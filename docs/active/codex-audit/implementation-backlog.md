# Codex Remediation Backlog

This backlog groups audit findings into independently reviewable slices. It is
not a request to implement everything immediately.

## Priority Sequence

1. `EW-CODEX-DISTRICTS-001` - preserve and render constructible placement
   constraints already present in rich exports.
2. `EW-CODEX-REL-001` - add Codex unresolved-reference diagnostics for
   player-facing categories.
3. `EW-CODEX-COUNCILORS-001` - verify Councilor completeness with exporter
   source count before changing UI/data.
4. `EW-CODEX-FACTIONS-001` - define the next Faction strategy/profile product
   shape.
5. `EW-CODEX-ACTIONS-001` - improve Action ownership/public-purpose metadata
   once exporter facts exist.
6. `EW-CODEX-TRAITS-001` - review exact Trait origin/ownership metadata for
   safer browsing.
7. `EW-CODEX-EQUIPMENT-001` - close Equipment icon/granted-ability coverage.
8. `EW-CODEX-VICTORY-001` - keep Victory local-only until `Master` is resolved.
9. `EW-CODEX-QUESTS-001` - future Questline encyclopedia projection only if
   product brings Quests back to top-level Codex.

## Stories

### EW-CODEX-DISTRICTS-001 - Preserve Constructible Placement Constraints

Category: Districts, Extractors, Improvements
Classification: PIPELINE
Priority: P0
Effort: M
Risk: Medium
Exporter-blocked: no
Status: completed 2026-08-18

Problem: rich District/Improvement JSON includes structured terrain, river, and
POI/resource-deposit placement constraints, but EWShop import/domain/API only
preserve `neighbourTiles`.

Player value: District and extractor pages can answer placement questions
without prose/key inference.

Evidence:

- Rich `DistrictDefinition_District_Tier1_DivinePopMonument` has
  `placementPrerequisites.terrain`, `river`, and `pointOfInterest`.
- Rich `Extractor_Luxury01` has an authorized `POI_ResourceDepositLuxury01`
  constraint.
- `ConstructiblePlacementPrerequisitesDto` and domain model contain only
  `neighbourTiles`.
- `buildCodexConstructibleRichEnrichment` renders only `AnyTile/SameRegion`.

Affected files/layers:

- facade constructible import/response DTOs
- domain constructible placement model
- district/improvement mappers and persistence if needed
- frontend `District`/`Improvement` types and store normalizers
- `codexConstructibleRichEnrichment.ts`
- focused backend/frontend tests

Proposed solution: add explicit placement submodels for terrain, river, and
point-of-interest constraints; preserve them through rich APIs; render concise
detail-only placement lines. Consider filters only after preserved values are
stable and useful.

Result: implemented explicit neighbour, terrain, river, and point-of-interest
placement submodels through facade import DTOs, domain placement model,
persistence columns, facade response DTOs, frontend District/Improvement store
normalizers, and Codex detail Planning enrichment. District/Extractor examples
now render concise detail-only terrain, river, and resource-deposit placement
lines. The rich District import also accepts the current exporter
object-shaped `constructionCost` value and converts it to stable
player-readable cost lines, preventing fresh local startup imports from failing
on current 0.82 data. Archive rows and visibility policy were left unchanged.

Non-goals: no archive redesign, no terrain matrix, no inferred adjacency
parser, no DBExporter request until EWShop preserves current data.

Acceptance criteria:

- Representative district and extractor rich JSON fields survive import to API.
- Codex detail shows safe placement text for at least one terrain/river/POI
  example.
- Existing archive rows remain unchanged.
- Tests cover import mapper, response mapping/store normalization, and detail
  enrichment.

Verification: relevant Maven tests, frontend Codex tests, TypeScript, build.

Completed verification: targeted Maven mapper/API tests and targeted frontend
store/Codex rich planning tests passed. Browser QA confirmed the Divined
Monument detail Planning panel renders `Production`, `10 Resource02`, forbidden
terrain, no-river, and no-resource-deposit lines after a fresh local startup
import. Broader final verification is still run at program close.

### EW-CODEX-COUNCILORS-001 - Prove Councilor Completeness Before Remediation

