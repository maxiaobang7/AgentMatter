import "server-only";

import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { Resource } from "@/lib/types";
import { resourceHref } from "@/lib/resources";
import { nextResourceStatus, type AdminResourceStatusAction } from "@/lib/resource-status";
import { ContentOperationError } from "@/server/content-errors";
import { sha256, stableResourceKey } from "@/server/crypto";
import { inTransaction, queryRows } from "@/server/db";
import { normalizeSeoTitle } from "@/lib/seo-title";
import { ensureTaxonomySeeded } from "@/server/taxonomy-service";

export { ContentOperationError } from "@/server/content-errors";

export type WriteAction = "draft" | "publish" | "update";

type ResourceRow = RowDataPacket & {
  id: number;
  status: "draft" | "published" | "unpublished" | "archived";
  content_hash: string;
  version_number: number;
  payload_json: string | Resource;
  pending_payload_json: string | Resource | null;
  pending_content_hash: string | null;
};

type OperationRow = RowDataPacket & {
  operation_id: string;
  action: string;
  status: "processing" | "succeeded" | "failed";
  request_hash: string;
  resource_id: number | null;
  result_json: string | Record<string, unknown> | null;
  error_message: string | null;
  created_at: Date;
  completed_at: Date | null;
};

function jsonValue<T>(value: string | T | null): T | null {
  if (!value) return null;
  return typeof value === "string" ? JSON.parse(value) as T : value;
}

async function selectOperation(connection: PoolConnection, operationId: string) {
  const [rows] = await connection.execute<OperationRow[]>("SELECT * FROM operations WHERE operation_id = ? LIMIT 1 FOR UPDATE", [operationId]);
  return rows[0];
}

async function beginOperation(connection: PoolConnection, input: { operationId: string; action: string; requestHash: string; actor: string }) {
  const existing = await selectOperation(connection, input.operationId);
  if (existing) {
    if (existing.request_hash !== input.requestHash || existing.action !== input.action) {
      throw new ContentOperationError("operationId 已被其他请求使用", 409, "operation_id_conflict");
    }
    if (existing.status === "succeeded") return jsonValue<Record<string, unknown>>(existing.result_json);
    if (existing.status === "failed") throw new ContentOperationError(existing.error_message ?? "历史操作失败", 409, "operation_previously_failed");
    throw new ContentOperationError("相同操作正在处理中", 409, "operation_in_progress");
  }
  await connection.execute(
    "INSERT INTO operations (operation_id, action, status, request_hash, actor) VALUES (?, ?, 'processing', ?, ?)",
    [input.operationId, input.action, input.requestHash, input.actor],
  );
  return null;
}

async function finishOperation(connection: PoolConnection, operationId: string, resourceId: number | null, result: Record<string, unknown>) {
  await connection.execute(
    "UPDATE operations SET status = 'succeeded', resource_id = ?, result_json = ?, completed_at = CURRENT_TIMESTAMP(3) WHERE operation_id = ?",
    [resourceId, JSON.stringify(result), operationId],
  );
}

function targetStatus(action: WriteAction, existing?: ResourceRow) {
  if (action === "draft") return existing?.status === "published" ? "published" : "draft";
  if (action === "publish") return "published";
  if (!existing) throw new ContentOperationError("更新目标不存在，请先创建草稿或发布", 404, "resource_not_found");
  return existing.status;
}

async function assertUniqueSeoTitle(connection: PoolConnection, resource: Resource, stableKey: string) {
  if (!resource.seo?.title) return;
  const [rows] = await connection.execute<(RowDataPacket & { stable_key: string; payload_json: string | Resource; pending_payload_json: string | Resource | null })[]>(
    "SELECT stable_key, payload_json, pending_payload_json FROM resources WHERE stable_key <> ? FOR UPDATE",
    [stableKey],
  );
  const target = normalizeSeoTitle(resource.seo.title);
  const duplicate = rows.find((row) => {
    const stored = jsonValue<Resource>(row.pending_payload_json ?? row.payload_json);
    return stored?.seo?.title && normalizeSeoTitle(stored.seo.title) === target;
  });
  if (duplicate) throw new ContentOperationError(`SEO 标题与 ${duplicate.stable_key} 重复，请重新生成`, 409, "duplicate_seo_title");
}

async function assertActiveTaxonomyTopics(connection: PoolConnection, resource: Resource) {
  if (!resource.taxonomy) return;
  const topics = [...new Set([resource.taxonomy.primaryTopic, ...(resource.taxonomy.secondaryTopics ?? [])])];
  const placeholders = topics.map(() => "?").join(", ");
  const [rows] = await connection.execute<(RowDataPacket & { slug: string })[]>(
    `SELECT slug FROM taxonomy_topics WHERE category = ? AND active = 1 AND slug IN (${placeholders})`,
    [resource.category, ...topics],
  );
  const active = new Set(rows.map((row) => row.slug));
  const missing = topics.filter((topic) => !active.has(topic));
  if (missing.length) throw new ContentOperationError(`能力领域不存在或已停用：${missing.join("、")}`, 422, "taxonomy_topic_invalid");
}

