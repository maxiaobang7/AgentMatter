import { describe, expect, it } from "vitest";
import { CATEGORY_TAXONOMY } from "@/data/taxonomy";
import { mergeTaxonomyTopics, normalizeTopicInput, taxonomyTopicInputSchema } from "@/lib/taxonomy-admin";

describe("taxonomy admin helpers", () => {
  it("normalizes topic labels, keywords, and sort order", () => {
    expect(normalizeTopicInput({
      category: "skills",
      slug: "  browser-tools  ",
      labelZh: " 浏览器工具 ",
      labelEn: " Browser tools ",
      keywords: "browser，浏览器, automation, browser",
      sortOrder: 7,
    })).toEqual({
      category: "skills",
      slug: "browser-tools",
      labelZh: "浏览器工具",
      labelEn: "Browser tools",
      keywords: ["browser", "浏览器", "automation"],
      sortOrder: 7,
    });
  });

  it("rejects malformed slugs and missing bilingual labels", () => {
    expect(taxonomyTopicInputSchema.safeParse({ category: "skills", slug: "Browser Tools", labelZh: "浏览器", labelEn: "", keywords: [], sortOrder: 1 }).success).toBe(false);
  });

  it("uses active database topics in their saved order and keeps static fallback for untouched categories", () => {
    const merged = mergeTaxonomyTopics(CATEGORY_TAXONOMY, [
      { id: 2, category: "skills", slug: "browser-tools", labelZh: "浏览器工具", labelEn: "Browser tools", keywords: ["browser"], sortOrder: 2, active: true, usageCount: 0 },
      { id: 1, category: "skills", slug: "coding-development", labelZh: "代码开发", labelEn: "Coding", keywords: ["code"], sortOrder: 1, active: true, usageCount: 3 },
      { id: 3, category: "skills", slug: "retired", labelZh: "已停用", labelEn: "Retired", keywords: [], sortOrder: 3, active: false, usageCount: 0 },
    ]);

    expect(merged.skills.topics.map((topic) => topic.slug)).toEqual(["coding-development", "browser-tools"]);
    expect(merged.skills.topics[0].label).toEqual({ zh: "代码开发", en: "Coding" });
    expect(merged.dsh).toEqual(CATEGORY_TAXONOMY.dsh);
  });
});
