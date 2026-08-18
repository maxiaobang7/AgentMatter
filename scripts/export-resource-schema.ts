import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { toJSONSchema } from "zod";
import { resources } from "../src/data/resources";
import { localizeResource } from "../src/data/resource-localizations";
import { resourceSchema } from "../src/lib/resource-schema";

async function main() {
  const schemaDirectory = path.resolve("operations/schemas");
  const templateDirectory = path.resolve("operations/templates");
  await Promise.all([mkdir(schemaDirectory, { recursive: true }), mkdir(templateDirectory, { recursive: true })]);
  const schema = toJSONSchema(resourceSchema, { target: "draft-2020-12" });
  const example = structuredClone(resources[0]);
  example.seo = {
    primaryKeyword: `${example.name} 安装教程`,
    title: `${example.name} 安装教程：核心用途 Skill`,
    description: `${example.name} 是一个面向 AI Agent 的开源资源。本页提供基于 GitHub 仓库整理的项目介绍、完整安装步骤、使用教程与必要注意事项。`,
    searchIntent: "installation",
    secondaryKeywords: [example.name, `${example.name} 安装`, "核心用途 Skill"],
    titleCandidates: [`${example.name} 安装教程：核心用途 Skill`, `${example.name} 怎么安装？完整使用教程`],
    selectionReason: "最终标题包含完整项目名、核心用途、资源类型与主要搜索意图，并且没有重复网站品牌名。",
  };
  example.detail.installationGuide = {
    summary: "用一句话说明这个项目的推荐安装路径，以及完成安装后用户可以直接做什么。",
    prerequisites: ["列出安装前必须具备的环境", "列出用户需要提前准备的账号、文件或权限"],
    verification: "给出一个最小可执行任务，并说明看到什么结果才代表安装成功。",
    agentInstallPrompt: "请帮我安装这个资源。项目地址：https://github.com/owner/repo。请先阅读 README 和安装文件，按项目提供的方式安装，完成后运行最小验证并告诉我结果；遇到需要授权或提供凭据的步骤时先询问我。",
    notes: ["只保留会直接影响安装或使用结果的注意事项"],
  };
  example.detail.tutorialSteps = [
    { title: "执行安装", description: "使用仓库提供的准确命令或配置完成安装。" },
    { title: "完成项目设置", description: "根据当前项目补齐路径、凭据或首次运行配置。" },
    { title: "验证是否可用", description: "运行最小任务并对照 installationGuide.verification 检查结果。" },
  ];
  const englishExample = localizeResource(example, "en");
  englishExample.detail.installationGuide = {
    summary: "Explain the recommended installation path for this project and what the user can do immediately after setup.",
    prerequisites: ["List the required runtime", "List any account, file, credential, or permission that must be prepared"],
    verification: "Provide a minimal executable task and describe the result that confirms a successful installation.",
    agentInstallPrompt: "Help me install this resource from https://github.com/owner/repo. Read the README and installation files, use the project's documented method, run a minimal verification, and report the result. Ask before requesting credentials, additional permissions, overwriting files, or performing risky actions.",
    notes: ["Keep only notes that directly affect installation or use"],
  };
  englishExample.detail.tutorialSteps = [
    { title: "Run the installation", description: "Use the exact command or configuration from repository evidence." },
    { title: "Complete project setup", description: "Configure paths, credentials, or first-run settings required by this project." },
    { title: "Verify the result", description: "Run a minimal task and compare the result with installationGuide.verification." },
  ];
  example.localizations = { en: {
    subtype: englishExample.subtype,
    summary: englishExample.summary,
    license: englishExample.license,
    facts: englishExample.facts,
    capabilities: englishExample.capabilities,
    compatibilities: englishExample.compatibilities.map(({ host, note }) => ({ host, ...(note ? { note } : {}) })),
    acquisitions: englishExample.acquisitions.map(({ label, requirements }) => ({ label, ...(requirements ? { requirements } : {}) })),
    verifications: englishExample.verifications.map(({ note, environment, result }) => ({ note, ...(environment ? { environment } : {}), ...(result ? { result } : {}) })),
    permissions: englishExample.permissions,
    limitations: englishExample.limitations,
    detail: englishExample.detail,
    seo: {
      primaryKeyword: `${example.name} installation guide`,
      title: `${example.name} Installation Guide: Core Use Skill`,
      description: `Learn what ${example.name} does, how to install it from GitHub, how to verify the setup, and what to review before using it with an AI agent.`,
      searchIntent: "installation",
      secondaryKeywords: [example.name, `install ${example.name}`, "AI Agent Skill"],
      titleCandidates: [`${example.name} Installation Guide: Core Use Skill`, `How to Install and Use ${example.name}`],
      selectionReason: "The selected title includes the exact project name, resource type, concrete purpose, and installation intent without repeating the AgentMatter brand.",
    },
  } };
  await writeFile(path.join(schemaDirectory, "resource.schema.json"), `${JSON.stringify(schema, null, 2)}\n`, "utf8");
  await writeFile(path.join(templateDirectory, "resource.example.json"), `${JSON.stringify(example, null, 2)}\n`, "utf8");
  console.log("resource schema and example exported");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
