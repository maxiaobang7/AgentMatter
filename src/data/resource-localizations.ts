import type { Resource, ResourceDetailContent, ResourceLocalization } from "@/lib/types";

type EnglishOverride = {
  subtype: string;
  summary: string;
  facts: string[];
  capabilities: string[];
  acquisitionLabels: string[];
  compatibilityHosts?: string[];
  acquisitionRequirements?: Array<string[] | undefined>;
  permissions?: string[];
  limitations?: string[];
  license?: string;
};

const ENGLISH_OVERRIDES: Record<string, EnglishOverride> = {
  "anthropics-skills": { subtype: "Official catalog", summary: "Anthropic's public Agent Skills catalog covering document, design, development, and content workflows.", facts: ["18 Skills", "Templates and specifications", "Collection"], capabilities: ["Document workflows", "Frontend design", "Skill creation", "MCP development"], acquisitionLabels: ["Browse Skills"], license: "Multiple licenses" },
  "openai-skills": { subtype: "Official catalog", summary: "OpenAI's curated Skills catalog for Codex, including research, deployment, document, and development tools.", facts: ["44 Skills", "Codex catalog", "Collection"], capabilities: ["Research", "Deployment", "Document workflows", "Automation"], acquisitionLabels: ["Browse curated Skills"], license: "Multiple licenses" },
  "trailofbits-skills": { subtype: "Security collection", summary: "A professional collection of Skills and plugins for security research, code auditing, and vulnerability analysis.", facts: ["78 Skills", "41 plugin manifests", "Includes scripts"], capabilities: ["Code auditing", "Vulnerability detection", "Malware analysis", "Smart contract security"], acquisitionLabels: ["View installation guide"], acquisitionRequirements: [["Some Skills execute local security tools"]], permissions: ["May execute local commands", "May read code repositories"] },
  "vercel-agent-skills": { subtype: "Publisher collection", summary: "Frontend, React, deployment, and web design Skills published by Vercel Labs.", facts: ["9 Skills", "Includes metadata.json", "Collection"], capabilities: ["React best practices", "Web design", "Vercel deployment"], acquisitionLabels: ["Browse Skills"], license: "Multiple licenses" },
  "agentic-awesome-skills": { subtype: "Large community catalog", summary: "A large community Skill catalog and local discovery toolkit with a CLI, MCP server, plugins, and Workbench.", facts: ["Large catalog", "CLI and MCP included", "Community collection"], capabilities: ["Skill discovery", "Local catalog", "Stack planning"], acquisitionLabels: ["Browse catalog"], limitations: ["The catalog is large, so each Skill's origin and license still need individual review."], license: "MIT + content licenses" },
  "mirage-dsh": { subtype: "Filesystem plugin", summary: "A unified virtual filesystem that connects DSH and other agents to multiple data sources.", facts: ["Cordis component", "Product integration layer", "TypeScript"], capabilities: ["Virtual filesystem", "Cross-source retrieval", "Agent tools"], acquisitionLabels: ["View DSH component"], permissions: ["Reads connected data sources", "May access the network"] },
  "dsh-web-ui": { subtype: "UI plugin collection", summary: "A DSH Web UI collection with task boards, Git graphs, mobile access, live metrics, and visual skins.", facts: ["Multi-component repository", "Skins and gallery", "Cordis"], capabilities: ["Task board", "Git graph", "Mobile remote access", "Live metrics"], acquisitionLabels: ["Choose a component"] },
  modlens: { subtype: "Vision plugin", summary: "Adds image understanding, OCR, layout analysis, and semantic evidence to text-only coding agents.", facts: ["5 vision providers", "Structured JSON", "Failover"], capabilities: ["OCR", "Image understanding", "Layout analysis"], acquisitionLabels: ["View installation"], acquisitionRequirements: [["A vision model or compatible provider"]], permissions: ["Images may be sent to an external vision service", "May require an API key"] },
  "dsh-tui": { subtype: "Terminal interface", summary: "A Claude Code-style full-screen terminal experience for DeepSeek Harness.", facts: ["TUI", "npm installation", "Themes and shortcuts"], capabilities: ["Thought stream", "Context progress", "TPS dashboard", "Session rollback"], acquisitionLabels: ["View quick start"], acquisitionRequirements: [["Node.js", "pnpm"]], limitations: ["Terminal behavior depends on the installed DSH version."] },
  aegis: { subtype: "Architecture workflow", summary: "Helps coding agents understand and maintain software architecture with baselines, evidence, and drift checks.", facts: ["Multi-host", "22 Skills", "Architecture baseline"], capabilities: ["Architecture awareness", "Evidence verification", "Drift checks"], acquisitionLabels: ["Choose a host and install"] },
  ruflo: { subtype: "Agent orchestration framework", summary: "A complete meta-framework for multi-agent orchestration, memory, MCP, and adaptive workflows.", facts: ["Multi-agent", "MCP and Skills", "Background capabilities"], capabilities: ["Swarm orchestration", "Memory", "RAG", "Workflows"], acquisitionLabels: ["View quick start"], permissions: ["Executes local commands", "Reads and writes project files", "May start background services"] },
  superclaude: { subtype: "Claude Code framework", summary: "A configuration framework that enhances Claude Code with specialized commands, personas, and development methods.", facts: ["Single host", "Commands and personas", "Python"], capabilities: ["Specialized commands", "Cognitive personas", "Development methods"], acquisitionLabels: ["View installation"] },
  superpowers: { subtype: "Development workflow", summary: "A Skills-driven software development methodology covering discovery, planning, implementation, and verification.", facts: ["Multi-host", "14 core Skills", "Methodology"], capabilities: ["Requirements discovery", "Plan writing", "Test-driven development", "Multi-agent development"], acquisitionLabels: ["Choose a host and install"] },
  "wshobson-agents": { subtype: "Plugin marketplace", summary: "A multi-harness plugin marketplace combining specialized agents, Skills, and workflows.", facts: ["Multi-host marketplace", "180 Skills", "Multiple plugin manifests"], capabilities: ["Plugin discovery", "Specialized agents", "Team orchestration"], acquisitionLabels: ["Browse plugins"] },
  "claude-code-templates": { subtype: "Configuration and templates", summary: "A CLI, template, and component collection for configuring, extending, and monitoring Claude Code.", facts: ["CLI", "Templates and Skills", "MCP configuration included"], capabilities: ["Configuration generation", "Template installation", "Usage monitoring"], acquisitionLabels: ["View CLI"], permissions: ["Writes Claude Code configuration", "May start a local web service"] },
  "mcp-reference-servers": { subtype: "Reference implementations", summary: "The official collection of reference servers and example implementations maintained by the Model Context Protocol project.", facts: ["Reference implementations", "Multiple servers", "Some components archived"], capabilities: ["Filesystem", "Git", "Fetch", "Protocol testing"], acquisitionLabels: ["Choose a reference server"], compatibilityHosts: ["MCP clients"], limitations: ["Reference implementations are not the same as production hosted services.", "Each component's status must be reviewed separately."], license: "Component-specific licenses" },
  context7: { subtype: "Documentation context service", summary: "Provides coding agents with current library documentation and version-aware code examples.", facts: ["Remote and local", "MCP", "Documentation retrieval"], capabilities: ["Library documentation", "Versioned examples", "Coding context"], acquisitionLabels: ["Connect Context7"], permissions: ["Queries are sent to the Context7 service"] },
  "github-mcp": { subtype: "Official production server", summary: "Lets AI agents access GitHub repositories, issues, pull requests, and Actions through controlled tools.", facts: ["Remote and local", "OAuth or PAT", "Optional read-only mode"], capabilities: ["Repository search", "Issue management", "Pull requests", "Actions"], acquisitionLabels: ["Remote OAuth", "Local PAT", "Docker"], compatibilityHosts: ["VS Code", "Other MCP clients"], acquisitionRequirements: [undefined, ["GitHub Personal Access Token"], ["Docker", "GitHub PAT"]], permissions: ["Reads GitHub data", "Write-enabled tools can modify GitHub data", "PATs should use least privilege"] },
  "playwright-mcp": { subtype: "Browser automation", summary: "Lets agents navigate websites, read pages, and perform actions through structured browser interaction.", facts: ["Local service", "Browser sessions", "Tool catalog"], capabilities: ["Page navigation", "Form interaction", "Accessibility snapshots", "Browser testing"], acquisitionLabels: ["View client configuration"], compatibilityHosts: ["MCP clients"], acquisitionRequirements: [["Node.js", "A browser runtime"]], permissions: ["Controls a browser", "Reads page content", "May access signed-in sessions"] },
  "firecrawl-mcp": { subtype: "Web scraping and search", summary: "Provides web scraping, search, content extraction, and batch processing tools to MCP clients.", facts: ["Hosted and local", "Optional API-key path", "Self-hostable"], capabilities: ["Web scraping", "Search", "Content extraction", "Batch processing"], acquisitionLabels: ["Hosted connection", "Run locally"], compatibilityHosts: ["Claude Code", "Cursor", "MCP clients"], acquisitionRequirements: [undefined, ["Node.js", "Some features require a Firecrawl API key"]], permissions: ["Accesses external websites", "Hosted use sends data to Firecrawl"] },
  "prompts-chat": { subtype: "Prompt collection", summary: "A community-built prompt discovery and collection project with a website, CLI, plugins, and MCP support.", facts: ["Ready to copy", "Community collection", "Self-hostable"], capabilities: ["Role prompts", "Community discovery", "Organization self-hosting"], acquisitionLabels: ["Browse prompts"], compatibilityHosts: ["Multiple models"], license: "CC0 + MIT" },
  "prompt-guide": { subtype: "Tutorials and guide", summary: "An open learning resource covering prompting, context engineering, RAG, and AI agents.", facts: ["Guide", "12 notebooks", "Tutorial format"], capabilities: ["Prompt fundamentals", "Advanced strategies", "RAG", "Agents"], acquisitionLabels: ["Start learning"], compatibilityHosts: ["Multiple models"] },
  "anthropic-prompt-tutorial": { subtype: "Interactive course", summary: "Anthropic's official interactive course covering prompt structure, few-shot examples, tool use, and retrieval.", facts: ["41 notebooks", "Platform-specific tracks", "Progressive curriculum"], capabilities: ["Role prompting", "Few-shot prompting", "Hallucination reduction", "Tool use"], acquisitionLabels: ["Start course"], license: "Not identified" },
  "brex-prompt-guide": { subtype: "Documentation guide", summary: "A compact prompt engineering guide covering model limitations, prompt risks, and practical strategies.", facts: ["Single document", "Not recently updated", "Foundational strategies"], capabilities: ["Citations", "Data embedding", "Structured output", "Prompt security"], acquisitionLabels: ["Read guide"], compatibilityHosts: ["Multiple models"], limitations: ["The repository has not been updated recently, so some model-specific information may be outdated."] },
  "system-prompts-archive": { subtype: "System prompt archive", summary: "An archive of system prompts, tool definitions, and model information organized by AI product.", facts: ["55+ prompt assets", "Organized by product", "Includes tool JSON"], capabilities: ["System prompt research", "Tool definitions", "Product comparison"], acquisitionLabels: ["Browse archive"], compatibilityHosts: ["Multiple AI tools"], limitations: ["Origin, version, and capture date require item-by-item verification.", "Content should not be assumed redistributable by default."] },
};

