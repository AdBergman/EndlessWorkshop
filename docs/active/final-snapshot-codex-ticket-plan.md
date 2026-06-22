# Final Snapshot Codex Ticket Plan

Status: active frontend/fullstack planning from final DB Exporter snapshot audit
Created: 2026-06-22

## Executive Summary

The final DB Exporter snapshot added useful public Codex metadata across many
categories. EWShop's generic Codex import path already preserves the important
public fields: `facts`, `sections`, `referenceKeys`, `publicContextKeys`, and
optional entry-level `svgIcon`.

The remaining public Codex work is mostly category presentation compatibility,
not a broad DTO rewrite. The highest-value public fix is Victory Conditions,
because it directly answers a central 4X planning question: how do I win?

Rich/source-truth exports are still gated by explicit importer/API/store work,
but the final snapshot makes Heroes + Skills and Factions the most important
near-term investigation tracks after the first public Codex compatibility slice.
Any rich import work must go through the existing Codex rich enrichment decision
process.

## Current Accepted State

- Public Codex exports remain encyclopedia/archive projections.
- Rich exports remain source-truth/domain data and require explicit importer,
  API, store, and resolver support before frontend use.
- Quest Explorer owns quest browsing, branching, progression, strategy, and
  lore. Codex must not recreate Quest Explorer.
- Quests remain hidden from top-level Codex browsing while direct links and
  search remain available.
- Diagnostics-only export kinds are not public Codex data.
- Frontend must not infer from keys, names, prose, SVG filenames, GUIDs, Unity
  paths, or fuzzy matching.
- Missing ownership/art/icon fields mean unknown or intentionally absent unless
  a future exporter/art contract emits explicit source-backed metadata.

## Ticket Plan

