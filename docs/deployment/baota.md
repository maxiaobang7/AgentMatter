# AgentMatter 宝塔部署说明

正式网址统一使用 `https://www.agentmatter.net`。根域名 `https://agentmatter.net` 只做 301 跳转，不同时提供两套内容。Next.js 负责公开前台、后台和 Agent API，MySQL 保存内容与版本，宝塔 Nginx 负责 HTTPS、限流与反向代理。AI 生成只在本地 Codex 运行，服务器不需要 OpenAI API Key。

## 1. 上线前准备

- Linux 服务器与宝塔面板
- Nginx、Node.js 20.9+、Corepack、pnpm 11.19.0
- MySQL 8.0 或 8.4
- `agentmatter.net` 与 `www.agentmatter.net` 均解析到服务器
- SSL 证书同时覆盖根域名和 `www`
- 如果服务器位于中国大陆，先确认 `agentmatter.net` 已完成适用于该服务器接入商的备案

在宝塔中新建纯静态站点作为域名和 Nginx 配置容器，不需要 PHP。Node 端口只监听 `127.0.0.1`，公网只开放 80/443；3000 和 MySQL 3306 不得加入安全组或防火墙的公网放行规则。

## 2. 创建数据库和最小权限用户

迁移包含外键，因此除了常规读写与建表权限，还需要 `REFERENCES`：

```sql
CREATE DATABASE agentmatter CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'agentmatter'@'127.0.0.1' IDENTIFIED BY '替换为随机长密码';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
  ON agentmatter.* TO 'agentmatter'@'127.0.0.1';
FLUSH PRIVILEGES;
```

不要让应用使用 MySQL `root` 账户，也不要允许该用户从 `%` 主机登录。

## 3. 上传代码与生产配置

```bash
cd /www/wwwroot/agentmatter
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env.production
```

编辑 `.env.production`：

```dotenv
NEXT_PUBLIC_SITE_URL=https://www.agentmatter.net
DATABASE_URL=mysql://agentmatter:URL编码后的数据库密码@127.0.0.1:3306/agentmatter
DATABASE_CONNECTION_LIMIT=10
SESSION_SECRET=至少32位且仅用于本站的随机字符串
ADMIN_PASSWORD_SCRYPT=pnpm-admin-hash-password-命令生成的结果
# AGENT_API_TOKEN_SHA256=可选的引导Token哈希
```

生成后台密码哈希和随机会话密钥：

```bash
pnpm admin:hash-password "至少12位的独立管理密码"
openssl rand -hex 32
```

`.env.production` 权限建议设为仅项目运行用户可读，例如 `chmod 600 .env.production`。不要把该文件、后台明文密码或 Agent Token 提交到 Git。

`NEXT_PUBLIC_SITE_URL` 会在构建时写入 metadata、canonical、sitemap 和 robots，因此必须在 `pnpm build` 之前设置；修改正式域名后必须重新构建。

## 4. 首次迁移、构建与启动

```bash
pnpm db:migrate
pnpm db:migrate
pnpm db:seed
pnpm db:seed
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

第二次迁移应显示 `skip`，第二次种子导入应显示 `0 created, 25 already existed`。这一步验证脚本可安全重复执行。

在宝塔 Node 项目管理器设置：

- 项目目录：`/www/wwwroot/agentmatter`
- 启动命令：`pnpm start`
- 端口：`3000`
- 运行环境：`production`
- 异常自动重启：开启

项目的 `start` 命令已限制监听 `127.0.0.1`。启动后先在服务器内验证：

```bash
curl --fail http://127.0.0.1:3000/api/health
```

必须返回 `"database":"connected"`，不能是 `static-fallback`。

## 5. Nginx、HTTPS 与标准域名

在宝塔为根域名和 `www` 申请同一张证书并开启强制 HTTPS。根域名的 HTTP 和 HTTPS 请求都应 301 到：

```nginx
return 301 https://www.agentmatter.net$request_uri;
```

`www.agentmatter.net` 站点的反向代理核心配置：

```nginx
client_max_body_size 700k;

location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
    proxy_read_timeout 60s;
}
```

`proxy_buffering off` 用于保留 Next.js 流式响应。不要在 Nginx 中覆盖应用已经返回的 CSP、HSTS、`X-Frame-Options` 等安全响应头。

在 Nginx `http {}` 作用域定义限流区：

```nginx
limit_req_zone $binary_remote_addr zone=agentmatter_login:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=agentmatter_submit:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=agentmatter_agent:10m rate=60r/m;
```

然后在 `www` 的 `server {}` 内为敏感接口配置独立 location；每个 location 需重复上面的 `proxy_pass` 和请求头设置：

```nginx
location = /api/admin/login {
    limit_req zone=agentmatter_login burst=5 nodelay;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location = /api/submissions {
    limit_req zone=agentmatter_submit burst=10 nodelay;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location ^~ /api/agent/ {
    limit_req zone=agentmatter_agent burst=30 nodelay;
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

修改 Nginx 后先执行配置检查再重载，避免直接保存错误配置导致站点中断：

```bash
nginx -t
```

## 6. 上线冒烟测试

在服务器内运行只读检查：

```bash
AGENTMATTER_SMOKE_URL=http://127.0.0.1:3000 \
NEXT_PUBLIC_SITE_URL=https://www.agentmatter.net \
pnpm smoke:production
```

域名切流后，再从外部电脑验证：

```bash
curl -I https://agentmatter.net/
curl -I https://www.agentmatter.net/
curl https://www.agentmatter.net/api/health
```

验收标准：根域名 301 到 `www`；`www` 返回 200；健康接口数据库已连接；页面 canonical、sitemap 与 robots 都使用 `https://www.agentmatter.net`；未授权 Agent API 返回 401。

## 7. 后台与本地 Codex

访问 `https://www.agentmatter.net/admin` 登录，在后台创建“本地 Codex” Token。Token 只显示一次，只保存在本地电脑，不写入宝塔计划任务或服务器脚本。具体流程见 `operations/README.md`。

## 8. 更新、备份与回滚

更新前备份 `.env.production`、当前代码目录和 MySQL。然后执行：

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm smoke:production
```

构建和冒烟测试成功后再重启 Node 项目。数据库建议每天备份并保留 7–30 份；每次内容写入由 `resource_versions`、`operations` 和 `audit_logs` 留痕。若新版本异常，恢复上一份代码与 `.env.production`，再按迁移是否兼容决定是否恢复数据库备份。

应用会返回 `Strict-Transport-Security: includeSubDomains`，因此未来创建任何 `agentmatter.net` 子域名时都必须提供有效 HTTPS。