export async function writeResource(input: { operationId: string; action: WriteAction; resource: Resource; actor: string; note?: string }) {
  const stableKey = stableResourceKey(input.resource.owner, input.resource.repo, input.resource.componentPath);
  const payload = JSON.stringify(input.resource);
  const contentHash = sha256(payload);
  const requestHash = sha256(JSON.stringify({ action: input.action, stableKey, payload, note: input.note ?? "" }));

  await ensureTaxonomySeeded();
  return inTransaction(async (connection) => {
    const replay = await beginOperation(connection, { operationId: input.operationId, action: input.action, requestHash, actor: input.actor });
    if (replay) return replay;

    await assertUniqueSeoTitle(connection, input.resource, stableKey);
    await assertActiveTaxonomyTopics(connection, input.resource);

    const [existingRows] = await connection.execute<ResourceRow[]>("SELECT * FROM resources WHERE stable_key = ? LIMIT 1 FOR UPDATE", [stableKey]);
    const existing = existingRows[0];
    const status = targetStatus(input.action, existing);
    const isPendingDraft = input.action === "draft" && existing?.status === "published";
    const materiallyChanged = isPendingDraft ? existing.pending_content_hash !== contentHash : !existing || existing.content_hash !== contentHash || existing.status !== status;
    let resourceId = existing?.id;
    let version = existing?.version_number ?? 0;

    if (!existing) {
      const [insert] = await connection.execute<ResultSetHeader>(
        "INSERT INTO resources (stable_key, resource_id, owner, repo, component_path, category, status, payload_json, content_hash, version_number, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, IF(? = 'published', CURRENT_TIMESTAMP(3), NULL))",
        [stableKey, input.resource.id, input.resource.owner, input.resource.repo, input.resource.componentPath ?? "", input.resource.category, status, payload, contentHash, status],
      );
      resourceId = insert.insertId;
      version = 1;
    } else if (isPendingDraft && materiallyChanged) {
      await connection.execute(
        "UPDATE resources SET pending_payload_json = ?, pending_content_hash = ?, pending_updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?",
        [payload, contentHash, existing.id],
      );
    } else if (materiallyChanged) {
      version += 1;
      await connection.execute(
        "UPDATE resources SET resource_id = ?, owner = ?, repo = ?, component_path = ?, category = ?, status = ?, payload_json = ?, content_hash = ?, pending_payload_json = NULL, pending_content_hash = NULL, pending_updated_at = NULL, version_number = ?, published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, CURRENT_TIMESTAMP(3)) ELSE published_at END WHERE id = ?",
        [input.resource.id, input.resource.owner, input.resource.repo, input.resource.componentPath ?? "", input.resource.category, status, payload, contentHash, version, status, existing.id],
      );
    }

    if (!resourceId) throw new ContentOperationError("资源写入失败", 500, "resource_write_failed");

    if (materiallyChanged && !isPendingDraft) {
      await connection.execute(
        "INSERT INTO resource_versions (resource_id, version_number, action, operation_id, payload_json, content_hash, actor) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [resourceId, version, input.action, input.operationId, payload, contentHash, input.actor],
      );
      await connection.execute(
        "INSERT INTO audit_logs (resource_id, operation_id, action, actor, before_hash, after_hash, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [resourceId, input.operationId, input.action, input.actor, existing?.content_hash ?? null, contentHash, JSON.stringify({ note: input.note ?? null, status })],
      );
    }
    if (materiallyChanged && isPendingDraft) {
      await connection.execute(
        "INSERT INTO audit_logs (resource_id, operation_id, action, actor, before_hash, after_hash, metadata_json) VALUES (?, ?, 'draft', ?, ?, ?, ?)",
        [resourceId, input.operationId, input.actor, existing?.content_hash ?? null, contentHash, JSON.stringify({ note: input.note ?? null, pendingReview: true, liveStatus: existing?.status })],
      );
    }

    const result = {
      operationId: input.operationId,
      resourceId,
      stableKey,
      status,
      version,
      changed: materiallyChanged,
      pendingReview: isPendingDraft,
      path: resourceHref(input.resource),
      contentHash,
    };
    await finishOperation(connection, input.operationId, resourceId, result);
    return result;
  });
}

