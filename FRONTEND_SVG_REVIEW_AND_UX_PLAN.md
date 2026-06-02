# Frontend SVG Review And UX Plan

Status: review/planning handoff after the SVG infrastructure, Codex icons, unit stat icons, tech unlock icons, and icon usage diagnostics pass.

## Merge Readiness Review

### Finding: Public manifest imports are still a temporary frontend smell

Severity: P2, non-blocking for current merge.

The icon manifest helpers import JSON directly from `frontend/public/svg`:

- `frontend/src/features/icons/iconManifest.ts`
- `frontend/src/features/icons/semanticIconManifest.ts`

This passes tests and production build, but Vite warns in dev that public assets should not be imported from JavaScript. This confirms the current manifest approach is workable as a bridge, but not the final clean contract.

Recommended next fix after exporter handoff:

- move the frontend icon contract into `src/generated` or another import-safe frontend location, or
- serve a backend/frontend bootstrap contract and keep runtime SVG URLs as `/svg/...`.

Do not block the current SVG UI work on this. It is already documented as temporary and the exporter contract work is in flight.

### No Blocking Code Issues Found

The current SVG work is bounded and follows the existing architecture:

- icon resolution stays in `src/features/icons`
- description token rendering stays centralized
- Codex UI swaps existing icon slots rather than adding layout-heavy decoration
- tech unlock icon usage is a bridge only, scoped to existing unlock rows
- unit Focus/Critical Chance is derived through the existing unit description-line path
- diagnostics stay in the existing Codex diagnostics download path

The strongest technical choice is the Codex entry icon resolver priority:

1. exact resource identity token in display name
2. exact extractor resource key
3. safe ability resolver
4. Codex kind fallback

That avoids the bad UX case where `[DustColored] Market Square` would become a Dust entry instead of a district entry.

## Verification

Run from `frontend/` on this reviewed state:

- `npm test -- --run`: passed, 86 files / 528 tests
- `npx tsc --noEmit --project tsconfig.json`: passed
- `npm run build`: passed

Known warning:

- Vite reports some chunks over 500 kB after minification.

Expected test noise:

- `questStore.test.ts` intentionally logs an offline API failure in one test.

## Units Page UX Redesign Plan

### Product Goal

Make `/units` feel like a premium 4X army browser: fast to scan, clear about tactical role, and still collectible/showcase-oriented. Do not turn it into a marketing hero page or a pure data table.

### Current Strengths

- The carousel/card concept gives the page identity.
- Unit evolution is already a core differentiator.
- SVG stat and ability icons now make compact stats more readable.
- URL hydration/deep-link behavior is already established and should be preserved.

### Current UX Problems

- The minor faction toggle sits as a utility control rather than part of a clear browsing toolbar.
- The carousel is visually expressive but not information-dense enough for comparing units.
- Side cards are dimmed enough that they are less useful as scan targets.
- The page lacks a stable detail panel for the selected unit's role, evolution context, and abilities.
- The current black/orange intensity can feel game-card flashy rather than premium tactical.

### Recommended Layout

Use a three-zone layout:

1. Top control bar
   - faction selector remains global
   - local controls: major/minor toggle, class filter, search, sort/group mode
   - compact count: visible units / faction

2. Selected unit stage
   - keep the main card as the visual anchor
   - add a quiet right-side detail panel for selected unit details
   - show role summary, stat row, ability icons, evolution tier, faction/minor origin

3. Evolution and comparison rail
   - keep the evolution tree below or beside the selected unit depending on viewport
   - allow scanning siblings/upgrades without flipping cards
   - use SVG icons for stat and ability anchors, not for decorative clutter

### Unit Page SVG Use

Safe now:

- compact stat icons: Damage, Health, Defense, Movement, Focus/Critical Chance, Upkeep
- ability icons where `getAbilityIconPath` safely resolves
- Codex-kind style links if unit abilities link into Codex
- resource/upkeep token icons in description lines

Wait for exporter:

- attack range icons
- weapon/combat role icons if not reliably exported
- exact ability semantic section
- unit class role icons if currently heuristic

Wait for art/webp:

- unit art, hero art, councilor art
- richer selected-unit showcase background
- faction-specific illustrative surfaces

### Implementation Sequence

1. UX-only refactor plan and visual QA checklist.
2. Extract a selected-unit detail view model from `deriveUnit` outputs and Codex ability lookups.
3. Add a selected-unit detail panel beside the card.
4. Add search/class filter without changing route semantics.
5. Tune carousel side-card readability and toggle placement.
6. Only after exporter/art: attack range and role-specific visual polish.

## Premium Background Strategy

Do not apply the ultra-premium Quest background to all views.

Recommended model: one shared premium atmosphere system with page-specific intensity.

### Quests

Keep cinematic/editorial. Quest Explorer can remain the premium north star because it is narrative-first and benefits from atmosphere.

### Units

Use a black artifact/showcase canvas, but calmer than today:

- less glow
- more stable control alignment
- route accent via shared tokens
- card/evolution readability first

### Codex

Use a quiet archive/workbench surface:

- charcoal panels
- precise borders
- restrained icon use
- high readability for text and related links

Codex should not be cinematic. It should feel like a premium encyclopedia.

### Tech

Keep the tech tree/canvas readable and strategic. Do not add node icon clusters now. Supporting table/toolbars can move toward shared charcoal styling.

### Summary

Dashboard/workbench. Dense, utilitarian, restrained. No cinematic background.

### Admin

Utility only. Shared tokens are fine, but avoid atmospheric treatment.

## Future Implementation Backlog

### Safe Now

- Use icon diagnostics on real imported Codex data.
- Fix high-frequency unresolved description tokens with exact manifest-backed mappings.
- Improve Codex entry icons for one proven category at a time.
- Add Units selected-detail panel view model.
- Calm Units carousel/toggle styling without changing route behavior.

### Wait For Exporter

- attack range icons
- semantic ability icon section
- exact unit class/combat role icons
- final generated frontend icon contract

### Wait For Art/WebP

- unit art
- hero art
- councilor art
- selected-unit visual showcase
- page-specific image-backed hero/stage moments

### Needs UX Mock Or Review First

- Units page structural redesign
- route-level premium atmosphere tokens
- Codex visual density retune
- Summary shared panel restyle
- any cross-route background change

## Recommended Next Work Item

Do not add more icons blindly.

Next implementation should be either:

1. run the new Codex icon diagnostics on real data and fix the top unresolved icon tokens, or
2. start the Units redesign with a small selected-unit detail panel and no new exporter assumptions.

If visual direction is the priority, start with Units. If data/icon coverage is the priority, start with diagnostics-driven token cleanup.
