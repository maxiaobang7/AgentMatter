# AgentMatter 宝塔面板完整部署教程

本教程适用于 Linux 宝塔面板，将 AgentMatter 部署到：

- 标准网址：`https://www.agentmatter.net`
- 根域名：`https://agentmatter.net`，永久 301 跳转到 `www`
- 项目目录：`/www/wwwroot/agentmatter`
- Node 内网地址：`http://127.0.0.1:3000`
- 数据库：本机 MySQL 8，数据库名和用户名均为 `agentmatter`

AgentMatter 不是静态网站：后台、提交接口、Agent API、MySQL 内容和图片处理都需要 Node.js。推荐架构是：

```text
浏览器 → HTTPS/443 → 宝塔 Nginx → 127.0.0.1:3000 → Next.js
                                                   ├─ MySQL 8
                                                   └─ storage/media

本地 Codex → HTTPS Agent API → Next.js → MySQL / storage/media
```

服务器不运行 AI，也不保存 OpenAI API Key。完整准备包位于 [`deploy/baota`](../../deploy/baota/README.md)。

## 一、部署前需要准备的内容

建议服务器至少具备：

- 2 核 CPU、2 GB 内存；如果只有 2 GB 内存，建议在宝塔开启 2 GB Swap
- 20 GB 以上可用磁盘
- 宝塔 Linux 面板 9.2 或更高版本
- Nginx 1.20+
- Node.js 20.9+，推荐 Node.js 22 LTS
- MySQL 8.0 或 8.4
- Git、OpenSSL、curl

你需要提前保存以下私密信息，后文会逐项生成：

1. MySQL `agentmatter` 用户密码
2. `SESSION_SECRET`
3. 后台管理员明文密码
4. 后台管理员密码的 `ADMIN_PASSWORD_SCRYPT` 哈希

不要把这些值发到聊天、写入 README、提交到 GitHub，或者保存在宝塔公开日志中。

## 二、配置 DNS 和服务器防火墙

在域名 DNS 服务商添加：

| 主机记录 | 类型 | 值 |
| --- | --- | --- |
| `@` | A | 服务器公网 IPv4 |
| `www` | A | 服务器公网 IPv4 |

如果使用 Cloudflare，首次申请证书时建议临时切换为“仅 DNS”，或者使用 DNS 验证证书。

服务器安全组和宝塔防火墙只开放：

- SSH 端口（建议限制为自己的 IP）
- 宝塔面板端口（建议限制为自己的 IP）
- TCP 80
- TCP 443

以下端口必须保持公网关闭：

- `3000`：只允许 Nginx 从本机访问
- `3306`：只允许 AgentMatter 从本机访问 MySQL

可在服务器执行以下命令确认 DNS 已指向当前服务器：

```bash
getent hosts agentmatter.net
getent hosts www.agentmatter.net
```

## 三、在宝塔安装运行环境

在“软件商店”安装：

1. Nginx
2. MySQL 8.0 或 8.4
3. Node.js 版本管理器
4. PM2 管理器（如果 Node 项目管理器没有自动安装）

打开 Node.js 版本管理器，安装 Node.js 22 LTS，并把它设置为命令行版本。SSH 或宝塔终端中验证：

```bash
node --version
npm --version
git --version
```

安装项目锁定的 pnpm 版本：

```bash
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm --version
```

如果当前 Node 安装不包含 Corepack：

```bash
npm install --global pnpm@11.19.0
```

`pnpm --version` 必须显示 `11.19.0`。

## 四、创建 MySQL 数据库

推荐在宝塔“数据库 → MySQL → 添加数据库”中填写：

- 数据库名：`agentmatter`
- 用户名：`agentmatter`
- 访问权限：本地服务器
- 字符集：`utf8mb4`
- 密码：使用密码生成器生成至少 32 位随机密码

为减少连接字符串编码错误，数据库密码可以使用以下命令生成 48 位十六进制值：

```bash
openssl rand -hex 24
```

十六进制密码不包含 `@`、`#`、`:`、`/` 等 URL 保留字符，可以直接写入 `DATABASE_URL`。如果使用宝塔生成的复杂密码，必须先做 URL 编码。

如果不用宝塔界面，可由 MySQL 管理员执行：

```sql
CREATE DATABASE agentmatter CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'agentmatter'@'127.0.0.1' IDENTIFIED BY '替换为随机长密码';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
  ON agentmatter.* TO 'agentmatter'@'127.0.0.1';
FLUSH PRIVILEGES;
```

