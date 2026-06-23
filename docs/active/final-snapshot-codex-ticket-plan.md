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
but the accepted value review makes Factions the next investigation after the
first public Codex compatibility slice. Heroes + Skills remains very high value,
but follows Factions because Factions is the stronger cross-category strategy
hub. Any rich import work must go through the existing Codex rich enrichment
decision process.

Do not mechanically adopt every exported field just because it exists. Final
snapshot work should prioritize player planning value over exporter coverage.

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
| FS-CODEX-002 | Victory Conditions Compact Reference Rows | Victory Conditions | P1 | Frontend | Add compact rows using exported objective, current value, hold duration, caveat/threshold note, and source refs where exact. | Rows communicate victory objective and exported current values without derived map-size examples; detail still shows full facts/sections; no frontend threshold derivation. | Codex page tests; presentation tests if helper added; typecheck; build; browser smoke. | Public `victoryconditions-codex` imported. | Implemented; local-only pending `FS-CODEX-014` follow-up |
| FS-CODEX-014 | Victory Data Quality Investigation | Victory Paths / Victory Conditions | P1 | Product/Frontend | Compared `victorypaths-codex` and `victoryconditions-codex` JSON against EWShop import/rendering before creating exporter follow-up. | Investigation found `Master` appears as a Victory path value for Supremacy and Insights, but no matching `VictoryPath_*` public entry/reference exists in `victorypaths-codex`; this is not an EWShop import/config issue. Victory categories remain local-only. | Investigation complete; docs-only `git diff --check`. | Final snapshot Victory exports; local-only category visibility. | Done |
| FS-CODEX-009 | Rich Factions Import Investigation | Factions / Rich Imports | P1 | Fullstack | Investigate importer/API/store needs for rich `factions` export as a future join point for faction pages and resolvers. | Report classifies backend/API/store/frontend changes; no UI implementation; no SVG/art inference; exact refs only. | Investigation only; if code later, backend and frontend contract tests. | Rich enrichment decision template. | Done; followed by Factions foundation and detail enrichment |
| FS-CODEX-010 | Heroes And Skills Import Investigation | Heroes / Skills / Rich Imports | P1 | Fullstack | Investigate rich `heroes` and `skills` exports for hero detail/profile enrichment and skill relationship use. | Report identifies supported fields, dropped fields, DTO gaps, and player-value slices; public Skills Codex category remains product-decision gated. | Investigation only; if code later, backend/API/frontend tests. | Rich enrichment decision template; Heroes Archive current state. | Done; followed by Heroes + Skills foundation, Hero detail enrichment, and bounded Hero Skill Options |
| FS-CODEX-003 | Population Archive Foundation | Populations | P1 | Frontend/Product | Establish first Population archive row model from exported `Type`, `Worker effects`, `Threshold rewards`, base food cost, and exact refs. | Rows answer what the population does; threshold rewards remain exact; no inference from population keys/names; no faction icon/art assumptions. | Codex page tests; typecheck; build; browser smoke for major/minor/action-created populations. | Product agreement on whether a Type rail is included in this slice or deferred. | Done |
| FS-CODEX-001 | Natural Wonders Row Compatibility | Natural Wonders | P1 | Frontend | Add category-specific archive row preview from exported `Effects`; show quiet `Footprint` metadata; keep generic detail behavior. | `/codex?category=naturalwonders` rows show useful effect lines; footprint displays when exported; no live placement/owner/discovery data is shown; no new filters. | Codex page tests; category config tests; typecheck; build; `git diff --check`; browser smoke for Natural Wonders. | Public `naturalwonders-codex` imported. | Done as `Wonders` shallow reference overview |
| FS-CODEX-011 | Constructible Detail Planning Enrichment | Districts / Improvements / Rich Imports | P1 | Fullstack | Preserve selected rich district/improvement planning fields and enrich Codex detail pages only. | Detail pages show exact Tech unlock links, District upgrade links with adjacency count, and limited safe placement text; archive rows remain unchanged; no cost/resource/formula display. | Backend/API tests; frontend Codex tests; typecheck; build; `git diff --check`. | Rich exports for districts/improvements. | Implemented in working tree; uncommitted/review pending |
| FS-CODEX-004 | Status Polarity And Interaction Polish | Statuses | P2 | Frontend/Product | Decide and implement minimal surfacing for exported `Polarity` and `Status interactions`. Prefer row/detail polish over new heavy navigation. | Bonus/Malus is visible only if useful; interactions use exact exported refs; thin statuses remain honest; no Status type rail unless separately approved. | Codex page tests; status helper tests; typecheck; build; browser smoke for Bonus, Malus, and interaction examples. | Existing Status Archive implementation. | Done |
| FS-CODEX-005 | Actions Mechanics Preview | Actions | P2 | Frontend/Product | Rejected direction. Investigation showed current `Action mechanics` are too modifier-heavy and implementation-oriented for archive rows. | Do not implement mechanic-first Action archive rows from current public data. Actions remain shallow/reference-style until exporter data becomes more player-facing. | N/A | Public `actions-codex` mechanics sections are available but not row-safe. | Rejected / replaced by `ACTIONS-UI-002` |
| ACTIONS-UI-002 | Shallow Action Archive Cleanup | Actions | P1 | Frontend | Keep Action archive rows shallow: show Action name plus exported description or `Effects` text only; do not render `Action mechanics` or modifier links/previews in archive rows. Preserve detail mechanics and related links. | Action archive rows do not expose modifier-heavy mechanics; current broad Category rail remains; detail pages still show full sections and exact related entries; Modifiers stay hidden from top-level navigation. | Codex page tests; typecheck; build; `git diff --check`. | Existing Action Archive mode and hidden Modifier behavior. | Implemented |
| FS-CODEX-006 | Victory Paths Presentation Decision | Victory Paths | P2 | Product/Frontend | Decide whether Victory Paths stay generic, become shallow reference rows, or get a tiny row model for `World effects` and linked faction traits. | Decision recorded; if implemented, rows show exported world effects and exact trait links only; no victory progression/threshold derivation. | If implementation: Codex tests, typecheck, build, browser smoke. | Victory Conditions row decision may influence presentation. | Proposed |
| FS-CODEX-007 | Ability Role Cleanup Follow-Up | Abilities | P2 | Frontend/Product | Review Ability Role allow-list after canonical `Apply Status` / `Remove Status`; remove or defer zero-use/debatable role shelves. | Canonical labels remain; no old `Status apply` / `Status remove` dependency; any removed shelf is absent only because exporter no longer emits it or product explicitly defers it. | Ability filter helper tests; Codex page tests; typecheck. | Current Ability Archive. | Proposed |
| FS-CODEX-008 | Trait Origin Faction Row Metadata Review | Traits | P2 | Frontend/Product | Decide whether exported `Origin faction` should appear as quiet row metadata for Protectorate/minor faction traits. | If implemented, only exact exported `Origin faction` facts are shown; no ownership inference; Trait Type rail remains unchanged. | Codex page tests; trait helper tests if added; typecheck; build. | Current Trait Archive using `Trait type`. | Proposed |
| FS-CODEX-012 | Quest Explorer Chapter Root Evidence Investigation | Quest Explorer / Rich Imports | P2 | Fullstack | Investigate `quest_explorer.chapterRootEvidence` for Quest Explorer diagnostics/context only. | Report confirms whether evidence improves `/quests`; Codex quest archive remains hidden; no Codex quest grouping or branch reconstruction. | Quest Explorer tests only if code follows. | Quest Explorer ownership docs. | Proposed |
| FS-CODEX-013 | Diagnostics Deny-List Hardening | Importer | P1 | Backend | Ensure diagnostics-only Codex-adjacent files are skipped, logged, and tested rather than public-imported. | `quest_explorer_branch_diagnostics`, `actions-codex-inventory`, `bonuses-codex-mechanics`, `victorycondition-threshold-diagnostics`, and status files are ignored by startup import; public Codex files still import. | `LocalStartupImportRunnerTest`; backend build if touched. | Final snapshot diagnostics list. | Done in current codebase |
| FS-CODEX-015 | Release Readiness Review | Final snapshot adoption | P1 | Product/Fullstack/Frontend | Assess whether the post-handoff workstream is production-ready and document release risks, QA checklist, release notes, and next direction. | Release recommendation is documented; local-only categories and exporter backlog are explicit; no speculative exporter requests are added. | Docs-only `git diff --check`. | Completed final snapshot adoption tickets and current working tree status. | Done |

## Recommended Next Ticket

`FS-CODEX-014 - Victory Data Quality Investigation` is complete. Victory Paths
and Victory Conditions remain local/dev-visible because `Master` appears as a
Victory path value for Supremacy and Insights, but no matching `VictoryPath_*`
public entry/reference exists in `victorypaths-codex`. This is not an EWShop
import/config issue.

DB Exporter follow-up: clarify whether `Master` is public. If public, emit a
Victory Path row and exact refs from the affected Victory Conditions; if
non-public, mark/document it as such.

`FS-CODEX-015 - Release Readiness Review` is now the active release assessment
for this adoption cycle. It recommends release with caveats after the current
constructible planning slice is either committed or intentionally excluded and
after focused browser QA.

After release, the recommended next major direction is a Faction
strategy/profile product-shape decision, building on the rich Factions
foundation and detail enrichment without automatically creating a large new
route.
