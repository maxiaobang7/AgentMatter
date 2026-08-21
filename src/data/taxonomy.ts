import type { CategorySlug, Resource, ResourceFacetKey, ResourceTaxonomy } from "@/lib/types";
import type { PublicLocale } from "@/lib/i18n";

type LocalizedLabel = { zh: string; en: string };

export type TaxonomyOption = {
  slug: string;
  label: LocalizedLabel;
  keywords?: string[];
};

export type TaxonomyFacetDefinition = {
  key: ResourceFacetKey;
  label: LocalizedLabel;
  options: TaxonomyOption[];
};

export type CategoryTaxonomy = {
  browseLabel: LocalizedLabel;
  topics: TaxonomyOption[];
  facets: TaxonomyFacetDefinition[];
};

const option = (slug: string, zh: string, en: string, keywords: string[] = []): TaxonomyOption => ({ slug, label: { zh, en }, keywords });

export const CATEGORY_TAXONOMY: Record<CategorySlug, CategoryTaxonomy> = {
  skills: {
    browseLabel: { zh: "按能力领域浏览", en: "Browse by capability" },
    topics: [
      option("coding-development", "编程开发", "Coding & development", ["编程", "开发", "代码", "coding", "development", "code"]),
      option("frontend-design", "前端与设计", "Frontend & design", ["前端", "设计", "ui", "ux", "frontend", "design", "cover"]),
      option("writing-docs", "写作与文档", "Writing & docs", ["写作", "文档", "内容", "writing", "document", "content"]),
      option("research-knowledge", "研究与知识", "Research & knowledge", ["研究", "检索", "知识", "research", "knowledge"]),
      option("data-analysis", "数据与分析", "Data & analysis", ["数据", "分析", "data", "analysis"]),
      option("testing-debugging", "测试与调试", "Testing & debugging", ["测试", "调试", "test", "debug"]),
      option("devops", "DevOps", "DevOps", ["部署", "devops", "deployment"]),
      option("security", "安全", "Security", ["安全", "漏洞", "审计", "security", "vulnerability", "audit"]),
      option("automation", "自动化", "Automation", ["自动化", "工作流", "automation", "workflow"]),
      option("multimedia", "图像与多媒体", "Images & multimedia", ["图像", "视频", "多媒体", "image", "video", "multimedia"]),
      option("planning", "项目规划", "Planning", ["规划", "计划", "planning"]),
      option("productivity", "生产力", "Productivity", ["生产力", "目录", "合集", "productivity", "catalog", "collection"]),
    ],
    facets: [
      { key: "workflow", label: { zh: "工作阶段", en: "Workflow stage" }, options: [option("discovery", "发现与研究", "Discovery & research"), option("planning", "规划", "Planning"), option("implementation", "实现", "Implementation"), option("review", "审查", "Review"), option("documentation", "文档", "Documentation"), option("security-testing", "安全测试", "Security testing")] },
      { key: "output", label: { zh: "输出类型", en: "Output type" }, options: [option("code", "代码", "Code"), option("document", "文档", "Document"), option("design", "设计稿", "Design"), option("data", "数据", "Data"), option("media", "媒体", "Media")] },
    ],
  },
  dsh: {
    browseLabel: { zh: "按插件能力浏览", en: "Browse by plugin capability" },
    topics: [
      option("ui-enhancements", "界面增强", "UI enhancements", ["界面", "ui", "tui", "web ui"]),
      option("themes-appearance", "主题与外观", "Themes & appearance", ["主题", "皮肤", "theme", "skin"]),
      option("models-providers", "模型与提供商", "Models & providers", ["模型", "provider", "model"]),
      option("sessions-messages", "会话与消息", "Sessions & messages", ["会话", "消息", "session", "message"]),
      option("memory-context", "记忆与上下文", "Memory & context", ["记忆", "上下文", "memory", "context"]),
      option("tools-capabilities", "工具与能力", "Tools & capabilities", ["工具", "文件系统", "tool", "filesystem"]),
      option("browser-web", "浏览器与网络", "Browser & web", ["浏览器", "网络", "browser", "web"]),
      option("multimodal", "多模态", "Multimodal", ["图像", "视觉", "ocr", "vision", "multimodal"]),
      option("workflow-automation", "工作流与自动化", "Workflow & automation", ["工作流", "架构", "自动化", "workflow", "architecture", "automation"]),
      option("git-code-review", "Git 与代码审查", "Git & code review", ["git", "代码审查", "code review"]),
      option("integrations", "通知与集成", "Notifications & integrations", ["通知", "集成", "notification", "integration"]),
      option("runtime", "开发与运行环境", "Development & runtime", ["运行", "终端", "runtime", "terminal"]),
      option("security-permissions", "安全与权限", "Security & permissions", ["安全", "权限", "security", "permission"]),
      option("usage-cost", "用量与成本", "Usage & cost", ["用量", "成本", "usage", "cost"]),
      option("remote-mobile", "远程与移动", "Remote & mobile", ["远程", "移动", "remote", "mobile"]),
    ],
    facets: [
      { key: "surface", label: { zh: "作用位置", en: "Surface" }, options: [option("web-ui", "Web UI", "Web UI"), option("terminal", "终端", "Terminal"), option("agent-runtime", "Agent 运行时", "Agent runtime"), option("remote", "远程端", "Remote")] },
    ],
  },
  plugins: {
    browseLabel: { zh: "按扩展能力浏览", en: "Browse by extension capability" },
    topics: [
      option("development-workflow", "开发工作流", "Development workflow", ["开发", "工作流", "development", "workflow"]),
      option("multi-agent", "多 Agent 编排", "Multi-agent orchestration", ["多 agent", "编排", "swarm", "multi-agent", "orchestration"]),
      option("code-review", "代码审查", "Code review", ["代码审查", "审计", "code review", "audit"]),
      option("git-github", "Git 与 GitHub", "Git & GitHub", ["git", "github"]),
      option("browser-web", "浏览器与网络", "Browser & web", ["浏览器", "browser", "web"]),
      option("memory-context", "记忆与上下文", "Memory & context", ["记忆", "上下文", "memory", "context"]),
      option("planning-tasks", "规划与任务", "Planning & tasks", ["规划", "任务", "planning", "task"]),
      option("testing-debugging", "测试与调试", "Testing & debugging", ["测试", "调试", "test", "debug"]),
      option("docs-knowledge", "文档与知识", "Docs & knowledge", ["文档", "知识", "docs", "knowledge"]),
      option("automation-integrations", "自动化与集成", "Automation & integrations", ["自动化", "集成", "automation", "integration"]),
      option("extension-management", "扩展与模板", "Extensions & templates", ["市场", "模板", "配置", "marketplace", "template", "configuration"]),
      option("security", "安全与权限", "Security & permissions", ["安全", "权限", "security", "permission"]),
    ],
    facets: [
      { key: "extension", label: { zh: "扩展形式", en: "Extension form" }, options: [option("framework", "框架", "Framework"), option("workflow-pack", "工作流包", "Workflow pack"), option("marketplace", "插件市场", "Marketplace"), option("templates", "配置与模板", "Config & templates")] },
      { key: "scope", label: { zh: "使用范围", en: "Usage scope" }, options: [option("project", "项目级", "Project"), option("user", "用户全局", "User-wide"), option("team", "团队共享", "Team shared")] },
    ],
  },
  mcp: {
    browseLabel: { zh: "按连接能力浏览", en: "Browse by connection" },
    topics: [
      option("developer-tools", "开发工具", "Developer tools", ["开发", "工具", "filesystem", "git", "developer", "tool"]),
      option("git-github", "Git 与 GitHub", "Git & GitHub", ["git", "github", "仓库", "issue", "pull request"]),
      option("browser-automation", "浏览器自动化", "Browser automation", ["浏览器", "自动化", "playwright", "browser", "automation"]),
      option("search-crawling", "搜索与网页抓取", "Search & crawling", ["搜索", "抓取", "爬取", "search", "crawl", "firecrawl"]),
      option("databases", "数据库", "Databases", ["数据库", "sql", "database"]),
      option("files-storage", "文件与存储", "Files & storage", ["文件", "存储", "filesystem", "storage"]),
      option("docs-knowledge", "文档与知识库", "Docs & knowledge", ["文档", "知识", "context7", "documentation", "knowledge"]),
      option("communication", "通信与协作", "Communication", ["通信", "协作", "message", "collaboration"]),
      option("cloud-devops", "云服务与 DevOps", "Cloud & DevOps", ["云", "devops", "cloud"]),
      option("data-analytics", "数据与分析", "Data & analytics", ["数据", "分析", "data", "analytics"]),
      option("ai-media", "AI 与多媒体", "AI & media", ["图像", "音频", "media", "image", "audio"]),
      option("productivity", "生产力与自动化", "Productivity", ["生产力", "自动化", "productivity"]),
      option("security", "安全", "Security", ["安全", "security"]),
    ],
    facets: [
      { key: "deployment", label: { zh: "部署方式", en: "Deployment" }, options: [option("local", "本地", "Local"), option("hosted", "托管", "Hosted"), option("self-hosted", "自托管", "Self-hosted"), option("hybrid", "混合", "Hybrid")] },
      { key: "transport", label: { zh: "传输协议", en: "Transport" }, options: [option("stdio", "stdio", "stdio"), option("streamable-http", "Streamable HTTP", "Streamable HTTP"), option("sse", "SSE", "SSE")] },
      { key: "authentication", label: { zh: "认证方式", en: "Authentication" }, options: [option("none", "无需认证", "No authentication"), option("api-key", "API Key", "API key"), option("oauth", "OAuth", "OAuth"), option("pat", "PAT", "PAT")] },
    ],
  },
  prompts: {
    browseLabel: { zh: "按内容用途浏览", en: "Browse by purpose" },
    topics: [
      option("prompt-library", "Prompt 合集", "Prompt libraries", ["合集", "library", "collection"]),
      option("prompt-engineering", "Prompt 工程学习", "Prompt engineering", ["教程", "指南", "课程", "tutorial", "guide", "course"]),
      option("system-prompt-research", "系统 Prompt 研究", "System prompt research", ["系统 prompt", "system prompt", "档案", "archive"]),
      option("coding", "编程", "Coding", ["编程", "代码", "coding", "code"]),
      option("writing", "写作", "Writing", ["写作", "writing"]),
      option("research", "研究", "Research", ["研究", "research"]),
      option("data-analysis", "数据分析", "Data analysis", ["数据", "分析", "data", "analysis"]),
      option("marketing", "营销", "Marketing", ["营销", "marketing"]),
      option("education", "教育", "Education", ["教育", "学习", "education", "learning"]),
      option("product-design", "产品与设计", "Product & design", ["产品", "设计", "product", "design"]),
      option("agent-orchestration", "Agent 编排", "Agent orchestration", ["agent", "编排", "orchestration"]),
      option("evaluation-security", "安全与评测", "Evaluation & security", ["安全", "评测", "security", "evaluation"]),
    ],
    facets: [
      { key: "content", label: { zh: "内容形态", en: "Content format" }, options: [option("collection", "Prompt 合集", "Prompt collection"), option("course", "互动课程", "Interactive course"), option("guide", "教程与指南", "Tutorial & guide"), option("archive", "研究档案", "Research archive")] },
    ],
  },
};

