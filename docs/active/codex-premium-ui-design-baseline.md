# EWShop Codex Premium UI Design Baseline

Status: active design baseline
Area: Codex / Encyclopedia
Current phase: post-DB-exporter metadata enrichment, manual UI iteration
Owner role: EWShop product / visual UI UX / frontend tech lead

## 1. Why this document exists

Recent Codex work added richer DB Exporter metadata, better reference surfaces, a landing category-card index, compact direct category navigation, and search performance fixes. The UI is now useful, but the design discussion has produced several important product decisions that should not be rediscovered every time Codex starts a new implementation slice.

This document is the stable source of truth for the current Codex UI direction.

## 2. Current accepted direction

### `/codex` landing page

The landing page is an encyclopedia index.

Accepted:
- The landing page should use category cards as the primary category navigation.
- The landing page should not also show the top category chip shelf.
- The landing page should use `Encyclopedia` as the main page title.
- The landing page should not repeat a second large `Codex Overview` title.
- Category cards should show icon, category name, count, and a short description.
- All visible categories should remain directly discoverable from the landing page.
- Modifiers must remain hidden from visible category navigation.

Rationale:
The category-card grid finally feels like a premium archive/index. It gives all categories direct visibility without the old chip-soup effect.

### Category pages

Category pages currently keep:
- compact direct category shelf at the top,
- left result list,
- right overview/detail panel,
- global search,
- selected category highlighting.

Accepted for now:
- Direct all-category access is valuable for 4X players.
- The category shelf should stay compact and visually quiet.
- Do not hide all categories behind group navigation for now.
- Do not move all category navigation into the left panel for now.
- The left panel remains the result/result-refinement surface, not the full category tree.

Rationale:
A 4X player often knows the exact category they want. Direct access is faster than forcing a group-first navigation step. The grouped shelf experiment was more structured but felt worse, took more space, and reduced scan speed.

### Entry/detail pages

Accepted:
- The right detail/overview cards are one of the strongest parts of the Codex.
- Do not broadly redesign detail pages in the current UI pass.
- Detail page work should remain scoped to proven value surfaces.

### Search

Accepted:
- Search is global/prominent and must stay fast.
- Search performance was recently improved by caching search documents and scoring candidates once before sorting.
- Search behavior/result ordering should not change without explicit product decision.
- Search visual/browser QA is user-owned unless explicitly requested.

### Shallow reference categories

Current shallow/reference categories:
- Resources
- Councilor Effects
- Partner Effects
- Traits

Accepted:
- These categories are top-level visible categories.
- They are list-first reference categories, not heavy dossier pages.
- Their list rows should show the useful effect/source/extractor information directly.
- They should not get generic rich dossier treatment unless product direction changes.
- For shallow categories, the left result panel may be less useful and is a future layout question, not solved yet.

### Modifiers

Accepted:
- Modifiers remain hidden from visible category navigation.
- Modifiers may remain searchable/linkable by exact public refs.
- Do not promote Modifiers.

### Ability / Status metadata filters

Current state:
- Ability/Status metadata filter implementation was explored and stashed.
- It should not be committed as-is.

Accepted:
- Ability and Status metadata is useful.
- Filters should be contextual and secondary, not another global chip ocean.
- Ability filters may return later:
  - Ability mechanic
  - Ability source
  - Combat role
- Status filters may return later:
  - Scope as the likely first visible filter
  - Status Type should probably remain row/detail metadata only unless manually reviewed
- Combat Role must not expose combined comma-string values as primary chips. If implemented, split deterministic comma-separated exported values or defer.

## 3. Rejected or paused directions

### Full grouped top navigation

Rejected for now:
- War / Empire / People / Diplomacy / Reference as a group selector that hides categories.

Reason:
It looked more organized but felt worse in practice, added a row, could slow direct access, and did not feel premium enough.

### Full category navigation in the left panel

Rejected for now:
- Moving all category navigation into the left panel.

Reason:
The left panel already has an important role as results scanning. Filling it with a full category tree risks moving the clutter rather than solving it.

### Commit Ability/Status filters as-is

Rejected for now:
- The first implementation worked technically but made the page more visually noisy.

Reason:
Filters should wait until the surrounding category/header layout is more settled.

## 4. Known current problems

1. Category pages still use the global `Encyclopedia` header, which can feel generic/heavy.
2. The category shelf on category pages is acceptable but still visually dense.
3. The landing page may still need fine spacing polish.
4. The left panel is useful for Tech/Abilities/Statuses, but questionable for shallow list categories like Partner Effects.
5. Ability/Status filters are parked until layout hierarchy is clearer.
6. Search performance must not regress.

## 5. Current 10/10 target

The Codex should clearly separate page modes:

### Landing mode: `/codex`
Purpose: browse the whole encyclopedia.

Should show:
- `Encyclopedia` title
- search
- stats
- category card index

Should not show:
- top category chip shelf
- left result panel
- right detail panel
- duplicate `Codex Overview` title

### Category mode: `/codex?category=...`
Purpose: browse one category.

Should show:
- contextual header for selected category in a future slice
- search
- compact category shelf
- left result list
- right overview/detail panel

### Entry mode: `/codex?category=...&entry=...`
Purpose: read one entry.

Should show:
- category context
- left result list where useful
- right entry detail

Entry title should remain primarily in the detail card.

### Search-active mode
Purpose: search results.

Not fully designed yet. Do not redesign in the next small slice unless explicitly asked.

## 6. Validation philosophy

For frontend implementation, default validation is:
- targeted unit/component tests for touched code,
- TypeScript check,
- build when appropriate,
- `git diff --check`.

Do not require Codex to run browser QA, screenshot capture, or visual tests unless explicitly requested. The user will do manual visual review from screenshots/browser.
