# AgentMatter MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-shaped public MVP for discovering, searching, reviewing, and submitting GitHub-hosted AI Agent resources, ready for later deployment through Baota Panel.

**Architecture:** Use a self-hostable Next.js App Router monolith with server-rendered public pages and client islands for filters, favorites, and form interactions. The first milestone reads typed local seed data through a repository boundary; a later MySQL adapter can replace it without rewriting pages. Public users remain anonymous, while moderation and GitHub synchronization are reserved for the next server-connected milestone.

**Tech Stack:** Next.js 16, React 19, TypeScript, global CSS, Vitest, in-app browser acceptance tests, future MySQL 8, Nginx reverse proxy on Baota Panel.

---

### Task 1: Project foundation and design system

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `eslint.config.mjs`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/components/site-header.tsx`
- Create: `src/components/site-footer.tsx`
- Copy: `public/brand/agentmatter-logo-primary.svg`
- Copy: `public/brand/agentmatter-mark.svg`

**Steps:**
1. Scaffold Next.js with TypeScript, App Router, ESLint and the `@/*` alias.
2. Define semantic color, type, spacing, radius and focus tokens matching the Modular Lab direction.
3. Build responsive header/footer navigation with an accessible mobile menu and search entry.
4. Run `pnpm lint` and verify no foundation errors.

### Task 2: Typed resource domain and seed repository

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/data/resources.ts`
- Create: `src/lib/resources.ts`
- Create: `src/lib/format.ts`
- Test: `src/lib/resources.test.ts`

**Steps:**
1. Write tests for category filtering, compatibility filtering, search match reasons and component identity.
2. Define resource, compatibility, acquisition, verification, license and risk types.
3. Add 25 researched GitHub benchmark resources as typed seed data.
4. Implement filtering, search, sorting and lookup utilities.
5. Run tests and ensure all domain cases pass.

### Task 3: Discovery surfaces

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/app/[category]/page.tsx`
- Create: `src/app/search/page.tsx`
- Create: `src/components/resource-card.tsx`
- Create: `src/components/resource-list.tsx`
- Create: `src/components/filter-panel.tsx`
- Create: `src/components/search-box.tsx`
- Create: `src/components/category-hero.tsx`

**Steps:**
1. Build the homepage around host-first discovery and five resource categories.
2. Build category pages with type-aware facts and query-string filters.
3. Build mixed search results with explicit match evidence.
4. Add empty, loading and no-match states.
5. Verify keyboard focus, headings and responsive layout.

### Task 4: Detail and trust experience

**Files:**
- Create: `src/app/resource/[owner]/[repo]/page.tsx`
- Create: `src/components/resource-detail.tsx`
- Create: `src/components/acquisition-panel.tsx`
- Create: `src/components/verification-status.tsx`
- Create: `src/components/favorite-button.tsx`

**Steps:**
1. Resolve repository and optional component identity from the URL.
2. Render type-aware overview, compatibility, installation, permissions, structure and verification sections.
3. Add host-aware acquisition choices and copy actions without claiming untested installation.
4. Store favorites locally with an accessible toggle.
5. Verify missing resources return the Next.js not-found page.

### Task 5: Submission and editorial pages

**Files:**
- Create: `src/app/submit/page.tsx`
- Create: `src/app/guidelines/page.tsx`
- Create: `src/app/about/page.tsx`
- Create: `src/app/api/submissions/route.ts`
- Create: `src/components/submission-form.tsx`
- Test: `src/app/api/submissions/route.test.ts`

**Steps:**
1. Build a GitHub URL-only submission flow with category and notes.
2. Validate GitHub URLs, normalize repository identity and reject oversized input.
3. Return a clear local-development acknowledgement without pretending data is persisted.
4. Explain inclusion, verification and classification rules in editorial pages.
5. Test success and validation error responses.

### Task 6: Production verification and Baota handoff

**Files:**
- Create: `.env.example`
- Create: `README.md`
- Create: `docs/deployment/baota.md`
- Create: `src/app/robots.ts`
- Create: `src/app/sitemap.ts`
- Create: `src/app/manifest.ts`

**Steps:**
1. Document local setup, environment variables and data-adapter boundary.
2. Document Node process, Nginx reverse proxy, TLS and scheduled GitHub sync for Baota.
3. Run `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit` and `pnpm build`.
4. Inspect homepage, category, search, detail and submission pages in the in-app browser at desktop and mobile sizes.
5. Fix all visible overflow, contrast, focus and content issues before handoff.
