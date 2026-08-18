# ADR-0001: Use a self-hosted Next.js monolith with a MySQL adapter boundary

## Status

Accepted

## Context

AgentMatter is a public catalog of GitHub-hosted Skills, DSH plugins, Agent plugins, MCP servers and Prompt resources. V1 requires SEO-friendly public pages, mixed search, anonymous submissions and an admin-only moderation path. The owner already operates a server through Baota Panel, so the application must not depend on Vercel or another managed platform. Initial traffic and team size do not justify distributed services.

## Decision

Build a single Next.js App Router application deployed as a Node.js process behind Baota-managed Nginx. Use a typed repository boundary so local seed data powers the first UI milestone and MySQL 8 can power production without changing page components. Use Baota scheduled tasks for GitHub metadata synchronization. Keep public users anonymous in V1; store favorites locally and reserve authentication for administrators.

## Consequences

### Positive

- One deployable process is easy to operate through Baota.
- Server rendering supports discovery and SEO.
- The same codebase can host pages, API routes and later admin workflows.
- MySQL matches common Baota installations and the relational resource model.
- A repository boundary prevents seed-data shortcuts from leaking into UI components.

### Negative

- Full-text Chinese search will need MySQL ngram configuration or a later search service.
- A single process is a shared failure domain.
- GitHub synchronization jobs must be designed not to block web requests.

### Neutral

- Redis is intentionally deferred until rate limiting or cache pressure justifies it.
- Docker remains optional; direct Node process deployment is the default.

## Alternatives Considered

**Static export**
- Rejected because submission APIs, moderation, dynamic search and scheduled data refresh need a server runtime.

**Separate frontend and API services**
- Rejected for V1 because it increases deployment and observability cost without a current scaling need.

**PostgreSQL**
- Technically strong, but MySQL is preferred for compatibility with the existing Baota environment. The domain layer remains database-independent.

**Managed Vercel deployment**
- Rejected because the user explicitly owns and wants to use a Baota-managed server.

## References

- https://nextjs.org/docs/app/guides/self-hosting
- https://nextjs.org/docs/app/getting-started/deploying
