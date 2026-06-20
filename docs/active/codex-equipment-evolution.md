# Codex Equipment Evolution

Status: Closed out for first archive evolution pass  
Owner: EWShop frontend/product  
Related process: `docs/active/codex-category-evolution-playbook.md`

## Purpose

Equipment is being evaluated as the next Codex category to evolve into a premium player-facing experience. The goal is to understand whether Equipment should remain a generic Codex list, become an Archive like Abilities and Statuses, or take another shape based on the exported data and player browsing behavior.

This document is the durable working memory for Equipment evolution. It records evidence, decisions, implementation results, exporter findings, and closeout notes so the work can continue safely across long Codex sessions.

Use this document together with the Codex Category Evolution Playbook. The playbook defines the process; this file records Equipment-specific findings.

## Current State

Equipment currently uses the generic Codex split layout:

- compact Codex top search/category shelf
- generic left result list
- generic main overview/detail rendering
- granted ability previews in detail when exact ability references resolve

Known starting assumptions:

- Equipment is currently a visible top-level Codex category.
- Equipment has existing detail behavior, including granted ability previews where exact ability references exist.
- Equipment should not copy Ability or Status UI blindly.
- No frontend inference from keys, names, prose, or SVG filenames is allowed.

## Phase Findings

### Data Audit

Local Codex export audited:

- `local-imports/codex/ewshop_equipment_codex_export_0.82.json`

Current exported shape:

- 160 Equipment entries.
- Facts on all 160 entries:
  - `Type`
  - `Slot`
  - `Rarity`
  - `Tier`
  - `Value`
- `Access pool` exists on 159 entries.
- Sections:
  - `Granted abilities`: 152 entries
  - `Effects`: 149 entries

Counts:

- Slot:
  - Weapon: 84
  - Accessory: 34
  - Armor: 32
  - Consumable: 10
- Type:
  - Accessory: 34
  - Armor: 32
  - Exotic: 22
  - One-Handed Weapon: 21
  - Two-Handed Weapon: 21
  - Bow: 20
  - Consumable: 10
- Rarity:
  - Rare: 59
  - Legendary: 46
  - Uncommon: 44
  - Common: 11
- Access pool:
  - Marketplace: 155
  - Quest: 4
  - missing: 1

Granted ability coverage:

- 281 granted ability references resolve to Codex Ability entries.
- 26 granted ability references do not resolve in current Codex data.
- 8 Equipment entries have no granted abilities.

Effect coverage:

- Most Equipment entries have 1-3 stat/effect lines.
- A few have 4-5 effect lines.
- 11 entries have no `Effects` lines, mostly Consumables whose meaning is carried by granted ability references.

Trustworthy data:

- `Type`, `Slot`, `Rarity`, `Tier`, `Value`, and `Access pool` are clean structured facts.
- `Effects` lines are player-facing stat/effect content.
- `Granted abilities` are useful when the referenced ability resolves exactly.

Noisy/missing data:

- Individual Equipment item icons are not exposed as stable Codex facts.
- Some granted ability references are exact keys but do not resolve in the current frontend Codex dataset.
- `Access pool` is missing for `Apotheosis Dirge`.

### Browse Audit

Equipment should be treated as an **Archive**.

4X player browse behavior:

- browse by equipment type/slot when outfitting heroes
- compare rarity/tier/value when judging gear quality
- scan stat effects quickly
- inspect granted abilities when an item changes battle behavior

The strongest first browse model is `Type`, because it separates weapons into meaningful shelves while still preserving Armor, Accessory, and Consumable:

- Accessory
- Armor
- Bow
- Consumable
- Exotic
- One-Handed Weapon
- Two-Handed Weapon

`Slot` is useful but too coarse as the primary rail because 84 entries collapse under Weapon. `Rarity` is useful as secondary browse/filtering, not the first identity.

### Navigation Audit

Recommended first navigation direction:

- Equipment-specific left rail.
- Primary group: `Type`.
- Secondary group: `Rarity`.
- Filtering should use exported facts only.
- Selecting/deselecting filters should return from Equipment detail to the archive list, matching Ability/Status behavior.

Do not use:

- `Tier` as primary navigation; it duplicates rarity for most player planning.
- `Value` as navigation; it is inspection/comparison metadata.
- `Access pool` as primary navigation; Quest-only count is too small for the first pass.
- granted ability names as rail navigation; that would become noisy and is content/relationship data.

### Main Panel Audit

Equipment archive rows should be content-first.

Recommended row hierarchy:

1. Equipment name and icon.
2. Effect/stat lines from `Effects`.
3. Granted ability preview lines when exact ability references resolve.
4. Quiet right-side metadata: Type, Rarity, Tier, maybe Value.

Important row behavior:

- Effects are content.
- Granted abilities are content when exact.
- Type/Rarity/Tier/Value are metadata.
- Do not render raw description prose ahead of gameplay content in archive rows.
- Do not infer missing granted ability details from unresolved keys.

Thin/fallback behavior:

- Items with neither Effects nor resolved granted abilities should remain visible.
- Use an honest fallback such as `No public equipment effects exported yet.`

### Detail Audit

Current Equipment detail already adds value through granted ability previews.

Future detail direction:

- detail should be an inspection/permalink page
- keep exact granted ability previews
- keep complete Effects
- show compact profile metadata for Type, Slot, Rarity, Tier, Value, Source
- avoid raw duplicate fact grids if an Equipment-specific detail polish happens later

Detail redesign is not required before improving the archive rows.

### Relationship Audit

Exact relationships found:

- Equipment -> Abilities through `Granted abilities` section item `referenceKey`.
- Quests -> Equipment through exact references; 101 inbound Quest references in local data.
- Traits -> Equipment through one exact inbound reference.

Recommended relationship approach:

- Equipment archive rows should show resolved granted ability previews first.
- Equipment details should keep granted ability previews.
- Inbound Quest/Trait relationships are useful detail-page trust/permalink content, but should not be added to archive rows in the first implementation.

### Exporter Audit

Non-blocking exporter findings:

- 26 Equipment granted ability references do not resolve to current public Codex Ability entries.
- Individual Equipment icon metadata is not available as a stable Codex fact/reference.
- `Access pool` is missing for `Apotheosis Dirge`.

None of these block a frontend Equipment Archive pass.

## Accepted Decisions

- Equipment is an Archive.
- First navigation should use exported `Type`, with `Rarity` as a secondary browse group.
- Archive rows should prioritize Effects and exact granted ability previews.
- Detail pages can remain mostly as-is for the first archive pass because granted ability previews already provide real inspection value.
- Exact references only; no frontend inference from equipment names, keys, prose, or SVG filenames.

## Rejected Directions

- Reference Sheet: rejected because Equipment is too broad and browse-heavy.
- Explorer: rejected for now because Equipment has no progression/journey model like Quests, Tech, or Units.
- Slot-only navigation: rejected as first rail because `Weapon` is too broad.
- Value/source-first navigation: rejected as too administrative for player browsing.

## Exporter Findings Recorded

Equipment exporter findings discovered so far:

- unresolved granted ability references
- missing explicit Equipment icon metadata
- one missing `Access pool`

Active exporter backlog:

- `docs/active/db-exporter-ability-metadata-handoff.md`

## Open Questions

- Should Equipment detail later get an effect-first profile layout like Abilities and Statuses?
- Should inbound Quest/Trait references be grouped in Equipment detail?
- Should Equipment rows show Value, or is Type/Rarity/Tier enough?
- Should explicit Equipment icon metadata be requested from the exporter, or is the generic Equipment icon acceptable for now?

## Future Ticket Roadmap

