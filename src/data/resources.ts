import { buildResourceDetail, type CatalogResource } from "@/data/resource-details";
import { STATIC_RESOURCE_TAXONOMY } from "@/data/taxonomy";
import type { CategorySlug, Resource } from "@/lib/types";

export const CATEGORY_INFO: Record<CategorySlug, { label: string; shortLabel: string; description: string; accent: string }> = {
  skills: { label: "Skills", shortLabel: "Skill", description: "为 AI Agent 提供可复用的专业能力与工作流程", accent: "#4f46e5" },
  dsh: { label: "DSH 插件", shortLabel: "DSH", description: "扩展 DeepSeek Harness 的界面、工具与工作方式", accent: "#7c3aed" },
  plugins: { label: "Agent 插件", shortLabel: "Plugin", description: "面向 Codex、Claude Code、Cursor 等宿主的扩展包", accent: "#178f3e" },
  mcp: { label: "MCP 服务器", shortLabel: "MCP", description: "通过 Model Context Protocol 将 Agent 连接到工具与数据", accent: "#1369d1" },
  prompts: { label: "Prompts", shortLabel: "Prompt", description: "可复用的提示词、系统 Prompt 档案与学习资源", accent: "#8b3de3" },
};

export const CATEGORY_INFO_EN: typeof CATEGORY_INFO = {
  skills: { label: "Skills", shortLabel: "Skill", description: "Reusable professional capabilities and workflows for AI agents", accent: "#4f46e5" },
  dsh: { label: "DSH Plugins", shortLabel: "DSH", description: "Interfaces, tools, and workflows that extend DeepSeek Harness", accent: "#7c3aed" },
  plugins: { label: "Agent Plugins", shortLabel: "Plugin", description: "Extensions for Codex, Claude Code, Cursor, and other agent hosts", accent: "#178f3e" },
  mcp: { label: "MCP Servers", shortLabel: "MCP", description: "Connect agents to tools and data through the Model Context Protocol", accent: "#1369d1" },
  prompts: { label: "Prompts", shortLabel: "Prompt", description: "Reusable prompts, system-prompt archives, and learning resources", accent: "#8b3de3" },
};

const metadataVerification = (note = "仓库身份、说明、许可证与关键结构已读取") => [
  { level: "metadata" as const, status: "verified" as const, checkedAt: "2026-08-15", note },
  { level: "install" as const, status: "unverified" as const, note: "尚未在 AgentMatter 测试环境安装" },
  { level: "function" as const, status: "unverified" as const, note: "尚未执行功能场景" },
];

