import { z } from "zod";
import type { CategoryTaxonomy } from "@/data/taxonomy";
import type { CategorySlug } from "@/lib/types";

const categorySchema = z.enum(["skills", "dsh", "plugins", "mcp", "prompts"]);
const topicSlugSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug 只能使用小写字母、数字和连字符");

function keywordList(value: unknown) {
  const items = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[，,\n]/) : [];
  return [...new Set(items.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))];
}
export const taxonomyTopicInputSchema = z.object({
  category: categorySchema,
  slug: topicSlugSchema,
  labelZh: z.string().trim().min(1).max(120),
  labelEn: z.string().trim().min(1).max(120),
  keywords: z.preprocess(keywordList, z.array(z.string().min(1).max(80)).max(30)),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
}).strict();

export type TaxonomyTopicInput = z.infer<typeof taxonomyTopicInputSchema>;

export type TaxonomyTopicRecord = TaxonomyTopicInput & {
  id: number;
  active: boolean;
  usageCount: number;
};

export function normalizeTopicInput(value: unknown): TaxonomyTopicInput {
  return taxonomyTopicInputSchema.parse(value);
}

export function mergeTaxonomyTopics(
  base: Record<CategorySlug, CategoryTaxonomy>,
  rows: TaxonomyTopicRecord[],
): Record<CategorySlug, CategoryTaxonomy> {
  const result = { ...base };
  const categories = [...new Set(rows.map((row) => row.category))];

  for (const category of categories) {
    const topics = rows
      .filter((row) => row.category === category && row.active)
      .sort((left, right) => left.sortOrder - right.sortOrder || left.id - right.id)
      .map((row) => ({ slug: row.slug, label: { zh: row.labelZh, en: row.labelEn }, keywords: row.keywords }));
    result[category] = { ...base[category], topics };
  }

  return result;
}
