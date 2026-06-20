# Codex Traits Evolution

Status: follow-up in progress  
Category: Traits  
Started: 2026-06-20  
Process: `docs/active/codex-category-evolution-playbook.md`

## Purpose

Traits are currently a top-level Codex category with shallow reference-row
support but generic split-layout navigation. This document is the durable
working memory for evolving Traits into the best player-facing Codex experience
without relying on chat history.

Traits should be judged on their own data and player browsing value. Do not copy
Abilities, Statuses, Equipment, or Resources blindly.

## Current State

- `/codex?category=traits` uses compact Trait Archive mode after
  TRAITS-UI-003.
- The left rail shows Type orientation:
  - `All`
  - `Faction`
  - `Protectorate`
- The main panel keeps reference-style rows.
- The main overview already uses shallow reference rows for Traits:
  - category/context
  - exported effect lines
  - exact Minor Faction links where available
- The left panel remains available on selected Trait entry routes and
  search-active Traits routes.
- Selected Trait detail pages use the generic Codex detail presentation.
- Traits remain visible as a top-level category.

## Data Audit

Source: local Codex export `local-imports/codex/ewshop_traits_codex_export_0.82.json`.

- Entry count: 178.
- Exported `kind`: all entries are `Trait`.
- Exported top-level categories:
  - `Faction`: 148.
  - `Protectorate`: 30.
- Thin entries: 0.
- Facts:
  - `Kind`: 178.
  - `Category`: 252. Many Faction traits have both broad `Faction` category
    and a secondary category such as `Defense`, `Discovery`, or
    `Affinity - Tahuks`.
  - `Cost`: 125.
  - `Required affinity`: 5.
- Sections:
  - `Effects`: 104 entries.
  - `Unlocks`: 41 entries.
  - `Exclusions`: 3 entries.
  - `Granted abilities`: 1 entry.
- Common section shapes:
  - `Effects`: 88.
  - no sections: 48.
  - `Unlocks`: 23.
  - `Effects + Unlocks`: 15.
  - `Exclusions + Unlocks`: 2.
  - `Effects + Exclusions`: 1.
  - `Granted abilities + Unlocks`: 1.

Representative entries:

- `Harmonious Tactics`: Faction trait with an effect and an unlocked ability.
- `Barter System`: Faction trait with secondary category, effect lines, and
  an exact Technology unlock.
- `Relic Seekers`: Faction trait with effects and many excluded buildings.
- `Heightened Senses`: Faction trait with a granted/unlocked ability.
- `Chant of the Rocks`: Protectorate trait with clean effect lines and exact
  Minor Faction relationship.
- `Fierce Independence`: Protectorate trait with clean effect lines and exact
  Minor Faction relationship.
- `Tahuk Political Stance - Open`: Faction trait with required affinity and
  trait exclusions.

## Browse Audit

Traits are player-facing build/planning modifiers, but the current data does
not provide explicit ownership facts for major-faction traits. Player browsing
questions supported by current exported data:

- Which traits are Faction traits vs Protectorate traits?
- What does this trait change?
- What does this trait unlock or exclude?
- Which Minor Faction does this Protectorate trait belong to?
- What is the trait cost when exported?
- Which exact linked entries are affected by this trait?

Unsupported or unsafe browsing questions:

- Which major faction owns this trait? Current data does not expose a reliable
  owner fact.
- Which gameplay theme does this trait belong to beyond exported secondary
  `Category` facts. Secondary `Category` is useful but overloaded.
- Which icon should represent this trait. No explicit Trait icon metadata was
  found.

## Category Classification

Decision: Traits are currently best treated as a compact Archive/Reference
hybrid.

Rationale:

- Like Reference Sheets, the overview rows already carry most useful content:
  effects, unlocks/exclusions, and exact links.
- Like Archives, the category has 178 entries and benefits from lightweight
  browse controls rather than a completely unfiltered sheet.
- A full Ability-style archive would be too much for this slice; a generic
  result list is too weak and duplicates the reference overview.

## Navigation Proposal

Initial navigation should be Trait-specific and small:

- Primary group: `Trait Type`
  - `Faction`
  - `Protectorate`

Potential later group:

- `Trait Category`, using secondary exported `Category` facts only after review.
  This is useful but potentially noisy because `Category` is overloaded with
  both broad and secondary values.

Things that should not be navigation yet:

- Cost: useful metadata, but not a strong first browse model.
- Required affinity: too sparse for a primary rail.
- Unlock/exclusion section presence: content, not navigation.
- Major faction ownership: exporter metadata is missing; do not infer from keys.

## Main Panel Proposal

Trait archive/reference rows should keep content-first shallow rows:

- Trait name.
- Effect lines when present.
- Unlocks/exclusions/granted ability references when available.
- Compact linked entity affordances for exact relationships.
- Quiet metadata: Trait type, cost when present, required affinity when present.

The current shallow rows already cover part of this:

