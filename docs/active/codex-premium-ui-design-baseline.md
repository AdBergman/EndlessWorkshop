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
- The current landing is acceptable for now; the attempted tiny CSS-only polish
  after `EW-CODEX-UI-001` was not visually meaningful enough and should not be
  repeated as-is.

Rationale:
The category-card grid finally feels like a premium archive/index. It gives all categories direct visibility without the old chip-soup effect.

### Category pages

Category pages currently keep:
- compact archive/search header,
- compact direct category shelf at the top,
- left result list,
- right overview/detail panel,
- global search,
- selected category highlighting.

Accepted for now:
- Direct all-category access is valuable for 4X players.
- The category shelf should stay compact and visually quiet.
- The category shelf includes `All` as the first escape-hatch control back to
  the landing/full encyclopedia state.
- The category shelf should wrap instead of overflowing horizontally.
- Category and entry views should not repeat a large selected-category title in
  the top header; the left results and right overview/detail panels carry the
  category context.
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
- Codex search filters results directly; the autocomplete popup is disabled for
  now because the cramped dropdown was noisy and low-value.
- Compact-header search is bounded in width so it does not dominate category
  pages.
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
- Partner Effects and Councilor Effects are proven full-width shallow overview
  categories as of `92e94047`.
- Resources are also proven full-width shallow overview categories as of
  `5bf7253d`.
- On Partner/Councilor Effects/Resources overview routes, the centered
  reference overview replaces the left results panel.
- Selected Partner/Councilor Effect and Resource entry routes still use the
  split results/detail layout.
- Search-active shallow routes keep split layout so search results remain
  visible.
- Resource overview rows show icons when exact resource/extractor icon data is
  available.
- Resource overview ordering is Luxury A-Z, Strategic A-Z, then Other A-Z,
  based on exported resource Type facts.
- Traits use a compact Trait Archive mode with Type rail (`All`, `Faction`,
  `Protectorate`) and reference-style rows; selected Trait entries and
  search-active Traits stay split-layout.
- Future full-width shallow categories must be added deliberately to the
  explicit frontend allow-list through `supportsFullWidthReferenceOverview(kind)`.

### Extractors

Accepted:
- Extractors are hidden support/reference targets, not visible top-level Codex
  destinations.
- Extractors do not appear in the category shelf or `/codex` landing category
  cards.
- Extractor entries remain searchable, linkable, and direct-routable where
  exact refs exist.
- Resource -> Extractor links remain the primary discovery path.

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

1. Ability/Status filters are parked until layout hierarchy is clearer.
2. Search performance must not regress.
3. No `EW-CODEX-UI-006` ticket is currently defined.

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
- compact archive/search header
- bounded-width search
- compact category shelf with `All` first
- left result list
- right overview/detail panel

Should not show:
- large repeated category title in the top header

### Entry mode: `/codex?category=...&entry=...`
Purpose: read one entry.

Should show:
- compact archive/search header
- category context in the left/right panels
- left result list where useful
- right entry detail

Entry title should remain in the detail card, not the top header.

### Search-active mode
Purpose: search results.

Should show:
- search filtering results directly
- no autocomplete popup for now
- category shelf with `All` available as the full-encyclopedia context

Do not redesign search further unless explicitly asked.

## 6. Validation philosophy

For frontend implementation, default validation is:
- targeted unit/component tests for touched code,
- TypeScript check,
- build when appropriate,
- `git diff --check`.

Do not require Codex to run browser QA, screenshot capture, or visual tests unless explicitly requested. The user will do manual visual review from screenshots/browser.
