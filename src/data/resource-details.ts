import type { Resource, ResourceDetailContent } from "@/lib/types";

export type CatalogResource = Omit<Resource, "detail">;

const githubDescriptions: Record<string, string> = {
  "anthropics-skills": "Public repository for Agent Skills.",
  "openai-skills": "Skills Catalog for Codex.",
  "trailofbits-skills": "Trail of Bits Claude Code skills for security research, vulnerability detection, and audit workflows.",
  "vercel-agent-skills": "Vercel's official collection of agent skills.",
  "agentic-awesome-skills": "A local, agent-first control plane for catalog discovery, selection, stack validation, and planning.",
  "mirage-dsh": "The World's First Unified Virtual Filesystem For AI Agents.",
  "dsh-web-ui": "Plugin and skin collection for DeepSeek Harness Web UI.",
  modlens: "The first vision plugin for DeepSeek Harness, and a vision bridge for text-only coding agents.",
  "dsh-tui": "A Claude Code-style TUI plugin for DSH with live status, streaming thoughts, rollback, context progress, and TPS.",
  aegis: "Make AI coding agents architecture-aware: baseline-first, evidence-verified, drift-checked, and safe across long tasks.",
  ruflo: "The original agent meta-harness for multi-agent swarms, autonomous workflows, memory, and self-learning intelligence.",
  superclaude: "A configuration framework that enhances Claude Code with specialized commands, cognitive personas, and development methodologies.",
  superpowers: "An agentic skills framework and software development methodology that works.",
  "wshobson-agents": "Multi-harness agentic plugin marketplace for Claude Code, Codex CLI, Cursor, OpenCode, GitHub Copilot, and Gemini CLI.",
  "claude-code-templates": "CLI tool for configuring and monitoring Claude Code.",
  "mcp-reference-servers": "Model Context Protocol Servers.",
  context7: "Up-to-date code documentation for LLMs and AI code editors.",
  "github-mcp": "GitHub's official MCP Server.",
  "playwright-mcp": "Playwright MCP server.",
  "firecrawl-mcp": "Official Firecrawl MCP Server for web scraping and search in LLM clients.",
  "prompts-chat": "Share, discover, and collect prompts from the community; free, open source, and self-hostable.",
  "prompt-guide": "Guides, papers, lessons, notebooks and resources for prompt engineering, context engineering, RAG, and AI Agents.",
  "anthropic-prompt-tutorial": "Anthropic's Interactive Prompt Engineering Tutorial.",
  "brex-prompt-guide": "Tips and tricks for working with Large Language Models like OpenAI's GPT-4.",
  "system-prompts-archive": "A collection of system prompts, tool definitions, and model information from many AI products.",
};

const categoryUseCases: Record<CatalogResource["category"], { suitable: string; unsuitable: string; boundary: string }> = {
  skills: {
    suitable: "希望把成熟工作方法作为可复用能力接入 Agent",
    unsuitable: "需要开箱即用的托管服务或独立应用",
    boundary: "Skill 会在所选 Agent 宿主的权限范围内工作；启用脚本前应检查其文件、网络和命令访问范围。",
  },
  dsh: {
    suitable: "正在使用 DeepSeek Harness，并希望补充界面、工具或工程工作流",
    unsuitable: "没有 DSH 环境，且项目未明确支持其他宿主",
    boundary: "DSH 插件与 Harness 进程共享一定运行环境；安装前应检查 Cordis 配置、依赖和外部服务访问。",
  },
  plugins: {
    suitable: "需要为编码 Agent 增加一组可安装的命令、角色、Skills 或编排能力",
    unsuitable: "只想复制一段 Prompt，不希望改动宿主配置或项目文件",
    boundary: "Agent 插件可能写入宿主配置、执行本地命令或启动后台进程；应从最小范围试用并审查安装脚本。",
  },
  mcp: {
    suitable: "需要通过 MCP 把 AI Agent 连接到外部工具、浏览器、代码或数据",
    unsuitable: "当前 Agent 不支持 MCP，或无法提供所需凭据与运行环境",
    boundary: "MCP 服务可获得其配置所授予的外部系统权限；令牌、会话和远程请求应遵循最小权限原则。",
  },
  prompts: {
    suitable: "需要学习、比较或复用 Prompt 与上下文工程材料",
    unsuitable: "把 Prompt 当作无需验证即可稳定工作的功能模块",
    boundary: "Prompt 内容本身不等于运行时保证；复制、改编和再分发前仍需核对来源、许可与敏感信息。",
  },
};

