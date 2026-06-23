# DB Exporter EWShop Handoff Ledger

Status: active cross-project handoff ledger  
Created: 2026-06-23

## Purpose

This ledger is the durable memory for EWShop and DB Exporter collaboration. It
tracks why requests were made, what DB Exporter returned, what EWShop
implemented, what EWShop found afterward, and what remains open.

This is not a replacement for detailed handoff docs, implementation packets, QA
results, or ticket plans. It is the index/history across those handoffs so that
new DB Exporter work starts from the current state rather than chat memory.

For reusable request/response checklists and prompt templates, use
`docs/active/db-exporter-request-workflow.md`.

## Usage Rules

- Read this ledger first for DB Exporter handoff, exporter-response,
  exporter-follow-up, final snapshot, or import/adoption work.
- Use `docs/active/db-exporter-request-workflow.md` before drafting a new
  exporter request or response.
- Before creating a new DB Exporter request, check whether the issue was
  previously requested, answered, rejected, superseded, implemented, or
  converted into an EWShop-owned product/frontend decision.
- Update this ledger when a new request, response, implementation finding, or
  exporter follow-up is created.
- Keep entries concise and link to detailed docs instead of duplicating them.
- Archive old detailed handoff docs when clearly superseded, but keep their
  paths listed here.
- If unsure whether a doc should be archived, list it as an archive candidate
  instead of moving it.
- Do not use this ledger to create new exporter requests without validated
  source/export evidence.

## Historical Pattern Analysis

This ledger is experimental project memory. The goal is not only to remember old
handoffs, but to detect repeated collaboration loops before EWShop and DB
Exporter repeat them.

Recurring patterns found in archived handoffs:

1. **Generic contract first, category polish second.**
   Early EWShop asks pushed for `facts`, `sections`, `referenceKeys`, and
   `publicContextKeys` as generic Codex surfaces. Once DB Exporter provided
   them broadly, the back-and-forth moved from "can EWShop import this?" to
   "which category is player-useful enough to promote?"

2. **Exact references beat display text every time.**
   Many handoffs started because EWShop could see meaningful player-facing text
   but could not safely link it. The durable resolution pattern is exporter
   emits exact public keys and EWShop fails closed when refs are absent.

3. **Thin entries are not automatically bugs.**
   Several response cycles ended with "leave this thin/searchable/linkable" when
   canonical public source data did not exist. Future requests should not reopen
   thin rows unless new source evidence exists.

4. **Diagnostics are useful evidence, not product UI.**
   Diagnostics repeatedly helped prove gaps, but handoffs also had to remind
   EWShop not to render diagnostic-only files, raw provenance, mapper names,
   debug text, Unity paths, or GUIDs as public Codex content.

5. **Route-owned experiences must stay route-owned.**
   Quest Explorer, Tech, Units, and future Faction/Hero strategy surfaces can
   use rich exports, but Codex should remain an encyclopedia/archive projection.
   Recreating route-owned progression or branching inside Codex has repeatedly
   been rejected.

6. **Exporter-safe metadata often reveals the next gap.**
   New public metadata improves EWShop quickly, then exposes the next missing
   source-truth concept: Ability ownership, Modifier provenance, Victory Path
   identity, Hero progression, or constructible public prerequisites.

7. **The best handoffs close ambiguity explicitly.**
   The most useful packets ask DB Exporter to either emit canonical public data
   or explicitly confirm that no public canonical source exists. That prevents
   EWShop from treating absence as a frontend display bug.

Practical rule: if a new request fits one of these patterns, start by linking
the prior entry and state what new evidence makes this request different.

## Current Open DB Exporter Follow-Ups

### Ability Role And Ownership Metadata

Source: `docs/active/db-exporter-ability-metadata-handoff.md`

Status: open, non-blocking.

Open asks:

- Clean `Combat role` so every role is supported by public player-facing
  ability content.
- Canonical role labels should be `Apply Status` and `Remove Status`, not
  `Status apply` and `Status remove`.
- Review noisy roles such as `Movement`, `True damage`, `Shield`,
  `Remove Status`, and `Reactivate skill`.
- Emit explicit ability ownership/origin metadata only when source data proves
  it. Absence means unknown/not explicitly owned.

### Victory Path `Master`

