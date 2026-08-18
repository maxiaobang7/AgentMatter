# AgentMatter AI 内容运营平台实施计划

**目标：** 将现有静态目录升级为“本地 Codex 生产内容、服务端安全存储和发布、前台动态读取”的可运行平台，同时保留 25 条静态资源作为无数据库时的只读降级数据。

## 阶段 1：数据与安全基础

- 建立 MySQL 资源、版本、操作、审计、API Token 与投稿表。
- 使用 Zod 统一资源写入契约，限制 GitHub 来源、字段长度和 URL。
- 使用哈希 Bearer Token、作用域、幂等键和事务保护 AI 发布接口。

## 阶段 2：AI 发布 API

- 实现 inventory、validate、draft、publish、update、unpublish、operation readback 与 rollback。
- 每次写入创建版本和审计记录，返回可追踪 operationId。
- 成功发布后刷新资源页面、分类、首页、搜索与 sitemap。

## 阶段 3：前台动态数据层

- Server Components 从 MySQL 读取已发布资源。
- 未配置数据库时使用现有静态数据，确保本地开发和迁移期间网站可用。
- 首页、分类、搜索、详情和 sitemap 共用同一目录读取层。

## 阶段 4：后台管理

- 提供单管理员登录、资源状态总览、版本/操作记录和人工审核入口。
- 登录会话使用 HttpOnly Cookie；所有敏感操作在服务端再次鉴权。

## 阶段 5：本地 Codex 运营工具包

- 提供 Codex Skill、JSON Schema、候选与资源模板。
- 提供 inventory、validate、publish 脚本及本地运行回执。
- 文档化 Windows 计划任务与宝塔部署流程，服务器不保存模型密钥。

## 验证

- 单元测试：Schema、安全鉴权、搜索/静态降级、API 非授权访问。
- 集成检查：迁移与种子脚本、幂等发布、版本/回滚、读回。
- 质量检查：lint、TypeScript、Vitest、Next production build。
