# AgentMatter Agent API v1

所有端点使用 `Authorization: Bearer <token>`。写操作还必须携带 `Idempotency-Key`，且值与 JSON 中的 `operationId` 完全一致。Token 由 `/admin` 创建，只在创建时显示一次。

## 端点

| 方法 | 路径 | 作用域 | 用途 |
| --- | --- | --- | --- |
| GET | `/api/agent/v1/inventory` | `resources:read` | 获取全部资源身份、状态、版本与哈希 |
| GET | `/api/agent/v1/resources/{owner}/{repo}` | `resources:read` | 发布后按身份读回，组件用 `?component=` |
| POST | `/api/agent/v1/resources/validate` | `resources:validate` | 只校验，不写数据库 |
| POST | `/api/agent/v1/resources/draft` | `resources:draft` | 新建或更新草稿 |
| POST | `/api/agent/v1/resources/publish` | `resources:publish` | 发布资源 |
| POST | `/api/agent/v1/resources/update` | `resources:update` | 更新已存在资源并保留当前状态 |
| POST | `/api/agent/v1/resources/unpublish` | `resources:unpublish` | 下线资源 |
| GET | `/api/agent/v1/operations/{operationId}` | `resources:read` | 获取幂等操作回执 |
| POST | `/api/agent/v1/resources/{id}/rollback` | `resources:rollback` | 恢复历史版本并创建新版本 |

写入体包含 `operationId`、完整 `resource` 和可选 `note`。`resource` 必须符合 `operations/schemas/resource.schema.json`。客户端还应读取 operation 和 resource，确认状态、版本和 contentHash 与写入回执一致。

## 状态码

- `200/201`：成功或幂等重放成功。
- `401`：Token 无效或缺少作用域。
- `409`：operationId 冲突、正在处理或历史失败。
- `422`：资源内容不符合契约。
- `503`：服务端未配置数据库或数据库不可用。
