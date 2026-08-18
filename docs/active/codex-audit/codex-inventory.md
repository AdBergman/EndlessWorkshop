# Codex Inventory

## Source Inventory

Current local snapshot:

- Codex exports: 22 files in `local-imports/codex/`.
- Rich/domain exports: 10 files in `local-imports/exports/`.
- Normalized Codex categories after EWShop import/frontend classification: 24.

Generic Codex import path:

- Local startup reads `local-imports/codex/*` with `entries[]` at
  `app/src/main/java/ewshop/app/importing/LocalStartupImportRunner.java:379`.
- Manual import endpoint is `POST /api/admin/import/codex` at
  `api/src/main/java/ewshop/api/controller/ImportAdminController.java:154`.
- `CodexImportMapper` preserves display name, category, kind, description
  lines, reference keys, facts, sections, public context keys, and `svgIcon` at
  `facade/src/main/java/ewshop/facade/mapper/CodexImportMapper.java:41`.
- `CodexImportService` applies public-release filters only to `actions`,
  `bonuses`, `quests`, and `traits` at
  `domain/src/main/java/ewshop/domain/service/CodexImportService.java:39`.
- Public API endpoints are `GET /api/codex` and `GET /api/codex/summary` at
  `api/src/main/java/ewshop/api/controller/CodexController.java:13`.
- Frontend loads `/codex` through `apiClient.getCodex` and `useCodexStore`;
  bonus-derived rows are normalized into `statuses` and `modifiers` at
  `frontend/src/stores/codexStore.ts:139`.

Rich import support:

- `LocalStartupImportRunner` imports rich `tech`, `districts`, `improvements`,
  `units`, `factions`, `heroes`, `skills`, and `quest_explorer` at
  `app/src/main/java/ewshop/app/importing/LocalStartupImportRunner.java:290`.
- Rich `abilities` and `populations` files exist locally but are not imported.

Top-level visibility:

- Hidden top-level kinds: `bonuses`, `extractors`, `modifiers`, `quests`.
- Local-only top-level kinds: `victoryconditions`, `victorypaths`.
- Full-width reference overview kinds: `counciloreffects`, `naturalwonders`,
  `partnereffects`, `resources`.
- Evidence:
  `frontend/src/lib/codex/codexCategoryConfig.ts:46`.

## Master Table

Counts are post-import-kind normalization where practical: `Extractor_*`
District rows become `extractors`; `bonuses` rows become `statuses` or
`modifiers`.

