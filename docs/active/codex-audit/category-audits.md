# Category Audits

Each section records the category verdict, evidence trace, main filtering/data
facts, current UI shape, and highest-value remediation decision. Scores use the
methodology in `audit-methodology.md`.

## 2026-08-19 Rich-Domain Integrity Closeout

Final explicit sweep after rebasing onto current `origin/main`.

| Rich domain | Closeout classification | Evidence |
| --- | --- | --- |
| Districts | Already fixed on current main; no additional material contract loss found. | Rich import preserves key, category/tier/level, cost lines, descriptor/reference/unlock keys, faction/variant/player-facing flags, level-up data, and placement prerequisites through import DTO, domain, persistence, API DTO, frontend type/store, and Codex constructible enrichment. Exporter/debug fields such as source line keys and template/prototype flags that are not part of the current player-facing District API remain intentionally outside the contract. |
| Improvements | EWShop-owned gap fixed in this branch. | API already exposed `category`, but frontend type/store did not preserve it; this branch fixes that contract loss. Current rich import/API also preserve description lines, unlock tech keys, and placement prerequisites. Rich construction/family/faction/provenance fields are intentionally not imported/exposed unless a future product slice needs them. |
| Units | No material contract loss found. | Unit key, display name/art id, faction display, major/hero/chosen/spawn flags, evolution keys, class/attack skill, merged ability keys, descriptions, and veterancy progression lines survive import DTO, domain, persistence, API, frontend store, and Codex detail enrichment. Raw grouped/helper ability buckets beyond the merged ability contract remain documented rich-route/detail candidates, not current API promises. |
| Factions | No material contract loss found. | Rich faction identity, public label, lore, kind, affinity, trait/population/unit/base-unit/hero/gated-tech/quest/protectorate relationship arrays preserve through the chain and feed exact Codex faction package enrichment. Visual/advisor mapper fields remain intentionally outside the current player-facing API contract. |
| Heroes | No material contract loss found. | Hero identity, faction/origin/class keys, grouped ability buckets, default skills, applicable skill trees, descriptions, and reference keys preserve through import, persistence, API, frontend type/store, and hero detail enrichment. Portrait/icon and planner-grade skill progression remain outside current scope. |
| Skills | No material contract loss found. | Skill trees, tiers, hero defaults, skill prerequisites/locks/inhibitors, placements, effects, resolved summaries, mechanic tags, ability/effect/reference arrays, and default hero links preserve through import DTOs, domain snapshots, JSON-backed persistence, API DTO, frontend type/store, and Hero Codex enrichment. |
| Tech | EWShop-owned gap fixed in this branch. | Full `technologyPrerequisiteTechKeys` and `exclusiveTechnologyPrerequisiteTechKeys` arrays now preserve from rich export through import DTO, domain, JPA collection tables, API DTO, frontend type/store, and Codex tech detail enrichment. `V3_5_6` hardens the existing collection tables with FK cascade, indexes, and uniqueness coverage. |
| Quest Explorer | EWShop-owned gap fixed in this branch; proven source/reference gaps already represented by canonical `DBX-CODEX-REFERENCES-001`. | Root `chapterRootEvidence` existed in rich Quest Explorer source but was dropped by EWShop; this branch preserves it through import metadata, persistence, API, frontend type, and normalizer. Entry navigation, lore, strategy, branch, requirement/reward, quality, progression, and debug summary fields remain preserved. Generic Quest rows still reference rich `FactionQuest_*` targets absent from generic Codex exports, which remains the existing canonical exporter/reference issue rather than a new EWShop substitute. |

## Abilities

Scores: UX 8, completeness 7, usefulness 8, trust 7. Confidence: PROVEN.

Verdict: one of the strongest Codex archives. It has 335 public rows, 1,778
facts, 414 sections, 95 references, and 331 exported ability icons. A hardcore
player can scan mechanics, target/range/cost, effects, and linked statuses.

Trace:

