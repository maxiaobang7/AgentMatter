import { describe, expect, it } from "vitest";
import { canonicalIdentity, filterResources, getResource, getResources, searchResources } from "@/lib/resources";

describe("resource catalog", () => {
  it("keeps repository and component identity separate", () => {
    const context7 = getResource("upstash", "context7", "packages/mcp");
    expect(context7).toBeDefined();
    expect(canonicalIdentity(context7!)).toBe("upstash/context7#packages/mcp");
  });

  it("filters strictly by documented host labels", () => {
    const results = filterResources({ category: "skills", host: "Codex" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((resource) => resource.compatibilities.some((item) => item.host === "Codex"))).toBe(true);
    expect(results.some((resource) => resource.id === "anthropics-skills")).toBe(false);
  });

  it("filters category resources by controlled topics", () => {
    const results = filterResources({ category: "mcp", topic: "browser-automation" });
    expect(results.map((resource) => resource.id)).toEqual(expect.arrayContaining(["playwright-mcp", "firecrawl-mcp"]));
    expect(results.some((resource) => resource.id === "github-mcp")).toBe(false);
  });

  it("uses OR inside a facet and AND across facets", () => {
    const authenticationOr = filterResources({ category: "mcp", facets: { authentication: ["oauth", "api-key"] } });
    expect(authenticationOr.map((resource) => resource.id).sort()).toEqual(["firecrawl-mcp", "github-mcp"]);

    const localWithoutAuth = filterResources({ category: "mcp", facets: { deployment: ["local"], authentication: ["none"] } });
    expect(localWithoutAuth.map((resource) => resource.id).sort()).toEqual(["mcp-reference-servers", "playwright-mcp"]);
  });

  it("returns explicit search match reasons", () => {
    const [hit] = searchResources("github-mcp-server");
    expect(hit.resource.id).toBe("github-mcp");
    expect(hit.reasons).toContain("名称或组件路径命中");
  });

  it("finds resources by capability", () => {
    const results = searchResources("浏览器测试");
    expect(results[0].resource.id).toBe("playwright-mcp");
    expect(results[0].reasons).toContain("能力命中");
  });

  it("requires structured detail content for every published resource", () => {
    const resources = getResources();
    expect(resources).toHaveLength(25);

    for (const resource of resources) {
      expect(resource.detail.introduction.length, resource.id).toBeGreaterThan(30);
      expect(resource.detail.introduction, resource.id).not.toMatch(/[\r\n]/);
      expect(resource.detail.githubDescription.length, resource.id).toBeGreaterThan(8);
      expect(resource.detail.suitableFor.length, resource.id).toBeGreaterThanOrEqual(2);
      expect(resource.detail.notSuitableFor.length, resource.id).toBeGreaterThanOrEqual(1);
      expect(resource.detail.readmeSummary.length, resource.id).toBeGreaterThanOrEqual(3);
      expect(resource.detail.capabilityDetails.length, resource.id).toBe(resource.capabilities.length);
      expect(resource.detail.structureDetails.length, resource.id).toBeGreaterThan(0);
      expect(resource.detail.structureDetails.every((item) => item.path && item.role), resource.id).toBe(true);
      expect(resource.detail.dataBoundaries.length, resource.id).toBeGreaterThan(0);
      expect(resource.detail.licenses.length, resource.id).toBeGreaterThan(0);
      expect(resource.detail.maintenance.lastPush, resource.id).toBe(resource.updatedAt);
      expect(resource.detail.categoryFacts.length, resource.id).toBeGreaterThanOrEqual(3);
      expect(resource.detail.evidence.every((item) => item.url.startsWith("https://github.com/")), resource.id).toBe(true);
      expect(resource.compatibilities.every((item) => item.evidenceUrl?.startsWith("https://github.com/")), resource.id).toBe(true);
      expect(resource.acquisitions.every((item) => item.evidenceUrl?.startsWith("https://github.com/")), resource.id).toBe(true);
      expect(resource.acquisitions.length, resource.id).toBeGreaterThan(0);
      expect(resource.acquisitions.every((item) => Boolean(item.command || item.url)), resource.id).toBe(true);
    }
  });

  it("does not overclaim installation or functional verification", () => {
    for (const resource of getResources()) {
      const install = resource.verifications.find((item) => item.level === "install");
      const functional = resource.verifications.find((item) => item.level === "function");
      expect(install?.status, resource.id).toBe("unverified");
      expect(functional?.status, resource.id).toBe("unverified");
    }
  });
});
