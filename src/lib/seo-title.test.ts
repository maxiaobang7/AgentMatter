import { describe, expect, it } from "vitest";
import { evaluateResourceSeoTitle, seoTitleHardIssues } from "@/lib/seo-title";

const resource = {
  name: "第一性原理",
  category: "prompts" as const,
  subtype: "从基本事实重新推导路径的 Prompt",
  capabilities: ["区分基本事实和习惯性假设"],
  officialKind: "publisher" as const,
};

describe("SEO title claims", () => {
  it("allows a protected term when it is part of the exact resource name", () => {
    const title = "第一性原理 Prompt 使用指南";

    expect(seoTitleHardIssues(resource, title)).not.toContain("标题包含无法由仓库资料证明的绝对化表述");
    expect(evaluateResourceSeoTitle(resource, title).issues).not.toContain("标题包含无法由仓库资料证明的绝对化表述");
  });

  it("still rejects unsupported claims outside the exact resource name", () => {
    const title = "第一性原理最好 Prompt 使用指南";

    expect(seoTitleHardIssues(resource, title)).toContain("标题包含无法由仓库资料证明的绝对化表述");
    expect(evaluateResourceSeoTitle(resource, title).issues).toContain("标题包含无法由仓库资料证明的绝对化表述");
  });
});