- Source: `local-imports/codex/ewshop_abilities_codex_export_0.82.json`.
- Rich source exists at `local-imports/exports/ewshop_abilities_export_0.82.json`
  with 364 entries, tactical profiles, mechanic tags, internal flags, and
  exclusion reasons, but is not imported by `LocalStartupImportRunner`.
- Generic Codex import preserves `svgIcon`; `CodexEntryIcon` resolves only
  `ability-icons` metadata for ability rows.
- Frontend mode is `abilityArchive`.

Filtering/completeness:

- No Codex import filter for abilities.
- Frontend filters use exported fact values through
  `codexAbilityArchiveFilters.ts`.
- Five local ability references point at unavailable `Status_*` rows, including
  `Status_Unit_Bodyguard` and `Status_Unit_Ecstatic`.
- Revalidated on 2026-08-19: sampled unresolved status targets are absent from
  all current generic Codex files; `Status_Unit_Bodyguarded` exists, but
  `Status_Unit_Bodyguard` does not.
- Current exporter follow-up for role/ownership remains valid; rich ability
  data should not be imported casually because it contains helper/internal
  classifications.

Improve now:

- FE: tighten role shelves after exporter role cleanup; keep using exact facts.
- FE: surface unresolved status-reference diagnostics in a developer-only report
  or content QA doc, not in player UI.

Exporter-needed:

- Explicit public ability ownership/source metadata.
- Cleaned/canonical role taxonomy where current role labels are misleading.

## Actions

Scores: UX 6, completeness 5, usefulness 5, trust 6. Confidence: PROVEN.

Verdict: usable but shallow. The compact Action archive is intentionally
conservative because exported mechanics are sparse or modifier-heavy.

Trace:

- Source: `local-imports/codex/ewshop_actions_codex_export_0.82.json`.
- 139 raw rows, 128 imported after `PublicReleaseFactionPolicy` filters
  unreleased SandShaper/RaiseRuin rows.
- Import path is generic Codex; no rich Action export exists.
- Frontend mode is `actionArchive`; rows prefer description/effect preview and
  avoid `Action mechanics` in archive rows.
- Revalidated on 2026-08-18: all 139 raw rows have `Category`, `Action type`,
  and `Kind` facts, but only 10 have exact `Origin faction` facts and no public
  purpose/strategic-use fact exists.

Filtering/completeness:

- `CodexImportService` applies the action release gate.
- Archive rail uses exact `Category` facts: Action, Faction, Empire,
  Constructible, Terraforming, Army.
- Many rows have no public description; mechanics details often link Modifiers,
  which are deliberately hidden from top-level browsing.

Improve now:

- FE: keep shallow rows, improve empty-state/metadata copy only if browser QA
  finds confusion.
- FE: developer diagnostics for action rows with zero public mechanics.

Exporter-needed:

- Explicit owner/faction metadata for faction/empire actions.
- Public action purpose/category metadata that is less modifier-oriented.
- Tracked as `DBX-CODEX-ACTIONS-001`; do not infer these values from keys or
  hidden Modifier relationships.

## Councilors

Scores: UX 5, completeness 6, usefulness 6, trust 7. Confidence: PROVEN for
EWShop path, UNKNOWN for game-source completeness.

Verdict: the category is currently generic but not obviously broken. The
reported possibility of incomplete Councilors is not explained by EWShop
filters.

Trace:

- Source: `local-imports/codex/ewshop_councilors_codex_export_0.82.json`.
- 43 councilors, with role facts distributed as Discovery 16, Society 9,
  Defense 9, Development 8, Clergy 1.
- Each row references a Councilor Effect and Partner Effect; all 128 local
  councilor references resolve in current Codex data.
- No rich councilor export is present under `local-imports/exports`.
- Frontend mode is generic.

Filtering/completeness:

- No `CodexImportService` councilor filter.
- No frontend councilor-specific filter.
- Top-level visibility is public.
- Therefore missing Councilors, if real, must be proven against exporter/source
  records, not assumed from EWShop UI.