Sources:

- `docs/active/final-snapshot-codex-ticket-plan.md`
- `docs/active/final-snapshot-release-readiness-review.md`

Status: open, non-blocking; Victory Paths and Victory Conditions remain
local/dev-visible only.

Open ask:

- `Master` appears as a Victory path value for Supremacy and Insights, but
  no matching `VictoryPath_*` public entry/reference exists in
  `victorypaths-codex`.
- DB Exporter should clarify whether `Master` is public.
- If public, emit a public Victory Path row and exact refs.
- If non-public, mark/document it as such.

### Modifier Provenance Metadata

Sources:

- `docs/active/final-snapshot-codex-ticket-plan.md`
- `docs/active/final-snapshot-release-readiness-review.md`

Status: open, low-medium priority.

Open ask:

- EWShop can resolve exact Action -> Modifier and Modifier -> affected Action.
- EWShop cannot safely determine what grants/unlocks a Modifier.
- Exporter should emit explicit provenance when source data proves it, such as
  `sourceKind`, `sourceKey`, `sourceDisplayName`, and `sourceReferenceKey`.
- Optional target fields may be useful if source data proves them.

### Hero Full Selectable Skill Progression

Sources:

- `docs/active/final-snapshot-release-readiness-review.md`
- `docs/active/final-snapshot-codex-ticket-plan.md`

Status: open, non-blocking.

Open gap:

- EWShop currently renders Hero starting/default skills, applicable skill paths,
  and exported skill options grouped by rich skill tree/tier data.
- Exported `levelPrerequisite` is rendered only as a conservative unlock
  threshold because its exact gameplay semantics are not yet confirmed.
- Full hero progression, explicit quadrant/source slot beyond exported tree
  type, point-cost/investment rules, stat-vs-skill spending, recruitment,
  portraits/icons, or skill-tree planning require explicit source-backed
  metadata/art contracts.
- EWShop must not imply that starting/default skills or current skill options
  are a complete leveling planner.

### Constructible Resource Prerequisite Public References

Sources:

- current `FS-CODEX-011` constructible planning work in the working tree
- `docs/active/final-snapshot-release-readiness-review.md`
- `docs/active/final-snapshot-codex-ticket-plan.md`

Status: open, non-blocking; document further only after `FS-CODEX-011` is
committed or explicitly excluded.

Open gap:

- EWShop can render exact Tech unlock links, District upgrade links, and limited
  safe placement text from rich District/Improvement data.
- Raw resource prerequisite IDs such as `Resource04` are not player-facing and
  should not be rendered in Codex detail pages.
- If product wants constructible resource prerequisites, exporter/import data
  needs exact public refs or source-backed display metadata.

## Chronological Ledger

### 2026-06-09 - SVG / Icon Contract Guardrails

- Direction: DB Exporter -> EWShop
- Topic: frontend-safe SVG/icon contracts and diagnostics
- Summary: Asset/exporter work established frontend-safe icon registries,
  renderability diagnostics, and guardrails against using broad raw SVG
  manifests directly in product UI.
- Source docs/files:
  - `docs/archive/exporter-handoffs/description-token-icons-handoff-2026-06.md`
  - `docs/archive/exporter-handoffs/ewshop-handoff-2026-06.md`
  - `docs/archive/exporter-handoffs/exporter-handoff-status.md`
  - `docs/frontend/svg-icon-contracts.md`
- Snapshot/export version: June 2026 staged in-game exports.
- Decision/result: EWShop should consume narrow frontend-safe registries such as
  `description-token-icons.json` and `ability-icons.json`; diagnostics are not
  runtime product data.
- EWShop implementation result: description token icons, ability icons, and
  unit stat icons are consumed through frontend icon resolvers.
- Follow-up generated: do not infer icons from SVG filenames, raw manifests,
  Unity paths, GUIDs, or mapper names.
- Status: implemented/archived.

### 2026-06-10 - Initial Codex Metadata / Reference Kind Requests

- Direction: EWShop -> DB Exporter
- Topic: Codex metadata and reference-kind gaps
- Summary: EWShop identified missing/noisy Codex metadata and exact-reference
  issues across early Codex categories.
