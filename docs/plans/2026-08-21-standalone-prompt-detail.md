# Standalone Prompt Detail Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use Code workflow to implement this plan task-by-task.

**Goal:** Give individually copyable Prompts a focused bilingual detail page while preserving the existing project detail page for Prompt collections, guides, Skills, plugins, and MCP servers.

**Architecture:** Add an optional discriminated `detail.prompt` payload to the shared resource contract. The resource route selects a dedicated client component only when `category` is `prompts` and `detail.prompt.kind` is `standalone`; all other resources continue through `ResourceDetail`. Existing standalone Prompt records receive a narrow legacy fallback until they are republished with the new field.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, Zod, Vitest.

---

### Task 1: Extend and test the resource contract

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/resource-schema.ts`
- Modify: `src/lib/resource-schema.test.ts`
- Regenerate: `operations/schemas/resource.schema.json`

**Steps:**
1. Add failing tests for valid standalone Prompt data, non-Prompt rejection, bilingual alignment, and the installation-guide exemption.
2. Add the `PromptDetail` discriminated union and schema refinements.
3. Run the focused schema tests.
4. Regenerate the JSON Schema and verify the generated diff.

### Task 2: Add standalone Prompt selection helpers and UI

**Files:**
- Create: `src/lib/prompt-detail.ts`
- Create: `src/lib/prompt-detail.test.ts`
- Create: `src/components/standalone-prompt-detail.tsx`
- Create: `src/components/standalone-prompt-detail.module.css`
- Modify: `src/app/resource/[owner]/[repo]/page.tsx`

**Steps:**
1. Test explicit selection, legacy extraction, collection exclusion, and placeholder handling.
2. Implement the selector and exact-text extraction.
3. Build the compact breadcrumb, introduction, copy card, source row, copied/error states, keyboard focus, responsive layout, and dark mode.
4. Select `CreativeWork` JSON-LD for standalone Prompts and retain `SoftwareSourceCode` elsewhere.
5. Run focused tests, lint, and TypeScript checks.

### Task 3: Migrate the published Prompt draft and publishing rules

**Files:**
- Modify: `operations/drafts/unix2dos-brain-prompts-ask-a-better-question.json`
- Modify: `operations/AGENTS.md`
- Modify: `operations/skills/agentmatter-publisher/SKILL.md`

**Steps:**
1. Add Chinese and English `detail.prompt` fields using the already verified GitHub source.
2. Document the standalone Prompt exception to project-style installation and six-section content rules.
3. Run local operation validation without publishing production data.

### Task 4: Full verification

**Files:**
- Verify only; fix affected files if failures expose regressions.

**Steps:**
1. Run all Vitest tests.
2. Run ESLint and TypeScript checks.
3. Run the Next.js production build.
4. Start the local application and inspect the Chinese and English standalone Prompt pages at desktop and mobile widths.
5. Confirm other Prompt collections still use the original resource page.
6. Review the final diff and commit the implementation locally; do not push or deploy without a separate request.
