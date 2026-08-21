import "server-only";

import type { RowDataPacket } from "mysql2/promise";
import { CATEGORY_TAXONOMY } from "@/data/taxonomy";
import { mergeTaxonomyTopics, normalizeTopicInput, type TaxonomyTopicInput, type TaxonomyTopicRecord } from "@/lib/taxonomy-admin";
import type { CategorySlug, Resource } from "@/lib/types";
import { ContentOperationError } from "@/server/content-errors";
import { executeStatement, queryRows } from "@/server/db";

type TopicRow = RowDataPacket & {
  id: number;
  category: CategorySlug;
  slug: string;
  label_zh: string;
  label_en: string;
  keywords_json: string | string[];
  sort_order: number;
  active: number | boolean;
};

type ResourcePayloadRow = RowDataPacket & {
  category: CategorySlug;
  payload_json: string | Resource;
  pending_payload_json: string | Resource | null;
};

let seedPromise: Promise<void> | undefined;

function decodeKeywords(value: string | string[]) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function decodeResource(value: string | Resource | null) {
  if (!value) return undefined;
  try {
    return typeof value === "string" ? JSON.parse(value) as Resource : value;
  } catch {
    return undefined;
  }
}

export async function ensureTaxonomySeeded() {
  seedPromise ??= (async () => {
    const values: Array<string | number> = [];
    const placeholders: string[] = [];
    for (const [category, config] of Object.entries(CATEGORY_TAXONOMY) as Array<[CategorySlug, (typeof CATEGORY_TAXONOMY)[CategorySlug]]>) {
      for (const [index, topic] of config.topics.entries()) {
        placeholders.push("(?, ?, ?, ?, ?, ?, 1)");
        values.push(category, topic.slug, topic.label.zh, topic.label.en, JSON.stringify(topic.keywords ?? []), (index + 1) * 10);
      }
    }
    await executeStatement(
      `INSERT IGNORE INTO taxonomy_topics (category, slug, label_zh, label_en, keywords_json, sort_order, active) VALUES ${placeholders.join(", ")}`,
      values,
    );
  })().catch((error) => {
    seedPromise = undefined;
    throw error;
  });
  return seedPromise;
}

async function resourceUsageCounts() {
  const rows = await queryRows<ResourcePayloadRow[]>("SELECT category, payload_json, pending_payload_json FROM resources");
  const counts = new Map<string, number>();
  for (const row of rows) {
    const resource = decodeResource(row.pending_payload_json ?? row.payload_json);
    if (!resource?.taxonomy) continue;
    for (const slug of new Set([resource.taxonomy.primaryTopic, ...(resource.taxonomy.secondaryTopics ?? [])])) {
      const key = `${row.category}:${slug}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

export async function getTaxonomyTopics(options: { includeInactive?: boolean; withUsage?: boolean } = {}): Promise<TaxonomyTopicRecord[]> {
  await ensureTaxonomySeeded();
  const rows = await queryRows<TopicRow[]>(
    `SELECT id, category, slug, label_zh, label_en, keywords_json, sort_order, active FROM taxonomy_topics${options.includeInactive ? "" : " WHERE active = 1"} ORDER BY FIELD(category, 'skills', 'dsh', 'plugins', 'mcp', 'prompts'), sort_order, id`,
  );
  const usage = options.withUsage ? await resourceUsageCounts() : new Map<string, number>();
  return rows.map((row) => ({
    id: Number(row.id),
    category: row.category,
    slug: row.slug,
    labelZh: row.label_zh,
    labelEn: row.label_en,
    keywords: decodeKeywords(row.keywords_json),
    sortOrder: Number(row.sort_order),
    active: Boolean(row.active),
    usageCount: usage.get(`${row.category}:${row.slug}`) ?? 0,
  }));
}

export async function getDatabaseTaxonomy() {
  const topics = await getTaxonomyTopics();
  return mergeTaxonomyTopics(CATEGORY_TAXONOMY, topics);
}

export async function createTaxonomyTopic(value: unknown) {
  await ensureTaxonomySeeded();
  const input = normalizeTopicInput(value);
  try {
    const result = await executeStatement(
      "INSERT INTO taxonomy_topics (category, slug, label_zh, label_en, keywords_json, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, 1)",
      [input.category, input.slug, input.labelZh, input.labelEn, JSON.stringify(input.keywords), input.sortOrder],
    );
    return { id: result.insertId, ...input, active: true, usageCount: 0 };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ER_DUP_ENTRY") {
      throw new ContentOperationError("该分类中已经存在相同 slug，请编辑或恢复原标签", 409, "taxonomy_topic_exists");
    }
    throw error;
  }
}

export async function updateTaxonomyTopic(id: number, value: Omit<TaxonomyTopicInput, "category" | "slug">) {
  const result = await executeStatement(
    "UPDATE taxonomy_topics SET label_zh = ?, label_en = ?, keywords_json = ?, sort_order = ? WHERE id = ?",
    [value.labelZh.trim(), value.labelEn.trim(), JSON.stringify(value.keywords), value.sortOrder, id],
  );
  if (!result.affectedRows) throw new ContentOperationError("能力领域不存在", 404, "taxonomy_topic_not_found");
  return { id, ...value };
}

export async function setTaxonomyTopicActive(id: number, active: boolean) {
  const topics = await getTaxonomyTopics({ includeInactive: true, withUsage: true });
  const topic = topics.find((item) => item.id === id);
  if (!topic) throw new ContentOperationError("能力领域不存在", 404, "taxonomy_topic_not_found");
  if (!active && topic.usageCount > 0) {
    throw new ContentOperationError(`仍有 ${topic.usageCount} 个资源使用该能力领域，请先调整资源标签`, 409, "taxonomy_topic_in_use");
  }
  if (!active && topics.filter((item) => item.category === topic.category && item.active).length <= 1) {
    throw new ContentOperationError("每个分类至少保留一个启用的能力领域", 409, "taxonomy_last_active_topic");
  }
  const result = await executeStatement("UPDATE taxonomy_topics SET active = ? WHERE id = ?", [active, id]);
  if (!result.affectedRows) throw new ContentOperationError("能力领域不存在", 404, "taxonomy_topic_not_found");
  return { id, active };
}

export function parseTaxonomyTopicUpdate(value: unknown) {
  const input = normalizeTopicInput(value);
  return { labelZh: input.labelZh, labelEn: input.labelEn, keywords: input.keywords, sortOrder: input.sortOrder };
}
