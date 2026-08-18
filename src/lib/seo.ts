import { CATEGORY_INFO, CATEGORY_INFO_EN } from "@/data/resources";
import { canonicalIdentity, resourceHref } from "@/lib/resources";
import type { Resource } from "@/lib/types";
import { localizedPath, type PublicLocale } from "@/lib/i18n";

export const SITE_NAME = "AgentMatter";
export const SITE_TITLE = "AgentMatter — Open-source AI Agent Resources";
export const SITE_DESCRIPTION = "Discover open-source Skills, DSH plugins, Agent plugins, MCP servers, and Prompts from GitHub.";
export const SITE_KEYWORDS = [
  "AI Agent",
  "Agent Skills",
  "DSH plugins",
  "AI Agent plugins",
  "MCP servers",
  "open-source AI tools",
  "DSH 插件",
  "AI Agent 插件",
  "MCP 服务器",
  "Prompt",
  "GitHub 开源项目",
];

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    return new URL(configured).toString().replace(/\/$/, "");
  } catch {
    return "http://localhost:3000";
  }
}

export function absoluteUrl(path = "/") {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function resourceSeoTitle(resource: Resource, locale: PublicLocale = "zh") {
  if (resource.seo?.title) return resource.seo.title;
  const purpose = resource.subtype.replace(/(?:服务器|插件|Skill|Prompt)$/i, "").trim() || resource.subtype;
  if (locale === "en") {
    const templates = {
      skills: `${resource.name} Installation Guide: ${purpose} Skill`,
      dsh: `${resource.name}: ${purpose} DSH Plugin`,
      plugins: `${resource.name}: ${purpose} AI Agent Plugin`,
      mcp: `${resource.name} Setup Guide: ${purpose} MCP Server`,
      prompts: `${resource.name}: ${purpose} Prompt Guide`,
    } satisfies Record<Resource["category"], string>;
    return templates[resource.category];
  }
  const templates = {
    skills: `${resource.name} 安装教程：${purpose} Skill`,
    dsh: `${resource.name}：${purpose} DSH 插件安装`,
    plugins: `${resource.name}：${purpose} AI Agent 插件`,
    mcp: `${resource.name} 配置教程：${purpose} MCP 服务器`,
    prompts: `${resource.name}：${purpose} Prompt 使用指南`,
  } satisfies Record<Resource["category"], string>;
  return templates[resource.category];
}

export function resourceSeoDescription(resource: Resource, locale: PublicLocale = "zh") {
  if (resource.seo?.description) return resource.seo.description;
  const category = (locale === "zh" ? CATEGORY_INFO : CATEGORY_INFO_EN)[resource.category].label;
  if (locale === "en") return `${resource.summary} Explore ${canonicalIdentity(resource)} with a practical overview, setup guidance, core capabilities, and usage notes. Category: ${category}.`;
  return `${resource.summary} 查看 ${canonicalIdentity(resource)} 的项目介绍、获取方式、核心能力与使用示例。分类：${category}。`;
}

export function resourceSeoKeywords(resource: Resource, locale: PublicLocale = "zh") {
  return [
    resource.seo?.primaryKeyword,
    ...(resource.seo?.secondaryKeywords ?? []),
    resource.name,
    canonicalIdentity(resource),
    (locale === "zh" ? CATEGORY_INFO : CATEGORY_INFO_EN)[resource.category].label,
    resource.subtype,
    resource.language,
    ...resource.capabilities,
    ...resource.compatibilities.map((item) => item.host),
    "AI Agent",
    "GitHub",
  ].filter((value): value is string => Boolean(value));
}

export function resourceCanonicalUrl(resource: Resource, locale: PublicLocale = "en") {
  return absoluteUrl(localizedPath(resourceHref(resource), locale));
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