- Source docs/files:
  - `docs/archive/codex/db-exporter-codex-metadata-handoff-2026-06-10.md`
  - `docs/archive/codex/db-exporter-codex-reference-kinds-handoff-2026-06-10.md`
  - `docs/archive/codex/codex-metadata-adoption-audit-2026-06-11.md`
- Snapshot/export version: pre-definitive-response `0.82` work.
- Decision/result: archived as historical context after later definitive
  response work superseded the specific asks.
- EWShop implementation result: later Codex category evolution consumed cleaned
  public metadata and exact refs where available.
- Follow-up generated: subsequent `DB-CODEX-DEF-*` definitive response cycle.
- Status: archived.

### 2026-06-12 - Content Quality Diagnostic Handoff

- Direction: EWShop -> DB Exporter
- Topic: public Codex content quality after broad metadata became available
- Summary: EWShop diagnostics separated frontend presentation duplication from
  exporter/editorial issues such as placeholder names, raw internal text, raw
  mechanics labels, missing player context, formula-like text, and no-op
  effects.
- Source docs/files:
  - `docs/archive/codex/codex-content-quality-audit-2026-06-12.md`
  - `docs/archive/codex/codex-content-quality-exporter-handoff-2026-06-12.md`
  - `docs/archive/codex/superseded-2026-06-13-exporter-packet-inputs/codex-content-quality-current-diagnostic-handoff.md`
- Snapshot/export version: local `0.82` Codex diagnostics before the definitive
  response cycle.
- Decision/result: cleaner public data was exporter/editorial-owned; duplicate
  fact/description presentation was EWShop-owned.
- EWShop implementation result: EWShop improved structured detail rendering and
  avoided frontend inference for missing gameplay context.
- Follow-up generated: category packet inputs and definitive response asks.
- Status: superseded/archived.

### 2026-06-13 - Exporter Packet Inputs

- Direction: EWShop -> DB Exporter
- Topic: Codex category packets and content-quality asks
- Summary: EWShop prepared category-level packet inputs for exporter cleanup,
  including content quality, relationship value gaps, and preview surfaces.
- Source docs/files:
  - `docs/archive/codex/superseded-2026-06-13-exporter-packet-inputs/`
- Snapshot/export version: pre-definitive-response `0.82` work.
- Decision/result: superseded by the 2026-06-16 definitive response cycle.
- EWShop implementation result: diagnostic outputs were later archived after QA
  and category evolution.
- Follow-up generated: definitive response packet and reconciliation docs.
- Status: superseded/archived.

### 2026-06-13 - Current Export Batch Review

- Direction: DB Exporter -> EWShop
- Topic: validated current export batch for EWShop product/import review
- Summary: DB Exporter provided a batch where generic Codex root shape stayed
  stable and optional metadata could be ignored or consumed by EWShop. The
  practical review question shifted to import cleanliness, frontend usefulness,
  and remaining product/data-quality gaps.
- Source docs/files:
  - `docs/archive/codex/superseded-2026-06-13-exporter-packet-inputs/ewshop-current-export-handoff.md`
- Snapshot/export version:
  `export-snapshots/bonuses-descriptor-target-correction-final-20260613`.
- Decision/result: no importer migration expected; EWShop should prefer
  structured fields, preserve icon tokens, ignore diagnostics as product
  content, and classify feedback as importer/API, frontend display, exporter
  data, or product/navigation decision.
- EWShop implementation result: later QA confirmed generic Codex import/API
  preservation and product rendering.
- Follow-up generated: targeted return handoffs for Resources, Actions, Traits,
  Quest refs, ReferenceKinds, and thin entity context.
- Status: superseded/archived.

### 2026-06-14 - Targeted Exporter Return Handoffs

- Direction: DB Exporter -> EWShop
- Topic: conservative Codex exporter implementation batches
- Summary: DB Exporter returned several focused, F8-validated slices using the
  existing generic Codex contract. Each slice emphasized exact refs, public-safe
  text, and no importer migration.
- Source docs/files:
  - `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/ewshop-db-exporter-actions-return-handoff-2026-06-14.md`
  - `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/ewshop-db-exporter-councilor-effects-return-handoff-2026-06-14.md`
  - `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/ewshop-db-exporter-quest-refs-return-handoff-2026-06-14.md`
  - `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/ewshop-db-exporter-referencekinds-return-handoff-2026-06-14.md`
  - `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/ewshop-db-exporter-resources-return-handoff-2026-06-14.md`
  - `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/ewshop-db-exporter-thin-entity-context-return-handoff-2026-06-14.md`
  - `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/ewshop-db-exporter-trait-refs-return-handoff-2026-06-14.md`
