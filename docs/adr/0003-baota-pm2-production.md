# ADR 0003: Deploy AgentMatter as a single Baota-managed Node service

- Status: Accepted
- Date: 2026-08-18

## Context

AgentMatter contains dynamic pages, an administrator interface, authenticated Agent APIs, runtime image processing, and MySQL-backed content. A static export cannot support these capabilities. The first production server is a single Linux host in the United States managed through Baota Panel, so operational simplicity and recoverability are more important than multi-region scaling.

## Decision

Use Nginx as the only public entry point and proxy requests to one persistent `next start` process bound to `127.0.0.1:3000`. Let Baota's Node project manager or PM2 supervise that process. Use a local MySQL 8 database restricted to loopback and store generated WebP media in `/www/wwwroot/agentmatter/storage/media`.

Only ports 80 and 443 are public. Port 3000 and MySQL 3306 remain closed externally. AI research and generation stay on the local Codex computer; the server stores, validates, audits, and publishes structured content but has no model API key.

## Alternatives considered

- **Static export:** rejected because it removes the admin, Agent API, runtime database reads, submissions, and media processing.
- **Docker Compose:** viable later, but deferred because it duplicates capabilities already provided by Baota and increases first-deployment complexity.
- **Multiple Node instances:** deferred. Next.js cache coordination, a shared media store, a stable Server Actions key, and deployment-version coordination would be required.

## Consequences

- The deployment is straightforward to inspect and recover through SSH even if a Baota plugin fails.
- Nginx handles TLS, malformed traffic, request size limits, and rate limiting.
- PM2 receives a 30-second shutdown window so Next.js can finish in-flight work.
- MySQL, `.env.production`, and `storage/media` are stateful and must be backed up.
- The single server is a single point of failure; the initial recovery targets are a daily backup, RPO of 24 hours, and RTO of 4 hours.