export const STATIC_RESOURCE_TAXONOMY: Record<string, ResourceTaxonomy> = {
  "anthropics-skills": { primaryTopic: "productivity", secondaryTopics: ["frontend-design", "writing-docs"], facets: { workflow: ["implementation", "documentation"], output: ["code", "document", "design"] } },
  "openai-skills": { primaryTopic: "automation", secondaryTopics: ["research-knowledge", "writing-docs"], facets: { workflow: ["discovery", "implementation", "documentation"], output: ["code", "document", "data"] } },
  "trailofbits-skills": { primaryTopic: "security", secondaryTopics: ["testing-debugging"], facets: { workflow: ["review", "security-testing"], output: ["code", "data"] } },
  "vercel-agent-skills": { primaryTopic: "frontend-design", secondaryTopics: ["coding-development", "devops"], facets: { workflow: ["implementation", "review"], output: ["code", "design"] } },
  "agentic-awesome-skills": { primaryTopic: "productivity", secondaryTopics: ["automation", "planning"], facets: { workflow: ["discovery", "planning"], output: ["code", "document"] } },
  "mirage-dsh": { primaryTopic: "tools-capabilities", secondaryTopics: ["memory-context"], facets: { surface: ["agent-runtime"] } },
  "dsh-web-ui": { primaryTopic: "ui-enhancements", secondaryTopics: ["themes-appearance", "remote-mobile"], facets: { surface: ["web-ui", "remote"] } },
  modlens: { primaryTopic: "multimodal", secondaryTopics: ["tools-capabilities"], facets: { surface: ["agent-runtime"] } },
  "dsh-tui": { primaryTopic: "ui-enhancements", secondaryTopics: ["runtime", "sessions-messages"], facets: { surface: ["terminal"] } },
  aegis: { primaryTopic: "workflow-automation", secondaryTopics: ["git-code-review"], facets: { surface: ["agent-runtime"] } },
  ruflo: { primaryTopic: "multi-agent", secondaryTopics: ["memory-context", "automation-integrations"], facets: { extension: ["framework"], scope: ["project", "team"] } },
  superclaude: { primaryTopic: "development-workflow", secondaryTopics: ["planning-tasks"], facets: { extension: ["framework"], scope: ["user"] } },
  superpowers: { primaryTopic: "development-workflow", secondaryTopics: ["planning-tasks", "testing-debugging"], facets: { extension: ["workflow-pack"], scope: ["project", "user"] } },
  "wshobson-agents": { primaryTopic: "extension-management", secondaryTopics: ["multi-agent"], facets: { extension: ["marketplace"], scope: ["user", "team"] } },
  "claude-code-templates": { primaryTopic: "extension-management", secondaryTopics: ["development-workflow"], facets: { extension: ["templates"], scope: ["project", "user"] } },
  "mcp-reference-servers": { primaryTopic: "developer-tools", secondaryTopics: ["files-storage"], facets: { deployment: ["local"], transport: ["stdio"], authentication: ["none"] } },
  context7: { primaryTopic: "docs-knowledge", secondaryTopics: ["developer-tools"], facets: { deployment: ["hybrid"], transport: ["stdio", "streamable-http"] } },
  "github-mcp": { primaryTopic: "git-github", secondaryTopics: ["developer-tools"], facets: { deployment: ["hybrid"], transport: ["stdio", "streamable-http"], authentication: ["oauth", "pat"] } },
  "playwright-mcp": { primaryTopic: "browser-automation", secondaryTopics: ["developer-tools"], facets: { deployment: ["local"], transport: ["stdio"], authentication: ["none"] } },
  "firecrawl-mcp": { primaryTopic: "search-crawling", secondaryTopics: ["browser-automation"], facets: { deployment: ["local"], transport: ["stdio"], authentication: ["api-key"] } },
  "prompts-chat": { primaryTopic: "prompt-library", secondaryTopics: ["writing", "coding"], facets: { content: ["collection"] } },
  "prompt-guide": { primaryTopic: "prompt-engineering", secondaryTopics: ["research", "agent-orchestration"], facets: { content: ["guide"] } },
  "anthropic-prompt-tutorial": { primaryTopic: "prompt-engineering", secondaryTopics: ["education"], facets: { content: ["course"] } },
  "brex-prompt-guide": { primaryTopic: "prompt-engineering", secondaryTopics: ["evaluation-security"], facets: { content: ["guide"] } },
  "system-prompts-archive": { primaryTopic: "system-prompt-research", secondaryTopics: ["research", "agent-orchestration"], facets: { content: ["archive"] } },
};