- Snapshot/export version: multiple 2026-06-14 F8-validated snapshots.
- Decision/result:
  - Resources became public Codex entities with exact extractor refs.
  - Councilor/Partner Effects became shallow public reference kinds.
  - Quest requirement/reward refs used exact public targets only.
  - Status scope and Modifier public-label work improved ReferenceKinds.
  - Traits gained exact unlock/ability refs without unresolved broken links.
  - Actions gained a conservative `Action mechanics` safe subset, though later
    EWShop product review kept Action archive rows shallow.
  - Thin Ability context improved only where public-safe source text existed.
- EWShop implementation result: these returns enabled later Resources,
  Statuses, Traits, Actions, Councilor/Partner Effects, and Quest link behavior
  decisions in Codex.
- Follow-up generated: definitive response and QA cycle to close remaining
  ambiguity.
- Status: answered/superseded by definitive response.

### 2026-06-16 / 2026-06-17 - DB Exporter Definitive Response Cycle

- Direction: DB Exporter -> EWShop
- Topic: `DB-CODEX-DEF-*` definitive response and EWShop import QA
- Summary: DB Exporter returned the cleaned definitive response. EWShop
  reconciled the response and completed import/API/browser QA.
- Source docs/files:
  - `docs/archive/codex/completed-2026-06-23-db-exporter-response-records/codex-db-exporter-implementation-packets/codex-db-exporter-definitive-response.md`
  - `docs/archive/codex/completed-2026-06-23-db-exporter-response-records/codex-db-exporter-response-ewshop-reconciliation.md`
  - `docs/archive/codex/completed-2026-06-23-db-exporter-response-records/codex-db-exporter-response-import-qa-results.md`
  - `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/`
- Snapshot/export version: final accepted snapshot `20260616-210540`, game
  export version `0.82`.
- Decision/result: EWShop import/diagnostics/browser QA passed; no EWShop-owned
  response implementation issues remained open.
- EWShop implementation result: generic Codex import/API/rendering preserved
  `facts`, `sections`, exact refs, and public context keys for sampled entries.
- Follow-up generated: Ability role/ownership metadata backlog remained active.
- Status: answered/implemented.

### 2026-06-20 - Ability Metadata Cleanup Follow-Up

- Direction: EWShop -> DB Exporter
- Topic: Ability `Combat role`, canonical role labels, and explicit ownership
- Summary: Ability Archive work showed that `Combat role` was still noisy and
  that explicit ability ownership/origin metadata was missing.
- Source docs/files:
  - `docs/active/db-exporter-ability-metadata-handoff.md`
  - `docs/active/codex-export-vs-rich-export-boundary.md`
- Snapshot/export version: based on accepted `0.82` Codex data after the
  definitive response pass.
- Decision/result: exporter-owned follow-up; EWShop may map old role labels
  temporarily but should not infer role/ownership locally.
- EWShop implementation result: Ability UI hides Source/Role from detail profile
  where noisy and supports canonical `Apply Status` / `Remove Status`
  compatibility.
- Follow-up generated: role audit/cleanup and ownership metadata remain open.
- Status: open.

### 2026-06-22 - Final Snapshot Handoff

- Direction: DB Exporter -> EWShop
- Topic: final EWShop handoff for public Codex and rich/source-truth exports
- Summary: DB Exporter delivered final snapshot `20260622-055736`, validated
  with no registered errors and post-F8 status.
- Source docs/files:
  - `docs/active/db-exporter-final-ewshop-handoff.md`
  - `docs/active/db-exporter-final-ewshop-codex-context.json`
  - local snapshot files under `local-imports/codex/` and
    `local-imports/exports/`
- Snapshot/export version: `20260622-055736`, game/exporter JSON version
  `0.82`.
- Decision/result: EWShop accepted the handoff for implementation planning and
  split work into public Codex compatibility and rich import/enrichment tracks.