Category: Councilors
Classification: EXPORTER REQUEST if source confirms a gap; otherwise FE
Priority: P1
Effort: XS
Risk: Low
Exporter-blocked: yes for completeness claim
Status: blocked/no-op 2026-08-18 pending source confirmation

Problem: Councilors may be incomplete, but EWShop currently has no evidence
that rows are filtered or lost.

Player value: avoids wasting UI/backend work and creates a clean handoff if the
source export is incomplete.

Evidence:

- `councilors-codex` contains 43 rows.
- No EWShop councilor-specific import or frontend filter exists.
- All local councilor references resolve.
- No rich Councilor export exists in `local-imports/exports`.

Proposed solution: ask DBExporter/source owner for expected public Councilor
count and exclusion rules. If 43 is complete, consider small FE Role rail. If
not, create exact exporter request with missing examples.

Result: revalidated local EWShop evidence and found no implementation defect.
The current `councilors-codex` export contains 43 rows, all 128 Councilor
outbound refs resolve locally, no rich Councilor export exists under
`local-imports/exports`, and no Councilor-specific EWShop import/frontend filter
was found. Completeness cannot be proven without DBExporter/source confirmation
of expected public Councilor count and exclusion policy. No UI/backend change was
made just to produce code.

Non-goals: no inferred faction/role ownership from names; no UI redesign before
source count is known.

Acceptance criteria:

- Written source confirmation of expected public rows and exclusion policy.
- If complete: update audit and optionally create FE polish story.
- If incomplete: add precise `DBX-CODEX-COUNCILORS-*` request.

Current verification: `jq` source count/role/reference checks and the
`diagnostics:codex-references` JSON run against `../local-imports/codex`
confirmed zero unresolved Councilor-sourced refs.

### EW-CODEX-FACTIONS-001 - Faction Strategy/Profile Shape Decision

Category: Factions, Minor Factions
Classification: FE
Priority: P1
Effort: S
Risk: Medium
Exporter-blocked: no
Status: completed 2026-08-18

Problem: Factions are a high-value strategy hub, but adding more links to the
current generic detail risks becoming a wall of references.

Player value: connects traits, populations, units, heroes, techs, protectorate
relationships, and Quest Explorer entry points in a deliberate planning
hierarchy.

Evidence:

- Rich factions are imported and detail enrichment already uses exact joins.
- Current action priorities recommend Faction strategy/profile as the next
  major direction.

Proposed solution: design/product decision doc comparing "Codex detail
enrichment", "small `/factions` route", and "defer until art/icon contracts".

Result: recorded `docs/active/codex-faction-strategy-profile-decision.md`.
Chosen path is to improve the existing Codex Faction detail page as the
strategy/profile surface. A new `/factions` route is deferred, waiting for
art/icon contracts is rejected for the next slice, and adding more raw related
links is rejected. The first implementation slice is
`EW-CODEX-FACTIONS-002 - Faction Strategy Profile Header`.

Non-goals: no implementation, no `/heroes` dashboard, no inferred ownership.

Acceptance criteria:

- Product shape decision recorded.
- Clear first implementation slice with dependencies and tests.

Verification: revalidated 5 public Faction Codex entries, 21 imported rich
faction-like records, and the existing exact-key package enrichment helper.

### EW-CODEX-FACTIONS-002 - Faction Strategy Profile Detail Pass

Category: Factions, Minor Factions
Classification: FE
Priority: P1
Effort: S
Risk: Medium
Exporter-blocked: no
Status: completed 2026-08-19

Problem: Major Faction detail pages had useful exact package links, but the
first screen still read like a generic dossier. The strongest strategy signals
were buried below trait sections, and archive rows emphasized trait names rather
than faction-defining mechanics.

Player value: a 4X player can quickly answer who the faction is, what makes it
strategically different, what systems it gets, and where to continue into Units,
Tech, Heroes, Populations, Traits, or Quest Explorer-owned quest details.

Result: implemented a compact `Strategy profile` section above Faction detail
content; used exact rich faction joins and existing capped package groups for
affinity/disposition, population, unit, tech, hero, quest, and trait counts;
used rich lore where available; promoted exported strategic effect lines in
Faction archive rows; renamed `Faction package` to `Faction systems`; removed
`exact refs` overflow wording; moved major Faction core effects ahead of trait
lists; and suppressed redundant `Kind=MinorFaction` structured facts.

