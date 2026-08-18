# All Pages Mockup Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align every public AgentMatter page with its approved mockup while preserving real data, filters, search, details, and submission validation.

**Architecture:** Introduce a shared mockup-alignment stylesheet loaded after the existing global design system, then reshape shared catalog, resource row, detail, submission, and editorial components. Page-specific markup follows the corresponding PNG reference; data and routing utilities remain unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, global CSS overrides, Vitest, in-app browser visual acceptance tests.

---

### Task 1: Category and search catalog surfaces

**Files:**
- Modify: `src/app/[category]/page.tsx`
- Modify: `src/app/search/page.tsx`
- Modify: `src/components/catalog-filters.tsx`
- Modify: `src/components/resource-card.tsx`
- Create: `src/app/mockups.css`

**Steps:**
1. Add category statistics and active-filter toolbar.
2. Build table-style category rows and horizontal search-result rows.
3. Add category/search filter modes without inventing persisted filter state.
4. Match the approved spacing, borders, type scale, tabs, and desktop density.
5. Collapse filters and rows safely on mobile.

### Task 2: Resource detail surface

**Files:**
- Modify: `src/components/resource-detail.tsx`
- Modify: `src/components/acquisition-panel.tsx`
- Modify: `src/components/verification-status.tsx`
- Modify: `src/app/mockups.css`

**Steps:**
1. Rebuild the identity header and metadata strip.
2. Add mockup tabs and compact overview, mode, permissions, structure, and verification panels.
3. Align the sticky acquisition sidebar with the resource context.
4. Preserve permission and unverified-status disclosures.
5. Verify tabs, external links, favorite state, and acquisition switching.

### Task 3: Submission workflow

**Files:**
- Modify: `src/app/submit/page.tsx`
- Modify: `src/components/submission-form.tsx`
- Modify: `src/app/mockups.css`

**Steps:**
1. Add centered title and three-stage progress indicator.
2. Add repository-format validation and local preview.
3. Present category choices, component path, Chinese metadata, host compatibility, and rules confirmation.
4. Keep the API acknowledgement honest about preview-only persistence.
5. Match the right-side submission checklist and GitHub rationale panel.

### Task 4: Guidelines, about, and footer

**Files:**
- Modify: `src/app/guidelines/page.tsx`
- Modify: `src/app/about/page.tsx`
- Modify: `src/components/site-footer.tsx`
- Modify: `src/app/mockups.css`

**Steps:**
1. Rebuild guidelines with a sticky section index, requirement cards, definition table, reject panel, and review flow.
2. Rebuild about with the dark brand hero, five-source diagram, principles, naming explanation, metrics, and CTA.
3. Replace the oversized footer with the compact approved footer.
4. Verify responsive reflow and accessibility landmarks.

### Task 5: Whole-site acceptance

**Files:**
- Update: `artifacts/mockup-*.png`

**Steps:**
1. Run tests, lint, TypeScript, and production build.
2. Capture all seven public page types at 1536px.
3. Check category filters, search, acquisition tabs, favorite, and submission validation.
4. Capture key pages at 390px and remove all horizontal overflow.
5. Leave the local development server running for review.
