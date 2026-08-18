# 本地 Codex 全自动运营

## 边界

- AI 研究、选题与写作全部在本地 Codex 完成。
- 宝塔服务器只运行 Next.js、MySQL 和发布 API，不运行模型，也不保存 OpenAI Key。
- GitHub 发现结果只作为候选；Codex 必须读取仓库 README、安装说明、LICENSE 与维护状态后才能生成内容。
- 自动化默认发布为 `draft`。当连续运行稳定、误报率可控后，再单独授权自动 `publish`。

## 每次任务

1. 调用 inventory 并按 stableKey 去重。
2. 从 GitHub 发现候选并做收录门槛判断。
3. 使用 `agentmatter-publisher` Skill 生成严格 JSON。
4. 本地 Schema 校验。
5. 服务端 validate。
6. draft/publish/update 幂等写入。
7. operation 与 resource 双重读回。
8. 把回执保存在 `operations/runs/`，失败时保留草稿与错误，不重复盲写。

## Windows 定时运行建议

电脑必须开机、联网且 Codex 可用。建议先在 Codex 桌面端创建每天一次的本地任务，提示它进入项目目录并严格使用 `operations/skills/agentmatter-publisher/SKILL.md`，每次最多生成一个草稿。若使用 Windows 任务计划程序，任务只负责启动本地 Codex 工作流，不直接调用生产数据库。

Token 应只放在当前用户的本地环境变量或安全凭据存储中。不要把它写入计划任务参数、仓库文件或公开日志。

## 故障策略

- inventory 失败：停止，不进行选题与发布。
- GitHub 证据不足：保存候选，不生成发布内容。
- 本地或服务端校验失败：修正 JSON，不绕过校验。
- 写入超时：先用同一 operationId 查询操作状态，再决定是否重试。
- 读回不一致：标记任务失败并停止后续发布。