const categoryFactLabels: Record<CatalogResource["category"], [string, string, string]> = {
  skills: ["Skill 形态", "主要能力", "明确宿主"],
  dsh: ["DSH 扩展形态", "主要能力", "运行宿主"],
  plugins: ["插件形态", "主要能力", "适配宿主"],
  mcp: ["连接方式", "工具能力", "MCP 客户端"],
  prompts: ["内容形态", "学习主题", "适用模型"],
};

const capabilityDescriptions: Record<CatalogResource["category"], (name: string) => string> = {
  skills: (name) => `把“${name}”整理为 Agent 可重复调用的说明、步骤或配套资源。`,
  dsh: (name) => `在 DeepSeek Harness 工作流中补充“${name}”能力。`,
  plugins: (name) => `通过宿主插件、命令、Agent 或 Skills 提供“${name}”。`,
  mcp: (name) => `通过 MCP 工具向兼容客户端暴露“${name}”能力。`,
  prompts: (name) => `围绕“${name}”提供可阅读、比较或复用的 Prompt 内容。`,
};

function repositoryUrl(resource: CatalogResource) {
  return `https://github.com/${resource.owner}/${resource.repo}`;
}

function componentUrl(resource: CatalogResource) {
  const base = repositoryUrl(resource);
  return resource.componentPath ? `${base}/tree/HEAD/${resource.componentPath}` : base;
}

function structureEvidenceUrl(resource: CatalogResource, path: string) {
  if (path.includes("<") || path.includes("*") || /Web 应用|MCP$/.test(path)) return componentUrl(resource);
  const normalized = path.replace(/\/$/, "");
  const fileName = normalized.split("/").at(-1) ?? normalized;
  const looksLikeFile = fileName.includes(".") || /^(Dockerfile|LICENSE|SECURITY|VERSIONING)$/i.test(fileName);
  return `${repositoryUrl(resource)}/${looksLikeFile ? "blob" : "tree"}/HEAD/${normalized}`;
}

function structureRole(path: string) {
  const normalized = path.toLowerCase();
  if (normalized.includes("skill.md")) return "Skill 的入口说明与执行规则";
  if (normalized.includes("plugin.json")) return "插件清单、身份与入口配置";
  if (normalized.includes("package.json")) return "组件依赖、脚本与包元数据";
  if (normalized.includes("cordis")) return "DSH / Cordis 的加载与补丁配置";
  if (normalized.includes("readme")) return "组件用法、配置和限制说明";
  if (normalized.includes("security")) return "漏洞报告与安全政策";
  if (normalized.includes("docker")) return "容器构建或运行配置";
  if (normalized.endsWith(".ipynb") || normalized.includes("notebook")) return "可交互课程或示例笔记本";
  if (normalized.includes("docs") || normalized.includes("guides")) return "补充文档与专题指南";
  if (normalized.includes("src")) return "主要实现源码";
  if (normalized.includes("test") || normalized.includes("e2e")) return "自动化测试与端到端验证";
  if (normalized.includes("prompt")) return "Prompt 正文或内容集合";
  return "仓库中的关键组件或资源目录";
}

function licenseDetails(resource: CatalogResource) {
  const base = repositoryUrl(resource);
  if (resource.id === "prompts-chat") {
    return [
      { scope: "Prompt 内容", spdx: "CC0-1.0", sourceUrl: `${base}/blob/HEAD/LICENSE` },
      { scope: "网站与工具源码", spdx: "MIT", sourceUrl: `${base}/blob/HEAD/LICENSE-CODE` },
    ];
  }
  if (resource.license === "多许可证" || resource.license === "组件级许可") {
    return [{ scope: "各子目录或组件", spdx: "以组件内 LICENSE 为准", sourceUrl: base }];
  }
  if (resource.license === "未识别") {
    return [{ scope: "仓库内容", spdx: "未在本次核验中识别", sourceUrl: base }];
  }
  return [{ scope: "仓库内容", spdx: resource.license.replace(" + 内容许可", ""), sourceUrl: `${base}/blob/HEAD/LICENSE` }];
}