Improve now:

- No EWShop implementation defect is currently proven. `EW-CODEX-COUNCILORS-001`
  revalidated 43 local Councilor rows, 128 locally resolved Councilor outbound
  references, no rich Councilor export, and no Councilor-specific EWShop filter.
- FE polish such as a small Role rail remains optional only after product review
  or source confirmation that 43 rows is complete.

Exporter-needed:

- Only after DBExporter confirms expected source count exceeds the 43 public
  rows or identifies excluded/non-public councilor records.

## Councilor Effects

Scores: UX 7, completeness 7, usefulness 6, trust 8. Confidence: PROVEN.

Verdict: strong shallow reference category. It is mostly a lookup table for
Councilor effect mechanics and source relationships.

Trace:

- Source: `local-imports/codex/ewshop_councilor_effects_codex_export_0.82.json`.
- 42 rows, 84 facts, 45 sections.
- Generic Codex import; full-width reference overview.
- No rich source.

Filtering/completeness:

- No import/frontend filter.
- One fewer effect than councilor rows is plausible from data reuse, not an
  EWShop loss; examples show role/effect lines are preserved.

Improve now:

- FE: optional Role rail if direct browsing becomes common.

Exporter-needed:

- None proven.

## Diplomacy

Scores: UX 7, completeness 6, usefulness 6, trust 7. Confidence: PROVEN.

Verdict: compact and useful for static treaty/declaration lookup, but not a full
diplomacy simulator.

Trace:

- Source:
  `local-imports/codex/ewshop_diplomatic_treaties_codex_export_0.82.json`.
- 22 rows; facts include Category, Bilateral, and Duration.
- Generic Codex import; frontend mode `diplomacyArchive`.
- Exact Status links support applied public-opinion/status summaries.

Filtering/completeness:

- No import filter.
- Runtime surrender/tribute values are not static Codex data per active
  priorities.

Improve now:

- FE: no urgent change; current category rail and status summaries are
  appropriate.

Exporter-needed:

- Relationship direction/static-vs-runtime metadata if future UI needs it.
- Treaty-specific icon metadata only if product wants stronger identity.

## Districts

Scores: UX 7, completeness 7, usefulness 8, trust 7. Confidence: PROVEN.

Verdict: strong archive. `EW-CODEX-DISTRICTS-001` now preserves and renders
rich placement/terrain/source-truth data that EWShop previously dropped.

Trace:

- Codex source: `local-imports/codex/ewshop_districts_codex_export_0.82.json`.
- Rich source: `local-imports/exports/ewshop_districts_export_0.82.json`.
- `CodexImportMapper` reclassifies `Extractor_*` rows into `extractors`.
- Rich District import maps `districtKey`, category, tier, constructible level,
  cost, descriptor keys, references, unlock techs, level-up, and
  `placementPrerequisites.neighbourTiles`, `terrain`, `river`, and
  `pointOfInterest`.
- Current object-shaped rich `constructionCost` values are accepted and mapped
  to stable cost lines such as `Production` and `10 Resource02`; internal
  production RPN keys are not rendered as player-facing cost text.
- `ConstructiblePlacementPrerequisitesDto`, the domain placement model,
  persistence columns, response DTOs, frontend stores, and Codex detail
  enrichment now preserve the rich source `terrain`, `river`, and
  `pointOfInterest` fields.
- Frontend `buildCodexConstructibleRichEnrichment` renders upgrade links and a
  very limited placement line: only `AnyTile` + `SameRegion`.

Representative field-loss table:

| Field / information | Export | Import DTO | Stored | API | Frontend | Rendered | Status |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Public effects | yes | yes via Codex | yes | yes | yes | yes | OK |
| Category/Tier | mostly yes | yes | yes | yes | yes | yes | OK |
| Level-up target/count | yes rich | yes | yes | yes | yes | yes detail-only |
| Terrain forbidden/allowed | yes rich | yes | yes | yes | yes | yes detail-only | fixed |
| River constraint | yes rich | yes | yes | yes | yes | yes detail-only | fixed |
| POI/resource deposit constraint | yes rich | yes | yes | yes | yes | yes detail-only | fixed |
| Exact adjacency effect semantics | effect text/descriptors | descriptor keys only | yes rich descriptor keys | yes | no structured parser | no filter | BE/FE after placement DTO fix |

Completed:

- PIPELINE/FE: extended rich constructible placement DTO/domain/persistence/API
  and frontend detail enrichment to preserve and show terrain, river, and
  POI/resource-deposit constraints already present in rich District exports.
- PIPELINE: made rich District import tolerant of current object-shaped
  construction-cost data so fresh 0.82 local startup imports complete.
- FE: archive rows remain effect-first; no terrain matrix or inferred adjacency
  parser was added.

Exporter-needed:

- Only for canonical public adjacency/placement metadata that a follow-up
  re-audit proves is still absent after EWShop preserves current rich fields.
  Request exact fields, not "adjacency bonuses."

## Extractors

Scores: UX 6, completeness 7, usefulness 7, trust 8. Confidence: PROVEN.

Verdict: hidden support category split from Districts. It works well as a
Resource-linked reference target.

Trace:

- Source rows live in `districts` Codex export with `Extractor_` keys.
- `CodexImportMapper` changes public export kind to `extractors` and category
  to `Extractors`.
- 66 rows resolve exact Resource links.
- Rich district source contains POI/resource-deposit placement constraints for
  extractor rows, and EWShop now preserves/renders those fields through the
  constructible placement path described in Districts.

Completed:

- PIPELINE/FE: same constructible placement preservation as Districts.
- FE: hidden top-level policy remains unchanged; Resources remains the entry
  point.

Exporter-needed:

- None proven for current extractor rows.

## Equipment

Scores: UX 8, completeness 7, usefulness 8, trust 7. Confidence: PROVEN.

Verdict: mature archive/detail category with clean facts and useful ability
relationships, held back mainly by missing icons and unresolved granted ability
coverage.

Trace:

- Source: `local-imports/codex/ewshop_equipment_codex_export_0.82.json`.
- 160 rows; all have Type, Slot, Rarity, Tier, and Value facts; 149 have
  Granted abilities.
- Generic Codex import; frontend `equipmentArchive` with Type/Rarity filters.
- No rich Equipment export.
- Revalidated on 2026-08-18: 149 rows have `Granted abilities` sections in the
  local export and zero rows export per-item `svgIcon` metadata.

Filtering/completeness:

- No import filter.
- Rows show effect previews and exact granted ability previews when references
  resolve.
- Per-item SVG metadata is absent.

Improve now:

- FE: review unresolved granted ability refs and make detail fallback clearer.
- FE: avoid icon inference from item keys/SVG filenames.

Exporter-needed:

- Explicit item icon metadata.
- Granted ability reference coverage where source can prove public ability
  targets.

## Factions

Scores: UX 7, completeness 7, usefulness 8, trust 7. Confidence: PROVEN.

Verdict: strategically important hub. The category is small, but rich faction
detail enrichment makes it a strong candidate for the next product shape.

Trace:

- Codex source: `local-imports/codex/ewshop_factions_codex_export_0.82.json`
  with 5 public major faction rows.
- Rich source: `local-imports/exports/ewshop_factions_export_0.82.json` with
  21 faction-like rows and package relationship keys.
- Rich import is supported by `/api/factions` and `factionStore`.
- Detail rendering uses exact rich package joins when available.

Filtering/completeness:

- No Codex import filter for factions.
- Public major faction count intentionally reflects released factions.
- Some package references remain unresolved where target rows are hidden or not
  public Codex targets.

Improve now:

- FE: `EW-CODEX-FACTIONS-001` recorded the strategy/profile shape decision in
  `docs/active/codex-faction-strategy-profile-decision.md`. The next slice is a
  compact Codex detail strategy profile header using exact existing rich faction
  groups, not a new `/factions` route or uncapped related-link wall.
- FE: add package relationship diagnostics to prevent giant link walls.

Exporter-needed:

- Only if future profile needs canonical public ownership/icon/art contracts not
  already in rich faction data.

## Heroes

Scores: UX 8, completeness 7, usefulness 8, trust 7. Confidence: PROVEN.

Verdict: strong archive and detail experience after rich Hero/Skill enrichment.
Do not expand into a skill planner without a separate product decision.

Trace:

- Codex source: `local-imports/codex/ewshop_heroes_codex_export_0.82.json`.
- Rich sources: `ewshop_heroes_export_0.82.json` and
  `ewshop_skills_export_0.82.json`.
- Local startup imports both `heroes` and `skills`.
- Frontend `heroArchive` uses Class/Faction filters and detail enrichment for
  origin/class, starting skills, skill paths, and exact primary ability links.

Filtering/completeness:

- No Codex hero filter.
- Rich helper/internal ability keys are preserved but rendered conservatively.
- Portraits/icons and canonical skill tiers/progression remain out of scope.

Improve now:

- FE: small browser QA/fallback polish around missing exact skill ability links.

Exporter-needed:

- Canonical hero skill tier/progression semantics if a planner is desired.
- Portrait/icon metadata/art contract if hero identity is to become visual.

## Improvements

Scores: UX 7, completeness 6, usefulness 7, trust 7. Confidence: PROVEN.

Verdict: useful archive with the same constructible placement-preservation issue
as Districts.

Trace:

- Codex source:
  `local-imports/codex/ewshop_improvements_codex_export_0.82.json`.
- Rich source:
  `local-imports/exports/ewshop_improvements_export_0.82.json`.
- Rich import/API/frontend now preserve `placementPrerequisites.neighbourTiles`,
  `terrain`, `river`, and `pointOfInterest`. Current local Improvement source
  examples only exercise neighbour placement.
- Rich API already exposed `category`; 2026-08-19 audit found the frontend
  `Improvement` type/store did not preserve it and still declared stale
  `unique`/`cost` requirements.
- Frontend mode is `improvementArchive`; detail enrichment shows exact unlock
  links and limited placement text.

Filtering/completeness:

- No import filter.
- Category rail is based on exact exported `Category` facts.
- Rich source includes construction cost/resource/family/faction fields not all
  exposed in current API; this is intentional unless product needs them.

Completed:

- PIPELINE/FE: shared rich constructible placement shape can preserve
  structured terrain/river/POI fields for Improvements when exporter data
  supplies them. Current local Improvement data remains neighbour-only.
- FE contract: `useImprovementStore` now preserves nullable `category`; the
  frontend type no longer requires fields the API does not return.

Exporter-needed:

- None proven until EWShop preserves current rich placement fields.

## Minor Factions

Scores: UX 6, completeness 7, usefulness 7, trust 7. Confidence: PROVEN.

Verdict: useful detail/reference category, but not as polished as major
Factions.

Trace:

- Codex source:
  `local-imports/codex/ewshop_minor_factions_codex_export_0.82.json`.
- Rich faction export includes minor/protectorate-like data and is imported.
- Detail can use rich faction package groups.

Filtering/completeness:

- No import filter.
- Three local minor-faction references are unresolved, including protectorate
  trait references for Blackhammer and a Mangrove quest reference.
- Revalidated on 2026-08-19: `MinorFaction_SpecificQuest_MangroveOfHarmony01`
  and `MinorFaction_MangroveOfHarmony_Elder` are referenced by current public
  Codex rows but absent from the generic Codex corpus; no rich minor-faction
  export exists in the local snapshot.

Improve now:

- FE: detail package grouping and unresolved-link diagnostics.

Exporter-needed:

- Only if protectorate trait/quest references should be public targets and are
  absent from current Codex exports.

## Modifiers

Scores: UX 4, completeness 5, usefulness 4, trust 5. Confidence: PROVEN.

Verdict: useful inspection/support data, intentionally hidden from top-level
browsing because provenance and player-facing semantics are weak.

Trace:

- Source: `local-imports/codex/ewshop_bonuses_codex_export_0.82.json`.
- Bonus rows normalize to `statuses` or `modifiers` in backend summaries and
  frontend store.
- 248 modifier rows import from 250 raw public-kind rows after release gates.
- Top-level visibility is hidden.

Filtering/completeness:

- `CodexImportService` filters unreleased action/trait/quest-related bonuses.
- No source/provenance metadata exists to say what grants many modifiers.

Improve now:

- FE: keep hidden; improve direct-detail labels only if they confuse exact-link
  flows.

Exporter-needed:

- Explicit modifier provenance metadata.

## Wonders

Scores: UX 7, completeness 6, usefulness 6, trust 8. Confidence: PROVEN.

Verdict: compact reference sheet; sufficient for static Codex use.

Trace:

- Source:
  `local-imports/codex/ewshop_natural_wonders_codex_export_0.82.json`.
- 6 rows; full-width reference overview as public `Wonders`.
- No rich source.

Filtering/completeness:

- No import filter.
- Live map/discovery/ownership state is intentionally not static Codex data.

Improve now:

- FE: no urgent work.

Exporter-needed:

- None proven.

## Partner Effects

Scores: UX 7, completeness 7, usefulness 6, trust 8. Confidence: PROVEN.

Verdict: strong shallow reference list.

Trace:

- Source:
  `local-imports/codex/ewshop_partner_effects_codex_export_0.82.json`.
- 39 rows; full-width reference overview.
- No rich source.

Filtering/completeness:

- No import filter.
- Backlinks from Councilors resolve through exact references rather than being
  duplicated as source lists.

Improve now:

- FE: no urgent work; optional source-count context later.

Exporter-needed:

- None proven.

## Populations

Scores: UX 7, completeness 7, usefulness 7, trust 7. Confidence: PROVEN.

Verdict: useful archive from Codex data alone; rich population export exists but
is not currently imported.

Trace:

- Codex source:
  `local-imports/codex/ewshop_populations_codex_export_0.82.json`.
- Rich source:
  `local-imports/exports/ewshop_populations_export_0.82.json`, skipped by
  local startup import because no rich population import path exists.
- 26 Codex rows; worker effects and threshold rewards are already rendered by
  `populationArchive`.

Filtering/completeness:

- No import filter.
- One local reference to `MinorFaction_MangroveOfHarmony_Elder` is unresolved.

Improve now:

- FE: minor polish only; current archive answers worker/threshold questions.
- BE: consider rich population import only if future design needs base/growth
  costs, availability, or descriptor keys beyond Codex facts.

Exporter-needed:

- None proven.

## Quests

Scores: UX 4, completeness 5, usefulness 4, trust 6. Confidence: PROVEN.

Verdict: intentionally hidden from top-level Codex because the dedicated
`/quests` route owns quest strategy/lore exploration.

Trace:

- Codex source: `local-imports/codex/ewshop_quests_codex_export_0.82.json`
  with 300 rows.
- Rich source:
  `local-imports/exports/ewshop_quest_explorer_export_0.82.json` with 156
  route-owned entries.
- Codex quest rows import and remain search/direct-linkable.
- Frontend category mode exists, but top-level visibility hides `quests`.

Filtering/completeness:

- Release gate exists for faction quest keys but current local snapshot count
  remains 300 after policy.
- Repeated titles and branch records make title/key grouping unsafe.
- Revalidated on 2026-08-19: 22 generic quest references point at
  `FactionQuest_*` choice/continuation keys absent from the generic Quest Codex
  export. The same keys exist in the rich Quest Explorer export, confirming a
  generic-vs-rich relationship/diagnostics gap rather than a raw quest-source
  absence.