| Category | Route / visibility | Count | Source/export kind | Generic/rich source | Backend importer/storage/API | Frontend loader/renderer | Filters/sorting/links/icons | UX | Complete | Useful | Trust | Confidence | Highest-priority issue |
| --- | --- | ---: | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| Abilities | `/codex?category=abilities`, public | 335 | `abilities` Codex; rich abilities skipped | Generic Codex only in runtime | Codex import -> `codex` -> `/api/codex` | `abilityArchive`; fact filters, ability rows/details | No import filter; explicit `svgIcon` for 331 rows; exact status refs partly unresolved | 8 | 7 | 8 | 7 | PROVEN | Role/ownership metadata remains incomplete/noisy. |
| Actions | `/codex?category=actions`, public | 128 imported from 139 raw | `actions` | Generic Codex | Codex import with public-release action gate | `actionArchive`; Category rail; shallow rows | 11 release-filtered rows; mechanics suppressed in archive; generic action icon | 6 | 5 | 5 | 6 | PROVEN | Sparse/noisy mechanics and missing ownership/faction facts. |
| Councilors | `/codex?category=councilors`, public | 43 | `councilors` | Generic Codex | Codex import no category-specific filter | Generic renderer | No councilor filter; exact councilor/partner/faction refs resolve | 5 | 6 | 6 | 7 | PROVEN | Completeness concern unproven; needs source/exporter confirmation before requests. |
| Councilor Effects | `/codex?category=counciloreffects`, public | 42 | `councilorEffects` | Generic Codex | Codex import | `referenceSheet`; full-width overview | No filter; effect lines; generic councilor icon | 7 | 7 | 6 | 8 | PROVEN | Low urgency; could add Role rail only if browsing proves needed. |
| Diplomacy | `/codex?category=diplomatictreaties`, public label Diplomacy | 22 | `diplomaticTreaties` | Generic Codex | Codex import | `diplomacyArchive`; Treaty Category rail | No filter; exact status links; generic diplomacy icon | 7 | 6 | 6 | 7 | PROVEN | Runtime/static treaty values and direction metadata are absent. |
| Districts | `/codex?category=districts`, public | 101 plus 66 extractors split out | `districts` Codex and rich districts | Generic + imported rich | Codex import; rich `/api/districts` | `districtArchive`; detail constructible enrichment | Extractors reclassified; Category/Tier rails; rich placement only partly preserved | 7 | 6 | 7 | 7 | PROVEN | Rich placement terrain/river/POI data is lost by EWShop pipeline. |
| Extractors | hidden top-level; direct/search/link support | 66 | `districts` rows with `Extractor_` prefix | Generic + rich district source | `CodexImportMapper` reclassifies to `extractors` | Shallow support rows, exact resource links | Hidden top-level; resource-token icons from display/key | 6 | 6 | 6 | 8 | PROVEN | Useful as support refs; rich POI placement not preserved. |
| Equipment | `/codex?category=equipment`, public | 160 | `equipment` | Generic Codex only | Codex import | `equipmentArchive`; Type/Rarity filters | No filter; granted ability refs; category icon only | 8 | 7 | 8 | 7 | PROVEN | Item icons and some granted ability refs are missing. |
| Factions | `/codex?category=factions`, public | 5 Codex; rich factions 21 imported | `factions` Codex + rich factions | Generic + rich detail enrichment | Codex import; `/api/factions` | Generic/archive detail enriched | No Codex filter; major faction icon resolver; exact package links | 7 | 7 | 8 | 7 | PROVEN | Best next product opportunity is faction profile/strategy shape. |
| Heroes | `/codex?category=heroes`, public | 79 Codex; rich heroes/skills imported | `heroes` Codex; rich heroes/skills | Generic + rich detail enrichment | Codex import; `/api/heroes`, `/api/skills` | `heroArchive`; detail profile/skills | No Codex filter; class/faction rail; generic/faction icons | 8 | 7 | 8 | 7 | PROVEN | Hero skill tier/progression and portraits remain explicit-contract gaps. |
| Improvements | `/codex?category=improvements`, public | 123 | `improvements` Codex + rich improvements | Generic + imported rich | Codex import; `/api/improvements` | `improvementArchive`; detail constructible enrichment | No filter; Category rail; rich placement only partly preserved | 7 | 6 | 7 | 7 | PROVEN | Rich placement/resource prerequisite data is not fully preserved/rendered. |
| Minor Factions | `/codex?category=minorfactions`, public | 16 Codex; rich factions include 16 minor-ish rows | `minorFactions` Codex + rich factions | Generic + rich detail enrichment | Codex import; `/api/factions` | Generic detail enriched | No filter; faction icon resolver; exact package links | 6 | 7 | 7 | 7 | PROVEN | Some protectorate/minor links remain unresolved or naming-inconsistent. |
| Modifiers | hidden top-level; search/direct inspection | 248 imported from 250 raw | `bonuses` -> `modifiers` | Generic Codex | Codex import with bonus gate | Generic hidden/support renderer | 2 release-filtered rows; top-level hidden; no provenance | 4 | 5 | 4 | 5 | PROVEN | Lacks source/provenance metadata, so player value is limited. |
| Wonders | `/codex?category=naturalwonders`, public label Wonders | 6 | `naturalwonders` | Generic Codex | Codex import | `referenceSheet`; full-width overview | No filter; generic wonder icon; effect/footprint facts | 7 | 6 | 6 | 8 | PROVEN | Thin but acceptable; no live placement/discovery data expected. |
| Partner Effects | `/codex?category=partnereffects`, public | 39 | `partnerEffects` | Generic Codex | Codex import | `referenceSheet`; full-width overview | No filter; effect rows; generic icon | 7 | 7 | 6 | 8 | PROVEN | Low urgency; source councilor backlinks are implicit via exact refs. |
| Populations | `/codex?category=populations`, public | 26 Codex; rich populations skipped | `populations` Codex; rich populations not imported | Generic Codex | Codex import | `populationArchive`; Type rail and effect rows | No filter; exact faction/threshold refs; generic population icon | 7 | 7 | 7 | 7 | PROVEN | Rich population source exists but is not imported; current UI is adequate. |
| Quests | hidden top-level; search/direct; `/quests` route-owned explorer | 300 Codex; 156 rich Quest Explorer entries | `quests` Codex; `quest_explorer` rich | Codex + route-owned rich | Codex import; `/api/quests/explorer` | `questArchive` when direct; hidden nav | No current release filter impact; titles/branches not safe for grouping | 4 | 5 | 4 | 6 | PROVEN | Do not rebuild Quest Explorer in Codex; needs exporter questline projection only if revived. |
| Resources | `/codex?category=resources`, public | 24 | `resources` | Generic Codex | Codex import | `referenceSheet`; full-width overview | No filter; exact extractor links; token icons | 8 | 8 | 7 | 8 | PROVEN | No major issue; keep as benchmark reference sheet. |
| Statuses | `/codex?category=statuses`, public | 337 | `bonuses` -> `statuses` | Generic Codex | Codex import; bonus normalization | `statusArchive`; scope rail/detail relationships | No status filter; exact inbound refs; generic status icon | 8 | 7 | 8 | 7 | PROVEN | Some ability status references unresolved; role/polarity polish remains bounded. |
| Tech | `/codex?category=tech`, public; `/tech` route-owned explorer | 133 Codex; rich tech imported | `tech` Codex + rich tech | Generic + rich detail enrichment | Codex import; `/api/techs` | `techArchive`; detail prereq enrichment | No filter; Era/Quadrant/Faction rail; exact unlock links | 8 | 8 | 9 | 7 | PROVEN | Keep Codex as archive; avoid duplicating `/tech` progression route. |
| Traits | `/codex?category=traits`, public | 122 imported from 178 raw | `traits` | Generic Codex only | Codex import with faction-trait release gate | `traitArchive`; Type rail/reference rows | 56 release-filtered faction/custom traits; no explicit major ownership | 7 | 6 | 7 | 6 | PROVEN | Major-faction ownership/category semantics need explicit metadata. |
| Units | `/codex?category=units`, public; `/units` route-owned explorer | 156 Codex; rich units imported | `units` Codex + rich units | Generic + rich detail enrichment | Codex import; `/api/units` | `unitArchive`; detail evolution enrichment | No filter; Class/Faction/Tier rail; exact abilities mostly resolve | 8 | 8 | 9 | 7 | PROVEN | Evolution is detail-only; public canonical evolution metadata remains split. |
| Victory Conditions | local/dev top-level; direct route | 6 | `victoryconditions` | Generic Codex | Codex import | local-only archive rows | Local-only; exact tech/path refs; no public top-level | 6 | 5 | 6 | 5 | PROVEN | `Master` path mismatch keeps Victory local-only. |
| Victory Paths | local/dev top-level; direct route | 2 | `victorypaths` | Generic Codex | Codex import | generic/local-only | Local-only; references not enough for complete path model | 4 | 3 | 3 | 4 | PROVEN | Missing/ambiguous `Master` public path row/reference. |