function maintenanceDetails(resource: CatalogResource) {
  const daysOld = Math.floor((Date.now() - Date.parse(resource.updatedAt)) / 86_400_000);
  const note = daysOld > 365
    ? "最近公开更新距本次收录已超过一年，使用前应重点核对内容时效与兼容性。"
    : daysOld > 120
      ? "仓库仍可访问，但最近公开更新距本次收录已有一段时间。"
      : "本次收录时仓库近期仍有公开更新；活跃度不等同于质量或兼容性保证。";
  return {
    lastPush: resource.updatedAt,
    archived: false,
    releaseUrl: `${repositoryUrl(resource)}/releases`,
    note,
  };
}

function boundaryDetails(resource: CatalogResource) {
  const base = categoryUseCases[resource.category];
  const explicit = resource.permissions?.map((permission, index) => ({
    label: `权限与边界 ${index + 1}`,
    description: permission,
    risk: /写入|执行|控制|发送|api key|token|pat|登录|外部/i.test(permission) ? "high" as const : "medium" as const,
    evidenceUrl: componentUrl(resource),
  })) ?? [];
  return explicit.length ? explicit : [{
    label: "运行边界",
    description: base.boundary,
    risk: resource.category === "prompts" ? "low" as const : "medium" as const,
    evidenceUrl: componentUrl(resource),
  }];
}

export function buildResourceDetail(resource: CatalogResource): ResourceDetailContent {
  const base = categoryUseCases[resource.category];
  const [typeLabel, capabilityLabel, hostLabel] = categoryFactLabels[resource.category];
  const repo = repositoryUrl(resource);
  const readme = `${repo}#readme`;
  const hostNames = resource.compatibilities.map((item) => item.host).join("、");
  const acquisitionNames = resource.acquisitions.map((item) => item.label).join("、");
  const limitation = resource.limitations?.[0] ?? base.unsuitable;

  return {
    introduction: `${resource.summary} 它的核心内容集中在${resource.capabilities.slice(0, 4).join("、")}，适合先从官方仓库说明和最小使用范围开始评估。`,
    githubDescription: githubDescriptions[resource.id] ?? "GitHub repository description was not captured in this catalog snapshot.",
    suitableFor: [base.suitable, `当前任务需要${resource.capabilities.slice(0, 2).join("或")}`],
    notSuitableFor: [limitation, "希望在未阅读仓库说明或未核对权限的情况下直接用于生产环境"],
    readmeSummary: [
      `项目定位：${resource.summary}`,
      `公开特征：${resource.facts.join("、")}。`,
      `主要获取路径：${acquisitionNames}；具体命令和要求以仓库当前说明为准。`,
    ],
    capabilityDetails: resource.capabilities.map((name) => ({
      name,
      description: capabilityDescriptions[resource.category](name),
      evidenceUrl: componentUrl(resource),
    })),
    structureDetails: (resource.structure ?? [resource.componentPath ?? "README.md"]).map((path) => ({
      path,
      role: structureRole(path),
      evidenceUrl: structureEvidenceUrl(resource, path),
    })),
    dataBoundaries: boundaryDetails(resource),
    licenses: licenseDetails(resource),
    maintenance: maintenanceDetails(resource),
    evidence: [
      { label: "GitHub 仓库", url: repo },
      { label: "README / 项目说明", url: readme },
      { label: resource.componentPath ? "收录组件路径" : "资源入口", url: componentUrl(resource) },
    ],
    categoryFacts: [
      { label: typeLabel, value: resource.subtype },
      { label: capabilityLabel, value: resource.capabilities.join("、") },
      { label: hostLabel, value: hostNames },
    ],
  };
}
