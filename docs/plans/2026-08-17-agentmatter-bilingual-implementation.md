# AgentMatter Bilingual Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make English the default public language and provide a complete Simplified Chinese version under `/zh`, with route-matched switching, localized resources, and correct multilingual SEO.

**Architecture:** A Next.js 16 `proxy.ts` rewrites `/zh/...` to the existing public route while attaching a trusted locale request header, so English and Chinese share one route implementation without duplicate page trees. Shared locale helpers provide dictionaries, localized paths, and URL alternates. Static seed resources receive reviewed English catalog overrides and generated English detail content; locally generated resources carry an explicit English localization in their validated payload.

**Tech Stack:** Next.js 16 App Router and Proxy, React 19, TypeScript, Zod, MySQL JSON payloads, Vitest, CSS Modules and global CSS.

---

### Task 1: Locale routing and request context

**Files:**
- Create: `src/proxy.ts`
- Create: `src/lib/i18n.ts`
- Test: `src/lib/i18n.test.ts`

1. Write tests for prefixing and removing `/zh` while preserving query strings and resource component parameters.
2. Implement the `en`/`zh` locale helpers and public-route matcher.
3. Implement a Proxy rewrite from `/zh/...` to the existing route with `x-agentmatter-locale: zh`; set `en` for unprefixed public routes and leave APIs, admin, assets and metadata endpoints untouched.
4. Run locale unit tests.

### Task 2: Localized resource contract and catalog projection

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/resource-schema.ts`
- Create: `src/data/resource-localizations.ts`
- Modify: `src/data/resource-details.ts`
- Modify: `src/server/catalog.ts`
- Test: `src/lib/resource-schema.test.ts`
- Test: `src/lib/resources.test.ts`

1. Add a structured English localization field for AI-generated resources.
2. Require local Codex resources to include both Chinese source content and complete English localized content.
3. Add reviewed English overrides for every static catalog seed.
4. Generate English detail sections from English facts and merge stored English localization for dynamic resources.
5. Verify every current resource produces an English-only public projection and a preserved Chinese projection.

### Task 3: Shared public interface localization

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/site-header.tsx`
- Modify: `src/components/site-footer.tsx`
- Modify: `src/components/search-box.tsx`
- Modify: `src/components/resource-card.tsx`
- Modify: `src/components/catalog-filters.tsx`
- Modify: `src/lib/format.ts`

1. Read the request locale in the root layout and set the `<html lang>` value.
2. Add a restrained `EN / 中文` route-matched switcher to desktop and mobile navigation.
3. Localize navigation, search, cards, filters, dates, accessibility labels and footer text.
4. Preserve current typography, spacing and responsive behavior.

### Task 4: Localize every public page

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/[category]/page.tsx`
- Modify: `src/app/search/page.tsx`
- Modify: `src/app/resource/[owner]/[repo]/page.tsx`
- Modify: `src/components/resource-detail.tsx`
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/guidelines/page.tsx`
- Modify: `src/app/submit/page.tsx`
- Modify: `src/components/submission-form.tsx`

1. Resolve the locale once per server page and request localized resources from the catalog.
2. Replace interface prose with locale dictionaries while preserving project-specific content from the localized resource.
3. Ensure every internal link keeps or removes `/zh` correctly.
4. Verify the language switch opens the equivalent path rather than the home page.

### Task 5: Multilingual SEO and discovery

**Files:**
- Modify: `src/lib/seo.ts`
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/manifest.ts`
- Test: `src/lib/seo.test.ts`

1. Generate self-referencing canonicals for both locales.
2. Add `en`, `zh-Hans` and `x-default` alternate URLs to all indexable public pages.
3. Localize Metadata, Open Graph locale, structured data and site descriptions.
4. Add both language versions to the sitemap with reciprocal alternates.

### Task 6: AI operations and current dynamic resource

**Files:**
- Modify: `operations/AGENTS.md`
- Modify: `operations/skills/agentmatter-publisher/SKILL.md`
- Modify: `operations/site-profile.json`
- Modify: `scripts/export-resource-schema.ts`
- Modify: `operations/drafts/pyang5166-gbro-cover-design.json`

1. Require local Codex to research facts once and generate both English and Chinese editorial/SEO fields.
2. Add the complete English localization for `gbro-cover-design` without changing commands, URLs or evidence.
3. Export the updated schema and example.
4. Validate and publish the current resource with operation and resource readback.

### Task 7: Full verification

1. Run `pnpm schema:export`, draft validation, unit tests, ESLint, TypeScript and production build.
2. Verify `/` is English and `/zh` is Chinese.
3. Verify an English and Chinese category page, search page and resource detail page.
4. Check `<html lang>`, title, description, canonical, `hreflang`, language switch target and browser console errors.
5. Confirm the server inventory and resource readback contain the bilingual payload.
