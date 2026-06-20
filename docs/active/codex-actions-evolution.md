# Codex Actions Evolution

Status: planning and audit in progress  
Category: Actions  
Started: 2026-06-20  
Process: `docs/active/codex-category-evolution-playbook.md`

## Purpose

Actions are a top-level Codex category. This document is the durable working
memory for evolving Actions into a player-facing Codex experience without
relying on chat history.

Actions should be evaluated through actual exported data and 4X player browsing
needs. Do not copy Ability, Status, Equipment, or Traits UI blindly.

## Phase 0 - Plan

### Category Classification Hypothesis

Initial hypothesis: Actions are likely an Archive.

Reasoning to verify:

- The category has enough entries that a generic list may become hard to scan.
- Actions are player-facing commands or systems rather than pure reference
  values.
- The strongest UI may be a compact browse rail plus enriched archive rows, but
  this must be earned by the data audit.

Alternative outcomes:

- Reference Sheet, if rows are shallow and self-contained.
- Generic split layout, if exported data is too sparse or noisy for a safe
  player-facing model.

### Audit Plan

Audit Actions for:

- entry count;
- facts and section titles;
- reference kinds and exact relationships;
- icon availability;
- sparse entries and outliers;
- noisy exporter taxonomy;
- player browse questions supported by exported facts;
- whether detail pages add inspection/permalink value.

Classify every finding as:

- frontend action;
- exporter backlog;
- intentionally deferred.

### Implementation Plan

Do not implement until the audit and proposal review are documented.

If implementation is justified, choose the smallest meaningful slice that:

- uses exported facts and exact references only;
- preserves route/query behavior;
- avoids backend/import/exporter contract changes;
- keeps category-specific code product-named;
- avoids generic frameworks.

## Phase 1 - Audit

Source: local Codex export `local-imports/codex/ewshop_actions_codex_export_0.82.json`.

### Data Audit

- Entry count: 139.
- Descriptions: 0 entries have `descriptionLines`.
- Sections:
  - `Action mechanics`: 55 entries.
  - no sections: 84 entries.
- Facts:
  - `Kind`: 139.
  - `Category`: 139.
  - `Action type`: 12.
  - `UI category`: 5.
- Broad exported `Category`/`Kind` values:
  - `Action`: 73.
  - `Faction Action`: 39.
  - `Empire Action`: 14.
  - `Constructible Action`: 7.
  - `Terraforming Action`: 5.
  - `Army Action`: 1.
- `Action type` values are sparse and mostly duplicate names:
  - `Rebuild Village`: 3.
  - `Raze District`: 2.
  - one-off values for constructible/terraforming actions.
- `UI category` only appears on 5 Mukag Empire actions:
  - `Light`: 3.
  - `Knowledge`: 1.
  - `Land`: 1.

Representative entries:

- `Absorb City`: normal Action with influence cost mechanic.
- `Attach Camp`: normal Action with many cost modifiers.
- `Build Bridge`: normal Action with money/turn cost modifiers and useful
  mechanic lines.
- `Move`: one Army Action with no public mechanics.
- `Kin Of Sheredyn Economy01`: duplicated as Faction Action and Empire Action.
- `Mukag Light01`: Empire Action with `UI category: Light`.
- `Camp Relocation`: Constructible Action with `Action type`.
- `Terraformation Enrich`: Terraforming Action with `Action type`.

Finding classification:

- Frontend action: broad `Category`/`Kind` values are reliable enough for a
  small Action Type rail.
- Frontend action: rows should not become rich cards yet because 84 entries have
  no sections.
- Exporter backlog: many unresolved references exist, especially action visual
  affinity and empire faction state keys.
- Intentionally deferred: deeper Action type/UI category navigation because data
  is too sparse.

### Browse Audit

Supported 4X browse questions:

- Is this a common action, faction-specific action, empire action,
  constructible action, terraforming action, or army action?
- Which actions have public mechanics/cost adjustments?
- Which actions are linked to exact cost modifiers or population types?

Unsupported/unsafe browse questions:

- Which exact faction owns a Faction Action. Current public facts do not expose
  a reliable faction owner for all such rows.
- Which player UI bucket a general Action belongs to. `UI category` only appears
  on 5 entries.
- Which action gameplay theme applies beyond broad exported category.

### Navigation Audit

Recommended first navigation:

- `Action Type`
  - `All`
  - `Action`
  - `Faction`
  - `Empire`
  - `Constructible`
  - `Terraforming`
  - `Army`

Rationale:

