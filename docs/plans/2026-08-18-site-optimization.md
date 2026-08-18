# AgentMatter Site Optimization Implementation Plan

> **For Codex:** Implement this plan task-by-task in the current workspace and verify each user-facing change in the local browser.

**Goal:** Close the highest-impact mobile UX, submission operations, SEO sharing, freshness, and accessibility gaps found in the August 18 audit without changing AgentMatter's approved visual direction.

**Architecture:** Keep catalog rendering server-first and use small client components only for interactive filters and submission draft restoration. Extend the existing MySQL submission table and admin dashboard instead of adding a second backend. Generate social metadata from the first curated resource image with a site fallback.

**Tech Stack:** Next.js 16.3.1 App Router, React 19, TypeScript, CSS Modules/global CSS, MySQL, Zod, Vitest.

---

### Task 1: Mobile catalog and guideline usability

**Files:**
- Modify: `src/components/catalog-filters.tsx`
- Modify: `src/app/mockups.css`
- Test: browser checks at 390px for `/skills`, `/search?q=skill`, and `/guidelines`

**Steps:**
1. Add a mobile filter disclosure that is collapsed by default while preserving desktop filters.
2. Replace decorative filter choices with real links or remove them when the data model cannot filter them.
3. Make “show more” reveal the remaining hosts instead of rendering static text.
4. Convert the mobile guideline definition table into stacked cards and confirm zero horizontal overflow.
5. Ensure primary links and filter rows have at least a 40–44px usable target.

### Task 2: Submission and admin review loop

**Files:**
- Modify: `database/migrations/004_submission_intake.sql`
- Modify: `src/components/submission-form.tsx`
- Modify: `src/app/api/submissions/route.ts`
- Modify: `src/server/admin-data.ts`
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/admin.css`
- Test: API validation/unit tests and authenticated dashboard readback

**Steps:**
1. Persist component path, display name, and selected hosts submitted by the public form.
2. Restore locally saved drafts on mount and provide a clear-draft action.
3. Add server-side Zod validation, repository/status deduplication, a honeypot, and bounded IP-based request throttling.
4. Read recent submissions into the admin dashboard and show their status and submitted metadata.
5. Verify duplicate and oversized submissions fail without creating additional rows.

### Task 3: Detail conversion and social SEO

**Files:**
- Modify: `src/components/resource-detail.tsx`
- Modify: `src/components/resource-detail.module.css`
- Modify: `src/app/resource/[owner]/[repo]/page.tsx`
- Modify: `src/app/page.tsx`
- Test: metadata output and desktop/mobile detail interaction

**Steps:**
1. Add an “Installation and usage” jump action in the detail hero.
2. Preserve the GitHub action as a secondary destination and keep the layout compact on mobile.
3. Use the first curated resource image for Open Graph and Twitter metadata, with the site image as fallback.
4. Add a catalog H2 on the homepage so headings do not jump from H1 to H3.
5. Verify English and Chinese labels and metadata.

### Task 4: Freshness, sorting, and global polish

**Files:**
- Modify: `src/app/[category]/page.tsx`
- Modify: `src/data/resource-details.ts`
- Modify: `src/components/site-header.tsx`
- Modify: `src/components/site-footer.tsx`
- Modify: relevant CSS files only where required

**Steps:**
1. Replace the fixed August 16 snapshot with the current request time for relative dates and recent-update counts.
2. Expose both stars and recently updated sorting with correct selected states.
3. Replace generic GitHub-home links with a configurable project/community URL and hide them when unconfigured.
4. Keep CSS changes scoped to active components and avoid expanding the legacy mockup layer.

### Task 5: Full verification

**Commands:**
- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test`
- `pnpm build`
- `pnpm ops:validate -- operations/templates/resource.example.json`

**Browser acceptance:**
- No horizontal overflow at 390px on all audited public pages.
- Mobile filters do not block access to results.
- Detail install jump reaches the installation section.
- Submission draft restores locally and all visible fields reach the API.
- Admin dashboard lists the stored submission.
- Resource pages emit an `og:image` and `twitter:image`.