- Revalidated on 2026-08-19: rich Quest Explorer export metadata
  `chapterRootEvidence` exists in local source data but was dropped by the
  EWShop import/API/frontend contract. EWShop now preserves that evidence as
  route metadata for diagnostics/link context only; it is not used to recreate a
  top-level Quest Codex grouping.

Improve now:

- Done 2026-08-19: preserve `chapterRootEvidence` from rich Quest Explorer
  import through persistence, `/api/quests/explorer`, frontend type, and
  normalizer.
- FE: keep hidden; do not group from titles or Quest Explorer branch data.

Exporter-needed:

- Future public Questline encyclopedia projection only if Quests return to
  top-level Codex: questline identity, faction, public visibility, chapter/quest
  counts, summary, and stable `/quests` link.

## Resources

Scores: UX 8, completeness 8, usefulness 7, trust 8. Confidence: PROVEN.

Verdict: benchmark shallow reference category.

Trace:

- Source: `local-imports/codex/ewshop_resources_codex_export_0.82.json`.
- 24 rows; exact extractor links and token icons.
- Full-width reference overview.

Filtering/completeness:

- No import filter.
- Extractor links resolve to hidden `extractors` rows.

Improve now:

- No major work.

Exporter-needed:

- None proven.

## Statuses

Scores: UX 8, completeness 7, usefulness 8, trust 7. Confidence: PROVEN.

Verdict: mature archive derived from `bonuses` with valuable effect previews,
polarity/duration metadata, and inbound relationship support.

Trace:

- Source: `local-imports/codex/ewshop_bonuses_codex_export_0.82.json`.
- 337 status rows after bonus-derived normalization.
- Backend summary and frontend store normalize rows with category/kind/key
  heuristics.
- Frontend mode is `statusArchive`.

Filtering/completeness:

- No status rows filtered in current simulated snapshot.
- Some ability references to statuses are unresolved.
- Inbound exact references from Abilities, Diplomacy, Actions, and Factions
  power detail relationships.

Improve now:

- FE: developer diagnostics for unresolved status refs.
- FE: bounded detail polish around interactions, not broader status ontology.

Exporter-needed:

- Only if source proves missing status/icon/type metadata not available in
  current `bonuses` projection.

## Tech

Scores: UX 8, completeness 8, usefulness 9, trust 7. Confidence: PROVEN.

Verdict: excellent archive companion to the route-owned `/tech` explorer.

Trace:

- Codex source: `local-imports/codex/ewshop_tech_codex_export_0.82.json`.
- Rich source: `local-imports/exports/ewshop_tech_export_0.82.json`.
- Rich import supports `/api/techs` and `techStore`.
- Frontend `techArchive` uses Era/Quadrant/Faction filters; detail enrichment
  adds exact prerequisite links from rich tech when public Codex targets resolve.
- Rich export fields `technologyPrerequisiteTechKeys` and
  `exclusiveTechnologyPrerequisiteTechKeys` are now preserved from import DTO
  through persistence, `/api/techs`, `Tech` frontend type/store, and Codex tech
  detail enrichment. Legacy singular `prereq`/`excludes` remain compatibility
  fields.

Filtering/completeness:

- No Codex import filter.
- 133 entries; all have Era/Quadrant/Tier facts.
- Archive intentionally does not duplicate `/tech` tree progression.

Improve now:

- Done 2026-08-19: preserve full exported prerequisite arrays end-to-end and
  add focused backend/API/frontend regression tests.
- FE: keep current split; small unresolved unlock diagnostics only.

Exporter-needed:

- Canonical public prerequisite/progression Codex metadata only if non-EWShop
  consumers or archive rows require it.

## Traits

Scores: UX 7, completeness 7, usefulness 7, trust 7. Confidence: PROVEN.