- EWShop implementation result: final snapshot ticket plan and execution
  playbook were created.
- Follow-up generated: `docs/active/final-snapshot-codex-ticket-plan.md` and
  `docs/active/final-snapshot-ticket-execution-playbook.md`.
- Status: answered/implemented.

### 2026-06-22 / 2026-06-23 - Public Codex Compatibility Adoption

- Direction: EWShop implementation from DB Exporter -> EWShop handoff
- Topic: public Codex final snapshot adoption
- Summary: EWShop implemented selected public Codex compatibility/polish rather
  than mechanically adopting every exported field.
- Source docs/files:
  - `docs/active/final-snapshot-codex-ticket-plan.md`
  - `docs/active/final-snapshot-release-readiness-review.md`
  - `docs/current-action-priorities.md`
- Snapshot/export version: `20260622-055736`.
- Decision/result:
  - Victory Conditions compact rows implemented but kept local/dev-only.
  - Natural Wonders became `Wonders` shallow reference overview.
  - Populations gained archive rows and calmer faction metadata.
  - Statuses gained Polarity/interactions polish.
  - Actions stayed shallow; modifier-heavy mechanics were removed from archive
    rows.
  - Victory Paths/Conditions remain local/dev-visible pending data-quality
    follow-up.
- EWShop implementation result: player-facing Codex quality improved without
  changing exporter contracts or using inference.
- Follow-up generated: Victory Path `Master` and Modifier provenance follow-ups.
- Status: implemented with open follow-ups.

### 2026-06-22 / 2026-06-23 - Rich Factions Import And Detail Enrichment

- Direction: EWShop implementation from DB Exporter -> EWShop handoff
- Topic: rich Factions source-truth import and Codex detail enrichment
- Summary: EWShop imported rich `factions` and used exact keys to enrich Codex
  Faction and Minor Faction details without creating a `/factions` route.
- Source docs/files:
  - `docs/active/final-snapshot-codex-ticket-plan.md`
  - `docs/active/final-snapshot-release-readiness-review.md`
  - `docs/active/codex-rich-enrichment-decision-template.md`
- Snapshot/export version: `20260622-055736`.
- Decision/result: rich Factions are a strong cross-category strategy hub, but
  a larger route/profile feature remains a product-shape decision.
- EWShop implementation result: `/api/factions` foundation and exact detail
  enrichment landed; no art/icon/prose inference was introduced.
- Follow-up generated: post-release Faction strategy/profile product decision.
- Status: implemented.

### 2026-06-22 / 2026-06-23 - Heroes + Skills Import And Hero Detail Enrichment

- Direction: EWShop implementation from DB Exporter -> EWShop handoff
- Topic: rich Heroes + Skills import and Hero Codex detail enrichment
- Summary: EWShop imported rich `heroes` and `skills` as source-truth sidecar
  data, then enriched Hero detail pages with compact profile information.
- Source docs/files:
  - `docs/active/final-snapshot-codex-ticket-plan.md`
  - `docs/active/final-snapshot-release-readiness-review.md`
  - `docs/active/codex-rich-enrichment-decision-template.md`
- Snapshot/export version: `20260622-055736`.
- Decision/result: Hero details show origin/class, starting skills, skill paths,
  and exact primary ability links where safe. EWShop does not build `/heroes`, a
  public Skills category, or a skill tree planner.
- EWShop implementation result: `/api/heroes`, `/api/skills`, frontend stores,
  and Codex Hero detail enrichment landed.
- Follow-up generated: full selectable skill progression remains a separate
  source/product gap.
- Status: implemented with open follow-up.

### 2026-06-23 - Constructible Detail Planning Enrichment

- Direction: EWShop implementation from DB Exporter -> EWShop handoff
- Topic: rich District/Improvement planning fields
- Summary: EWShop implemented a bounded detail-only constructible enrichment
  slice from rich District/Improvement data.
- Source docs/files:
  - `docs/active/final-snapshot-codex-ticket-plan.md`
  - `docs/active/final-snapshot-release-readiness-review.md`
  - current uncommitted `FS-CODEX-011` working tree changes
- Snapshot/export version: `20260622-055736`.
- Decision/result: details may show exact Tech unlock links, District upgrade
  links, and limited safe placement text. Archive rows, construction cost, raw
  resource prerequisite IDs, RPN/formulas, and full planner behavior remain out
  of scope.