- It uses exact exported `Category` facts only.
- It gives orientation for 139 rows.
- It avoids pretending that sparse `Action type` or `UI category` facts are a
  complete browse taxonomy.

Do not use yet:

- `Action type`: too sparse and duplicates entry names.
- `UI category`: too sparse.
- Cost type: mechanics content, not first-pass navigation.
- Exact faction ownership: missing exporter-owned fact.

### Main Panel Audit

Current main panel behavior:

- Actions use the generic Codex summary/detail path.
- Rows show names, generic secondary context, and any readable preview that the
  shared renderer can derive.
- Many rows are sparse; a rich effect-first row model would leave too many empty
  or fallback-heavy rows.

Recommendation:

- Keep current rows in the first implementation slice.
- Add orientation through the left rail first.
- Consider row enrichment later only after product review of the filtered
  category.

### Detail Audit

Action detail pages currently provide:

- title/permalink;
- facts;
- `Action mechanics` sections where exported;
- exact related entries where references resolve.

Detail value:

- useful as inspection/permalink for cost modifiers and mechanics;
- still generic and sometimes sparse;
- not worth redesigning before overview navigation is improved.

### Relationship Audit

Outbound exact references from Actions:

- resolved `bonuses`: 60.
- resolved `populations`: 5.
- unresolved references: 72.

Inbound exact references to Actions:

- from `bonuses`: 57.

Relationship recommendation:

- Do not surface relationship cards in rows yet.
- Detail pages can continue to carry exact related entries.
- Exporter backlog should record unresolved Action reference families.

### Exporter Audit

Non-blocking exporter findings:

- Action ownership/faction metadata is not explicit enough for faction markers.
- Action references include many unresolved public keys.
- `UI category` and `Action type` coverage is sparse and should not drive
  frontend navigation yet.

None block the first frontend slice.

## Phase 2 - Proposal Review

### Proposal Answers

1. What is this category?
   - Actions are an Archive with sparse rows and a reliable broad type taxonomy.
2. How does a 4X player browse it?
   - First by broad type: common, faction, empire, constructible,
     terraforming, army.
3. What is the strongest navigation model?
   - A compact Action Type rail using exported `Category` facts.
4. What should remain visible?
   - Action names, existing main-panel rows, exact detail relationships, and
     mechanics where already rendered.
5. What should move to detail?
   - Cost modifier lists, resolved bonus relationships, and sparse mechanics
     inspection.
6. What is the smallest meaningful improvement?
   - Replace the generic left results list with an Action Type rail while
     preserving current row/detail behavior.

### Proposal Challenge

UX designer:

- Concern: `Action` as a label is generic, but it is exported and safer than
  inventing a player-facing label.
- Benefit: a small rail reduces the feeling of a 139-row name dump without
  adding noisy controls.

Frontend tech lead:

- Concern: another category-specific rail adds props to `CodexLeftPane`.
- Mitigation: follow the existing Status/Trait pattern with product-specific
  helper/component names and no generic faceted framework.

4X player:

- Concern: Faction Action does not tell me which faction.
- Mitigation: do not infer ownership; record exporter follow-up. The broad split
  is still more useful than a flat list.

Alternatives rejected:

- Full-width reference overview: too many sparse rows and too little row content.
- Rich Action rows: too many entries lack mechanics.
- Secondary filters from `Action type`/`UI category`: incomplete data.

Recommended implementation: `ACTIONS-UI-001 - Action Type Rail`.

## Accepted Decisions

- Actions are an Archive for the current pass.
- Use exported `Category` facts only for the first navigation slice.
- Do not infer faction ownership or action theme from keys, names, prose, or SVG
  filenames.
- Keep current main rows and detail pages in the first slice.
- Defer row enrichment and detail redesign.

## Rejected Directions

- Full-width reference sheet for Actions.
- Rich mechanics/effect row redesign in the first slice.
- Faction ownership markers without exporter-provided ownership metadata.
- Navigation from sparse `Action type` or `UI category` facts.

## Exporter Findings Recorded

- Action ownership/faction metadata missing for safe Faction Action grouping.
- Unresolved Action references, especially action visual affinity and empire
  faction state keys.
- Sparse `Action type` and `UI category` coverage.

Backlog reference: `docs/active/db-exporter-ability-metadata-handoff.md`.

These were appended to the active exporter backlog. None blocked
`ACTIONS-UI-001`.

## Open Questions

- What is the strongest player browse model for Actions?
- Are exported facts reliable enough for navigation?
- Are Action rows content-rich enough for Archive treatment?
- What should Action detail pages add beyond archive rows?