- context label from exported `Category`.
- effect lines.
- exact Minor Faction links for Protectorate traits.

Implemented improvements:

- TRAITS-UI-002 briefly promoted Traits to a full-width reference overview,
  removing the generic result list.
- Follow-up review found that 122-178 rows were too many without orientation.
- TRAITS-UI-003 replaced the generic result list with a compact Type rail while
  preserving the reference-style main rows.

## Detail Proposal

Trait detail pages should provide inspection/permalink value:

- complete effect lines;
- unlocks/exclusions/granted abilities with exact links;
- compact profile facts: Trait Type, Cost, Required affinity;
- exact related entries;
- no inferred faction ownership.

Generic facts such as `Kind: Trait` should remain secondary or disappear from
primary profile treatment if a future detail-specific slice is implemented.

## Relationship Audit

Exact outbound relationships from Traits, deduplicated by source-target pair:

- Minor Factions: 30.
- Traits: 28.
- Units: 20.
- Tech: 19.
- Districts: 12.
- Improvements: 9.
- Heroes: 5.
- Equipment: 1.
- Abilities: 1.

Exact inbound relationships to Traits:

- Minor Factions: 30.
- Traits: 28.

Current important limitation:

- Some exact references are unresolved in current frontend data, especially
  custom district/improvement/technology keys. These should not be inferred.

## Exporter Findings Recorded

Appended to active exporter backlog:

- Non-blocking: Faction trait ownership is not emitted as explicit metadata.
  Frontend cannot safely show major faction ownership or faction icons without
  exporter-owned facts/reference keys.
- Non-blocking: `Category` is overloaded for Traits. It carries both broad
  `Faction`/`Protectorate` values and secondary trait-category values.
- Non-blocking: Some Trait references are unresolved in current Codex data,
  especially custom district/improvement/technology refs.
- Non-blocking: Trait icon strategy lacks explicit icon metadata.

Backlog reference: `docs/active/db-exporter-ability-metadata-handoff.md`.

None blocked Traits UI work.

## Accepted Decisions

- Traits must use exact exported facts/references only.
- Do not infer major faction ownership from entry keys, names, prose, or SVG
  filenames.
- Traits are not ready for faction icon markers.
- Trait row content should be effects/unlocks/exclusions first; metadata should
  support scanning.
- The generic left result list is a likely weak point for Traits.
- A Trait Type rail is safe and useful when it uses only exported category/type
  facts: `Faction` and `Protectorate`.
- Trait Archive mode should preserve reference-style rows, selected detail
  behavior, and search-active behavior.

## Open Questions

- Whether the Trait Type rail should eventually use a player-facing label such
  as `Minor Faction` for Protectorate traits. Current slice keeps
  `Protectorate` because that is the exported value.
- Should secondary `Category` facts become navigation after a small Type-first
  prototype?
- Should Trait detail pages get a compact profile/effect-first layout?
- Should exact unlock/exclusion links be surfaced inline in archive rows beyond
  the current Minor Faction link behavior?

## Ticket Roadmap

### TRAITS-UI-001 - Audit And Classification

Status: complete in this document.

Goal: classify Traits, audit data, and identify supported browse questions.

### TRAITS-UI-002 - Trait Type Rail Or Full-Width Reference Decision

Status: superseded by TRAITS-UI-003.

Goal: remove duplicate generic result-list feeling by either adding a small
Trait-specific rail or promoting Traits to a full-width reference overview.

Result:

- Initially chose full-width reference overview for the category overview route.
- Follow-up review found this was incomplete: 122-178 Trait rows is too many
  for a single unfiltered sheet, and no pixel-level visual review had completed.
- TRAITS-UI-003 replaced that direction with compact Trait Archive mode:
  Type rail plus reference-style rows.

Why this was the smallest safe slice:

- The existing shallow Trait row renderer already exposed effects and exact
  Minor Faction links.
- The generic left results list duplicated names without adding meaningful
  planning context.
- No new data model or generic framework was needed.

### TRAITS-UI-003 - Trait Type Rail

Status: implemented.

Goal: add a compact orientation rail for the exported broad Trait types.

Scope:

- `All`
- `Faction`
- `Protectorate`

Rules:

- use exported category/type facts only;
- do not infer major faction ownership;
- do not rename Protectorate to Minor Faction yet;
- do not add secondary category filters yet;
- preserve existing shallow reference rows;
- preserve selected Trait detail and search-active split behavior.

Result:

- Added a Trait-specific helper and rail.
- Rail options are `All`, `Faction`, and `Protectorate`.
- Counts are derived from the current search-filtered Trait dataset.
- Selecting a Type filters the overview.
- Selecting the same Type again clears it.
- Selecting/clearing a Type from a selected Trait detail route returns to the
  Trait overview list.
- Search-active Traits retain the rail and update counts from search results.
- No secondary category filters were added.
- `Protectorate` was not renamed to `Minor Faction` because the exported value
  is `Protectorate`.

