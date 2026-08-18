import { describe, expect, it } from "vitest";
import { resources } from "@/data/resources";
import { resourceSchema } from "@/lib/resource-schema";

describe("resourceSchema", () => {
  it("accepts all static migration seeds", () => {
    for (const resource of resources) expect(resourceSchema.safeParse(resource), resource.id).toMatchObject({ success: true });
  });

  it("rejects taxonomy values outside the resource category vocabulary", () => {
    const candidate = structuredClone(resources[0]);
    candidate.taxonomy = { primaryTopic: "browser-automation" };
    expect(resourceSchema.safeParse(candidate).success).toBe(false);
  });

  it("rejects a resource whose evidence does not include its GitHub repository", () => {
    const candidate = structuredClone(resources[0]);
    candidate.detail.evidence = [{ label: "错误来源", url: "https://github.com/another/project" }];
    expect(resourceSchema.safeParse(candidate).success).toBe(false);
  });

  it("rejects non-GitHub provenance URLs", () => {
    const candidate = structuredClone(resources[0]);
    candidate.provenance = { generatedBy: "codex", generatedAt: new Date().toISOString(), sourceUrls: ["https://example.com/source"] };
    candidate.detail.installationGuide = { summary: "这是一段项目专属的安装说明，会告诉用户如何完成准备和安装。", prerequisites: ["已准备运行环境"], verification: "运行一个最小任务并确认资源返回预期结果。", agentInstallPrompt: "请阅读项目仓库并按官方安装步骤完成安装，完成后运行最小任务验证结果。" };
    candidate.detail.tutorialSteps = [{ title: "完成安装", description: "复制项目提供的命令并完成安装。" }, { title: "验证结果", description: "运行最小任务确认资源已加载。" }];
    expect(resourceSchema.safeParse(candidate).success).toBe(false);
  });

  it("accepts the optional editorial tutorial, use cases and review", () => {
    const candidate = structuredClone(resources[0]);
    candidate.detail.installationGuide = { summary: "这是一段项目专属的安装说明，会告诉用户如何完成准备和安装。", prerequisites: ["已安装 Git"], verification: "运行一个最小任务并确认资源返回预期结果。", agentInstallPrompt: "请阅读项目仓库并按官方安装步骤完成安装，完成后运行最小任务验证结果。" };
    candidate.detail.tutorialSteps = [{ title: "完成安装", description: "按照仓库说明复制完整目录，再在宿主中触发 Skill。" }];
    candidate.detail.useCases = [{ title: "内容创作", description: "把长文整理成可交给图片模型的封面提示词。" }];
    candidate.detail.review = { summary: "这是一段基于仓库资料整理的使用评价，不把资料阅读写成亲自实测。", strengths: ["流程清楚"], limitations: ["仍需外部图片模型"] };
    expect(resourceSchema.safeParse(candidate).success).toBe(true);
  });

  it("requires a project-specific installation guide for AI generated resources", () => {
    const candidate = structuredClone(resources[0]);
    candidate.provenance = {
      generatedBy: "codex",
      generatedAt: new Date().toISOString(),
      sourceUrls: [`https://github.com/${candidate.owner}/${candidate.repo}`],
    };
    candidate.detail.tutorialSteps = [
      { title: "完成安装", description: "运行仓库提供的安装命令。" },
      { title: "验证结果", description: "运行最小任务确认资源已加载。" },
    ];
    expect(resourceSchema.safeParse(candidate).success).toBe(false);
  });

  it("requires an AI Agent installation prompt for generated resources", () => {
    const candidate = structuredClone(resources[0]);
    candidate.provenance = {
      generatedBy: "codex",
      generatedAt: new Date().toISOString(),
      sourceUrls: [`https://github.com/${candidate.owner}/${candidate.repo}`],
    };
    candidate.detail.installationGuide = {
      summary: "这是一段项目专属的安装说明，会告诉用户如何完成准备和安装。",
      prerequisites: ["已安装 Git"],
      verification: "运行一个最小任务并确认资源返回预期结果。",
    };
    candidate.detail.tutorialSteps = [
      { title: "完成安装", description: "运行仓库提供的安装命令。" },
      { title: "验证结果", description: "运行最小任务确认资源已加载。" },
    ];
    expect(resourceSchema.safeParse(candidate).success).toBe(false);
  });

  it("requires structured SEO fields for AI generated resources", () => {
    const candidate = structuredClone(resources[0]);
    candidate.provenance = { generatedBy: "codex", generatedAt: new Date().toISOString(), sourceUrls: [`https://github.com/${candidate.owner}/${candidate.repo}`] };
    candidate.detail.installationGuide = { summary: "这是一段项目专属的安装说明，会告诉用户如何完成准备和安装。", prerequisites: ["已安装 Git"], verification: "运行一个最小任务并确认资源返回预期结果。", agentInstallPrompt: "请阅读项目仓库并按官方安装步骤完成安装，完成后运行最小任务验证结果。" };
    candidate.detail.tutorialSteps = [{ title: "完成安装", description: "复制项目提供的命令并完成安装。" }, { title: "验证结果", description: "运行最小任务确认资源已加载。" }];
    const result = resourceSchema.safeParse(candidate);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path.join(".") === "seo")).toBe(true);
  });

  it("accepts complete AI-generated SEO and rejects brand duplication", () => {
    const candidate = structuredClone(resources[0]);
    candidate.provenance = { generatedBy: "codex", generatedAt: new Date().toISOString(), sourceUrls: [`https://github.com/${candidate.owner}/${candidate.repo}`] };
    candidate.detail.installationGuide = { summary: "这是一段项目专属的安装说明，会告诉用户如何完成准备和安装。", prerequisites: ["已安装 Git"], verification: "运行一个最小任务并确认资源返回预期结果。", agentInstallPrompt: "请阅读项目仓库并按官方安装步骤完成安装，完成后运行最小任务验证结果。" };
    candidate.detail.tutorialSteps = [{ title: "完成安装", description: "复制项目提供的命令并完成安装。" }, { title: "验证结果", description: "运行最小任务确认资源已加载。" }];
    candidate.seo = {
      primaryKeyword: `${candidate.name} 安装教程`,
      title: `${candidate.name} 安装教程：内容创作 Skill`,
      description: `${candidate.name} 是一个用于内容创作的 Agent Skill。本页提供项目介绍、完整安装步骤、使用教程与注意事项，帮助用户快速完成配置。`,
      searchIntent: "installation",
      secondaryKeywords: [candidate.name, "内容创作 Skill"],
      titleCandidates: [`${candidate.name} 安装教程：内容创作 Skill`, `${candidate.name} 使用指南：内容创作 Skill`],
      selectionReason: "这个标题包含完整项目名、核心用途、资源类型与清晰的安装搜索意图。",
    };
    candidate.localizations = { en: {
      subtype: "Content creation",
      summary: `${candidate.name} is an Agent Skill for repeatable content creation workflows and guided task execution.`,
      facts: ["Reusable workflow"],
      capabilities: ["Content creation"],
      compatibilities: candidate.compatibilities.map((item) => ({ host: item.host })),
      acquisitions: candidate.acquisitions.map((item) => ({ label: `Install ${candidate.name}`, requirements: item.requirements })),
      verifications: candidate.verifications.map(() => ({ note: "Public repository information was reviewed." })),
      detail: structuredClone(candidate.detail),
      seo: {
        primaryKeyword: `${candidate.name} installation guide`,
        title: `${candidate.name} Installation Guide: Content Creation Skill`,
        description: `Learn how to install and use ${candidate.name}, including its core content creation workflow, requirements, practical steps, and verification guidance.`,
        searchIntent: "installation",
        secondaryKeywords: [candidate.name, "content creation Skill"],
      },
    } };
    expect(resourceSchema.safeParse(candidate).success).toBe(true);
    candidate.seo.title = `${candidate.seo.title} | AgentMatter`;
    expect(resourceSchema.safeParse(candidate).success).toBe(false);
  });

  it("accepts repository media with an explicit placement and dimensions", () => {
    const candidate = structuredClone(resources[0]);
    candidate.detail.media = [{
      id: "workflow-example",
      src: "https://raw.githubusercontent.com/anthropics/skills/main/skills/example.png",
      sourceUrl: "https://raw.githubusercontent.com/anthropics/skills/main/skills/example.png",
      evidenceUrl: "https://github.com/anthropics/skills/blob/main/skills/example.png",
      alt: "仓库中的 Skill 工作流示例图",
      caption: "图片来自项目仓库。",
      kind: "diagram",
      placement: "after-introduction",
      width: 1200,
      height: 675,
    }];
    expect(resourceSchema.safeParse(candidate).success).toBe(true);
  });

  it("rejects unrelated remote images in editorial media", () => {
    const candidate = structuredClone(resources[0]);
    candidate.detail.media = [{
      id: "outside-image",
      src: "https://example.com/screenshot.png",
      sourceUrl: "https://github.com/anthropics/skills/blob/main/skills/example.png",
      evidenceUrl: "https://github.com/anthropics/skills/blob/main/skills/example.png",
      alt: "与仓库无关的外部图片",
      kind: "screenshot",
      placement: "after-introduction",
      width: 1200,
      height: 675,
    }];
    expect(resourceSchema.safeParse(candidate).success).toBe(false);
  });
});