export async function unpublishResource(input: { operationId: string; owner: string; repo: string; componentPath?: string; actor: string; note?: string }) {
  const stableKey = stableResourceKey(input.owner, input.repo, input.componentPath);
  const requestHash = sha256(JSON.stringify({ action: "unpublish", stableKey, note: input.note ?? "" }));
  return inTransaction(async (connection) => {
    const replay = await beginOperation(connection, { operationId: input.operationId, action: "unpublish", requestHash, actor: input.actor });
    if (replay) return replay;
    const [rows] = await connection.execute<ResourceRow[]>("SELECT * FROM resources WHERE stable_key = ? LIMIT 1 FOR UPDATE", [stableKey]);
    const resource = rows[0];
    if (!resource) throw new ContentOperationError("资源不存在", 404, "resource_not_found");
    if (resource.status !== "unpublished") {
      await connection.execute("UPDATE resources SET status = 'unpublished' WHERE id = ?", [resource.id]);
      await connection.execute(
        "INSERT INTO audit_logs (resource_id, operation_id, action, actor, before_hash, after_hash, metadata_json) VALUES (?, ?, 'unpublish', ?, ?, ?, ?)",
        [resource.id, input.operationId, input.actor, resource.content_hash, resource.content_hash, JSON.stringify({ note: input.note ?? null })],
      );
    }
    const result = { operationId: input.operationId, resourceId: resource.id, stableKey, status: "unpublished", changed: resource.status !== "unpublished" };
    await finishOperation(connection, input.operationId, resource.id, result);
    return result;
  });
}

export async function changeResourceStatus(input: { operationId: string; resourceId: number; action: AdminResourceStatusAction; actor: string; note?: string }) {
  const requestHash = sha256(JSON.stringify({ action: input.action, resourceId: input.resourceId, note: input.note ?? "" }));
  return inTransaction(async (connection) => {
    const replay = await beginOperation(connection, { operationId: input.operationId, action: input.action, requestHash, actor: input.actor });
    if (replay) return replay;
    const [rows] = await connection.execute<ResourceRow[]>("SELECT * FROM resources WHERE id = ? LIMIT 1 FOR UPDATE", [input.resourceId]);
    const resource = rows[0];
    if (!resource) throw new ContentOperationError("资源不存在", 404, "resource_not_found");
    let targetStatus: ResourceRow["status"];
    try {
      targetStatus = nextResourceStatus(resource.status, input.action);
    } catch (error) {
      throw new ContentOperationError(error instanceof Error ? error.message : "资源状态转换无效", 409, "resource_status_invalid");
    }

    const promotePending = input.action === "draft" && Boolean(resource.pending_payload_json && resource.pending_content_hash);
    const payload = promotePending ? resource.pending_payload_json! : resource.payload_json;
    const contentHash = promotePending ? resource.pending_content_hash! : resource.content_hash;
    const nextVersion = promotePending && contentHash !== resource.content_hash ? resource.version_number + 1 : resource.version_number;
    const changed = resource.status !== targetStatus || promotePending;

    if (changed) {
      if (input.action === "archive") {
        // Archiving is intentionally non-destructive: keep both the live payload
        // and any pending revision so an administrator can restore the resource.
        await connection.execute("UPDATE resources SET status = ? WHERE id = ?", [targetStatus, resource.id]);
      } else {
        await connection.execute(
          "UPDATE resources SET status = ?, payload_json = ?, content_hash = ?, pending_payload_json = NULL, pending_content_hash = NULL, pending_updated_at = NULL, version_number = ? WHERE id = ?",
          [targetStatus, typeof payload === "string" ? payload : JSON.stringify(payload), contentHash, nextVersion, resource.id],
        );
      }
      if (nextVersion !== resource.version_number) {
        await connection.execute(
          "INSERT INTO resource_versions (resource_id, version_number, action, operation_id, payload_json, content_hash, actor) VALUES (?, ?, 'draft', ?, ?, ?, ?)",
          [resource.id, nextVersion, input.operationId, typeof payload === "string" ? payload : JSON.stringify(payload), contentHash, input.actor],
        );
      }
      await connection.execute(
        "INSERT INTO audit_logs (resource_id, operation_id, action, actor, before_hash, after_hash, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [resource.id, input.operationId, input.action, input.actor, resource.content_hash, contentHash, JSON.stringify({ note: input.note ?? null, fromStatus: resource.status, toStatus: targetStatus, promotedPending: promotePending })],
      );
    }

    const parsed = jsonValue<Resource>(payload);
    const result = {
      operationId: input.operationId,
      resourceId: resource.id,
      status: targetStatus,
      version: nextVersion,
      changed,
      path: parsed ? resourceHref(parsed) : undefined,
      contentHash,
    };
    await finishOperation(connection, input.operationId, resource.id, result);
    return result;
  });
}