### TRAITS-UI-004 - Trait Row Relationship Polish

Status: planned if needed.

Goal: improve exact unlock/exclusion/granted ability presentation without
turning linked entities into full row cards.

### TRAITS-UI-005 - Trait Detail Inspection Layout

Status: optional.

Goal: make Trait detail pages useful trust/permalink pages if browser review
shows generic detail is too database-like.

### TRAITS-UI-006 - Final Category Closeout

Status: required before completion.

Goal: browser review, architecture review, exporter backlog verification,
documentation closeout, and commit strategy.

## Lessons Learned

- Trait data exposes useful content, but the ownership model is weaker than a
  player expects. The UI must resist pretending it knows faction ownership.
- A category can be both shallow-row-friendly and still large enough to need
  browse support.
- Shallow-row-friendly does not automatically mean full-width-only. Large
  reference-like categories still need an orientation layer.
- A compact rail can provide orientation without turning the category into a
  heavy filter panel.

## Final Category Closeout

Date: 2026-06-20

### Final State

- Traits are a top-level Codex Archive/Reference hybrid.
- `/codex?category=traits` uses compact Trait Archive mode.
- Trait Archive mode has a Type rail: `All`, `Faction`, `Protectorate`.
- Main Trait rows remain reference-style rows with exported effect lines and
  exact links where available.
- Selected Trait detail routes keep split results/detail behavior.
- Search-active Traits keep split behavior so search results remain visible.
- No route params, secondary filters, icon inference, or backend contract
  changes were introduced.

### Browser/Product Review

Validation:

- Vite route smoke returned `200` for:
  - `/codex?category=traits`
  - `/codex?category=traits&entry=Trait_DaughterOfBor`
  - `/codex?category=abilities`
  - `/codex?category=resources`
- Existing local backend `/api/codex` returned `200`.
- Live backend data had 2,490 Codex entries and 122 Trait entries:
  - `Faction`: 92
  - `Protectorate`: 30

Limitations:

- In-app browser control failed with a sandbox metadata error.
- Headless Chrome exited immediately with code 134 in this environment.
- No pixel/screenshot review was completed by Codex in this pass.

Product assessment:

- Visual designer: the Type rail should make the category less like an
  undifferentiated sheet while preserving the good reference rows. Manual pixel
  review is still recommended because automated browser review was unavailable.
- Frontend tech lead: the implementation is scoped and product-specific, with
  mode selection in `codexCategoryConfig`, Type derivation in a helper, and
  presentation in `TraitArchiveRail`.
- 4X gamer: `Faction` vs `Protectorate` is the only currently safe broad browse
  split. Secondary categories may help later, but need a separate product pass.

### Architecture Review

- `CodexPage.tsx` keeps route orchestration.
- `codexCategoryConfig.ts` owns category mode behavior.
- `codexTraitArchiveFilters.ts` owns Trait Type derivation.
- `TraitArchiveRail.tsx` owns the Trait-specific rail presentation.
- `CodexSummaryDetail` already owned shallow Trait row rendering.
- No generic framework was introduced.
- No key/name/prose/SVG inference was added.
- Modifiers and Extractors visibility rules were unchanged.
- Ability, Status, Equipment, Resources, Partner Effects, and Councilor Effects
  behavior remains protected by existing tests.

### Test And Validation Review

Passed:

- `npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts`
- `npx tsc --noEmit --project tsconfig.json`
- `npm run build`
- `git diff --check`

Tests updated:

- `codexCategoryConfig` now classifies Traits as `traitArchive`.
- Codex page coverage verifies the Trait rail, counts, Faction filtering,
  clear/toggle behavior, search-adjusted counts, selected-detail return to the
  overview, and unaffected Tech/Partner Effect behavior.

### Exporter Backlog Verification

Non-blocking Trait exporter findings were appended to:

`docs/active/db-exporter-ability-metadata-handoff.md`

Recorded areas:

- explicit Trait ownership metadata;
- overloaded Trait `Category` semantics;
- unresolved Trait references;
- explicit Trait icon metadata.

No DB Exporter implementation was started.

### Remaining Known Issues

- Live backend data during smoke had 122 Traits while local 0.82 audit data had
  178 Traits. This appears to be environment/import state rather than a frontend
  change.
- Full visual browser review still belongs to manual/user review because the
  automated browser surfaces were unavailable in this session.
- Trait detail pages remain generic; improve only if manual review finds them
  too database-like.
- Secondary Trait Category navigation remains deferred.

### Completion Decision

Traits are complete for the current frontend pass after TRAITS-UI-003.

Completion caveat: automated pixel-level browser review was unavailable in this
environment. Manual visual review should confirm the rail feels balanced, but no
known code, validation, or architecture blocker remains.

Recommended commit split:

1. `feat(codex): add traits type rail`
   - frontend Trait Archive mode, rail helper/component, tests
2. `docs(codex): record traits category evolution`
   - durable Traits docs, exporter backlog, active Codex docs, playbook history
