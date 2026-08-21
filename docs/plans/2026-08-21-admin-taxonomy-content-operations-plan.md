# AgentMatter Admin Taxonomy and Content Operations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add database-backed capability topics, safe resource status operations, and a dedicated submission review page to the AgentMatter admin.

**Architecture:** Seed the current static taxonomy into a new MySQL table and merge active database rows into the existing taxonomy configuration. Keep static fallback behavior for environments without a database. Add authenticated admin route handlers for taxonomy and resource status changes, then expose them through focused admin pages.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, MySQL 8, Zod, Vitest, CSS.

---

### Task 1: Add taxonomy storage and pure helpers

**Files:**
- Create: `database/migrations/005_taxonomy_topics.sql`
- Create: `src/lib/taxonomy-admin.ts`
- Test: `src/lib/taxonomy-admin.test.ts`

**Steps:**
1. Write failing tests for topic input normalization, taxonomy merging, and immutable slugs.
2. Run `pnpm test -- src/lib/taxonomy-admin.test.ts` and confirm failure.
3. Implement the migration and pure helpers.
4. Run the focused tests and confirm success.

### Task 2: Add database taxonomy repository and validation

**Files:**
- Create: `src/server/taxonomy-service.ts`
- Modify: `src/lib/resource-schema.ts`
- Modify: `src/server/content-service.ts`
- Modify: `src/server/catalog.ts`
- Test: `src/lib/resource-schema.test.ts`

**Steps:**
1. Change schema tests so topic slugs are format-validated locally and database-validated on writes.
2. Implement topic loading, CRUD, usage checks, and resource write validation.
3. Add a cached catalog taxonomy loader with static fallback.
4. Run resource schema and taxonomy tests.

### Task 3: Build taxonomy admin API and page

**Files:**
- Create: `src/app/api/admin/taxonomy/route.ts`
- Create: `src/app/api/admin/taxonomy/[id]/route.ts`
- Create: `src/app/admin/taxonomy/page.tsx`
- Create: `src/components/admin-taxonomy-manager.tsx`
- Modify: `src/app/admin.css`

**Steps:**
1. Add authenticated CRUD route handlers with Zod validation.
2. Build the category tabs, add form, editable rows, usage counts, stop/restore controls, and live status messages.
3. Add responsive styles and keyboard-accessible controls.
4. Run lint and TypeScript checks for the new files.

### Task 4: Add safe resource status operations

**Files:**
- Modify: `src/server/content-service.ts`
- Create: `src/app/api/admin/resources/[id]/status/route.ts`
- Create: `src/components/admin-resource-status-actions.tsx`
- Modify: `src/app/admin/resources/[id]/page.tsx`
- Test: `src/lib/resource-status.test.ts`

**Steps:**
1. Write failing tests for allowed status transitions.
2. Implement `draft` and `archive` transitions with operation and audit records.
3. Add the authenticated admin endpoint and confirmation UI.
4. Verify the focused tests.

### Task 5: Move submissions to an independent admin page

**Files:**
- Modify: `src/server/admin-data.ts`
- Modify: `src/app/admin/page.tsx`
- Create: `src/app/admin/submissions/page.tsx`
- Modify: `src/app/admin-submissions.css`
- Modify: `src/app/api/admin/submissions/[id]/route.ts`

**Steps:**
1. Split submission queries from the dashboard query.
2. Add fixed admin navigation and a submission entry card to the dashboard.
3. Build the dedicated page with status filters and counts.
4. Revalidate both `/admin` and `/admin/submissions` after review changes.

### Task 6: Apply dynamic taxonomy to public pages

**Files:**
- Modify: `src/app/[category]/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/search/page.tsx`
- Modify: `src/components/resource-card.tsx`
- Modify: `src/data/taxonomy.ts`

**Steps:**
1. Add taxonomy helper overloads that accept a supplied configuration.
2. Load the database-backed taxonomy in home, category, and search pages.
3. Pass the configuration to resource cards and filter labels.
4. Verify static fallback still works without DATABASE_URL.

### Task 7: Full verification

**Files:**
- Modify as needed from failures only.

**Steps:**
1. Run `pnpm test`.
2. Run `pnpm lint`.
3. Run `pnpm exec tsc --noEmit`.
4. Run `pnpm build`.
5. Start the local app and visually inspect `/admin`, `/admin/taxonomy`, `/admin/submissions`, and one resource editor.

