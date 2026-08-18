# AgentMatter

AgentMatter 是一个面向 AI Agent 的 GitHub 资源目录，首期收录五类内容：Skills、DSH 插件、Agent 插件、MCP 服务器和 Prompts。

- 网站：<https://www.agentmatter.net>
- 仓库：<https://github.com/maxiaobang7/AgentMatter>

当前里程碑已经包含动态 MySQL 资源目录、Codex 专用发布 API、版本与回滚、操作审计、管理员后台、本地 AI 运营 Skill/Schema/脚本，以及 25 条可迁移的静态种子。未配置数据库时，公开前台会自动降级使用静态种子，但所有写入功能保持关闭。

## 本地运行

要求 Node.js 20.9 或更高版本，并安装 pnpm。

```bash
pnpm install --frozen-lockfile
copy .env.example .env.local
pnpm dev
```

访问 `http://localhost:3000`。

## 数据库初始化

创建 MySQL 8 数据库并设置 `DATABASE_URL` 后执行：

```bash
pnpm db:migrate
pnpm db:seed
pnpm admin:hash-password "至少12位的管理密码"
```

把密码哈希写入 `ADMIN_PASSWORD_SCRYPT`，并设置至少 32 位的 `SESSION_SECRET`。访问 `/admin` 登录管理后台。

## 本地 Codex 运营

服务器不运行 AI。请在后台创建 Token，然后按 [本地 Codex 运营说明](docs/operations/local-codex.md) 和 [运营工具包](operations/README.md) 工作。Agent API 契约见 [API v1](docs/api/agent-v1.md)。

## 质量检查

```bash
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## 生产运行

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm db:seed
pnpm build
pnpm start
```

正式网址统一为 `https://www.agentmatter.net`，根域名 301 跳转到 `www`。`NEXT_PUBLIC_SITE_URL` 必须在构建前设置；生产服务只监听 `127.0.0.1`，由宝塔 Nginx 对外提供 HTTPS。完整步骤与只读冒烟测试见 [宝塔部署说明](docs/deployment/baota.md)。

## 数据边界

- 生产资源目录：MySQL `resources.payload_json`（只向前台读取 `published`）
- 迁移种子与无数据库降级：`src/data/resources.ts`
- 查询与筛选：`src/lib/resources.ts`
- 服务端目录读取：`src/server/catalog.ts`
- AI 内容写入：`src/app/api/agent/v1`
- 本地运营工具：`operations/`

## 产品原则

- GitHub 仓库和仓库内组件是两种不同身份，避免合集资源被错误合并。
- Stars 只作为仓库热度快照，不代表组件质量或安全性。
- “信息已核对”“安装已实测”“功能已实测”分开展示，不做未经验证的承诺。
- V1 不提供公众账号；收藏保存在浏览器本机。