Non-goals preserved: no new `/factions` route, no planner/dashboard, no inferred
facts from keys or prose, no art/portrait work, no uncapped relationship wall,
and no recreation of route-owned Tech, Unit, or Quest Explorer experiences.

Verification: focused Faction package/detail tests, structured description
tests, browser review for Aspects, Necrophages, Tahuk, Ametrine, desktop
viewport, and mobile-width viewport. Full frontend checks are run at PR close.

### EW-CODEX-REL-001 - Codex Unresolved Reference Diagnostics

Category: Cross-Codex
Classification: FE
Priority: P1
Effort: S
Risk: Low
Exporter-blocked: no
Status: completed 2026-08-18

Problem: unresolved references are currently discovered ad hoc.

Player value: prioritizes fixes where missing links hide real strategic
relationships.

Evidence: local audit found unresolved clusters in Abilities, Factions, Heroes,
Improvements, Tech, Units, and hidden Modifiers.

Proposed solution: extend existing Codex diagnostics/report tooling to produce
category/prefix examples and classify hidden-support vs truly missing public
targets.

Result: added `npm run diagnostics:codex-references`, backed by
`codexReferenceDiagnosticReport`, reusing canonical Codex reference resolution,
reference diagnostics, diagnostic classification, and top-level visibility
helpers. The report lists source category, source entry, field/index, referenced
key, target prefix, diagnostic kind, visibility class, and classification in
deterministic order. The 2026-08-18 local run checked 9,992 references and
reported 271 unresolved or malformed references.

Non-goals: no player-facing warning badges; no automatic exporter requests.

Acceptance criteria:

- Diagnostics output lists category, source key, missing key, target prefix, and
  likely visibility class.
- Tests cover at least status, improvement, and hidden modifier examples.

Verification: focused Vitest coverage for report output, canonical reference
diagnostics, and diagnostic classification passed. CLI run against
`../local-imports/codex` passed.

### EW-CODEX-ACTIONS-001 - Action Ownership and Public Purpose Metadata

Category: Actions
Classification: EXPORTER REQUEST
Priority: P2
Effort: M after exporter data
Risk: Medium
Exporter-blocked: yes
Status: blocked 2026-08-18 pending `DBX-CODEX-ACTIONS-001`

Problem: Action rows are intentionally shallow because ownership and
player-purpose facts are sparse, while mechanics are modifier-heavy.

Proposed solution: after exporter emits ownership/purpose metadata, add a
targeted Action row/filter polish slice.

Result: revalidated local source data and confirmed this is still
exporter-blocked. `ewshop_actions_codex_export_0.82.json` has 139 raw Action
rows with complete `Category`, `Action type`, and `Kind` facts, but only 10 rows carry an
exact `Origin faction` fact and no row exposes a public-purpose/strategic-use
field. Many rows are descriptionless and rely on `Action mechanics` sections
that link hidden Modifiers. EWShop should keep the current conservative Action
archive rather than infer ownership or purpose from keys/modifier links.

Verification: `jq` source fact-label/count inspection on the local Action
Codex export.

Acceptance criteria:

- Action rows can show owner/faction/purpose from explicit facts.
- Archive still avoids raw modifier mechanics as primary content.

### EW-CODEX-TRAITS-001 - Trait Ownership Metadata Review

Category: Traits
Classification: FE now, EXPORTER REQUEST if facts absent
Priority: P2
Effort: S
Risk: Low
Exporter-blocked: maybe
Status: completed/no-op 2026-08-18

Problem: Traits have useful Type filtering, but major-faction ownership is not
safe to infer.

Proposed solution: review exact exported `Origin faction`/related facts where
available; add quiet row/detail metadata only when exact.

Result: revalidated local Trait source and current UI behavior. The export has
178 raw Trait rows and 30 exact `Origin faction` facts, all on Protectorate
traits in the checked examples. The existing Trait archive already uses the
exact `Trait type` rail and exact related references; Protectorate rows expose
Minor Faction links while suppressing duplicate `Protectorate: ...` preview
text. No additional row/detail metadata was added because it would duplicate
the current exact relationship UI, and major-faction ownership still is not
safe to infer.