应用禁止使用 MySQL `root`，也不要创建 `'agentmatter'@'%'`。

## 五、从 GitHub 获取代码

在宝塔终端或 SSH 执行：

```bash
cd /www/wwwroot
git clone https://github.com/maxiaobang7/AgentMatter.git agentmatter
cd /www/wwwroot/agentmatter
git branch --show-current
git log -1 --oneline
```

分支应为 `main`。安装构建依赖：

```bash
pnpm install --frozen-lockfile --prod=false
```

这里必须使用 `--prod=false`，因为 TypeScript、ESLint、迁移工具和构建流程需要开发依赖；真正对外运行的仍是生产模式。

## 六、生成后台密码和生产环境配置

先生成 64 位会话密钥：

```bash
openssl rand -hex 32
```

再生成后台密码哈希。命令中的明文密码至少 12 位，并且不要与宝塔、SSH 或数据库密码相同：

```bash
pnpm admin:hash-password "在这里输入你的独立后台密码"
```

该命令会输出一行 `盐值:哈希`，把输出保存到 `ADMIN_PASSWORD_SCRYPT`；登录后台时仍使用刚才输入的明文密码。

复制生产配置模板：

```bash
cp deploy/baota/agentmatter.env.example .env.production
nano .env.production
```

最终文件应类似下面这样，所有 `CHANGE_ME` 都必须替换：

```dotenv
NEXT_PUBLIC_SITE_URL=https://www.agentmatter.net
NEXT_PUBLIC_GITHUB_URL=https://github.com/maxiaobang7/AgentMatter
DATABASE_URL=mysql://agentmatter:你的数据库密码@127.0.0.1:3306/agentmatter
DATABASE_POOL_SIZE=8
SESSION_SECRET=刚才生成的64位十六进制随机值
ADMIN_PASSWORD_SCRYPT=刚才生成的盐值和哈希
AGENTMATTER_MEDIA_DIR=/www/wwwroot/agentmatter/storage/media
```

说明：

- `NEXT_PUBLIC_SITE_URL` 会在 `pnpm build` 时写入 canonical、sitemap 和前端包，改域名后必须重新构建。
- `DATABASE_POOL_SIZE` 才是程序实际读取的连接池变量，建议单实例先使用 `8`。
- 不要在服务器配置 OpenAI、Anthropic 或其他模型 Key。
- 暂时不要配置 `AGENT_API_TOKEN_SHA256`；上线后从后台创建可撤销的 Token 更安全。

限制配置文件权限，并准备持久化媒体目录：

```bash
mkdir -p /www/wwwroot/agentmatter/storage/media
chown -R www:www /www/wwwroot/agentmatter/storage
chown www:www /www/wwwroot/agentmatter/.env.production
chmod 600 /www/wwwroot/agentmatter/.env.production
```

如果宝塔 Node 项目使用的不是 `www` 用户，请把上面的用户和用户组替换为实际运行用户。

运行自动配置检查。该检查只输出配置项状态，不会显示密码：

```bash
pnpm deploy:preflight
```

只有出现 `Production environment preflight passed` 才继续。

## 七、迁移数据库、测试并构建

为脚本增加执行权限，然后运行首次部署准备：

```bash
chmod +x deploy/baota/first-deploy.sh deploy/baota/update.sh
bash deploy/baota/first-deploy.sh
```

脚本依次完成：

1. 锁定依赖安装
2. 生产配置校验
3. 数据库迁移
4. 初始资源导入
5. Agent Schema 导出与验证
6. 自动化测试
7. ESLint、Next 路由类型和 TypeScript 检查
8. `next build` 生产构建

脚本可安全重复执行：已经执行的迁移会显示 `skip`，已存在的种子不会重复插入。脚本默认只完成构建，不自动启动 PM2，避免与宝塔 Node 项目管理器创建两个进程。

如果构建因内存不足被系统终止，请先在宝塔 Linux 工具箱增加 Swap，不要跳过构建检查。

## 八、在宝塔创建 Node 项目

进入“网站 → Node 项目 → 添加 Node 项目”。不同面板版本字段名称略有差异，填写原则如下：

| 配置项 | 值 |
| --- | --- |
| 项目名称 | `agentmatter` |
| 项目路径 | `/www/wwwroot/agentmatter` |
| Node 版本 | Node.js 22 LTS |
| 启动文件 | `node_modules/next/dist/bin/next` |
| 启动参数 | `start -H 127.0.0.1 -p 3000` |
| 端口 | `3000` |
| 运行环境 | `production` |
| 实例数量 | `1` |
| 自动重启 | 开启 |