- EQUIPMENT-UI-001: Equipment Type/Rarity left rail.
- EQUIPMENT-UI-002: Equipment archive row effect/granted ability previews.
- EQUIPMENT-UI-003: Equipment detail profile/effect layout polish if manual review shows detail still feels generic.
- EQUIPMENT-UI-004: Exact inbound Quest/Trait relationship sections if product review values source discovery.
- EQUIPMENT-UI-005: Final category closeout.

## Implementation Results

### EQUIPMENT-UI-001/002 - Archive Rail And Row Foundation

Implemented as a combined narrow frontend slice.

Result:

- Equipment now uses an explicit `equipmentArchive` Codex category mode.
- Left pane is an Equipment archive rail instead of the generic result list.
- Rail groups:
  - `Type`
  - `Rarity`
- Filters use exported Equipment facts only.
- Selecting the same filter again clears that filter.
- Clear resets all Equipment filters.
- Changing Equipment filters from a detail route removes `entry` and returns to the archive list.
- Search still applies before Equipment filters.

Archive row behavior:

- Equipment rows render item icon/name.
- Rows prioritize exported `Effects` lines.
- Rows show up to 5 Equipment effect lines.
- Rows show exact granted ability preview cards when `Granted abilities` references resolve to public Ability entries.
- Unresolved granted ability references are not invented into preview cards.
- Right-side metadata shows:
  - Type
  - Rarity
  - Tier/Base
  - Value
- Rows use an honest fallback when neither Effects nor resolved granted ability previews exist:
  - `No public equipment effects exported yet.`

What worked:

- Existing granted ability preview builder was reusable for Equipment archive rows.
- Existing archive rail visual language from Status was reusable without creating a generic framework.
- Existing Codex category mode helper was the right place to make Equipment behavior explicit.

What did not change:

- Equipment detail pages still use current generic/structured detail behavior.
- Inbound Quest/Trait relationships are not surfaced yet.
- Per-item Equipment icons are not inferred from SVG filenames.
- Backend/import/export contracts are unchanged.

### EQUIPMENT-UI-003A - Granted Ability Presentation Polish

Implemented as a focused archive-row polish slice after manual visual review.

Problem:

- Equipment archive rows rendered exact granted abilities as full preview cards.
- The cards competed with the Equipment item itself.

Result:

- Equipment archive rows now render resolved granted abilities as a compact inline `Grants:` line.
- Granted ability names remain exact-reference controls and navigate to the resolved Ability entry.
- Visible granted ability links are capped to preserve row height.
- Overflow renders as a quiet `+N more` indicator.
- Unresolved granted ability references are still not rendered as fake links.
- Full granted ability preview cards remain available in Equipment detail pages.

Decision:

- Archive rows may surface exact linked entities as compact inline affordances.
- Full relationship cards should stay in detail pages unless the linked entity is the primary row content.

### EQUIPMENT-UI-003B - Ability Tooltip Parity And Metadata Cleanup

Implemented as a focused follow-up to the compact `Grants:` line.

Result:

- Compact granted ability links now reuse the existing Codex inline entity link component used by Ability effect links.
- Granted ability links show the standard Codex hover/focus tooltip preview.
- Granted ability links remain exact-reference navigation controls.
- No new tooltip framework or Equipment-specific tooltip path was introduced.
- `Value` was removed from Equipment archive row metadata.

Decision:

- Equipment archive row metadata now shows:
  - Type
  - Rarity
  - Tier/Base
- `Value` remains detail/provenance data, not archive scan metadata.
- When inline linked entities appear in archive rows, reuse existing Codex link/tooltip behavior before introducing new presentation systems.

## Lessons Learned

- Equipment confirms the Archive pattern can work without copying Ability or Status directly.
- For Equipment, granted ability references are content, not just related metadata.
- Primary entities must dominate archive rows; linked entities should be compact unless they are the row's main content.
- Inline linked entities should reuse existing Codex hover/click affordances where possible.
- Administrative metadata such as `Value` should not appear in archive rows unless it improves player planning.
- Type is stronger than Slot as first browse model because Slot collapses most items into Weapon.
- Rarity is useful as secondary navigation, but should not dominate the row.
- Unresolved exact references should remain honest missing data rather than frontend-inferred cards.

