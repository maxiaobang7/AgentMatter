---
name: agentmatter-publisher
description: 为 AgentMatter 从 GitHub 发现、研究、生成、校验并发布 Skills、DSH 插件、Agent 插件、MCP 服务器和 Prompts。
---

# AgentMatter Publisher

使用本 Skill 时，先遵守 `operations/AGENTS.md`，再执行以下工作流。

开始时完整读取 `operations/site-profile.json`、`operations/schemas/resource.schema.json` 与 `operations/templates/resource.example.json`。

## 1. 建立库存

运行 `pnpm ops:inventory`。将 `inventory/current.json` 视为服务端当前事实，按 stableKey 去重。

## 2. 发现候选

只从 GitHub 搜索候选。为每个候选记录仓库地址、分类、componentPath、Stars、最后 push、归档状态、LICENSE、README 安装入口和为什么值得收录。发现数据只是线索，发布前必须再次读取仓库原文。

## 3. 研究正文配图

检查 README、`assets/`、`docs/`、示例目录和仓库公开截图。只选择能说明界面、输出结果、工作流程或典型使用场景的图片，最多 3 张。排除徽章、头像、纯 Logo、社交分享图、重复图和无法说明产品的装饰图。

每张图记录 `src`、`sourceUrl`、`evidenceUrl`、中文 `alt`、可选 `caption`、`kind`、`placement`、`width` 和 `height`。优先使用作者放在仓库中的说明图；没有合格图片时，截取对应 GitHub 仓库或组件 README 的相关区域。初稿的 `src` 可使用 GitHub 原始图片地址或 `operations/media-staging/` 中的本地截图；完成初稿后必须运行 `pnpm ops:media <draft>`。脚本先在本地解码、限制最长边、压缩并转换为 WebP，校验通过后才上传和读回媒体记录。不得把远程图片地址直接留在最终正文中，也不得跳过本地 WebP 处理。

## 4. 生成资源 JSON

完整读取 `operations/schemas/resource.schema.json` 和 `operations/templates/resource.example.json`，输出严格 JSON 到 `operations/drafts/<stable-key>.json`。中文介绍要简洁、具体；安装命令逐字来自仓库证据；README 摘要只做事实性重写。

必须生成受控 `taxonomy`：从当前 schema 和 `src/data/taxonomy.ts` 对应分类的词库中选择恰好一个 `primaryTopic`、最多三个 `secondaryTopics`，并按项目证据填写适用的 `facets`。不得自由创造 slug，不得为了覆盖更多筛选而添加 README 无法证明的部署、传输、认证或使用范围。无法确认的 facet 直接省略。主主题表达项目最主要的用户用途，次主题只表达真实的跨领域能力。

所有 `evidenceUrl`、`sourceUrl`、`releaseUrl` 和来源链接必须是 GitHub HTTPS 链接。`provenance.generatedBy` 固定为 `codex`，`generatedAt` 使用当前 UTC ISO 时间，`sourceUrls` 列出本次真正读取的 GitHub 页面。

每条 AI 资源必须生成 `seo`。围绕一个明确搜索意图先写 3 个候选标题，再选择信息最完整、最自然的一条作为 `seo.title`，并在 `selectionReason` 说明取舍。标题必须包含完整项目名、具体用途与 Skills、DSH、Agent 插件、MCP 或 Prompt 类型词；安装型页面要体现安装或配置意图。不要在字段中加入 `AgentMatter`，前台会自动补品牌。不得使用无法从仓库证明的绝对化宣传词。`seo.description` 要准确概括页面能提供的介绍和教程，不要机械堆词。生成前先用库存中的 `seoTitle` 排除重复标题。

中文主内容完成后，必须根据同一组 GitHub 事实生成 `localizations.en`。英文版本需要覆盖 subtype、summary、facts、capabilities、兼容宿主、获取标签、核验说明、限制、完整 detail 和独立英文 SEO。URL、命令、配置、证据、数字、许可证与日期必须与中文主内容完全一致；只翻译编辑文字。英文正文应按英文用户的阅读习惯自然重写，不能逐字硬译，也不能夹杂中文界面词。中文和英文安装提示词都要保留凭据、额外权限与覆盖文件时先确认的边界。

Skills、DSH 插件、Agent 插件、MCP 与 Prompt 合集/教程的详情正文依次提供项目介绍、核心功能、安装与使用、使用场景、使用评价和 README。使用评价必须说明判断来自哪些公开材料；不能把阅读仓库写成亲自安装或长期使用。

单条可复制 Prompt 使用 `detail.prompt.kind = "standalone"`，并同时填写完整 `text`、可选 `placeholder` 与 GitHub `sourceUrl`；英文版本在 `localizations.en.detail.prompt` 提供自然英文正文，并保持相同来源。单条 Prompt 页面只展示一段介绍、完整可复制正文和来源，不生成项目型的安装、功能、评价或 README 页面模块。Prompt 合集使用 `collection`，教程使用 `guide`，继续采用完整项目详情结构。

除 `detail.prompt.kind = "standalone"` 的单条 Prompt 外，`detail.installationGuide` 必须提供项目专属的安装导语、准备条件、成功验证方法、必要注意事项，以及可直接交给 Codex、Claude Code 等 AI Agent 的 `agentInstallPrompt`；`detail.tutorialSteps` 至少提供两个可执行步骤。提示词必须写明资源名称、GitHub 项目地址、需要读取的安装资料、目标操作、验证方法，以及遇到凭据、额外权限或覆盖文件时先向用户确认。命令或配置必须来自仓库证据，但正文要把零散的 README 信息整理成用户可以直接照做的教程。不得用“克隆完整 Skill”“选择获取方式”充当教程标题，也不得把“查看官方安装说明”“按照 README 操作”当作关键步骤。

## 5. 准备媒体并本地校验

有正文配图时先运行：

```powershell
pnpm ops:media operations/drafts/<file>.json
```

脚本会读取 GitHub 图片或受限暂存目录中的截图，在本地完成压缩与 WebP 转换，校验格式、尺寸和上传文件大小后再上传，随后完成媒体读回，并把最终站内地址与真实尺寸写回草稿。媒体回执中的 `localProcessing.mimeType` 必须为 `image/webp`。

运行：

```powershell
pnpm ops:validate operations/drafts/<file>.json
```

校验失败就修复 JSON；不得绕过 Schema。

## 6. 发布与读回

草稿：

```powershell
pnpm ops:publish operations/drafts/<file>.json draft
```

正式发布：

```powershell
pnpm ops:publish operations/drafts/<file>.json publish
```

脚本会先调用服务端校验，再执行幂等写入，然后读取 operation 和资源本身，并把回执写入 `operations/runs/`。只有回执中的两次 readback 都成功，任务才算完成。

## 7. 更新规则

更新已存在资源时使用 `update`；若证据不足，先写 `draft` 等待后台人工审核。不得自动下线或回滚资源，除非用户明确授权。

定时或无人值守任务一律默认使用 `draft`。只有用户针对具体资源明确要求正式发布时才能使用 `publish`。