Verdict: useful reference/archive hybrid, with public-release filtering and
exact Protectorate ownership links. Major-faction ownership remains an exporter
question rather than a frontend inference target.

Trace:

- Source: `local-imports/codex/ewshop_traits_codex_export_0.82.json`.
- 178 raw rows, 122 imported after `PublicReleaseFactionPolicy` filters
  unreleased/custom faction traits.
- Frontend `traitArchive` uses exported `Trait type`.
- No rich Trait source.
- Revalidated on 2026-08-18: the export includes 30 exact `Origin faction`
  facts, all on checked Protectorate examples with `MinorFaction_*` references.
  Existing Trait rows expose those exact Minor Faction links and suppress
  duplicate `Protectorate: ...` preview text.

Filtering/completeness:

- 56 rows filtered by release policy.
- Major-faction ownership is not safely exposed as a canonical fact for all
  rows; do not infer from keys.

Improve now:

- No immediate implementation. `EW-CODEX-TRAITS-001` closed as completed/no-op:
  current Trait Type filtering and exact related Minor Faction links already
  cover the safe exported ownership signal.

Exporter-needed:

- Explicit ownership/category semantics for major-faction traits if a stronger
  browse model is desired.

## Units

Scores: UX 8, completeness 8, usefulness 9, trust 7. Confidence: PROVEN.

Verdict: strong combat comparison archive; `/units` remains the route-owned
evolution/explorer surface.

Trace:

- Codex source: `local-imports/codex/ewshop_units_codex_export_0.82.json`.
- Rich source: `local-imports/exports/ewshop_units_export_0.82.json`.
- Rich import supports `/api/units` and `unitStore`.
- Frontend `unitArchive` uses Class/Faction/Tier filters, stat rows, granted
  abilities, and detail-only previous/evolves-into enrichment.

Filtering/completeness:

- No Codex import filter.
- 156 rows; all have Stats and Tier/Class facts.
- Revalidated on 2026-08-19: public unit rows reference `Faction_Tormented`,
  `MinorFaction_Dungeon`, and `MinorFaction_GreenScions`; those targets are
  absent from all current generic Codex files and from available rich
  faction/minor-faction exports.

Improve now:

- FE: unresolved ref diagnostics and small row/detail fallback polish.

Exporter-needed:

- Public canonical evolution metadata only if it must be searchable/filterable
  or external API-visible.

## Victory Conditions

Scores: UX 6, completeness 5, usefulness 6, trust 5. Confidence: PROVEN.

Verdict: useful for QA and direct inspection, but intentionally local-only.

Trace:

- Source:
  `local-imports/codex/ewshop_victory_conditions_codex_export_0.82.json`.
- 6 rows with objective, current value, formula, hold duration, and exact tech
  references.
- Frontend has compact row support but category is `localOnly`.

Filtering/completeness:

- No import filter.
- Existing evidence says `Master` appears as a Victory path value for Supremacy
  and Insights without a matching public `VictoryPath_*` row/reference.
- Revalidated on 2026-08-18: Supremacy and Insights still have `Victory path`
  value `Master` with no `referenceKey`, while `victorypaths-codex` still has
  only `VictoryPath_Enrich` and `VictoryPath_Glorify`.

Improve now:

- FE: keep local-only until `Master` is clarified.

Exporter-needed:

- Clarify/emit/document `Master` Victory Path.

## Victory Paths

Scores: UX 4, completeness 3, usefulness 3, trust 4. Confidence: PROVEN.

Verdict: too thin and data-quality-blocked for public navigation.

Trace:

- Source:
  `local-imports/codex/ewshop_victory_paths_codex_export_0.82.json`.
- 2 rows: not enough to explain all Victory Condition path values.
- Generic local-only rendering.

Filtering/completeness:

- No import filter.
- Local-only visibility prevents the known caveat from becoming public
  navigation.

Improve now:

- FE: keep local-only; no UI investment until data-quality decision.

Exporter-needed:

- Same `Master` clarification as Victory Conditions.
