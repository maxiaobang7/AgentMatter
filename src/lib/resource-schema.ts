import { z } from "zod";
import { CATEGORY_TAXONOMY } from "@/data/taxonomy";
import { seoTitleHardIssues } from "@/lib/seo-title";

const githubUrl = z.url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && ["github.com", "raw.githubusercontent.com"].includes(url.hostname);
}, "必须使用 GitHub HTTPS 地址");

const shortText = z.string().trim().min(1).max(240);
const taxonomySlug = z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const resourceFacetKey = z.enum(["workflow", "output", "surface", "extension", "scope", "deployment", "transport", "authentication", "content"]);
const evidenceUrl = githubUrl.optional();
const localMediaPath = z.string().trim().regex(/^\/media\/resources\/[a-z0-9-]+\/[a-z0-9._-]+\/[a-f0-9]{24}\.webp$/i, "站内图片路径无效");
const displayImageUrl = z.union([
  localMediaPath,
  githubUrl.refine((value) => {
    const url = new URL(value);
    return url.hostname === "raw.githubusercontent.com" || /\/raw\//.test(url.pathname);
  }, "远程正文图片必须是 GitHub 原始图片地址"),
]);
const editorialDetailItem = z.object({
  title: shortText,
  description: z.string().trim().min(1).max(1000),
});
const promptDetailSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("standalone"),
    text: z.string().trim().min(20).max(30_000),
    placeholder: z.string().trim().min(1).max(500).optional(),
    sourceUrl: githubUrl,
  }).strict(),
  z.object({
    kind: z.enum(["collection", "guide"]),
    sourceUrl: githubUrl.optional(),
  }).strict(),
]);

