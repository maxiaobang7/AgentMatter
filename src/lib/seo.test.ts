import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { resources } from "@/data/resources";
import { absoluteUrl, breadcrumbJsonLd, resourceSeoDescription, resourceSeoKeywords, resourceSeoTitle, serializeJsonLd } from "@/lib/seo";
import { evaluateResourceSeoTitle } from "@/lib/seo-title";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

describe("SEO helpers", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterAll(() => {
    if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it("builds absolute canonical URLs", () => {
    expect(absoluteUrl("/mcp")).toBe("http://localhost:3000/mcp");
  });

  it("escapes markup in JSON-LD payloads", () => {
    expect(serializeJsonLd({ name: "<AgentMatter>" })).toContain("\\u003cAgentMatter>");
  });

  it("creates ordered breadcrumbs", () => {
    const data = breadcrumbJsonLd([{ name: "首页", path: "/" }, { name: "MCP", path: "/mcp" }]);
    expect(data.itemListElement).toHaveLength(2);
    expect(data.itemListElement[1]).toMatchObject({ position: 2, item: "http://localhost:3000/mcp" });
  });

  it("includes resource identity and category keywords", () => {
    const resource = resources.find((item) => item.id === "github-mcp");
    expect(resource).toBeDefined();
    expect(resourceSeoKeywords(resource!)).toEqual(expect.arrayContaining(["GitHub MCP Server", "github/github-mcp-server", "MCP 服务器"]));
  });

  it("uses category-specific fallback titles", () => {
    const resource = resources.find((item) => item.id === "github-mcp");
    expect(resourceSeoTitle(resource!)).toContain("MCP 服务器");
    expect(resourceSeoTitle(resource!)).toContain("配置教程");
  });

  it("prefers AI-authored SEO title and description", () => {
    const resource = structuredClone(resources[0]);
    resource.seo = {
      primaryKeyword: `${resource.name} 安装教程`,
      title: `${resource.name} 安装教程：内容创作 Skill`,
      description: `${resource.name} 是一个用于内容创作的 Agent Skill。本页提供项目介绍、完整安装步骤、使用教程与注意事项，帮助用户快速完成配置。`,
      searchIntent: "installation",
      secondaryKeywords: [resource.name, "内容创作 Skill"],
    };
    expect(resourceSeoTitle(resource)).toBe(resource.seo.title);
    expect(resourceSeoDescription(resource)).toBe(resource.seo.description);
    expect(resourceSeoKeywords(resource)[0]).toBe(resource.seo.primaryKeyword);
  });

  it("scores specific titles and explains generic titles", () => {
    const resource = { ...resources[0], name: "gbro-cover-design", subtype: "封面提示词生成", capabilities: ["封面提示词生成"] };
    expect(evaluateResourceSeoTitle(resource, "gbro-cover-design 安装教程：AI 封面提示词 Skill").score).toBeGreaterThanOrEqual(85);
    expect(evaluateResourceSeoTitle(resource, "gbro-cover-design 安装与使用").issues).toContain("标题过于通用，缺少项目的具体用途");
  });
});