如果面板只有“启动命令”，填写：

```bash
pnpm start
```

启动后不要通过公网 IP 的 3000 端口测试，而是在服务器本机执行：

```bash
curl --fail http://127.0.0.1:3000/api/health
```

正确结果必须包含：

```json
{"ok":true,"mode":"database","database":"connected"}
```

如果看到 `static-fallback`，说明 Node 进程没有加载 `.env.production`；如果看到 `database":"unavailable"`，检查 MySQL 用户、密码、权限和服务状态。

### 不使用宝塔 Node 项目管理器时

可以直接使用仓库内 PM2 配置：

```bash
cd /www/wwwroot/agentmatter
AGENTMATTER_START_WITH_PM2=YES bash deploy/baota/first-deploy.sh
pm2 status
pm2 save
```

两种方式二选一，不要同时启动。

## 九、配置 Nginx 反向代理

推荐在 Node 项目设置中开启“外网映射”，域名填 `www.agentmatter.net`。也可以新建一个不使用 PHP 的站点，再在“反向代理”中把目标 URL 设置为：

```text
http://127.0.0.1:3000
```

发送域名使用 `$host`，内容替换留空。不要同时创建两个占用同一域名的站点。

### 1. 添加全局限流区

把 [`deploy/baota/nginx-http-rate-limit.conf`](../../deploy/baota/nginx-http-rate-limit.conf) 中的三行 `limit_req_zone` 加入 Nginx 主配置的 `http {}` 内。宝塔常见位置：

```text
/www/server/nginx/conf/nginx.conf
```

这些指令不能放进站点的 `server {}`，否则 `nginx -t` 会报错。

### 2. 添加站点代理规则

打开 `www.agentmatter.net` 的站点配置，把宝塔自动生成的重复 `location /` 替换为 [`deploy/baota/nginx-site-proxy.conf`](../../deploy/baota/nginx-site-proxy.conf) 的内容。

关键设置包括：

- `client_max_body_size 10m`：应用允许上传约 8.5 MB 的 GitHub 正文配图
- `proxy_buffering off`：支持 Next.js 流式响应
- 登录、公众提交和 Agent API 使用不同限流规则
- 转发真实 Host、来源 IP 和 HTTPS 协议

不要在 Nginx 重复添加 CSP、HSTS、`X-Frame-Options` 等响应头，Next.js 已经统一发送。

每次修改后必须先检查再重载：

```bash
/www/server/nginx/sbin/nginx -t
```

看到 `syntax is ok` 和 `test is successful` 后，再在宝塔中点击“重载配置”。

## 十、申请 SSL 并设置标准域名

在开启强制 HTTPS、301 和反向代理之前，先申请证书。宝塔官方文档提示：反向代理或已有 301 可能导致 HTTP 文件验证失败。

1. 暂时关闭站点反向代理和强制 HTTPS。
2. 在站点“SSL → Let's Encrypt”中同时勾选：
   - `agentmatter.net`
   - `www.agentmatter.net`
3. 申请并部署证书。
4. 确认两个域名都在证书 SAN 列表中。
5. 重新启用反向代理。
6. 开启强制 HTTPS。

然后在站点 `server {}` 中加入根域名跳转：

```nginx
if ($host = agentmatter.net) {
    return 301 https://www.agentmatter.net$request_uri;
}
```

也可以使用宝塔“重定向”功能创建域名级 301。不要使用 JavaScript 跳转，也不要让根域名和 `www` 同时返回 200。

再次执行 Nginx 配置检查并重载。

## 十一、执行上线验收

先在服务器内检查 Node 进程：

```bash
cd /www/wwwroot/agentmatter
AGENTMATTER_SMOKE_URL=http://127.0.0.1:3000 \
NEXT_PUBLIC_SITE_URL=https://www.agentmatter.net \
pnpm smoke:production
```

必须显示：

```text
Production smoke test passed: http://127.0.0.1:3000
```

再从自己的电脑验证公网：

```bash
curl -I https://agentmatter.net/
curl -I https://www.agentmatter.net/
curl https://www.agentmatter.net/api/health
curl -I https://www.agentmatter.net/robots.txt
curl -I https://www.agentmatter.net/sitemap.xml
```

最终验收标准：