const resourceBaseSchema = z.object({
  id: z.string().trim().min(1).max(180).regex(/^[a-z0-9][a-z0-9._/-]*$/i),
  name: z.string().trim().min(1).max(120),
  owner: z.string().trim().min(1).max(100).regex(/^[a-z0-9](?:[a-z0-9-]{0,38})$/i),
  repo: z.string().trim().min(1).max(100).regex(/^[a-z0-9._-]+$/i),
  componentPath: z.string().trim().max(300).regex(/^(?!\/)(?!.*\.\.)(?!.*\\).+$/).optional(),
  category: z.enum(["skills", "dsh", "plugins", "mcp", "prompts"]),
  taxonomy: z.object({
    primaryTopic: taxonomySlug,
    secondaryTopics: z.array(taxonomySlug).max(3).optional(),
    facets: z.partialRecord(resourceFacetKey, z.array(taxonomySlug).min(1).max(8)).optional(),
  }).strict().optional(),
  subtype: shortText,
  officialKind: z.enum(["platform", "publisher", "community"]),
  summary: z.string().trim().min(20).max(500),
  stars: z.number().int().nonnegative().max(1_000_000_000),
  license: z.string().trim().min(1).max(80),
  language: z.string().trim().max(80).optional(),
  updatedAt: z.iso.datetime(),
  compatibilities: z.array(z.object({
    host: shortText,
    level: z.enum(["documented", "community", "inferred"]),
    note: z.string().trim().max(500).optional(),
    evidenceUrl,
  })).max(40),
  facts: z.array(shortText).min(1).max(30),
  capabilities: z.array(shortText).min(1).max(30),
  acquisitions: z.array(z.object({
    label: shortText,
    mode: z.enum(["install", "connect", "copy", "learn", "browse"]),
    host: shortText.optional(),
    command: z.string().trim().max(4000).optional(),
    config: z.string().trim().max(12000).optional(),
    uninstall: z.string().trim().max(4000).optional(),
    url: githubUrl.optional(),
    evidenceUrl,
    requirements: z.array(shortText).max(20).optional(),
  })).min(1).max(30),
  verifications: z.array(z.object({
    level: z.enum(["metadata", "install", "function"]),
    status: z.enum(["verified", "unverified"]),
    checkedAt: z.union([z.iso.date(), z.iso.datetime()]).optional(),
    environment: z.string().trim().max(300).optional(),
    evidenceUrls: z.array(githubUrl).max(20).optional(),
    result: z.string().trim().max(1000).optional(),
    note: z.string().trim().min(1).max(1000),
  })).max(20),
  permissions: z.array(shortText).max(30).optional(),
  structure: z.array(shortText).max(50).optional(),
  limitations: z.array(shortText).max(30).optional(),
  featured: z.boolean().optional(),
  seo: z.object({
    primaryKeyword: z.string().trim().min(2).max(120),
    title: z.string().trim().min(10).max(120),
    description: z.string().trim().min(40).max(300),
    searchIntent: z.enum(["installation", "configuration", "usage", "overview", "learning"]),
    secondaryKeywords: z.array(z.string().trim().min(2).max(120)).min(1).max(12),
    titleCandidates: z.array(z.string().trim().min(10).max(120)).min(2).max(5).optional(),
    selectionReason: z.string().trim().min(20).max(1000).optional(),
  }).strict().optional(),
  provenance: z.object({
    generatedBy: z.literal("codex"),
    generatedAt: z.iso.datetime(),
    sourceUrls: z.array(githubUrl).min(1).max(50),
    model: z.string().trim().max(100).optional(),
    reviewedBy: z.string().trim().max(100).optional(),
  }).optional(),
  detail: z.object({
    introduction: z.string().trim().min(20).max(1200),
    githubDescription: z.string().trim().max(500),
    prompt: promptDetailSchema.optional(),
    suitableFor: z.array(shortText).max(20),
    notSuitableFor: z.array(shortText).max(20),
    readmeSummary: z.array(z.string().trim().min(1).max(2000)).min(1).max(30),
    capabilityDetails: z.array(z.object({ name: shortText, description: z.string().trim().min(1).max(1000), evidenceUrl })).max(30),
    installationGuide: z.object({
      summary: z.string().trim().min(20).max(1000),
      prerequisites: z.array(shortText).min(1).max(12),
      verification: z.string().trim().min(10).max(1000),
      agentInstallPrompt: z.string().trim().min(20).max(4000).optional(),
      notes: z.array(shortText).max(12).optional(),
    }).optional(),
    tutorialSteps: z.array(editorialDetailItem).min(1).max(12).optional(),
    useCases: z.array(editorialDetailItem).min(1).max(12).optional(),
    review: z.object({
      summary: z.string().trim().min(20).max(1200),
      strengths: z.array(shortText).min(1).max(12),
      limitations: z.array(shortText).min(1).max(12),
    }).optional(),
    media: z.array(z.object({
      id: z.string().trim().min(1).max(80).regex(/^[a-z0-9][a-z0-9._-]*$/i),
      src: displayImageUrl,
      sourceUrl: githubUrl,
      evidenceUrl: githubUrl,
      alt: z.string().trim().min(4).max(240),
      caption: z.string().trim().min(4).max(500).optional(),
      kind: z.enum(["screenshot", "example", "diagram", "cover"]),
      placement: z.enum(["after-introduction", "after-capabilities", "after-installation", "after-use-cases", "after-review", "in-readme"]),
      width: z.number().int().min(160).max(8000),
      height: z.number().int().min(120).max(8000),
    })).max(8).optional(),
    structureDetails: z.array(z.object({ path: z.string().trim().min(1).max(300), role: z.string().trim().min(1).max(500), evidenceUrl })).max(50),
    dataBoundaries: z.array(z.object({ label: shortText, description: z.string().trim().min(1).max(1000), risk: z.enum(["low", "medium", "high"]), evidenceUrl })).max(30),
    licenses: z.array(z.object({ scope: shortText, spdx: shortText, sourceUrl: githubUrl })).max(20),
    maintenance: z.object({
      lastPush: z.iso.datetime(),
      archived: z.boolean(),
      latestRelease: z.string().trim().max(100).optional(),
      releaseUrl: githubUrl.optional(),
      note: z.string().trim().min(1).max(1000),
    }),
    evidence: z.array(z.object({ label: shortText, url: githubUrl })).min(1).max(50),
    categoryFacts: z.array(z.object({ label: shortText, value: z.string().trim().min(1).max(500) })).max(30),
  }),
}).strict();