Verification: `jq` Trait fact-label/origin inspection plus existing
`CodexPage.referenceDomainArchives` and `CodexPage.referenceOverviewRows`
coverage for Trait Type filtering and Minor Faction links.

Acceptance criteria:

- No key/name inference.
- Existing Trait Type rail remains unchanged.

### EW-CODEX-EQUIPMENT-001 - Equipment Icon and Granted Ability Coverage

Category: Equipment
Classification: EXPORTER REQUEST
Priority: P2
Effort: M after exporter data
Risk: Low
Exporter-blocked: yes
Status: blocked 2026-08-18 pending `DBX-CODEX-EQUIPMENT-001`

Problem: Equipment lacks explicit item icon metadata and some granted ability
refs do not resolve.

Proposed solution: request exact icon metadata and public ability target
coverage, then render item icons using the existing semantic icon path.

Result: revalidated local Equipment source data and confirmed this remains
exporter-blocked. `ewshop_equipment_codex_export_0.82.json` has 160 rows with
clean Type/Slot/Rarity/Tier/Value facts and 149 rows with `Granted abilities`
sections, but zero rows export `svgIcon` metadata. EWShop should not guess item
icons from filenames or keys.

Verification: `jq` Equipment fact-label, `svgIcon`, and granted-ability section
inspection on the local Equipment Codex export.

Acceptance criteria:

- No SVG filename inference.
- Equipment rows/details render icons only from explicit metadata.

### EW-CODEX-VICTORY-001 - Victory Local-Only Closeout

Category: Victory Conditions, Victory Paths
Classification: EXPORTER REQUEST
Priority: P1
Effort: S after exporter response
Risk: Medium
Exporter-blocked: yes
Status: blocked 2026-08-18 pending `DBX-CODEX-VICTORY-001`

Problem: Victory data is useful but local-only because `Master` appears as a
path value without matching public path row/reference.

Proposed solution: keep local-only until exporter clarifies `Master`; after
response, decide whether Victory can become public.

Result: revalidated local Victory data and kept the category local-only. The
six Victory Conditions include two `Victory path` facts with value `Master`
and no `referenceKey`; `victorypaths-codex` still has only
`VictoryPath_Enrich` and `VictoryPath_Glorify`.

Verification: `jq` Victory Condition path fact inspection and Victory Path row
inspection on local Codex exports.

Acceptance criteria:

- `Master` is emitted as public path with exact refs or explicitly documented as
  non-public.
- Public top-level visibility changes only after product/data-quality review.

### EW-CODEX-QUESTS-001 - Questline Encyclopedia Projection

Category: Quests
Classification: EXPORTER REQUEST
Priority: P3
Effort: L
Risk: High
Exporter-blocked: yes
Status: deferred/exporter-blocked 2026-08-18 pending product decision and
`DBX-CODEX-QUESTS-001`

Problem: current Quest Codex rows are not safe for top-level encyclopedia
grouping, and Quest Explorer is route-owned.

Proposed solution: only if product wants Quests back in top-level Codex, request
source-truth questline encyclopedia records from exporter.

Result: revalidated local Quest data and deferred implementation. The Codex
Quest export still has 300 branch/step-style rows, many duplicate display names
such as `A Bitter Truth` appearing 18 times and `A Fresh Lead` appearing 10
times. The dedicated `/quests` route remains the route-owned Quest Explorer, so
top-level Codex grouping should wait for explicit Questline projection records
and product direction.

Verification: `jq` Quest row count, duplicate display-name, and fact-label
inspection on the local Quest Codex export.

Acceptance criteria:

- No grouping by duplicate titles, keys, or branch topology.
- Codex links to `/quests` rather than duplicating Quest Explorer.

## Defer / Low-Value Items

- Councilor Effects role rail: small but low urgency.
- Partner Effects source-count context: low urgency.
- Natural Wonder redesign: current reference overview is sufficient.
- Rich Population import: defer until current Codex population archive proves
  insufficient.
- Public Skills category: not recommended without product surface decision.