- `agentmatter.net` 返回 301，目标为 `https://www.agentmatter.net/...`
- `www.agentmatter.net` 返回 200
- `/api/health` 显示数据库已连接
- `/admin/login` 可以打开，但搜索引擎响应头为 `noindex`
- 未授权 `/api/agent/v1/inventory` 返回 401
- HTML canonical、robots 和 sitemap 都使用 `https://www.agentmatter.net`
- 响应包含 CSP、HSTS、`X-Content-Type-Options`、`X-Frame-Options` 和 `Referrer-Policy`
- 服务器公网无法连接 3000 和 3306

## 十二、登录后台并连接本地 Codex

打开：

```text
https://www.agentmatter.net/admin
```

使用第六步设置的后台明文密码登录。进入 Token 管理后创建“本地 Codex”Token，并只授予运营实际需要的作用域。

Token 只显示一次，只保存在本地 Windows 电脑。不要把 Token 放入宝塔计划任务、服务器 `.env.production` 或 GitHub Actions。具体使用方法见：

- [`operations/README.md`](../../operations/README.md)
- [`docs/operations/local-codex.md`](../operations/local-codex.md)

## 十三、配置自动备份

在宝塔“计划任务”中至少创建：

### MySQL 备份

- 类型：备份数据库
- 数据库：`agentmatter`
- 周期：每天一次，建议低峰时间
- 本地保留：30 份
- 额外建议：同步一份到与服务器不同的对象存储

### 媒体和配置备份

必须包含：

```text
/www/wwwroot/agentmatter/.env.production
/www/wwwroot/agentmatter/storage/media
```

无需备份：

```text
node_modules
.next
artifacts
```

代码已经保存在 GitHub。每月至少做一次恢复演练，确认数据库 SQL 和媒体压缩包真的可以还原。

## 十四、后续更新

更新前先在宝塔手动执行一次数据库和媒体备份，确认备份成功后运行：

```bash
cd /www/wwwroot/agentmatter
AGENTMATTER_BACKUP_CONFIRMED=YES bash deploy/baota/update.sh
```

脚本会拒绝覆盖服务器上的本地改动，只允许 `main` 快进更新，并重新执行依赖安装、质量门禁、构建、迁移和种子同步。

如果使用宝塔 Node 项目管理器，脚本完成后在面板点击“重启”，再执行：

```bash
AGENTMATTER_SMOKE_URL=http://127.0.0.1:3000 \
NEXT_PUBLIC_SITE_URL=https://www.agentmatter.net \
pnpm smoke:production
```

不要在服务器直接编辑源码；所有代码改动都应在本地测试、提交 GitHub，再由服务器拉取。

## 十五、故障排查和回滚

### 502 Bad Gateway

```bash
curl http://127.0.0.1:3000/api/health
pm2 status
pm2 logs agentmatter --lines 100
```

如果本机 3000 不通，先检查 Node 进程；如果本机正常而域名 502，检查 Nginx 代理和防火墙。

### 数据库不可用

```bash
systemctl status mysqld || systemctl status mysql
```

检查 `.env.production` 中的数据库用户名、密码是否经过正确 URL 编码，以及宝塔数据库权限是否限制到本机。

### 图片上传返回 413

确认站点配置中是 `client_max_body_size 10m`，修改后执行 `nginx -t` 并重载。

### 登录后立即退出

检查 `SESSION_SECRET` 是否在重启或更新时发生变化，并确认 Nginx 正确传递 `X-Forwarded-Proto https`。

### 代码版本回滚

先记录当前和上一版本：

```bash
git log --oneline -10
```

恢复上一份确认可用的代码备份或指定 Git 提交，重新执行依赖安装和 `pnpm build`，再重启 Node 项目。数据库迁移默认只向前执行；如果新版本包含不兼容迁移，必须同时恢复更新前的 MySQL 备份，不要只回滚代码。

## 十六、安全检查清单

- [ ] 宝塔面板和 SSH 只允许可信 IP，且使用强密码或 SSH Key
- [ ] 80/443 以外的业务端口未公开
- [ ] MySQL 没有使用 root，也没有允许 `%` 远程登录
- [ ] `.env.production` 权限为 600，且 Git 未跟踪
- [ ] 后台密码与宝塔、SSH、数据库密码不同
- [ ] 未在服务器配置任何模型 API Key
- [ ] Nginx 限流已生效，配置修改前均执行 `nginx -t`
- [ ] MySQL、媒体目录和环境配置每天备份
- [ ] SSL 自动续签已开启并有到期提醒
- [ ] 上线后已运行完整 smoke test