const resourceLocalizationSchema = z.object({
  subtype: shortText,
  summary: z.string().trim().min(20).max(500),
  license: z.string().trim().min(1).max(80).optional(),
  facts: z.array(shortText).min(1).max(30),
  capabilities: z.array(shortText).min(1).max(30),
  compatibilities: z.array(z.object({ host: shortText, note: z.string().trim().max(500).optional() }).strict()).max(40),
  acquisitions: z.array(z.object({ label: shortText, requirements: z.array(shortText).max(20).optional() }).strict()).min(1).max(30),
  verifications: z.array(z.object({ note: z.string().trim().min(1).max(1000), environment: z.string().trim().max(300).optional(), result: z.string().trim().max(1000).optional() }).strict()).max(20),
  permissions: z.array(shortText).max(30).optional(),
  limitations: z.array(shortText).max(30).optional(),
  detail: resourceBaseSchema.shape.detail,
  seo: resourceBaseSchema.shape.seo.unwrap(),
}).strict();

export const resourceSchema = resourceBaseSchema.extend({
  localizations: z.object({ en: resourceLocalizationSchema }).strict().optional(),
}).strict().superRefine((resource, context) => {
  const standalonePrompt = resource.category === "prompts" && resource.detail.prompt?.kind === "standalone";
  if (resource.detail.prompt && resource.category !== "prompts") {
    context.addIssue({ code: "custom", path: ["detail", "prompt"], message: "Prompt 专用内容只能用于 prompts 分类" });
  }
  if (resource.taxonomy) {
    const config = CATEGORY_TAXONOMY[resource.category];
    const topicSlugs = new Set(config.topics.map((topic) => topic.slug));
    const selectedTopics = [resource.taxonomy.primaryTopic, ...(resource.taxonomy.secondaryTopics ?? [])];
    for (const [index, topic] of selectedTopics.entries()) {
      if (!topicSlugs.has(topic)) context.addIssue({ code: "custom", path: ["taxonomy", index === 0 ? "primaryTopic" : "secondaryTopics", ...(index === 0 ? [] : [index - 1])], message: `标签 ${topic} 不属于 ${resource.category} 主题词库` });
    }
    if (new Set(selectedTopics).size !== selectedTopics.length) context.addIssue({ code: "custom", path: ["taxonomy"], message: "主主题与次主题不能重复" });
    for (const [facetKey, values] of Object.entries(resource.taxonomy.facets ?? {})) {
      const facet = config.facets.find((item) => item.key === facetKey);
      if (!facet) {
        context.addIssue({ code: "custom", path: ["taxonomy", "facets", facetKey], message: `筛选维度 ${facetKey} 不适用于 ${resource.category}` });
        continue;
      }
      const allowed = new Set(facet.options.map((item) => item.slug));
      for (const [index, value] of values.entries()) {
        if (!allowed.has(value)) context.addIssue({ code: "custom", path: ["taxonomy", "facets", facetKey, index], message: `标签 ${value} 不属于 ${facetKey} 词库` });
      }
      if (new Set(values).size !== values.length) context.addIssue({ code: "custom", path: ["taxonomy", "facets", facetKey], message: "同一筛选维度不能包含重复标签" });
    }
  }
  const expected = `https://github.com/${resource.owner}/${resource.repo}`.toLowerCase();
  const sources = resource.provenance?.sourceUrls ?? resource.detail.evidence.map((item) => item.url);
  if (!sources.some((source) => source.toLowerCase().startsWith(expected))) {
    context.addIssue({ code: "custom", path: ["detail", "evidence"], message: "证据必须包含资源对应的 GitHub 仓库" });
  }
  if (resource.provenance && !standalonePrompt && !resource.detail.installationGuide) {
    context.addIssue({ code: "custom", path: ["detail", "installationGuide"], message: "AI 生成资源必须提供项目专属安装指南" });
  }
  if (resource.provenance && !resource.seo) {
    context.addIssue({ code: "custom", path: ["seo"], message: "AI 生成资源必须提供独立的 SEO 标题、描述与关键词" });
  }
  if (resource.provenance && !resource.localizations?.en) {
    context.addIssue({ code: "custom", path: ["localizations", "en"], message: "AI 生成资源必须提供完整英文版本" });
  }
  const english = resource.localizations?.en;
  if (english) {
    const aligned: Array<[string, number, number]> = [
      ["compatibilities", english.compatibilities.length, resource.compatibilities.length],
      ["acquisitions", english.acquisitions.length, resource.acquisitions.length],
      ["verifications", english.verifications.length, resource.verifications.length],
    ];
    for (const [field, actual, expected] of aligned) {
      if (actual !== expected) context.addIssue({ code: "custom", path: ["localizations", "en", field], message: `英文数组必须与原始字段一一对应，需要 ${expected} 项` });
    }
    for (const message of seoTitleHardIssues(resource, english.seo.title)) {
      context.addIssue({ code: "custom", path: ["localizations", "en", "seo", "title"], message });
    }
    const localizedPrompt = english.detail.prompt;
    if (resource.detail.prompt?.kind !== localizedPrompt?.kind) {
      context.addIssue({ code: "custom", path: ["localizations", "en", "detail", "prompt"], message: "中英文 Prompt 内容类型必须一致" });
    } else if (resource.detail.prompt?.kind === "standalone" && localizedPrompt?.kind === "standalone" && resource.detail.prompt.sourceUrl !== localizedPrompt.sourceUrl) {
      context.addIssue({ code: "custom", path: ["localizations", "en", "detail", "prompt", "sourceUrl"], message: "中英文单条 Prompt 必须使用相同的 GitHub 来源" });
    }
  }
  if (resource.seo) {
    for (const message of seoTitleHardIssues(resource, resource.seo.title)) {
      context.addIssue({ code: "custom", path: ["seo", "title"], message });
    }
    if (!resource.seo.title.toLocaleLowerCase().includes(resource.seo.primaryKeyword.toLocaleLowerCase()) && !resource.seo.description.toLocaleLowerCase().includes(resource.seo.primaryKeyword.toLocaleLowerCase())) {
      context.addIssue({ code: "custom", path: ["seo", "primaryKeyword"], message: "主关键词必须自然出现在 SEO 标题或描述中" });
    }
    if (resource.seo.titleCandidates && !resource.seo.titleCandidates.includes(resource.seo.title)) {
      context.addIssue({ code: "custom", path: ["seo", "titleCandidates"], message: "候选标题必须包含最终选用的标题" });
    }
  }
  if (resource.provenance && !standalonePrompt && !resource.detail.installationGuide?.agentInstallPrompt) {
    context.addIssue({ code: "custom", path: ["detail", "installationGuide", "agentInstallPrompt"], message: "AI 生成资源必须提供可直接交给 Agent 的安装提示词" });
  }
  if (resource.provenance && !standalonePrompt && (!resource.detail.tutorialSteps || resource.detail.tutorialSteps.length < 2)) {
    context.addIssue({ code: "custom", path: ["detail", "tutorialSteps"], message: "AI 生成资源必须提供至少两个可执行安装步骤" });
  }
});

export const resourceWriteRequestSchema = z.object({
  operationId: z.string().trim().min(8).max(120).regex(/^[a-zA-Z0-9._:-]+$/),
  resource: resourceSchema,
  note: z.string().trim().max(500).optional(),
}).strict();

export type ValidatedResource = z.infer<typeof resourceSchema>;

export function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}