| Ticket ID | Title | Category | Priority | Owner Area | Scope | Acceptance Criteria | Validation | Dependencies | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FS-CODEX-002 | Victory Conditions Compact Reference Rows | Victory Conditions | P1 | Frontend | Add compact rows using exported objective, current value, hold duration, caveat/threshold note, and source refs where exact. | Rows communicate victory objective and exported current values without derived map-size examples; detail still shows full facts/sections; no frontend threshold derivation. | Codex page tests; presentation tests if helper added; typecheck; build; browser smoke. | Public `victoryconditions-codex` imported. | Ready |
| FS-CODEX-010 | Heroes And Skills Import Investigation | Heroes / Skills / Rich Imports | P1 | Fullstack | Investigate rich `heroes` and `skills` exports for hero detail/profile enrichment and skill relationship use. | Report identifies supported fields, dropped fields, DTO gaps, and player-value slices; public Skills Codex category remains product-decision gated. | Investigation only; if code later, backend/API/frontend tests. | Rich enrichment decision template; Heroes Archive current state. | Ready |
| FS-CODEX-009 | Rich Factions Import Investigation | Factions / Rich Imports | P1 | Fullstack | Investigate importer/API/store needs for rich `factions` export as a future join point for faction pages and resolvers. | Report classifies backend/API/store/frontend changes; no UI implementation; no SVG/art inference; exact refs only. | Investigation only; if code later, backend and frontend contract tests. | Rich enrichment decision template. | Ready |
| FS-CODEX-003 | Population Archive Foundation | Populations | P1 | Frontend/Product | Establish first Population archive row model from exported `Type`, `Worker effects`, `Threshold rewards`, base food cost, and exact refs. | Rows answer what the population does; threshold rewards remain exact; no inference from population keys/names; no faction icon/art assumptions. | Codex page tests; typecheck; build; browser smoke for major/minor/action-created populations. | Product agreement on whether a Type rail is included in this slice or deferred. | Ready |
| FS-CODEX-001 | Natural Wonders Row Compatibility | Natural Wonders | P1 | Frontend | Add category-specific archive row preview from exported `Effects`; show quiet `Footprint` metadata; keep generic detail behavior. | `/codex?category=naturalwonders` rows show useful effect lines; footprint displays when exported; no live placement/owner/discovery data is shown; no new filters. | Codex page tests; category config tests; typecheck; build; `git diff --check`; browser smoke for Natural Wonders. | Public `naturalwonders-codex` imported. | Ready |
| FS-CODEX-011 | Rich Constructible Planning Investigation | Districts / Improvements / Rich Imports | P1 | Fullstack | Investigate rich district/improvement fields: construction cost, unlock technologies, placement prerequisites, family/level data. | Report separates Codex row/detail opportunities from route-owned planning UI; no RPN execution or inferred unlock timing. | Investigation only; if code later, relevant backend/API/frontend tests. | Rich exports for districts/improvements. | Ready |
| FS-CODEX-004 | Status Polarity And Interaction Polish | Statuses | P2 | Frontend/Product | Decide and implement minimal surfacing for exported `Polarity` and `Status interactions`. Prefer row/detail polish over new heavy navigation. | Bonus/Malus is visible only if useful; interactions use exact exported refs; thin statuses remain honest; no Status type rail unless separately approved. | Codex page tests; status helper tests; typecheck; build; browser smoke for Bonus, Malus, and interaction examples. | Existing Status Archive implementation. | Ready |
| FS-CODEX-005 | Actions Mechanics Preview | Actions | P2 | Frontend | Surface exported `Action mechanics` in archive rows when public description is absent or thin. Keep current broad Category rail. | Thin Action rows show safe mechanics snippets; current rail remains based on broad `Category`; `Action type` is not misused as a broad browse filter. | Codex page tests; typecheck; build; browser smoke for Actions. | Public `actions-codex` mechanics sections. | Ready |
| FS-CODEX-006 | Victory Paths Presentation Decision | Victory Paths | P2 | Product/Frontend | Decide whether Victory Paths stay generic, become shallow reference rows, or get a tiny row model for `World effects` and linked faction traits. | Decision recorded; if implemented, rows show exported world effects and exact trait links only; no victory progression/threshold derivation. | If implementation: Codex tests, typecheck, build, browser smoke. | Victory Conditions row decision may influence presentation. | Proposed |
| FS-CODEX-007 | Ability Role Cleanup Follow-Up | Abilities | P2 | Frontend/Product | Review Ability Role allow-list after canonical `Apply Status` / `Remove Status`; remove or defer zero-use/debatable role shelves. | Canonical labels remain; no old `Status apply` / `Status remove` dependency; any removed shelf is absent only because exporter no longer emits it or product explicitly defers it. | Ability filter helper tests; Codex page tests; typecheck. | Current Ability Archive. | Proposed |
| FS-CODEX-008 | Trait Origin Faction Row Metadata Review | Traits | P2 | Frontend/Product | Decide whether exported `Origin faction` should appear as quiet row metadata for Protectorate/minor faction traits. | If implemented, only exact exported `Origin faction` facts are shown; no ownership inference; Trait Type rail remains unchanged. | Codex page tests; trait helper tests if added; typecheck; build. | Current Trait Archive using `Trait type`. | Proposed |
| FS-CODEX-012 | Quest Explorer Chapter Root Evidence Investigation | Quest Explorer / Rich Imports | P2 | Fullstack | Investigate `quest_explorer.chapterRootEvidence` for Quest Explorer diagnostics/context only. | Report confirms whether evidence improves `/quests`; Codex quest archive remains hidden; no Codex quest grouping or branch reconstruction. | Quest Explorer tests only if code follows. | Quest Explorer ownership docs. | Proposed |
| FS-CODEX-013 | Diagnostics Deny-List Hardening | Importer | P1 | Backend | Ensure diagnostics-only Codex-adjacent files are skipped, logged, and tested rather than public-imported. | `quest_explorer_branch_diagnostics`, `actions-codex-inventory`, `bonuses-codex-mechanics`, `victorycondition-threshold-diagnostics`, and status files are ignored by startup import; public Codex files still import. | `LocalStartupImportRunnerTest`; backend build if touched. | Final snapshot diagnostics list. | Done in current codebase |

## Recommended Next Ticket

Start with `FS-CODEX-002 - Victory Conditions Compact Reference Rows`.

Reason: Victory Conditions already import as public Codex rows, and the final
snapshot includes unusually complete public metadata: objective, current
exported-game value, hold duration, scaling inputs, source refs, and caveats.
This is the best value/risk public Codex compatibility slice because it helps
players understand victory planning without backend or rich-import work.

The recommended second slice is `FS-CODEX-010 - Heroes And Skills Import
Investigation`, because the new rich exports appear to unlock higher-value hero
planning work but require explicit fullstack import/API/store decisions before
UI implementation.
