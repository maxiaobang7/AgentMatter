# AgentMatter 本地 Codex 运营工具包

本目录运行在你的 Windows 电脑上。Codex 在本地研究 GitHub、生成 JSON 并通过 HTTPS 发布；宝塔服务器不运行 AI，也不保存 OpenAI API Key。

## 首次配置

1. 在 `/admin` 创建“本地 Codex” Token。
2. 在当前 PowerShell 会话设置：

```powershell
$env:AGENTMATTER_API_URL = "https://www.agentmatter.net"
$env:AGENTMATTER_AGENT_TOKEN = "am_后台生成的Token"
```

3. 生成或更新内容时让 Codex 使用 `operations/skills/agentmatter-publisher/SKILL.md`。

## 命令

```powershell
pnpm ops:inventory
pnpm ops:media operations/drafts/example.json
pnpm ops:validate operations/drafts/example.json
pnpm ops:publish operations/drafts/example.json draft
pnpm ops:publish operations/drafts/example.json publish
pnpm ops:publish operations/drafts/example.json update
```

`runs/` 中的 JSON 是发布与读回回执，可用于追踪每次本地任务。计划任务应调用 Codex 非交互任务，由 Codex 按 Skill 生成草稿；建议自动流程默认只提交 draft，正式 publish 保留人工确认，稳定后再逐步放开。

## 正文配图

资源草稿可以在 `detail.media` 中声明来自 GitHub 仓库的截图、示例图或流程图。运行 `pnpm ops:media <draft>` 后，图片会经过服务器解码、缩放和 WebP 转换，保存到 `AGENTMATTER_MEDIA_DIR`，草稿中的远程地址会替换为站内内容寻址地址。媒体上传和媒体读回都成功后再发布资源。

自动任务只能在仓库确有说明性图片时添加配图。没有合格图片时不生成 `media` 字段。