- EWShop implementation result: implemented in working tree but not yet committed
  at time of ledger creation.
- Follow-up generated: constructible resource prerequisite public-ref gap if
  product wants those requirements surfaced.
- Status: implemented/uncommitted.

### 2026-06-23 - Release Readiness And Technical Refactor Review

- Direction: EWShop internal review after DB Exporter -> EWShop handoff
- Topic: release readiness and post-adoption technical cleanup
- Summary: EWShop reviewed final snapshot adoption for production readiness and
  technical refactor opportunities.
- Source docs/files:
  - `docs/active/final-snapshot-release-readiness-review.md`
  - `docs/active/final-snapshot-technical-refactor-review.md`
- Snapshot/export version: `20260622-055736`.
- Decision/result: release with caveats after constructible planning is
  committed or excluded and focused browser QA passes. No technical refactor
  blocks release.
- EWShop implementation result: active release assessment and refactor plan were
  created.
- Follow-up generated: post-release refactor tickets and Faction strategy/profile
  product-shape decision.
- Status: implemented.

### 2026-06-23 - Final Snapshot Import Hygiene Audit

- Direction: EWShop internal review after DB Exporter -> EWShop handoff
- Topic: import hygiene, diagnostics suppression, and player-visible data safety
- Summary: EWShop audited final snapshot local imports from JSON file through
  startup import, persistence, API, frontend store, category visibility, and
  player-facing UI.
- Source docs/files:
  - `docs/active/final-snapshot-import-hygiene-audit.md`
  - `docs/active/final-snapshot-release-readiness-review.md`
  - `app/src/main/java/ewshop/app/importing/LocalStartupImportRunner.java`
  - `local-imports/codex/*`
  - `local-imports/exports/*`
- Snapshot/export version: `20260622-055736`.
- Decision/result: import hygiene does not block release. No new exporter-owned
  follow-up was discovered; existing Victory Path `Master`, Modifier
  provenance, Hero progression, constructible public resource prerequisite, and
  Ability metadata follow-ups remain the active exporter loops.
- EWShop implementation result: diagnostics-only Codex kinds are skipped,
  unsupported rich exports are skipped, noisy support categories remain
  hidden/local-only as appropriate, and current rich detail enrichments fail
  closed.
- Follow-up generated: optional EWShop diagnostics deny-list hardening/test
  coverage; no new DB Exporter request.
- Status: implemented.

## Archived / Superseded Handoff Docs

Archived historical context:

- `docs/archive/codex/db-exporter-codex-metadata-handoff-2026-06-10.md`
- `docs/archive/codex/db-exporter-codex-reference-kinds-handoff-2026-06-10.md`
- `docs/archive/codex/codex-metadata-adoption-audit-2026-06-11.md`
- `docs/archive/codex/codex-content-quality-exporter-handoff-2026-06-12.md`
- `docs/archive/codex/completed-2026-06-23-db-exporter-response-records/`
- `docs/archive/codex/superseded-2026-06-13-exporter-packet-inputs/`
- `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/`
- `docs/archive/codex/superseded-2026-06-17-premium-ui-baseline/`
- `docs/archive/exporter-handoffs/exporter-handoff-status.md`
- `docs/archive/exporter-handoffs/ewshop-handoff-2026-06.md`
- `docs/archive/exporter-handoffs/description-token-icons-handoff-2026-06.md`

Archive candidates, not moved by this ledger pass: none identified for the DB
Exporter/final snapshot cleanup. Final snapshot handoff/context docs remain
active because `FS-CODEX-*` execution still references them.

## How To Add A New Entry

Add a concise chronological entry with:

- date;
- direction: `EWShop -> DB Exporter` or `DB Exporter -> EWShop`;
- topic;
- summary;
- source docs/files;
- snapshot/export version if relevant;
- decision/result;
- EWShop implementation result if any;
- follow-up generated;
- status: `open`, `answered`, `implemented`, `superseded`, or `archived`.

Then update:

- this ledger's open follow-up list if the item remains actionable;
- `docs/active/README.md` only if a new active doc was created;
- `docs/current-action-priorities.md` only if the current direction or active
  source-of-truth docs changed.
