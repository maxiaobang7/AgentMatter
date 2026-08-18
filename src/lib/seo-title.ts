import type { CategorySlug, Resource } from "@/lib/types";

const CATEGORY_TERMS: Record<CategorySlug, string[]> = {
  skills: ["Skill", "Skills", "技能"],
  dsh: ["DSH", "插件"],
  plugins: ["Agent", "插件"],
  mcp: ["MCP", "服务器"],
  prompts: ["Prompt", "提示词"],
};

const INTENT_TERMS = ["安装", "配置", "教程", "使用", "指南"];
const UNSUPPORTED_CLAIMS = ["最好", "最强", "第一", "唯一"];

export type SeoTitleEvaluation = {
  score: number;
  grade: "excellent" | "good" | "needs-work";
  displayUnits: number;
  issues: string[];
};

export function estimateSeoTitleDisplayUnits(value: string) {
  return Array.from(value).reduce((sum, char) => sum + (/^[\x00-\xff]$/.test(char) ? 1 : 2), 0);
}

export function normalizeSeoTitle(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[\s·|：:—_-]+/g, "");
}

export function seoTitleHardIssues(resource: Pick<Resource, "name" | "officialKind">, title: string) {
  const issues: string[] = [];
  const normalized = title.toLocaleLowerCase();
  if (!normalized.includes(resource.name.toLocaleLowerCase())) issues.push("标题必须包含完整项目名");
  if (normalized.includes("agentmatter")) issues.push("标题中不要写 AgentMatter，页面会自动添加品牌名");
  if (resource.officialKind === "community" && title.includes("官方")) issues.push("社区项目不能标注为官方");
  if (UNSUPPORTED_CLAIMS.some((claim) => title.includes(claim))) issues.push("标题包含无法由仓库资料证明的绝对化表述");
  return issues;
}

export function evaluateResourceSeoTitle(resource: Pick<Resource, "name" | "category" | "subtype" | "capabilities" | "officialKind">, title: string): SeoTitleEvaluation {
  const issues = seoTitleHardIssues(resource, title);
  const fullTitle = `${title.trim()} | AgentMatter`;
  const displayUnits = estimateSeoTitleDisplayUnits(fullTitle);
  let score = 0;
  const normalized = title.toLocaleLowerCase();

  if (normalized.includes(resource.name.toLocaleLowerCase())) score += 25;
  if (CATEGORY_TERMS[resource.category].some((term) => normalized.includes(term.toLocaleLowerCase()))) score += 15;
  else issues.push("建议写明资源类型，帮助用户快速判断内容");

  const topicTerms = [resource.subtype, resource.subtype.replace(/(?:生成|管理|服务|工具|插件|服务器)$/i, ""), ...resource.capabilities]
    .flatMap((item) => item.split(/[、，,\s/]+/)).filter((item) => item.length >= 2);
  if (topicTerms.some((term) => normalized.includes(term.toLocaleLowerCase()))) score += 20;
  else issues.push("标题缺少能够区分该项目的核心用途");

  if (INTENT_TERMS.some((term) => title.includes(term))) score += 15;
  else issues.push("建议体现安装、配置、教程或使用等搜索意图");

  if (displayUnits >= 36 && displayUnits <= 72) score += 15;
  else if (displayUnits < 88) score += 8;
  else issues.push("完整标题偏长，搜索结果中可能较早被截断");

  if (title.trim() !== `${resource.name} 安装与使用` && !UNSUPPORTED_CLAIMS.some((claim) => title.includes(claim))) score += 10;
  else if (title.trim() === `${resource.name} 安装与使用`) issues.push("标题过于通用，缺少项目的具体用途");

  const bounded = Math.max(0, Math.min(100, score));
  return { score: bounded, grade: bounded >= 85 ? "excellent" : bounded >= 70 ? "good" : "needs-work", displayUnits, issues: [...new Set(issues)] };
}
