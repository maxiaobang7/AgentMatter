# Focused Resource Detail Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Rebuild AgentMatter resource detail pages around a concise project introduction and a type-aware installation or usage console.

**Architecture:** Keep the existing structured resource data and dynamic route. Replace the current navigation/sidebar-heavy client component with one focused hero console and a single editorial article. Derive action labels, setup steps, usage examples, and FAQ copy from the resource category and acquisition mode without adding a second data source.

**Tech Stack:** Next.js 16 App Router, React 19 client components, TypeScript, global CSS, Vitest.

---

### Task 1: Define the focused detail behavior

**Files:**
- Modify: `src/components/resource-detail.tsx`
- Test: `src/lib/resources.test.ts`

**Steps:**
1. Add a data-contract test requiring every resource to have at least one acquisition with a command or official URL.
2. Run `pnpm test` and confirm the catalog contract passes.
3. Remove the page section navigation, compatibility, permissions, structure, maintenance, verification, and desktop sidebar rendering.
4. Add category-aware hero titles, primary actions, setup steps, usage examples, and FAQ items.
5. Keep unverified data out of the main reading path rather than changing its stored verification state.

### Task 2: Implement the confirmed visual hierarchy

**Files:**
- Modify: `src/app/mockups.css`

**Steps:**
1. Add a focused detail-page style layer matching the confirmed mockup.
2. Implement the two-column hero with the installation console docked on the right.
3. Implement a centered editorial body without a left or right navigation rail.
4. Style three setup steps, capability rows, usage example, README summary, FAQ, and related resources.
5. Add responsive rules that stack the hero and retain the installation console near the top on mobile.

### Task 3: Verify all five resource types

**Files:**
- Test: `src/lib/resources.test.ts`

**Steps:**
1. Run `pnpm lint` and fix all static issues.
2. Run `pnpm test` and confirm all catalog tests pass.
3. Run `pnpm build` and confirm the dynamic resource route compiles.
4. Visually inspect one MCP page and one non-install resource page at desktop width.
5. Inspect the MCP page at 390px and confirm there is no horizontal overflow or duplicate installation command.

### Task 4: Document completion

**Files:**
- Update: `docs/plans/2026-08-16-focused-resource-detail-page.md` only if implementation differs materially from this plan.

**Steps:**
1. Report the final page hierarchy and type-aware behavior.
2. Include lint, test, build, and visual verification results.
3. Do not claim a Git commit because this workspace is not a Git repository.