export async function rollbackResource(input: { operationId: string; resourceId: number; version: number; actor: string; note?: string }) {
  const requestHash = sha256(JSON.stringify({ action: "rollback", resourceId: input.resourceId, version: input.version, note: input.note ?? "" }));
  return inTransaction(async (connection) => {
    const replay = await beginOperation(connection, { operationId: input.operationId, action: "rollback", requestHash, actor: input.actor });
    if (replay) return replay;
    const [resourceRows] = await connection.execute<ResourceRow[]>("SELECT * FROM resources WHERE id = ? LIMIT 1 FOR UPDATE", [input.resourceId]);
    const resource = resourceRows[0];
    if (!resource) throw new ContentOperationError("资源不存在", 404, "resource_not_found");
    const [versionRows] = await connection.execute<(RowDataPacket & { payload_json: string | Resource; content_hash: string })[]>(
      "SELECT payload_json, content_hash FROM resource_versions WHERE resource_id = ? AND version_number = ? LIMIT 1",
      [input.resourceId, input.version],
    );
    const target = versionRows[0];
    if (!target) throw new ContentOperationError("目标版本不存在", 404, "version_not_found");
    const payload = typeof target.payload_json === "string" ? target.payload_json : JSON.stringify(target.payload_json);
    const parsed = jsonValue<Resource>(payload);
    if (!parsed) throw new ContentOperationError("版本内容损坏", 500, "version_payload_invalid");
    const nextVersion = resource.version_number + 1;
    await connection.execute(
      "UPDATE resources SET resource_id = ?, owner = ?, repo = ?, component_path = ?, category = ?, payload_json = ?, content_hash = ?, pending_payload_json = NULL, pending_content_hash = NULL, pending_updated_at = NULL, version_number = ? WHERE id = ?",
      [parsed.id, parsed.owner, parsed.repo, parsed.componentPath ?? "", parsed.category, payload, target.content_hash, nextVersion, resource.id],
    );
    await connection.execute(
      "INSERT INTO resource_versions (resource_id, version_number, action, operation_id, payload_json, content_hash, actor) VALUES (?, ?, 'rollback', ?, ?, ?, ?)",
      [resource.id, nextVersion, input.operationId, payload, target.content_hash, input.actor],
    );
    await connection.execute(
      "INSERT INTO audit_logs (resource_id, operation_id, action, actor, before_hash, after_hash, metadata_json) VALUES (?, ?, 'rollback', ?, ?, ?, ?)",
      [resource.id, input.operationId, input.actor, resource.content_hash, target.content_hash, JSON.stringify({ fromVersion: resource.version_number, toVersion: input.version, note: input.note ?? null })],
    );
    const result = { operationId: input.operationId, resourceId: resource.id, status: resource.status, version: nextVersion, rolledBackTo: input.version, path: resourceHref(parsed) };
    await finishOperation(connection, input.operationId, resource.id, result);
    return result;
  });
}

export async function getOperation(operationId: string) {
  const rows = await queryRows<OperationRow[]>("SELECT * FROM operations WHERE operation_id = ? LIMIT 1", [operationId]);
  const row = rows[0];
  if (!row) return null;
  return { operationId: row.operation_id, action: row.action, status: row.status, resourceId: row.resource_id, result: jsonValue(row.result_json), error: row.error_message, createdAt: row.created_at, completedAt: row.completed_at };
}

export async function getInventory() {
  const rows = await queryRows<(RowDataPacket & { id: number; stable_key: string; resource_id: string; category: string; status: string; content_hash: string; pending_content_hash: string | null; version_number: number; updated_at: Date; published_at: Date | null; payload_json: string | Resource; pending_payload_json: string | Resource | null })[]>(
    "SELECT id, stable_key, resource_id, category, status, content_hash, pending_content_hash, version_number, updated_at, published_at, payload_json, pending_payload_json FROM resources ORDER BY updated_at DESC",
  );
  return rows.map((row) => {
    const selected = jsonValue<Resource>(row.pending_payload_json ?? row.payload_json);
    return { id: row.id, stableKey: row.stable_key, resourceId: row.resource_id, category: row.category, status: row.status, seoTitle: selected?.seo?.title ?? null, contentHash: row.content_hash, pendingContentHash: row.pending_content_hash, pendingReview: Boolean(row.pending_content_hash), version: row.version_number, updatedAt: row.updated_at, publishedAt: row.published_at };
  });
}

export async function getStoredResource(owner: string, repo: string, componentPath?: string) {
  const stableKey = stableResourceKey(owner, repo, componentPath);
  const rows = await queryRows<(ResourceRow & { stable_key: string })[]>("SELECT * FROM resources WHERE stable_key = ? LIMIT 1", [stableKey]);
  const row = rows[0];
  if (!row) return null;
  const selectedPayload = row.pending_payload_json ?? row.payload_json;
  return { id: row.id, stableKey: row.stable_key, status: row.status, version: row.version_number, contentHash: row.pending_content_hash ?? row.content_hash, liveContentHash: row.content_hash, pendingReview: Boolean(row.pending_content_hash), resource: jsonValue<Resource>(selectedPayload) };
}
