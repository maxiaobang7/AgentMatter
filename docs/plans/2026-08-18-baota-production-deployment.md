# AgentMatter Baota Production Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prepare a repeatable and security-conscious production deployment package for AgentMatter on a Linux Baota server.

**Architecture:** Run one persistent Next.js Node process on `127.0.0.1:3000`, supervised by PM2 and exposed only through Baota Nginx. Store catalog data in a local MySQL 8 database and uploaded article media on persistent local disk; keep all AI generation and GitHub research on the operator's local Codex machine.

**Tech Stack:** Next.js 16, Node.js 20+, pnpm 11, PM2, Nginx, MySQL 8, Bash, Baota Panel.

---

### Task 1: Record the production architecture decision

**Files:**
- Create: `docs/adr/0003-baota-pm2-production.md`

1. Document why a Node server is required and static export is not viable.
2. Document the single-instance PM2 and Nginx topology.
3. Record security boundaries, persistent paths, backup targets, and deferred alternatives.

### Task 2: Add production configuration templates

**Files:**
- Create: `deploy/baota/agentmatter.env.example`
- Create: `deploy/baota/ecosystem.config.cjs`
- Modify: `.env.example`

1. Use the real canonical and GitHub URLs.
2. Match the database pool variable used by `src/server/db.ts`.
3. Keep every credential as an obvious placeholder.
4. Configure one PM2 process, loopback binding, memory restart, and a 30-second shutdown window.

### Task 3: Add deployment preflight validation

**Files:**
- Create: `scripts/deployment-preflight.mjs`
- Modify: `package.json`

1. Load production environment variables using Next's environment loader.
2. Reject missing secrets, placeholder values, root database users, non-loopback database hosts, malformed password hashes, and unsupported Node versions.
3. Print variable names only; never echo credential values.
4. Verify both a valid and an invalid configuration locally.

### Task 4: Add Nginx templates

**Files:**
- Create: `deploy/baota/nginx-http-rate-limit.conf`
- Create: `deploy/baota/nginx-site-proxy.conf`

1. Define rate-limit zones in Nginx `http {}` scope.
2. Proxy the site to `127.0.0.1:3000` with forwarding headers.
3. Disable buffering for Next.js streaming.
4. Permit the application's 8.5 MB media endpoint with a 10 MB proxy limit.
5. Do not duplicate security headers already emitted by Next.js.

### Task 5: Add first-deploy and update helpers

**Files:**
- Create: `deploy/baota/first-deploy.sh`
- Create: `deploy/baota/update.sh`
- Create: `deploy/baota/README.md`

1. Install locked dependencies including build-time development packages.
2. Run preflight, migrations, idempotent seeding, schema validation, tests, lint, route type generation, TypeScript, and production build.
3. Start or reload PM2 when available, otherwise give a clear Baota-panel handoff.
4. Refuse updates from a dirty tree or without explicit backup confirmation.

### Task 6: Replace the operator tutorial

**Files:**
- Modify: `docs/deployment/baota.md`
- Modify: `README.md`

1. Cover DNS, firewall, Node, MySQL, Git clone, environment creation, build, PM2, Nginx, SSL, admin setup, local Codex, smoke tests, backups, updates, and rollback.
2. Include exact Baota field values and commands.
3. Mark which values must be generated privately and which ports must remain closed.

### Task 7: Verify and publish

1. Run `pnpm schema:export`.
2. Run `pnpm ops:validate -- operations/templates/resource.example.json`.
3. Run `pnpm test`, `pnpm lint`, `pnpm exec next typegen`, `pnpm exec tsc --noEmit`, and `pnpm build`.
4. Run `pnpm audit --prod` and staged secret checks.
5. Commit, push to `main`, and verify that the public remote commit matches the local commit.
