# Homepage Mockup Rebuild Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the AgentMatter homepage to closely match `design/mockups/01-homepage.png` while keeping real repository data and working navigation.

**Architecture:** Replace the current editorial homepage composition with a mockup-led server-rendered catalog landing page. Keep shared data/query helpers, add a dedicated blueprint illustration component, and isolate homepage styling in a CSS Module so category, search, and detail pages retain their existing layout.

**Tech Stack:** Next.js 16 App Router, React 19 server components, TypeScript, CSS Modules, inline accessible SVG, Vitest, in-app browser visual testing.

---

### Task 1: Recreate the dark hero and blueprint illustration

**Files:**
- Create: `src/components/matter-blueprint.tsx`
- Create: `src/app/home.module.css`
- Modify: `src/app/page.tsx`

**Steps:**
1. Build the dark navy full-width hero with dotted technical background.
2. Restore the English AgentMatter title, English promise, and Chinese provenance line.
3. Draw five connected wireframe cubes with inline SVG.
4. Place the functional search box across the dark/light boundary.
5. Verify hero hierarchy at 1440px and 390px.

### Task 2: Restore the catalog-first content hierarchy

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/home.module.css`

**Steps:**
1. Add the GitHub-only provenance strip and submit CTA.
2. Render real category tabs with counts from the resource repository.
3. Replace editorial category cards with a three-column, mockup-shaped resource grid.
4. Preserve links, real stars, license, update date, and compatibility information.
5. Add a clear path to the complete search catalog.

### Task 3: Align the shared header with the approved mockup

**Files:**
- Modify: `src/components/site-header.tsx`
- Modify: `src/app/globals.css`

**Steps:**
1. Use a wider header container and remove compact search from the homepage.
2. Add the visible GitHub utility link shown in the mockup.
3. Preserve the responsive menu and submit CTA.
4. Verify keyboard focus and mobile navigation.

### Task 4: Verify parity and prevent regressions

**Files:**
- Update: `artifacts/homepage-rebuild-desktop.png`
- Update: `artifacts/homepage-rebuild-mobile.png`

**Steps:**
1. Run `pnpm test`, `pnpm lint`, and `pnpm exec tsc --noEmit`.
2. Run `pnpm build` and confirm all application routes compile.
3. Compare the 1440px screenshot with `design/mockups/01-homepage.png`.
4. Inspect the 390px responsive layout and mobile menu.
5. Fix all visual overflow, console warnings, and interaction regressions before delivery.