const ENGLISH_CATEGORY = {
  skills: { suitable: "You want to add a reusable professional workflow to an agent", unsuitable: "You need a hosted service or standalone application", boundary: "A Skill runs within the permissions of its agent host. Review file, network, and command access before enabling scripts.", type: "Skill format", host: "Supported hosts" },
  dsh: { suitable: "You use DeepSeek Harness and want additional tools, interface features, or engineering workflows", unsuitable: "You do not have a DSH environment and the project does not document another host", boundary: "DSH plugins share parts of the Harness runtime. Review Cordis configuration, dependencies, and external access before installation.", type: "DSH extension", host: "Runtime host" },
  plugins: { suitable: "You want installable commands, agents, Skills, or orchestration for a coding agent", unsuitable: "You only want a prompt and do not want to modify host configuration", boundary: "Agent plugins may write configuration, execute local commands, or start background services. Begin with a limited scope and review installation scripts.", type: "Plugin format", host: "Supported hosts" },
  mcp: { suitable: "You need to connect an AI agent to tools, browsers, code, or data through MCP", unsuitable: "Your agent does not support MCP or you cannot provide the required environment", boundary: "An MCP server receives the external-system permissions granted by its configuration. Use least privilege for tokens, sessions, and remote requests.", type: "Connection mode", host: "MCP clients" },
  prompts: { suitable: "You want to learn, compare, or reuse prompt and context-engineering material", unsuitable: "You expect a prompt to behave like a verified software component", boundary: "Prompt content is not a runtime guarantee. Review origin, license, and sensitive information before copying, adapting, or redistributing it.", type: "Content format", host: "Applicable models" },
} as const;

