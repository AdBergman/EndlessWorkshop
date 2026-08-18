# Codex Remediation Backlog

This backlog groups audit findings into independently reviewable slices. It is
not a request to implement everything immediately.

## Priority Sequence

1. `EW-CODEX-DISTRICTS-001` - preserve and render constructible placement
   constraints already present in rich exports.
2. `EW-CODEX-COUNCILORS-001` - verify Councilor completeness with exporter
   source count before changing UI/data.
3. `EW-CODEX-FACTIONS-001` - define the next Faction strategy/profile product
   shape.
4. `EW-CODEX-REL-001` - add Codex unresolved-reference diagnostics for
   player-facing categories.
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
lines. Archive rows and visibility policy were left unchanged.

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
store/Codex rich planning tests passed. Broader final verification is still run
at program close.

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

Non-goals: no implementation, no `/heroes` dashboard, no inferred ownership.

Acceptance criteria:

- Product shape decision recorded.
- Clear first implementation slice with dependencies and tests.

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

Problem: Action rows are intentionally shallow because ownership and
player-purpose facts are sparse, while mechanics are modifier-heavy.

Proposed solution: after exporter emits ownership/purpose metadata, add a
targeted Action row/filter polish slice.

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

Problem: Traits have useful Type filtering, but major-faction ownership is not
safe to infer.

Proposed solution: review exact exported `Origin faction`/related facts where
available; add quiet row/detail metadata only when exact.

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

Problem: Equipment lacks explicit item icon metadata and some granted ability
refs do not resolve.

Proposed solution: request exact icon metadata and public ability target
coverage, then render item icons using the existing semantic icon path.

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

Problem: Victory data is useful but local-only because `Master` appears as a
path value without matching public path row/reference.

Proposed solution: keep local-only until exporter clarifies `Master`; after
response, decide whether Victory can become public.

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

Problem: current Quest Codex rows are not safe for top-level encyclopedia
grouping, and Quest Explorer is route-owned.

Proposed solution: only if product wants Quests back in top-level Codex, request
source-truth questline encyclopedia records from exporter.

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
