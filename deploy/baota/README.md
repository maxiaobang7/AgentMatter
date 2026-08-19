# Baota deployment package

Start with [`docs/deployment/baota.md`](../../docs/deployment/baota.md). It contains the complete panel and SSH walkthrough.

Files in this directory:

- `agentmatter.env.example`: production environment template; copy it to the project root as `.env.production` and never commit the filled file.
- `ecosystem.config.cjs`: PM2 configuration for one loopback-only Next.js process.
- `nginx-http-rate-limit.conf`: rate-limit zones for the main Nginx `http {}` block.
- `nginx-site-proxy.conf`: reverse-proxy locations for the `www.agentmatter.net` Nginx `server {}` block.
- `first-deploy.sh`: idempotent first-build and validation helper.
- `update.sh`: guarded update helper that requires an explicit backup confirmation.

The scripts assume the repository is cloned to `/www/wwwroot/agentmatter`. Override it without editing files:

```bash
AGENTMATTER_PROJECT_DIR=/another/absolute/path bash deploy/baota/first-deploy.sh
```

Shell scripts intentionally do not create passwords, edit Nginx, request certificates, or make backups. Those steps contain server-specific secrets and remain explicit in the operator tutorial.

`first-deploy.sh` also does not start a process by default, preventing a duplicate PM2 process when you use Baota's Node project manager. To use the bundled PM2 configuration instead, explicitly set `AGENTMATTER_START_WITH_PM2=YES`.

## Analytics and webmaster verification

The production environment template contains the AgentMatter Baidu Analytics site id. Webmaster platforms should be added as token values only:

```env
NEXT_PUBLIC_BAIDU_SITE_VERIFICATION=your-baidu-token
NEXT_PUBLIC_BING_SITE_VERIFICATION=your-bing-token
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-token
```

After adding or changing any `NEXT_PUBLIC_*` value, rebuild and restart the Node project. Do not paste complete `<script>` or `<meta>` tags into the environment file.
