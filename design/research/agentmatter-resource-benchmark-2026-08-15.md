# AgentMatter 五类资源基准研究与页面 V2 规格

> 数据快照：2026-08-15。来源仅限 GitHub 仓库、仓库 README 与仓库文件树。Star 会持续变化；它只表示关注度，不等同于质量、安全性或兼容性。

## 1. 选样方法

每类选择 5 个项目，综合考虑：GitHub 关注度、生态代表性、持续维护信号、信息结构完整度与形态差异。DSH 生态发布时间很短，因此该类的“经典”解释为当前最有代表性的先行项目，而不是经过多年验证的成熟项目。

AgentMatter 的资源身份采用三层模型：

- 仓库：`owner/repo`
- 资源：可安装或可使用的独立对象
- 组件路径：`owner/repo#path`，用于 monorepo、合集和多组件仓库

## 2. 25 个 GitHub 基准样本

### 2.1 Skills

| 项目 | Star 快照 | 提供的信息 | 仓库结构特征 | 对 AgentMatter 的启示 |
|---|---:|---|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) | 169,508 | Skill 集、适用入口、创建示例、合作伙伴 Skill、免责声明 | `skills/<name>/SKILL.md`，另有 `spec/`、`template/` 和插件清单 | 区分官方示例、合作伙伴与第三方；合集不能只做一张仓库卡，应展开到组件级 |
| [openai/skills](https://github.com/openai/skills) | 24,959 | Codex Skills 目录、安装方式、许可说明 | `skills/.curated/<name>/SKILL.md`，部分 Skill 带 `references/`、脚本和资产 | 要显示宿主 Agent、安装目标、资源目录及附带文件，不应只展示 README 摘要 |
| [trailofbits/skills](https://github.com/trailofbits/skills) | 6,599 | 安装、分类插件目录、安全研究用途、开发与贡献方式 | `plugins/<plugin>/.claude-plugin/plugin.json` + `skills/<skill>/SKILL.md`；一个插件可含多个 Skill | Skill 和插件存在包含关系；详情页必须显示“所属插件”和安全用途/风险边界 |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | 30,058 | Skill 目录、安装、使用、结构约定 | `skills/<name>/SKILL.md` + `README.md` + `AGENTS.md` + `metadata.json`，部分提供 zip | 可把结构完整度做成信号：说明、元数据、可下载包、维护文件是否齐全 |
| [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) | 44,978 | 大型目录、CLI/MCP/Workbench、安装预览、验证与隐私/安全文档 | 海量 `skills/<name>/SKILL.md`，同时含应用、插件、目录、政策与安全文件 | 大合集需要“库级详情 + 组件搜索”；数量不是质量，必须显示来源、审查状态和重复风险 |

**Skills 专属字段：** 单一 Skill/合集、Skill 规范、宿主 Agent、触发方式、包含的脚本/参考资料/资产、所属插件、安装目标、权限与外部依赖。

### 2.2 DSH 插件

| 项目 | Star 快照 | 提供的信息 | 仓库结构特征 | 对 AgentMatter 的启示 |
|---|---:|---|---|---|
| [strukto-ai/mirage](https://github.com/strukto-ai/mirage) | 3,441 | 统一虚拟文件系统、架构、Python/TypeScript/CLI 安装与快速开始 | DSH 组件位于 `typescript/packages/dsh`，含 `package.json` 与 `cordis.patch.yml`；仓库主体远大于 DSH 适配层 | 详情必须标记“主产品的 DSH 适配组件”，安装对象不能错误指向仓库根 |
| [zhu1090093659/dsh-web-ui](https://github.com/zhu1090093659/dsh-web-ui) | 2,516 | 任务看板、Git 图谱、面板、移动端、统计和皮肤，含中英文文档与画廊 | `packages/` 下有多个独立包，每个包常有 `cordis.patch.yml` 与 `package.json` | 需要组件选择器、截图画廊、功能矩阵；一个仓库可生成多个可安装条目 |
| [liustack/modlens](https://github.com/liustack/modlens) | 1,767 | 视觉能力、引擎/provider、安装、用法、路由、文档与免责声明 | DSH 适配位于 `dsh/`，含 `client.js`、`index.js`、`vision-schema.json` 和 Cordis 补丁 | 需要展示数据出站、API Key、视觉提供商、故障转移和输出 schema 等运行风险信息 |
| [ccch1mneyyy/dsh-TUI](https://github.com/ccch1mneyyy/dsh-TUI) | 1,177 | TUI 能力、快捷键、安装、配置、架构、主题、已知限制 | 根目录含 `cordis.yml`、`cordis.patch.yml`、CLI、安装脚本与双语 `docs/` | 详情页应把“启动命令”“快捷键”“已知限制”放在高优先级位置，而非埋进 README |
| [GanyuanRan/Aegis](https://github.com/GanyuanRan/Aegis) | 1,019 | 架构驱动工作流、基准、安装、支持宿主、维护者文档 | 同时包含 `.claude-plugin`、`.codex-plugin`、`.cursor-plugin`、`.opencode`、DSH Cordis 补丁及多个 Skills | 一个资源可跨 DSH/通用插件/Skills；主分类唯一，但详情页应显示全部格式与安装入口 |

**DSH 专属字段：** DSH Profile、包名、Cordis 清单/补丁路径、兼容 DSH 版本、安装与启动命令、UI/后台类型、宿主产品关系、外部服务、已知限制。

### 2.3 通用 Agent 插件

| 项目 | Star 快照 | 提供的信息 | 仓库结构特征 | 对 AgentMatter 的启示 |
|---|---:|---|---|---|
| [ruvnet/claude-flow](https://github.com/ruvnet/claude-flow) | 67,908 | 多 Agent 编排、记忆、MCP、Skills、快速开始、安全与变更记录 | 同时有 `.claude-plugin`、`.agents`、`.harness`、`SKILL.md`、大量 hooks/清单/安装脚本 | “插件”可能是完整框架；应列出所含组件、运行服务与写入/执行权限 |
| [SuperClaude-Org/SuperClaude_Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework) | 23,834 | Claude Code 增强框架、命令、角色、开发方法与安装 | Python 包、`.claude/`、插件清单、命令与 Skills 混合 | 单宿主插件也可收录；兼容标签必须来自真实结构与文档，不能因“通用”分类自动推断 |
| [obra/superpowers](https://github.com/obra/superpowers) | 272,382 | 软件开发方法、工作流、安装及多宿主入口 | 多个宿主清单：`.codex-plugin`、`.claude-plugin`、`.cursor-plugin`、`.opencode` 等，核心 Skills 独立 | 搜索结果应突出“多宿主”与每个宿主的安装差异；详情提供宿主切换器 |
| [wshobson/agents](https://github.com/wshobson/agents) | 38,829 | 插件市场、快速开始、内容组成、多 Harness 支持、质量评估 | `plugins/<name>/` 下分别有 Claude/Codex 清单、Skills 和 Agent 定义 | 市场型仓库要支持二级浏览：先看插件包，再看 Skill/Agent 组成和质量评分方法 |
| [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates) | 30,251 | Claude Code 配置、模板、CLI、监控、安全与 MCP 配置 | `.claude-plugin`、`.mcp.json`、CLI、Web 应用、模板/Skills 大集合 | UI 要区分 CLI 工具、模板库、插件市场与 MCP 配置，避免只用“插件”一个含糊标签 |

**通用插件专属字段：** 支持宿主、插件格式、包含组件（Agent/Skill/Command/Hook/MCP）、安装方式、配置写入位置、后台进程、网络/文件/命令权限、迁移与卸载方式。

### 2.4 MCP 服务器

| 项目 | Star 快照 | 提供的信息 | 仓库结构特征 | 对 AgentMatter 的启示 |
|---|---:|---|---|---|
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | 89,578 | 参考服务器、入门、客户端配置、开发、发布与安全 | `src/<server>` 下为独立参考实现；含 `.mcp.json`，并明确部分服务器已归档 | 必须区分“参考实现”和“生产服务”，服务器级状态优先于仓库整体状态 |
| [upstash/context7](https://github.com/upstash/context7) | 60,788 | 最新代码文档、远程/本地使用、客户端集成与安全 | MCP 位于 `packages/mcp`，另含 CLI、插件、Skills 与多宿主扩展 | 详情需显示本地/远程两条路径、组件路径、鉴权差异和替代安装方式 |
| [github/github-mcp-server](https://github.com/github/github-mcp-server) | 32,270 | 用例、远程服务、本地服务、客户端安装、配置、Token 安全与企业版 | Go 服务、`cmd/`、`docs/`、工具集、Docker 与安全文档 | 权限 scope、只读模式、远程/本地、企业版支持必须进入结构化字段 |
| [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | 36,150 | 与 CLI 的差异、能力、要求、配置、用户数据目录、安全和工具列表 | 紧凑的 TypeScript 包，含 `server.json`、Docker、类型定义、测试 | 浏览器自动化类必须醒目标注可见浏览器、会话数据、文件与页面交互权限 |
| [firecrawl/firecrawl-mcp-server](https://github.com/firecrawl/firecrawl-mcp-server) | 7,241 | 抓取/搜索能力、托管与本地安装、多客户端配置、环境变量、自托管 | 单一服务包，含 Docker、`src/`、版本策略、托管/本地两种运行方式 | 要把“免费/Keyless/需 API Key/可自托管”拆开，不把服务价格与仓库许可证混为一谈 |

**MCP 专属字段：** 实现类型（参考/官方/社区）、运行形态（远程/本地/自托管）、Transport、客户端、工具集/工具数量、认证、环境变量、权限 scope、数据去向、运行要求、Docker/包管理器、只读能力。

### 2.5 Prompts

| 项目 | Star 快照 | 提供的信息 | 仓库结构特征 | 对 AgentMatter 的启示 |
|---|---:|---|---|---|
| [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts) | 167,167 | 社区 Prompt、交互式站点、自托管、CLI、Claude 插件与 MCP 集成 | `PROMPTS.md` 加 Web 应用、插件、MCP、治理与多许可证文件 | Prompt 项目可能已产品化；应显示“原始 Prompt 数据”和衍生应用/插件，许可证按资产区分 |
| [dair-ai/Prompt-Engineering-Guide](https://github.com/dair-ai/Prompt-Engineering-Guide) | 77,487 | 指南、论文、课程、Notebook、RAG/Agent 资源 | `guides/`、`notebooks/`、课程和站点代码 | Prompt 分类需要“模板库/指南/课程/系统 Prompt 档案”等子类型，否则搜索意图混乱 |
| [anthropics/prompt-eng-interactive-tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) | 37,675 | 从基础结构到 few-shot、链式 Prompt、工具使用的互动课程 | 分平台目录和大量 Jupyter Notebook，逐课组织 | 教程型资源应显示学习路径、难度、课时/章节与运行环境，而不是“复制 Prompt”按钮 |
| [brexhq/prompt-engineering](https://github.com/brexhq/prompt-engineering) | 9,581 | LLM 基础、Prompt 风险、策略、引用与程序化输出 | 主要是单一长篇 `README.md`，结构极简，更新较早 | 信息质量不等于文件数量；需要“维护状态/最后更新”与“文档型资源”标识 |
| [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) | 142,842 | 多款 AI 工具的系统 Prompt、工具定义与模型资料 | 按产品目录组织 `.txt`、`.yaml`、`.json`，含 Prompt 与 Tools 文件 | 系统 Prompt 档案要显示来源说明、抓取日期、适用版本、许可与潜在敏感/过时风险 |

**Prompts 专属字段：** 子类型、Prompt 格式、语言、目标模型/产品、变量、示例输入输出、版本/采集日期、复制方式、许可与可复用性、来源说明、教学难度。

## 3. 样本揭示出的共同信息结构

### 3.1 所有资源都应有的字段

1. **身份**：资源名称、`owner/repo`、组件路径、主分类、次级格式。
2. **一句话价值**：做什么、给谁用，不直接复制 GitHub description。
3. **兼容性**：明确支持、社区验证、仅推断三种状态；推断不能显示为“支持”。
4. **获取方式**：安装命令、复制、远程连接、教程阅读或下载；按类型切换 CTA。
5. **维护信号**：Star、最近提交、最近 Release、Archived、Issue/PR 活跃度；日期必须可见。
6. **许可证**：仓库许可证与组件/内容许可证分开；未知就显示“未识别”，不能留空。
7. **验证状态**：元数据已核验、安装已核验、功能已核验分别展示，并写明日期与环境。
8. **风险与要求**：API Key、网络、命令执行、文件访问、浏览器会话、数据出站、付费服务。
9. **结构**：关键文件树、README 目录、包含的 Skill/Agent/Prompt/Tool 等对象。
10. **来源**：GitHub、README、Release、License、Security、组件目录的直接链接。

### 3.2 不应该合并成一个分数的信号

- 热度：Star/Fork/收藏趋势。
- 维护：最后提交、Release、响应状态。
- 完整度：README、License、Security、安装、卸载、限制说明。
- 验证：AgentMatter 实际核验到哪一步。
- 风险：权限和数据边界。

这些维度应并列显示，不能做成一个不透明的“95 分”或“安全”徽章。

## 4. 资源分类页 V2

### 4.1 页面结构

1. 面包屑 + 分类名称 + 明确定义。
2. 分类概览：资源数、最近更新数、已验证数，并解释统计口径。
3. 子类型快捷入口，例如 Skills 的“单一 Skill / 合集 / 官方目录 / 安全类”。
4. 分类专属筛选器；统一筛选只保留宿主、许可证、维护状态、验证状态。
5. 排序：推荐、热度、最近更新、最近收录；“推荐”必须有公开规则说明。
6. 资源列表采用高信息密度横向卡片，而非外观相同的宫格。

### 4.2 卡片结构

- 第一行：类型/子类型、名称、官方/社区身份、验证状态。
- 第二行：中文价值摘要。
- 第三行：`owner/repo#path`，monorepo 路径不可省略。
- 第四行：随类型变化的 3–4 个关键事实。
- 底栏：Star、最近更新、License、要求/风险图标、查看详情。

**Skills 卡事实示例：** `18 Skills · Claude/Codex · 含脚本与模板 · 合集`
**MCP 卡事实示例：** `远程 + 本地 · OAuth/PAT · 只读可选 · 45+ tools`

### 4.3 过滤器必须随分类变化

| 分类 | 首要筛选 |
|---|---|
| Skills | 宿主 Agent、单一/合集、领域、是否含脚本、安装方式 |
| DSH 插件 | Profile、UI/能力/工作流、包管理器、DSH 兼容版本 |
| 通用插件 | 宿主、插件格式、所含组件、后台服务、配置写入范围 |
| MCP | 本地/远程、Transport、认证、数据源、只读、Docker/API Key |
| Prompts | 模板/合集/教程/系统档案、语言、模型、格式、可复制性 |

## 5. 搜索结果页 V2

### 5.1 搜索结果回答三个问题

1. **为什么命中？** 显示命中位置：名称、README、能力、宿主、组件路径或标签，并高亮关键词。
2. **它到底是什么？** 类型与子类型固定显示，不能让 Skill 合集、插件和 MCP 看起来一样。
3. **我能否使用？** 在列表直接显示兼容宿主、获取方式、关键要求和维护状态。

### 5.2 页面结构

- 搜索框支持资源名、能力、仓库、宿主和安装命令。
- 顶部显示总结果与五类分布，可一键切换分类。
- 左侧筛选分为“通用筛选”和“当前结果出现的专属筛选”，并显示计数。
- 主列表使用混合类型行；每行包含类型专属事实条。
- 提供“精确仓库命中”“组件命中”“内容命中”标签。
- 搜索词无结果时给出拼写建议、相关能力和提交 GitHub 仓库入口。

### 5.3 排序逻辑

默认相关性建议：名称/仓库精确命中 > 结构化能力与宿主命中 > README 内容命中 > 标签命中。热度只作为同等相关度下的次级信号，避免大仓库长期垄断前排。

## 6. 资源详情页 V2

### 6.1 首屏

- 类型与子类型、名称、官方/社区、验证等级。
- 中文摘要与 GitHub 原始描述分开。
- `owner/repo#path` 可复制。
- Star、License、最后提交、最近 Release、收录/核验日期。
- 右侧为**类型感知的操作卡**：安装、连接、复制、开始课程或查看组件，而不是统一使用安装命令。

### 6.2 标签页

1. 概览：能力、适用场景、不适用场景。
2. 安装/使用：按宿主切换，列前置要求、命令、配置和卸载。
3. 文件与结构：关键树、组件清单、每个文件的作用。
4. README：保留原文入口，站内只做结构化摘要。
5. 版本与维护：Release、变更、兼容性、Archived/弃用状态。
6. 核验记录：核验环境、日期、范围、失败项和证据。

### 6.3 正文模块顺序

1. 它解决什么问题
2. 核心能力 / 所含组件
3. 兼容性矩阵
4. 安装或使用路径
5. 要求、权限与数据边界
6. 仓库结构
7. 已知限制
8. 维护信号
9. AgentMatter 核验记录
10. 同类替代与相关组件

### 6.4 验证文案

- 元数据已核验：仓库身份、License、结构和说明已读取。
- 安装已核验：指定环境中完成安装/连接，但未代表全部平台。
- 功能已核验：列明实际执行的最小场景与结果。
- 未核验：只是收录，不显示“安全”或“可用”结论。

## 7. V2 视觉与交互决定

- 延续 AgentMatter 的 Modular Lab 风格：冷白底、墨蓝文本、靛青主色、信号绿用于“当前/通过”，琥珀色用于要求与风险。
- Star、更新、License 使用低强调度；资源类型、兼容性和操作方式使用高强调度。
- 徽章数量限制在首屏 4 个以内，其余进入事实条或展开区，避免“标签墙”。
- 文件路径、安装命令、环境变量使用等宽字体；普通描述不用等宽字体。
- 任何风险图标都配文字，不只依赖颜色。
- 移动端将筛选器收进抽屉，卡片顺序保持：身份 → 价值 → 兼容/要求 → 维护 → 操作。

## 8. 建议的数据模型补充

```text
Resource
├─ repository: owner/repo
├─ component_path: nullable path
├─ primary_type: skill | dsh_plugin | agent_plugin | mcp | prompt
├─ subtypes: []
├─ hosts: [{name, support_level, evidence_url}]
├─ acquisition: [{host, mode, command_or_url, requirements}]
├─ capabilities: []
├─ structure: [{path, role}]
├─ permissions: []
├─ data_boundaries: []
├─ licenses: [{scope, spdx, source_url}]
├─ maintenance: {last_push, latest_release, archived}
└─ verification: [{level, date, environment, evidence, result}]
```

这一结构允许 AgentMatter 在保持统一浏览体验的同时，真实表达五类资源的差异。