function githubUrl(resource: Resource) { return `https://github.com/${resource.owner}/${resource.repo}`; }
function componentUrl(resource: Resource) { return resource.componentPath ? `${githubUrl(resource)}/tree/HEAD/${resource.componentPath}` : githubUrl(resource); }

function englishDetail(resource: Resource): ResourceDetailContent {
  const category = ENGLISH_CATEGORY[resource.category];
  const repo = githubUrl(resource);
  const permissions = resource.permissions ?? [];
  const licenseScope = resource.license === "Multiple licenses" || resource.license === "Component-specific licenses" ? "Each component" : "Repository content";
  return {
    introduction: `${resource.summary} Its core areas include ${resource.capabilities.slice(0, 4).join(", ")}. Start with the repository documentation and the smallest practical scope before adopting it broadly.`,
    githubDescription: resource.detail.githubDescription,
    suitableFor: [category.suitable, `Your current task needs ${resource.capabilities.slice(0, 2).join(" or ")}`],
    notSuitableFor: [resource.limitations?.[0] ?? category.unsuitable, "You want to use it in production without reading the repository documentation or reviewing permissions"],
    readmeSummary: [`Project focus: ${resource.summary}`, `Published characteristics: ${resource.facts.join(", ")}.`, `Primary acquisition path: ${resource.acquisitions.map((item) => item.label).join(", ")}. Check the current repository for exact commands and requirements.`],
    capabilityDetails: resource.capabilities.map((name) => ({ name, description: resource.category === "mcp" ? `Exposes ${name} to compatible clients through MCP tools.` : resource.category === "prompts" ? `Provides prompt material for learning, comparing, or reusing ${name}.` : `Adds a repeatable workflow or integration for ${name}.`, evidenceUrl: componentUrl(resource) })),
    structureDetails: (resource.structure ?? [resource.componentPath ?? "README.md"]).map((path) => ({ path, role: "A key implementation, configuration, or documentation path in the repository.", evidenceUrl: componentUrl(resource) })),
    dataBoundaries: permissions.length ? permissions.map((permission, index) => ({ label: `Permission boundary ${index + 1}`, description: permission, risk: /write|execute|control|send|token|key|session/i.test(permission) ? "high" : "medium", evidenceUrl: componentUrl(resource) })) : [{ label: "Runtime boundary", description: category.boundary, risk: resource.category === "prompts" ? "low" : "medium", evidenceUrl: componentUrl(resource) }],
    licenses: [{ scope: licenseScope, spdx: resource.license, sourceUrl: resource.license === "Not identified" ? repo : `${repo}/blob/HEAD/LICENSE` }],
    maintenance: { ...resource.detail.maintenance, note: "The repository was publicly accessible when cataloged. Recent activity does not by itself guarantee quality or compatibility." },
    evidence: [{ label: "GitHub repository", url: repo }, { label: "README and project documentation", url: `${repo}#readme` }, { label: resource.componentPath ? "Cataloged component path" : "Resource entry", url: componentUrl(resource) }],
    categoryFacts: [{ label: category.type, value: resource.subtype }, { label: "Primary capabilities", value: resource.capabilities.join(", ") }, { label: category.host, value: resource.compatibilities.map((item) => item.host).join(", ") }],
  };
}

