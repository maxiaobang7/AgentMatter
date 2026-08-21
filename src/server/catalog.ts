import "server-only";

import { cache } from "react";
import type { RowDataPacket } from "mysql2/promise";
import { resources as staticResources } from "@/data/resources";
import { CATEGORY_TAXONOMY } from "@/data/taxonomy";
import { localizeResource, localizeResources } from "@/data/resource-localizations";
import { resourceSchema } from "@/lib/resource-schema";
import { getResource } from "@/lib/resources";
import type { Resource } from "@/lib/types";
import type { PublicLocale } from "@/lib/i18n";
import { isDatabaseConfigured, queryRows } from "@/server/db";
import { getDatabaseTaxonomy } from "@/server/taxonomy-service";

type PayloadRow = RowDataPacket & { payload_json: string | Resource };

function decodePayload(payload: string | Resource): Resource | undefined {
  try {
    const value = typeof payload === "string" ? JSON.parse(payload) : payload;
    const parsed = resourceSchema.safeParse(value);
    if (!parsed.success) {
      console.error("数据库中存在不符合资源契约的数据", parsed.error.issues);
      return undefined;
    }
    return parsed.data as Resource;
  } catch (error) {
    console.error("无法解析资源 JSON", error);
    return undefined;
  }
}

export const getCatalogResources = cache(async (locale?: PublicLocale): Promise<Resource[]> => {
  if (!isDatabaseConfigured()) return locale ? localizeResources(staticResources, locale) : staticResources;
  const rows = await queryRows<PayloadRow[]>(
    "SELECT payload_json FROM resources WHERE status = 'published' ORDER BY published_at DESC, id DESC",
  );
  const decoded = rows.map((row) => decodePayload(row.payload_json)).filter((item): item is Resource => Boolean(item));
  return locale ? localizeResources(decoded, locale) : decoded;
});

export const getCatalogResource = cache(async (owner: string, repo: string, componentPath?: string, locale?: PublicLocale) => {
  if (!isDatabaseConfigured()) {
    const resource = getResource(owner, repo, componentPath, staticResources);
    return resource && locale ? localizeResource(resource, locale) : resource;
  }
  const rows = await queryRows<PayloadRow[]>(
    "SELECT payload_json FROM resources WHERE status = 'published' AND LOWER(owner) = LOWER(?) AND LOWER(repo) = LOWER(?) ORDER BY (component_path = ?) DESC, id ASC LIMIT 1",
    [owner, repo, componentPath ?? ""],
  );
  const resource = rows[0] ? decodePayload(rows[0].payload_json) : undefined;
  return resource && locale ? localizeResource(resource, locale) : resource;
});

export const getCatalogTaxonomy = cache(async () => {
  if (!isDatabaseConfigured()) return CATEGORY_TAXONOMY;
  try {
    return await getDatabaseTaxonomy();
  } catch (error) {
    console.error("无法读取数据库能力领域，已回退到静态词库", error);
    return CATEGORY_TAXONOMY;
  }
});