## Category Breakdown

- Public top-level categories: Abilities, Actions, Councilors, Councilor
  Effects, Diplomacy, Districts, Equipment, Factions, Heroes, Improvements,
  Minor Factions, Wonders, Partner Effects, Populations, Resources, Statuses,
  Tech, Traits, Units.
- Hidden/support categories: Extractors, Modifiers, Quests.
- Local-only QA/product-review categories: Victory Conditions, Victory Paths.
- Mature/specialized archive modes: Abilities, Actions, Diplomacy, Districts,
  Equipment, Heroes, Improvements, Populations, Statuses, Tech, Traits, Units.
- Reference-sheet modes: Councilor Effects, Partner Effects, Resources, Wonders.
- Generic detail/overview modes: Councilors, Factions, Minor Factions,
  Modifiers, Victory Paths.

## Import-Filter Counts

Simulated from `CodexImportMapper`, `CodexImportService`, and frontend bonus
normalization against local 0.82 JSON:

| Normalized kind | Raw public-kind rows | Imported rows | Import-filtered examples |
| --- | ---: | ---: | --- |
| actions | 139 | 128 | `ActionTypeRaiseSandRuin`, `ConstructibleAction_TerraformationBiomeSandBanks`, SandShaper action rows |
| modifiers | 250 | 248 | `ActionCostModifier_RaiseRuin_Decrease_00`, `FactionTrait_ConstructibleCostModifierDefinition_KinOfSheredyn_03` |
| traits | 178 | 122 | unreleased/custom `FactionTrait_*` rows |
| all other normalized kinds | unchanged | unchanged | no category-specific Codex import filter found |

## Cross-Link Snapshot

Reference-key resolution from local JSON is generally strong but not complete.
`EW-CODEX-REL-001` added `npm run diagnostics:codex-references` so unresolved
clusters can be regenerated deterministically with source entry context.
Important unresolved clusters:

- Abilities: 5 unresolved `Status_*` references.
- Factions: 10 unresolved refs, including `District_Base_CityCenter_Tier1` and
  some `UnitAbility_*` keys.
- Heroes: 10 unresolved refs, including `Faction_Hero` and some hero-specific
  ability keys.
- Improvements: 16 unresolved effect-style refs such as
  `KinOfSheredyn_Effect_DistrictImprovement_02`.
- Tech: 8 unresolved constructible/unit/ability-style unlock refs.
- Units: 8 unresolved faction/minor-faction refs.
- Modifiers: 74 unresolved refs, expectedly noisy and hidden.

These counts are diagnostic, not automatic exporter requests: some unresolved
refs point at hidden/support rows or non-public implementation records.