function mergeStoredLocalization(resource: Resource, localization: ResourceLocalization): Resource {
  return {
    ...resource,
    subtype: localization.subtype,
    summary: localization.summary,
    license: localization.license ?? resource.license,
    facts: localization.facts,
    capabilities: localization.capabilities,
    compatibilities: resource.compatibilities.map((item, index) => ({ ...item, ...localization.compatibilities[index] })),
    acquisitions: resource.acquisitions.map((item, index) => ({ ...item, ...localization.acquisitions[index] })),
    verifications: resource.verifications.map((item, index) => ({ ...item, ...localization.verifications[index] })),
    permissions: localization.permissions,
    limitations: localization.limitations,
    detail: localization.detail,
    seo: localization.seo,
  };
}

function mergeStaticOverride(resource: Resource, override: EnglishOverride): Resource {
  const localized: Resource = {
    ...resource,
    subtype: override.subtype,
    summary: override.summary,
    license: override.license ?? resource.license,
    facts: override.facts,
    capabilities: override.capabilities,
    compatibilities: resource.compatibilities.map((item, index) => ({ ...item, host: override.compatibilityHosts?.[index] ?? item.host, note: undefined })),
    acquisitions: resource.acquisitions.map((item, index) => ({ ...item, label: override.acquisitionLabels[index] ?? item.label, requirements: override.acquisitionRequirements?.[index] ?? item.requirements })),
    verifications: resource.verifications.map((item) => ({ ...item, environment: item.level === "metadata" ? "Public GitHub repository and project documentation" : undefined, result: item.level === "metadata" ? "Repository identity, public documentation, license marker, and key paths were reviewed; installation and functional behavior were not tested." : undefined, note: item.level === "metadata" ? "Repository identity, documentation, license, and key structure were reviewed." : item.level === "install" ? "Not installed in the AgentMatter test environment." : "No functional scenario was executed." })),
    permissions: override.permissions,
    limitations: override.limitations,
    detail: resource.detail,
    seo: undefined,
  };
  localized.detail = englishDetail(localized);
  return localized;
}

export function localizeResource(resource: Resource, locale: "en" | "zh"): Resource {
  if (locale === "zh") return resource;
  if (resource.localizations?.en) return mergeStoredLocalization(resource, resource.localizations.en);
  const override = ENGLISH_OVERRIDES[resource.id];
  return override ? mergeStaticOverride(resource, override) : resource;
}

export function localizeResources(resources: Resource[], locale: "en" | "zh") {
  return resources.map((resource) => localizeResource(resource, locale));
}