function localized(label: LocalizedLabel, locale: PublicLocale) {
  return label[locale];
}

export function getCategoryTaxonomy(category: CategorySlug, source: Record<CategorySlug, CategoryTaxonomy> = CATEGORY_TAXONOMY) {
  return source[category];
}

export function getTaxonomyOption(category: CategorySlug, facet: "topic" | ResourceFacetKey, slug: string, source: Record<CategorySlug, CategoryTaxonomy> = CATEGORY_TAXONOMY) {
  const config = source[category];
  const options = facet === "topic" ? config.topics : config.facets.find((item) => item.key === facet)?.options;
  return options?.find((item) => item.slug === slug);
}

export function getTaxonomyLabel(category: CategorySlug, facet: "topic" | ResourceFacetKey, slug: string, locale: PublicLocale, source: Record<CategorySlug, CategoryTaxonomy> = CATEGORY_TAXONOMY) {
  return getTaxonomyOption(category, facet, slug, source)?.label[locale] ?? slug;
}

export function getFacetLabel(category: CategorySlug, key: ResourceFacetKey, locale: PublicLocale) {
  return CATEGORY_TAXONOMY[category].facets.find((facet) => facet.key === key)?.label[locale] ?? key;
}

export function getResourceTaxonomy(resource: Resource): ResourceTaxonomy {
  if (resource.taxonomy) return resource.taxonomy;
  if (STATIC_RESOURCE_TAXONOMY[resource.id]) return STATIC_RESOURCE_TAXONOMY[resource.id];

  const haystack = [resource.name, resource.subtype, resource.summary, ...resource.capabilities, ...resource.facts].join(" ").toLocaleLowerCase();
  const topics = CATEGORY_TAXONOMY[resource.category].topics;
  const ranked = topics
    .map((topic, index) => ({ topic, index, score: (topic.keywords ?? []).reduce((score, keyword) => score + (haystack.includes(keyword.toLocaleLowerCase()) ? 1 : 0), 0) }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  return { primaryTopic: ranked[0]?.topic.slug ?? topics[0].slug, secondaryTopics: ranked.filter((item) => item.score > 0).slice(1, 3).map((item) => item.topic.slug) };
}

export function resourceTopicLabel(resource: Resource, locale: PublicLocale, source: Record<CategorySlug, CategoryTaxonomy> = CATEGORY_TAXONOMY) {
  return getTaxonomyLabel(resource.category, "topic", getResourceTaxonomy(resource).primaryTopic, locale, source);
}

export function resourceFacetBadges(resource: Resource, locale: PublicLocale, limit = 3, source: Record<CategorySlug, CategoryTaxonomy> = CATEGORY_TAXONOMY) {
  const taxonomy = getResourceTaxonomy(resource);
  const badges = Object.entries(taxonomy.facets ?? {}).flatMap(([key, values]) =>
    (values ?? []).map((value) => getTaxonomyLabel(resource.category, key as ResourceFacetKey, value, locale, source)),
  );
  return [...new Set(badges)].slice(0, limit);
}

export function browseLabel(category: CategorySlug, locale: PublicLocale, source: Record<CategorySlug, CategoryTaxonomy> = CATEGORY_TAXONOMY) {
  return localized(source[category].browseLabel, locale);
}
