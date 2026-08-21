import "server-only";

import type { RowDataPacket } from "mysql2/promise";
import type { Resource } from "@/lib/types";
import { isAdminSessionValid } from "@/server/admin-auth";
import { queryRows } from "@/server/db";

export async function requireAdmin() {
  if (!await isAdminSessionValid()) throw new Error("UNAUTHORIZED");
}

export async function getAdminDashboard() {
  await requireAdmin();
  const [counts, resources, operations, submissionCounts] = await Promise.all([
    queryRows<(RowDataPacket & { status: string; total: number })[]>("SELECT status, COUNT(*) AS total FROM resources GROUP BY status"),
    queryRows<(RowDataPacket & { id: number; stable_key: string; category: string; status: string; version_number: number; pending_content_hash: string | null; updated_at: Date })[]>("SELECT id, stable_key, category, status, version_number, pending_content_hash, updated_at FROM resources ORDER BY COALESCE(pending_updated_at, updated_at) DESC LIMIT 100"),
    queryRows<(RowDataPacket & { operation_id: string; action: string; status: string; actor: string; created_at: Date })[]>("SELECT operation_id, action, status, actor, created_at FROM operations ORDER BY created_at DESC LIMIT 30"),
    queryRows<(RowDataPacket & { status: string; total: number })[]>("SELECT status, COUNT(*) AS total FROM submissions GROUP BY status"),
  ]);
  return {
    counts,
    resources: resources.map((resource) => ({ ...resource, status: resource.pending_content_hash ? "待审核更新" : resource.status })),
    operations,
    submissionCounts,
  };
}

export type SubmissionStatus = "new" | "reviewing" | "accepted" | "rejected";

export async function getAdminSubmissions(status?: SubmissionStatus) {
  await requireAdmin();
  const [counts, submissions] = await Promise.all([
    queryRows<(RowDataPacket & { status: SubmissionStatus; total: number })[]>("SELECT status, COUNT(*) AS total FROM submissions GROUP BY status"),
    status
      ? queryRows<(RowDataPacket & { id: number; github_url: string; category: string | null; component_path: string | null; display_name: string | null; hosts_json: string | string[] | null; note: string | null; status: SubmissionStatus; created_at: Date })[]>("SELECT id, github_url, category, component_path, display_name, hosts_json, note, status, created_at FROM submissions WHERE status = ? ORDER BY created_at DESC LIMIT 500", [status])
      : queryRows<(RowDataPacket & { id: number; github_url: string; category: string | null; component_path: string | null; display_name: string | null; hosts_json: string | string[] | null; note: string | null; status: SubmissionStatus; created_at: Date })[]>("SELECT id, github_url, category, component_path, display_name, hosts_json, note, status, created_at FROM submissions ORDER BY FIELD(status, 'new', 'reviewing', 'accepted', 'rejected'), created_at DESC LIMIT 500"),
  ]);
  return {
    counts,
    submissions: submissions.map((submission) => ({ ...submission, hosts: typeof submission.hosts_json === "string" ? JSON.parse(submission.hosts_json) as string[] : (submission.hosts_json ?? []) })),
  };
}

export async function getAdminResource(id: number) {
  await requireAdmin();
  const [resources, versions] = await Promise.all([
    queryRows<(RowDataPacket & { id: number; stable_key: string; status: string; version_number: number; payload_json: string | Resource; pending_payload_json: string | Resource | null })[]>("SELECT id, stable_key, status, version_number, payload_json, pending_payload_json FROM resources WHERE id = ? LIMIT 1", [id]),
    queryRows<(RowDataPacket & { version_number: number; action: string; actor: string; created_at: Date })[]>("SELECT version_number, action, actor, created_at FROM resource_versions WHERE resource_id = ? ORDER BY version_number DESC LIMIT 30", [id]),
  ]);
  const row = resources[0];
  if (!row) return null;
  const selectedPayload = row.pending_payload_json ?? row.payload_json;
  const resource = typeof selectedPayload === "string" ? JSON.parse(selectedPayload) as Resource : selectedPayload;
  return { id: row.id, stableKey: row.stable_key, status: row.pending_payload_json ? "draft" : row.status, liveStatus: row.status, version: row.version_number, pendingReview: Boolean(row.pending_payload_json), resource, versions };
}