## Final Closeout

Completed: 2026-06-20.

### Browser/Product Review

Reviewed in a real local browser through Chrome DevTools against the running Vite app.

Paths and interactions checked:

- `/codex?category=equipment`
- Type filter: `Bow`
- Rarity filter: `Legendary`
- search: `plate`
- no-results search: `crown`
- Equipment detail route, then selecting `Rare` from the rail
- sanity checks:
  - `/codex?category=abilities`
  - `/codex?category=statuses`
  - `/codex?category=resources`

Findings:

- Equipment root renders as an archive with Type/Rarity rail and 160 archive rows.
- Type and Rarity filters are usable and update the row set.
- Search works with Equipment archive rows; `plate` returned matching equipment rows.
- No-results state is quiet and clear for unmatched Equipment searches.
- Selecting a rail filter from an Equipment detail route removes `entry` and returns to the archive list.
- Abilities, Statuses, and Resources sanity pages loaded without obvious runtime errors.
- Equipment rows are more useful than the old generic list because exported effects and exact granted ability previews are visible in the archive.

Persona ratings:

- Visual UI/UX designer: 7.5/10. The archive structure is solid and calm, but Equipment detail and per-item icon identity remain future polish areas.
- Frontend tech lead: 8/10. The mode is explicit, product-specific, and bounded; no generic framework was introduced.
- 4X gamer: 8/10. Type/Rarity browsing plus effects/granted abilities make the category useful for planning. Detail can still become a stronger inspection page later.

### Architecture Review

Reviewed against `AGENTS.md`, `docs/frontend/frontend-architecture-guidelines.md`, and current Codex component patterns.

Result:

- `CodexPage.tsx` owns route/query orchestration and category-mode state, matching existing Codex architecture.
- Equipment filtering logic lives in `codexEquipmentArchiveFilters.ts`, not inline in the page.
- Equipment rail rendering lives in `EquipmentArchiveRail.tsx`.
- Equipment row rendering is still in `CodexSummaryDetail.tsx`, consistent with existing Ability/Status summary-row specialization.
- The category mode is explicit through `getCodexCategoryMode("equipment")`.
- No backend/import/exporter contracts changed.
- No frontend inference from keys, names, prose, or SVG filenames was introduced.
- No generic faceted-navigation framework was introduced.

Cleanup performed during closeout:

- Renamed a shared preview-line helper from a Status-specific name to `getStructuredSectionPreviewLines` after Equipment started using it too.

### Validation

Passed:

- `npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts`
- `npx tsc --noEmit --project tsconfig.json`

Final validation also requires:

- `npm run build`
- `git diff --check`

### Final Decisions

- Equipment is complete for the first Archive pass.
- Keep Equipment visible as a top-level Codex category.
- Use Type/Rarity left-rail filtering.
- Keep Equipment archive rows content-first with Effects and exact granted ability previews.
- Keep Equipment detail polish deferred.
- Keep inbound Quest/Trait relationships deferred.
- Keep per-item icon identity exporter-dependent.

### Remaining Known Issues / Follow-Up Work

- Equipment detail pages still use the current generic/structured detail pattern.
- Inbound Quest/Trait relationships are known but not surfaced.
- Some granted ability references are unresolved until exporter/frontend data is cleaned up.
- Equipment lacks explicit per-item icon metadata.
- `Apotheosis Dirge` is missing `Access pool`.

### Recommended Commit Split

One docs+frontend commit is acceptable because the implementation and durable working docs describe the same category evolution slice:

- `feat(codex): add equipment archive mode`

If a smaller split is preferred:

1. `docs(codex): add equipment evolution plan`
2. `feat(codex): add equipment archive mode`