const catalogResources: CatalogResource[] = [
  {
    id: "anthropics-skills", name: "Anthropic Skills", owner: "anthropics", repo: "skills", componentPath: "skills", category: "skills", subtype: "官方目录", officialKind: "platform",
    summary: "Anthropic 公开的 Agent Skills 目录，覆盖文档、设计、开发和内容工作流。", stars: 169508, license: "多许可证", language: "Python", updatedAt: "2026-08-13T18:09:56Z",
    compatibilities: [{ host: "Claude Code", level: "documented" }, { host: "Claude.ai", level: "documented" }, { host: "Claude API", level: "documented" }],
    facts: ["18 个 Skill", "含模板与规范", "合集"], capabilities: ["文档处理", "前端设计", "Skill 创建", "MCP 开发"],
    acquisitions: [{ label: "浏览 Skills", mode: "browse", url: "https://github.com/anthropics/skills/tree/main/skills" }], verifications: metadataVerification(), structure: ["skills/<name>/SKILL.md", "spec/", "template/"], featured: true,
  },
  {
    id: "openai-skills", name: "OpenAI Skills", owner: "openai", repo: "skills", componentPath: "skills/.curated", category: "skills", subtype: "官方目录", officialKind: "platform",
    summary: "OpenAI 为 Codex 提供的精选 Skills 目录，包含研究、部署、文档和开发工具。", stars: 24959, license: "多许可证", language: "Python", updatedAt: "2026-07-14T16:47:46Z",
    compatibilities: [{ host: "Codex", level: "documented" }], facts: ["44 个 Skill", "Codex 目录", "合集"], capabilities: ["研究", "部署", "文档处理", "自动化"],
    acquisitions: [{ label: "浏览精选 Skills", mode: "browse", url: "https://github.com/openai/skills/tree/main/skills/.curated" }], verifications: metadataVerification(), structure: ["skills/.curated/<name>/SKILL.md", "references/", "scripts/"], featured: true,
  },
  {
    id: "trailofbits-skills", name: "Trail of Bits Skills", owner: "trailofbits", repo: "skills", componentPath: "plugins", category: "skills", subtype: "安全合集", officialKind: "publisher",
    summary: "面向安全研究、代码审计和漏洞分析的专业 Skill 与插件合集。", stars: 6599, license: "CC-BY-SA-4.0", language: "Python", updatedAt: "2026-08-14T22:53:11Z",
    compatibilities: [{ host: "Claude Code", level: "documented" }, { host: "Codex", level: "documented" }], facts: ["78 个 Skill", "41 个插件清单", "含脚本"], capabilities: ["代码审计", "漏洞检测", "恶意软件分析", "智能合约安全"],
    acquisitions: [{ label: "查看安装说明", mode: "install", url: "https://github.com/trailofbits/skills#installation", requirements: ["部分 Skill 会执行本地安全工具"] }], verifications: metadataVerification(), permissions: ["可能执行本地命令", "可能读取代码仓库"], structure: ["plugins/<plugin>/.claude-plugin/plugin.json", "plugins/<plugin>/skills/<skill>/SKILL.md"], featured: true,
  },
  {
    id: "vercel-agent-skills", name: "Vercel Agent Skills", owner: "vercel-labs", repo: "agent-skills", componentPath: "skills", category: "skills", subtype: "发布者合集", officialKind: "publisher",
    summary: "Vercel Labs 发布的前端、React、部署和 Web 设计 Skills。", stars: 30058, license: "多许可证", language: "JavaScript", updatedAt: "2026-08-15T12:12:22Z",
    compatibilities: [{ host: "Claude Code", level: "documented" }, { host: "Codex", level: "community" }], facts: ["9 个 Skill", "含 metadata.json", "合集"], capabilities: ["React 最佳实践", "Web 设计", "Vercel 部署"],
    acquisitions: [{ label: "浏览 Skills", mode: "browse", url: "https://github.com/vercel-labs/agent-skills/tree/main/skills" }], verifications: metadataVerification(), structure: ["skills/<name>/SKILL.md", "skills/<name>/metadata.json"], featured: true,
  },
  {
    id: "agentic-awesome-skills", name: "Agentic Awesome Skills", owner: "sickn33", repo: "antigravity-awesome-skills", componentPath: "skills", category: "skills", subtype: "社区大型目录", officialKind: "community",
    summary: "大型社区 Skill 目录与本地发现工具，提供 CLI、MCP、插件和 Workbench。", stars: 44978, license: "MIT + 内容许可", language: "Python", updatedAt: "2026-08-13T17:56:53Z",
    compatibilities: [{ host: "Codex", level: "documented" }, { host: "Claude Code", level: "documented" }, { host: "Cursor", level: "documented" }, { host: "Gemini CLI", level: "documented" }], facts: ["大型目录", "附带 CLI/MCP", "社区合集"], capabilities: ["Skill 发现", "本地目录", "组合规划"],
    acquisitions: [{ label: "查看目录", mode: "browse", url: "https://github.com/sickn33/antigravity-awesome-skills" }], verifications: metadataVerification("仓库结构规模较大，数量不代表逐项质量"), limitations: ["目录规模大，单个 Skill 的来源和许可需要单独核对"], structure: ["skills/<name>/SKILL.md", "apps/", "plugins/"],
  },

  {
    id: "mirage-dsh", name: "Mirage for DSH", owner: "strukto-ai", repo: "mirage", componentPath: "typescript/packages/dsh", category: "dsh", subtype: "文件系统插件", officialKind: "publisher",
    summary: "为 DSH 和其他 Agent 提供跨数据源的统一虚拟文件系统。", stars: 3441, license: "Apache-2.0", language: "TypeScript", updatedAt: "2026-08-15T14:02:06Z",
    compatibilities: [{ host: "DSH", level: "documented" }], facts: ["Cordis 组件", "主产品适配层", "TypeScript"], capabilities: ["虚拟文件系统", "跨数据源检索", "Agent 工具"], acquisitions: [{ label: "查看 DSH 组件", mode: "install", url: "https://github.com/strukto-ai/mirage/tree/main/typescript/packages/dsh" }], verifications: metadataVerification(), permissions: ["读取已连接的数据源", "可能访问网络"], structure: ["typescript/packages/dsh/package.json", "typescript/packages/dsh/cordis.patch.yml"], featured: true,
  },
  {
    id: "dsh-web-ui", name: "DSH Web UI", owner: "zhu1090093659", repo: "dsh-web-ui", componentPath: "packages", category: "dsh", subtype: "UI 插件合集", officialKind: "community",
    summary: "为 DSH Web UI 提供任务看板、Git 图谱、移动端、实时统计与皮肤。", stars: 2516, license: "Apache-2.0", language: "TypeScript", updatedAt: "2026-08-15T14:34:20Z",
    compatibilities: [{ host: "DSH", level: "documented" }], facts: ["多组件仓库", "含皮肤与画廊", "Cordis"], capabilities: ["任务看板", "Git 图谱", "移动端远程", "实时统计"], acquisitions: [{ label: "选择组件", mode: "browse", url: "https://github.com/zhu1090093659/dsh-web-ui/tree/main/packages" }], verifications: metadataVerification(), structure: ["packages/<component>/package.json", "packages/<component>/cordis.patch.yml"], featured: true,
  },
  {
    id: "modlens", name: "ModLens", owner: "liustack", repo: "modlens", componentPath: "dsh", category: "dsh", subtype: "视觉插件", officialKind: "publisher",
    summary: "为纯文本编码 Agent 增加图像理解、OCR、布局和语义证据。", stars: 1767, license: "MIT", language: "TypeScript", updatedAt: "2026-08-14T20:36:33Z",
    compatibilities: [{ host: "DSH", level: "documented" }, { host: "Codex", level: "documented" }, { host: "Claude Code", level: "documented" }], facts: ["5 个视觉 provider", "结构化 JSON", "故障转移"], capabilities: ["OCR", "图像理解", "布局分析"], acquisitions: [{ label: "查看安装", mode: "install", url: "https://github.com/liustack/modlens/blob/main/INSTALL.md", requirements: ["视觉模型或兼容 provider"] }], verifications: metadataVerification(), permissions: ["图像可能发送到外部视觉服务", "可能需要 API Key"], structure: ["dsh/client.js", "dsh/index.js", "dsh/vision-schema.json"], featured: true,
  },
  {
    id: "dsh-tui", name: "dsh-TUI", owner: "ccch1mneyyy", repo: "dsh-TUI", category: "dsh", subtype: "终端界面", officialKind: "community",
    summary: "为 DSH 提供 Claude Code 风格的全屏终端交互体验。", stars: 1177, license: "MIT", language: "TypeScript", updatedAt: "2026-08-15T14:38:42Z",
    compatibilities: [{ host: "DSH", level: "documented" }], facts: ["TUI", "npm 安装", "主题与快捷键"], capabilities: ["思考流", "上下文进度", "TPS 仪表", "会话回滚"], acquisitions: [{ label: "查看快速开始", mode: "install", url: "https://github.com/ccch1mneyyy/dsh-TUI#快速开始", requirements: ["Node.js", "pnpm"] }], verifications: metadataVerification(), structure: ["cordis.yml", "cordis.patch.yml", "bin/dsh-tui.js", "docs/"], limitations: ["终端交互行为依赖 DSH 版本"],
  },
  {
    id: "aegis", name: "Aegis", owner: "GanyuanRan", repo: "Aegis", category: "dsh", subtype: "架构工作流", officialKind: "publisher",
    summary: "让编码 Agent 以基线、证据和漂移检查理解并维护软件架构。", stars: 1019, license: "MIT", language: "Python", updatedAt: "2026-08-15T00:15:11Z",
    compatibilities: [{ host: "DSH", level: "documented" }, { host: "Codex", level: "documented" }, { host: "Claude Code", level: "documented" }, { host: "OpenCode", level: "documented" }], facts: ["跨宿主", "22 个 Skill", "架构基线"], capabilities: ["架构感知", "证据验证", "漂移检查"], acquisitions: [{ label: "选择宿主安装", mode: "install", url: "https://github.com/GanyuanRan/Aegis#quick-install" }], verifications: metadataVerification(), structure: [".codex-plugin/", ".claude-plugin/", ".cursor-plugin/", "cordis.patch.yml"],
  },

  {
    id: "ruflo", name: "Ruflo", owner: "ruvnet", repo: "claude-flow", category: "plugins", subtype: "Agent 编排框架", officialKind: "publisher",
    summary: "面向多 Agent 编排、记忆、MCP 和自适应工作流的完整元框架。", stars: 67908, license: "MIT", language: "TypeScript", updatedAt: "2026-08-15T06:28:27Z",
    compatibilities: [{ host: "Claude Code", level: "documented" }, { host: "Codex", level: "documented" }, { host: "Hermes", level: "documented" }], facts: ["多 Agent", "MCP + Skills", "后台能力"], capabilities: ["Swarm 编排", "记忆", "RAG", "工作流"], acquisitions: [{ label: "查看快速开始", mode: "install", url: "https://github.com/ruvnet/claude-flow" }], verifications: metadataVerification(), permissions: ["执行本地命令", "读写项目文件", "可能启动后台服务"], structure: [".claude-plugin/", ".agents/", ".harness/", "SKILL.md"], featured: true,
  },
  {
    id: "superclaude", name: "SuperClaude Framework", owner: "SuperClaude-Org", repo: "SuperClaude_Framework", category: "plugins", subtype: "Claude Code 框架", officialKind: "community",
    summary: "通过专用命令、角色和开发方法增强 Claude Code 的配置框架。", stars: 23834, license: "MIT", language: "Python", updatedAt: "2026-07-22T06:02:09Z",
    compatibilities: [{ host: "Claude Code", level: "documented" }], facts: ["单宿主", "命令与角色", "Python"], capabilities: ["专业命令", "认知角色", "开发方法"], acquisitions: [{ label: "查看安装", mode: "install", url: "https://github.com/SuperClaude-Org/SuperClaude_Framework" }], verifications: metadataVerification(), structure: ["src/superclaude/", ".claude/", "plugins/"],
  },
  {
    id: "superpowers", name: "Superpowers", owner: "obra", repo: "superpowers", category: "plugins", subtype: "开发工作流", officialKind: "publisher",
    summary: "以 Skills 驱动的完整软件开发方法，覆盖构思、计划、实现和验证。", stars: 272382, license: "MIT", language: "Shell", updatedAt: "2026-08-13T00:36:31Z",
    compatibilities: [{ host: "Codex", level: "documented" }, { host: "Claude Code", level: "documented" }, { host: "Cursor", level: "documented" }, { host: "Gemini CLI", level: "documented" }], facts: ["多宿主", "14 个核心 Skill", "方法论"], capabilities: ["需求构思", "计划编写", "测试驱动", "多 Agent 开发"], acquisitions: [{ label: "选择宿主安装", mode: "install", url: "https://github.com/obra/superpowers#installation" }], verifications: metadataVerification(), structure: [".codex-plugin/plugin.json", ".claude-plugin/", ".cursor-plugin/", "skills/"], featured: true,
  },
  {
    id: "wshobson-agents", name: "Agentic Plugin Marketplace", owner: "wshobson", repo: "agents", componentPath: "plugins", category: "plugins", subtype: "插件市场", officialKind: "community",
    summary: "面向多个编码 Agent 的插件市场，集合专业 Agents、Skills 和工作流。", stars: 38829, license: "MIT", language: "Python", updatedAt: "2026-08-05T07:11:13Z",
    compatibilities: [{ host: "Codex", level: "documented" }, { host: "Claude Code", level: "documented" }, { host: "Cursor", level: "documented" }, { host: "OpenCode", level: "documented" }, { host: "Gemini CLI", level: "documented" }], facts: ["多宿主市场", "180 个 Skill", "多插件清单"], capabilities: ["插件发现", "专业 Agent", "团队编排"], acquisitions: [{ label: "浏览插件", mode: "browse", url: "https://github.com/wshobson/agents/tree/main/plugins" }], verifications: metadataVerification(), structure: ["plugins/<name>/.codex-plugin/plugin.json", "plugins/<name>/.claude-plugin/plugin.json", "plugins/<name>/skills/"], featured: true,
  },
  {
    id: "claude-code-templates", name: "Claude Code Templates", owner: "davila7", repo: "claude-code-templates", category: "plugins", subtype: "配置与模板工具", officialKind: "community",
    summary: "用于配置、扩展和监控 Claude Code 的 CLI、模板及组件集合。", stars: 30251, license: "MIT", language: "Python", updatedAt: "2026-08-15T14:04:31Z",
    compatibilities: [{ host: "Claude Code", level: "documented" }], facts: ["CLI", "模板与 Skills", "含 MCP 配置"], capabilities: ["配置生成", "模板安装", "使用监控"], acquisitions: [{ label: "查看 CLI", mode: "install", url: "https://github.com/davila7/claude-code-templates" }], verifications: metadataVerification(), permissions: ["写入 Claude Code 配置", "可能启动本地 Web 服务"], structure: [".claude-plugin/", ".mcp.json", "cli-tool/", "templates/"],
  },

  {
    id: "mcp-reference-servers", name: "MCP Reference Servers", owner: "modelcontextprotocol", repo: "servers", componentPath: "src", category: "mcp", subtype: "参考实现合集", officialKind: "platform",
    summary: "Model Context Protocol 官方维护的参考服务器与示例实现合集。", stars: 89578, license: "组件级许可", language: "TypeScript", updatedAt: "2026-08-10T02:41:59Z",
    compatibilities: [{ host: "MCP 客户端", level: "documented" }], facts: ["参考实现", "多服务器", "部分已归档"], capabilities: ["文件系统", "Git", "Fetch", "协议测试"], acquisitions: [{ label: "选择参考服务器", mode: "browse", url: "https://github.com/modelcontextprotocol/servers/tree/main/src" }], verifications: metadataVerification(), limitations: ["参考实现不等于生产级托管服务", "组件状态需要单独判断"], structure: ["src/<server>/README.md", "src/<server>/package.json", ".mcp.json"], featured: true,
  },
  {
    id: "context7", name: "Context7", owner: "upstash", repo: "context7", componentPath: "packages/mcp", category: "mcp", subtype: "文档上下文服务", officialKind: "publisher",
    summary: "为编码 Agent 提供最新版本的软件库文档与代码示例。", stars: 60788, license: "MIT", language: "TypeScript", updatedAt: "2026-08-15T14:16:12Z",
    compatibilities: [{ host: "Codex", level: "documented" }, { host: "Claude Code", level: "documented" }, { host: "Cursor", level: "documented" }], facts: ["远程 + 本地", "MCP", "文档检索"], capabilities: ["库文档检索", "版本化示例", "编码上下文"], acquisitions: [{ label: "连接 Context7", mode: "connect", url: "https://github.com/upstash/context7/tree/master/packages/mcp" }], verifications: metadataVerification(), permissions: ["查询内容会发送至 Context7 服务"], structure: ["packages/mcp/package.json", "packages/mcp/mcpb/manifest.json", "packages/mcp/README.md"], featured: true,
  },
  {
    id: "github-mcp", name: "GitHub MCP Server", owner: "github", repo: "github-mcp-server", category: "mcp", subtype: "官方生产实现", officialKind: "platform",
    summary: "让 AI Agent 通过受控工具访问 GitHub 仓库、Issue、Pull Request 与 Actions。", stars: 32270, license: "MIT", language: "Go", updatedAt: "2026-08-14T22:44:12Z",
    compatibilities: [{ host: "VS Code", level: "documented" }, { host: "其他 MCP 客户端", level: "documented" }], facts: ["远程 + 本地", "OAuth / PAT", "只读可选"], capabilities: ["仓库检索", "Issue 管理", "Pull Request", "Actions"], acquisitions: [{ label: "远程 OAuth", mode: "connect", url: "https://github.com/github/github-mcp-server#remote-github-mcp-server" }, { label: "本地 PAT", mode: "install", url: "https://github.com/github/github-mcp-server#local-github-mcp-server", requirements: ["GitHub Personal Access Token"] }, { label: "Docker", mode: "install", command: "docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server", url: "https://github.com/github/github-mcp-server#installation", requirements: ["Docker", "GitHub PAT"] }], verifications: metadataVerification(), permissions: ["读取 GitHub 数据", "启用写入工具时可修改 GitHub 数据", "PAT 应遵循最小权限"], structure: ["cmd/github-mcp-server/", "docs/", "e2e/", "Dockerfile", "SECURITY.md"], featured: true,
  },
  {
    id: "playwright-mcp", name: "Playwright MCP", owner: "microsoft", repo: "playwright-mcp", category: "mcp", subtype: "浏览器自动化", officialKind: "publisher",
    summary: "通过结构化浏览器交互让 Agent 导航网页、读取页面并执行操作。", stars: 36150, license: "Apache-2.0", language: "TypeScript", updatedAt: "2026-08-12T20:16:20Z",
    compatibilities: [{ host: "MCP 客户端", level: "documented" }], facts: ["本地服务", "浏览器会话", "工具列表"], capabilities: ["页面导航", "表单交互", "可访问性快照", "浏览器测试"], acquisitions: [{ label: "查看客户端配置", mode: "install", url: "https://github.com/microsoft/playwright-mcp#getting-started", requirements: ["Node.js", "浏览器运行环境"] }], verifications: metadataVerification(), permissions: ["控制浏览器", "读取页面内容", "可能访问已登录会话"], structure: ["server.json", "src/", "Dockerfile", "SECURITY.md"], featured: true,
  },
  {
    id: "firecrawl-mcp", name: "Firecrawl MCP Server", owner: "firecrawl", repo: "firecrawl-mcp-server", category: "mcp", subtype: "网页抓取与搜索", officialKind: "publisher",
    summary: "为 MCP 客户端提供网页抓取、搜索、内容提取和批处理能力。", stars: 7241, license: "MIT", language: "JavaScript", updatedAt: "2026-08-14T23:12:46Z",
    compatibilities: [{ host: "Claude Code", level: "documented" }, { host: "Cursor", level: "documented" }, { host: "MCP 客户端", level: "documented" }], facts: ["托管 + 本地", "API Key 可选路径", "可自托管"], capabilities: ["网页抓取", "搜索", "内容提取", "批处理"], acquisitions: [{ label: "托管连接", mode: "connect", url: "https://github.com/firecrawl/firecrawl-mcp-server#hosted-mcp-keyless-free-tier" }, { label: "本地运行", mode: "install", command: "npx -y firecrawl-mcp", requirements: ["Node.js", "部分功能需要 Firecrawl API Key"] }], verifications: metadataVerification(), permissions: ["访问外部网页", "使用托管服务时数据会发送至 Firecrawl"], structure: ["src/", "Dockerfile", "VERSIONING.md"],
  },

  {
    id: "prompts-chat", name: "Prompts.chat", owner: "f", repo: "awesome-chatgpt-prompts", componentPath: "PROMPTS.md", category: "prompts", subtype: "Prompt 合集", officialKind: "community",
    summary: "社区共建的 Prompt 发现与收藏项目，同时提供网站、CLI、插件和 MCP。", stars: 167167, license: "CC0 + MIT", language: "HTML", updatedAt: "2026-08-15T03:18:07Z",
    compatibilities: [{ host: "多模型", level: "documented" }], facts: ["可直接使用", "社区合集", "可自托管"], capabilities: ["角色 Prompt", "社区发现", "组织内自托管"], acquisitions: [{ label: "浏览 Prompts", mode: "copy", url: "https://github.com/f/awesome-chatgpt-prompts/blob/main/PROMPTS.md" }], verifications: metadataVerification(), structure: ["PROMPTS.md", "CLAUDE-PLUGIN.md", "MCP", "Web 应用"], featured: true,
  },
  {
    id: "prompt-guide", name: "Prompt Engineering Guide", owner: "dair-ai", repo: "Prompt-Engineering-Guide", category: "prompts", subtype: "教程与指南", officialKind: "publisher",
    summary: "系统讲解 Prompt、上下文工程、RAG 和 AI Agent 的开放学习资源。", stars: 77487, license: "MIT", language: "MDX", updatedAt: "2026-03-11T20:09:13Z",
    compatibilities: [{ host: "多模型", level: "documented" }], facts: ["指南", "12 个 Notebook", "教程型"], capabilities: ["基础 Prompt", "高级策略", "RAG", "Agent"], acquisitions: [{ label: "开始学习", mode: "learn", url: "https://github.com/dair-ai/Prompt-Engineering-Guide" }], verifications: metadataVerification(), structure: ["guides/", "notebooks/", "lecture/"], featured: true,
  },
  {
    id: "anthropic-prompt-tutorial", name: "Anthropic Prompt Engineering Tutorial", owner: "anthropics", repo: "prompt-eng-interactive-tutorial", category: "prompts", subtype: "互动课程", officialKind: "platform",
    summary: "Anthropic 官方互动课程，从 Prompt 基础结构讲到 few-shot、工具使用和检索。", stars: 37675, license: "未识别", language: "Jupyter Notebook", updatedAt: "2026-03-01T17:07:40Z",
    compatibilities: [{ host: "Claude", level: "documented" }, { host: "Amazon Bedrock", level: "documented" }], facts: ["41 个 Notebook", "分平台课程", "进阶路径"], capabilities: ["角色提示", "Few-shot", "减少幻觉", "工具使用"], acquisitions: [{ label: "开始课程", mode: "learn", url: "https://github.com/anthropics/prompt-eng-interactive-tutorial" }], verifications: metadataVerification(), structure: ["Anthropic 1P/*.ipynb", "AmazonBedrock/"], featured: true,
  },
  {
    id: "brex-prompt-guide", name: "Brex Prompt Engineering", owner: "brexhq", repo: "prompt-engineering", category: "prompts", subtype: "文档指南", officialKind: "publisher",
    summary: "一篇结构紧凑的 Prompt 工程指南，介绍模型限制、Prompt 风险和实用策略。", stars: 9581, license: "MIT", updatedAt: "2023-10-23T01:41:26Z",
    compatibilities: [{ host: "多模型", level: "documented" }], facts: ["单文档", "长期未更新", "基础策略"], capabilities: ["引用", "数据嵌入", "结构化输出", "Prompt 安全"], acquisitions: [{ label: "阅读指南", mode: "learn", url: "https://github.com/brexhq/prompt-engineering" }], verifications: metadataVerification(), limitations: ["最后更新较早，部分模型信息可能过时"], structure: ["README.md"],
  },
  {
    id: "system-prompts-archive", name: "System Prompts and Models of AI Tools", owner: "x1xhlol", repo: "system-prompts-and-models-of-ai-tools", category: "prompts", subtype: "系统 Prompt 档案", officialKind: "community",
    summary: "按产品整理多款 AI 工具的系统 Prompt、工具定义和模型资料。", stars: 142842, license: "GPL-3.0", updatedAt: "2026-08-11T13:01:09Z",
    compatibilities: [{ host: "多款 AI 工具", level: "documented" }], facts: ["55+ Prompt 资产", "按产品归档", "含工具 JSON"], capabilities: ["系统 Prompt 研究", "工具定义", "产品对比"], acquisitions: [{ label: "浏览档案", mode: "browse", url: "https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools" }], verifications: metadataVerification("仓库结构、许可与文件类型已读取；未核实每份档案的来源链"), limitations: ["来源、版本与采集日期需要逐项核对", "不应默认视为可再分发内容"], structure: ["<product>/*.txt", "<product>/*.yaml", "<product>/*tools.json"], featured: true,
  },
];

export const resources: Resource[] = catalogResources.map((resource) => {
  const detail = buildResourceDetail(resource);
  return {
    ...resource,
    taxonomy: resource.taxonomy ?? STATIC_RESOURCE_TAXONOMY[resource.id],
    detail,
    compatibilities: resource.compatibilities.map((compatibility) => ({
      ...compatibility,
      evidenceUrl: compatibility.evidenceUrl ?? detail.evidence[2].url,
    })),
    acquisitions: resource.acquisitions.map((acquisition) => ({
      ...acquisition,
      evidenceUrl: acquisition.evidenceUrl ?? acquisition.url ?? detail.evidence[2].url,
    })),
    verifications: resource.verifications.map((verification) => verification.level === "metadata" ? {
      ...verification,
      environment: "GitHub 公开仓库与项目文档",
      evidenceUrls: detail.evidence.map((item) => item.url),
      result: "已读取仓库身份、公开说明、许可证标记与关键结构；未执行安装或功能场景。",
    } : verification),
  };
});