## Ticket Roadmap

### ACTIONS-UI-001 - Action Type Rail

Status: implemented.

Goal: add compact Actions-only Type navigation using exported `Category` facts.

Scope:

- `All`
- `Action`
- `Faction`
- `Empire`
- `Constructible`
- `Terraforming`
- `Army`

### ACTIONS-UI-002 - Action Row Mechanics Review

Status: deferred.

Goal: decide whether mechanics previews can improve archive rows without
creating fallback-heavy rows.

### ACTIONS-UI-003 - Action Detail Inspection Layout

Status: deferred.

Goal: improve detail pages if manual review finds generic detail too raw.

## ACTIONS-UI-001 Result

Implemented a compact Actions-only Type rail.

Behavior:

- `/codex?category=actions` uses Action Archive mode.
- The left rail shows:
  - `All`
  - `Action`
  - `Faction`
  - `Empire`
  - `Constructible`
  - `Terraforming`
  - `Army`
- Counts are derived from the current search-filtered Action dataset.
- Selecting a Type filters the main Action overview.
- Selecting the same Type again clears it.
- Selecting/clearing a Type from an Action detail route removes `entry` and
  returns to the Action overview.
- Search-active Actions keep the rail and update counts from search results.
- Main rows and detail pages remain the existing generic Action presentation.

Why this slice was enough:

- It fixes the weakest surface, orientation for a 128-139-row category.
- It avoids building rich rows on top of sparse data.
- It preserves exact exported data and does not infer ownership/theme.

## Validation

Passed:

- `npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts`
- `npx tsc --noEmit --project tsconfig.json`
- `npm run build`
- `git diff --check`

Tests updated:

- `codexCategoryConfig` now classifies Actions as `actionArchive`.
- Codex page coverage verifies Action rail display, counts, filtering,
  same-option clear, search-adjusted counts, selected-detail return to the
  overview, and unaffected generic Tech behavior.
- Existing Action detail tests were updated to assert direct detail routes
  rather than the removed generic left result list.

## Product Review

Route/API smoke:

- Vite route smoke returned `200` for:
  - `/codex?category=actions`
  - `/codex?category=actions&entry=ActionTypeBuildBridge`
  - `/codex?category=abilities`
  - `/codex?category=resources`
- Live backend `/api/codex` returned 2,490 Codex entries and 128 Action
  entries:
  - `Action`: 72
  - `Faction Action`: 34
  - `Empire Action`: 10
  - `Constructible Action`: 7
  - `Terraforming Action`: 4
  - `Army Action`: 1

Limitations:

- Chrome headless exited with code 134 in this environment.
- No pixel/screenshot review was completed by Codex in this pass.

Persona review:

- UX designer: the Type rail adds needed orientation without making sparse
  rows heavier. Manual visual review should confirm the rail does not feel too
  technical.
- Frontend tech lead: implementation follows the Status/Trait pattern with a
  product-specific helper and rail, no generic framework, and route behavior
  preserved.
- 4X player: broad Type browsing is useful, but the category still lacks
  faction ownership and richer row explanations. Those need exporter/product
  follow-up before frontend should invent more.

## Refactor Review

- `CodexPage.tsx` still owns route/query orchestration and local filter state,
  matching current Codex mode patterns.
- `codexActionArchiveFilters.ts` owns pure exact-fact derivation.
- `ActionArchiveRail.tsx` owns the presentation.
- `CodexLeftPane` now has another product-specific mode branch; this is
  acceptable but reinforces that a future cleanup may extract archive-mode prop
  composition if the file becomes harder to review.
- No stale Action-specific code paths were found after the test updates.

## Final Closeout

Date: 2026-06-20

Completion decision: Complete with follow-up recommended.

Justification:

- The first meaningful Actions evolution slice is complete and validated.
- The category now has orientation appropriate to its size.
- Rich row/detail redesign is intentionally deferred because current data is
  sparse and exporter metadata is incomplete.

Remaining issues:

- No pixel-level visual review completed in this environment.
- Faction ownership is missing for safe richer labels/icons.
- Many Action references remain unresolved or internal-looking.
- Action detail pages remain generic but serviceable as inspection/permalink
  pages.

Recommended commit split:

1. `feat(codex): add actions type rail`
   - frontend Action Archive mode, helper/component, tests
2. `docs(codex): record actions category evolution`
   - durable Actions docs, exporter backlog, playbook history, active status

## Final Closeout

Pending.
