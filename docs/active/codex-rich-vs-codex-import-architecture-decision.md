# Codex vs Rich Import Architecture Decision

Status: active architecture decision  
Created: 2026-06-21  
Related:

- `docs/active/codex-export-vs-rich-export-boundary.md`
- `docs/active/db-exporter-codex-vs-rich-contract-summary.md`
- `docs/active/codex-rich-import-enrichment-audit.md`
- `docs/active/codex-rich-enrichment-decision-template.md`
- `docs/active/db-exporter-ability-metadata-handoff.md`

## Purpose

This document decides where future Codex enrichment data should live before
EWShop implements rich-import enrichment.

The goal is to avoid two equal mistakes:

- bloating Codex exports until they duplicate rich/domain exports;
- coupling Codex UI directly to route-owned rich page logic.

The chosen architecture is a hybrid per-field ownership model.

## Current Runtime Inventory

| Data family | Source import shape | Backend import/API | Frontend store/query | Current consumer | Codex access classification |
| --- | --- | --- | --- | --- | --- |
| Codex | `local-imports/codex/*`, generic `exportKind` + `entries[]` | `/api/admin/import/codex`, `/api/codex`, `CodexRepository` | `apiClient.getCodex`, `useCodexStore` | `/codex`, SEO, Quest Strategy exact links | Codex-owned and cleanly reusable. |
| Tech rich | `local-imports/exports/ewshop_tech_export_0.82.json`, `techs[]` | `/api/admin/import/techs`, `/api/techs`, `TechRepository` | `apiClient.getTechs`, `useTechStore` | `/tech`, build/share flows | Already imported; reusable through store/selectors, but route UI remains `/tech`-owned. |
| Units rich | `local-imports/exports/ewshop_units_export_0.82.json`, `units[]` | `/api/admin/import/units`, `/api/units`, `UnitRepository` | `apiClient.getUnits`, `useUnitStore` | `/units` evolution explorer, Codex links | Already imported; reusable through store/selectors, but Unit explorer UI remains route-owned. |
| Districts rich | `local-imports/exports/ewshop_districts_export_0.82.json`, `districts[]` | `/api/admin/import/districts`, `/api/districts`, `DistrictRepository` | `apiClient.getDistricts`, `useDistrictStore` | Tech unlock/resource support | Already imported; clean data source, no current rich route. |
| Improvements rich | `local-imports/exports/ewshop_improvements_export_0.82.json`, `improvements[]` | `/api/admin/import/improvements`, `/api/improvements`, `ImprovementRepository` | `apiClient.getImprovements`, `useImprovementStore` | Tech unlock/resource support | Already imported; clean data source, no current rich route. |
| Quest Explorer rich | `local-imports/exports/ewshop_quest_explorer_export_0.82.json`, `entries[]` | `/api/admin/import/quests/explorer`, `/api/quests/explorer`, `QuestExplorerRepository` | `apiClient.getQuestExplorer`, `useQuestStore` | `/quests` Strategy/Lore explorer | Already imported but route-owned; not a safe Codex grouping source. |
| Heroes rich | `local-imports/exports/ewshop_heroes_export_0.82.json`, `units[]` | unsupported local startup export kind today | none | none | Export exists but is not imported. |
| Skills rich | `local-imports/exports/ewshop_skills_export_0.82.json`, skill tree/skill arrays | unsupported local startup export kind today | none | none | Export exists but is not imported. |
| Populations rich | `local-imports/exports/ewshop_populations_export_0.82.json`, `populations[]` | unsupported local startup export kind today | none | none | Export exists but is not imported. |
| Abilities rich | `local-imports/exports/ewshop_abilities_export_0.82.json`, `entries[]` | unsupported local startup export kind today | none | none | Export exists but is not imported. |
| Equipment | Codex export only | Codex API only | `useCodexStore` | `/codex` | Codex-only. |
| Traits | Codex export only | Codex API only | `useCodexStore` | `/codex` | Codex-only. |
| Actions | Codex export only | Codex API only | `useCodexStore` | `/codex` | Codex-only. |
| Diplomacy | Codex export only | Codex API only | `useCodexStore` | `/codex` | Codex-only. |
| Resources/Statuses/Factions/Minor Factions/Councilors/Effects | Codex export only | Codex API only | `useCodexStore` | `/codex` | Codex-only. |

Supported local startup `exports/` kinds are currently `districts`,
`improvements`, `units`, `tech`, and `quest_explorer`. Other rich files may
exist locally, but EWShop currently skips them until import/API/store work is
explicitly added.

## Ownership Decision Rules

### Put Data In Codex Export When

- it is public encyclopedia/archive metadata;
- it is useful for Codex search, filters, archive rows, or simple detail
  inspection;
- it is shallow, stable, and row/detail ready;
- it is an exact public reference to another Codex entry;
- it should be available through the normal Codex API/import path;
- it avoids frontend inference;
- it does not require importing a full domain graph.

Examples: ownership facts, category/type/filter facts, row-ready public effects,
exact public links, stable Codex icon references, and canonical archive grouping
metadata such as Quest grouping identifiers.

### Put Data In Rich/Domain Export When

- it is structured domain logic;
- it powers a rich route or future rich route;
- it represents progression, trees, paths, branches, skill graphs, evolution
  chains, unlock graphs, prerequisites, or deep systems;
- it has diagnostics/internal structure;
- copying it into Codex would turn Codex into a second route.

Examples: Tech prerequisite graph, Unit evolution chain, Hero skill trees, Quest
branches/paths, structured unlock models, and route-specific progression state.

### Use A Frontend Resolver When

- Codex has a shallow entry;
- rich data exists as an exact sibling/domain record;
- the enrichment is EWShop UI-only;
- enrichment is optional and can fail closed;
- it improves detail/profile inspection without becoming the rich route;
- it does not require backend/API canonical semantics.

Resolvers must read from store/helper boundaries, not route components. They must
not infer from names, prose, display titles, old footer strings, SVG filenames,
or key fragments.

Examples: Tech detail prerequisite links from `useTechStore`, Unit detail
previous/evolves-into links from `useUnitStore`, District/Improvement detail
profile fields from their stores, and future Hero skill/profile enrichment after
Hero/Skill import exists.

### Keep In DB Exporter Backlog When

- data is canonical public metadata;
- data is needed by backend/API/non-rich consumers;
- data is missing from both Codex and rich exports;
- data requires explicit ownership, grouping, identity, or stable icon contract;
- rich import cannot safely solve it;
- the alternative would be frontend key/prose/title/SVG inference.

Examples: Ability ownership, Quest canonical archive grouping, Equipment icon
and reference coverage, Trait ownership/category semantics, Action ownership and
reference metadata, and Diplomacy relationship direction/runtime/static
metadata.

## Category Decision Matrix

| Category | Current Codex state | Rich export state | Imported today? | Desired data | Best owner | Risk | First safe action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Abilities | Mature archive; facts/effects/references | Rich ability export exists with tactical profiles and diagnostics | No | Ownership, cleaned roles, optional tactical detail | Split: exporter for public roles/ownership; future resolver only after Ability import | Noisy rich/internal helpers could leak engine data | Keep backlog; defer rich Ability import. |
| Statuses | Mature archive/detail from Codex bonuses | No rich sibling | No | Better type/icon/relationship metadata if source proves it | Codex/exporter backlog only | Frontend inference from names is tempting | Defer until data-quality evidence. |
| Equipment | Mature archive/detail; no rich sibling | None | No | Item icons, missing granted refs | Codex exporter backlog | Fake icon precision | Keep backlog. |
| Traits | Type rail/reference rows | None | No | Ownership/category semantics | Codex exporter backlog | Protectorate/minor-faction wording ambiguity | Keep backlog/defer secondary filters. |
| Actions | Compact archive; sparse public data | None | No | Ownership/reference/browse metadata | Codex exporter backlog | Sparse rows can invite inferred roles | Keep backlog. |
| Diplomacy | Compact archive; treaty metadata/effects | None | No | Relationship direction/runtime/static values, treaty icons | Codex exporter backlog | Runtime-only values may be unstable | Keep backlog. |
| Improvements | Mature archive; Codex effects | Rich export exists and is imported | Yes | Detail profile/constructible/faction/variant inspection | Resolver for UI-only detail; exporter for public row facts | Debug/prototype flags can leak | Defer; possible later detail resolver. |
| Districts | Mature archive; Codex effects/extracts | Rich export exists and is imported | Yes | Detail profile/faction/tier/progression inspection | Resolver for UI-only detail; exporter for canonical tier/progression facts | Variant/repair/prototype flags can leak | Defer; possible later detail resolver. |
| Heroes | Mature archive; no rich import | Hero + Skills rich exports exist | No | Skill/default skill detail, maybe profile data | Add rich importer/store before resolver; exporter for public refs/icons | Importer scope larger than UI polish | Defer until Hero detail value justifies importer. |
| Units | Mature archive; route-owned Units page exists | Rich Unit export exists and is imported | Yes | Detail evolution/profile/grouped abilities | Resolver for UI-only detail; exporter for canonical public evolution if needed | Recreating Unit Explorer inside Codex | Candidate after Tech if detail need is high. |
| Tech | Mature archive; route-owned Tech page exists | Rich Tech export exists and is imported | Yes | Detail prerequisites/exclusive prerequisites | Resolver first; exporter only if canonical API metadata is needed | Duplicating `/tech` tree UI | `CODEX-RICH-001`: Tech detail prerequisite enrichment. |
| Quests | Hidden from top-level Codex; direct/search works | Quest Explorer rich export imported | Yes, but route-owned | Canonical archive grouping | Exporter backlog | Title/key heuristics would reintroduce Quest Explorer logic | Do not use rich Quest export for Codex grouping. |
| Populations | Codex category/reference data | Rich export exists | No | Threshold/worker profile if category evolves | Rich importer + resolver if future UI asks for it | Importer work for small category | Defer. |
| Resources | Shallow reference sheet | None | No | Current data sufficient | Codex export | Low | No action. |
| Factions | Codex entries | None | No | Current data/icon refs mostly sufficient | Codex export/icon manifest | Ownership facts may be missing in other categories | No action. |
| Minor Factions | Codex entries | None | No | Current data sufficient | Codex export | Low | No action. |
| Councilors | Codex entries | None | No | If future category evolves, likely Codex metadata | Codex export | Unknown | Defer. |
| Councilor Effects | Reference sheet | None | No | Current data sufficient | Codex export | Low | No action. |
| Partner Effects | Reference sheet | None | No | Current data sufficient | Codex export | Low | No action. |
| Skills | No Codex category | Rich Skills export exists | No | Hero detail sidecar, maybe future route/category | Rich import first, then resolver; not Codex export by default | Could become separate route/domain | Defer until Hero skill UI is approved. |

## Field-Level Decisions

### Tech Prerequisites

Decision: use rich Tech import/resolver first.

Tech prerequisites and exclusions are already imported through `/api/techs` and
normalized in `useTechStore`. They are structured graph data that powers the
route-owned `/tech` experience, so Codex should not ask the Codex exporter to
duplicate the full graph as row metadata. A Codex detail resolver can show exact
prerequisite links/profile sections from rich Tech data and fail closed when
Tech data is unavailable.

Split: if prerequisites become canonical public Codex/API facts for non-EWShop
consumers, DB Exporter can still add shallow Codex metadata later.

### Unit Evolution

Decision: use rich Unit import/resolver for EWShop detail enrichment; keep
canonical public evolution metadata in backlog only if needed.

Unit previous/evolves-into fields are already imported through `/api/units` and
normalized in `useUnitStore`. Codex detail can surface a compact exact
evolution/profile section, but it must not recreate the Unit Evolution Explorer
or use route UI. If evolution relationships should be searchable/filterable or
public API Codex facts, the exporter should emit them in Codex.

### Hero Skills And Default Skills

Decision: do not use a resolver until Hero/Skills rich imports exist.

Hero and Skills exports exist locally but are unsupported by local startup
import, backend DTOs, API endpoints, and frontend stores. The right sequence is:
add bounded Hero/Skills rich import only when a Hero detail/profile slice needs
it, then build a resolver over the normalized store. Do not copy skill trees into
Codex export unless they become shallow public Codex facts.

### Quest Grouping

Decision: exporter-owned; do not use Quest Explorer rich export.

Quest Explorer data is imported but route-owned and not 1:1 with Codex Quest
records. Codex duplicate-title grouping needs canonical archive grouping
metadata from the exporter. Title grouping, title+chapter grouping, key parsing,
or Quest Explorer branch/path reconstruction are rejected.

### Ability Ownership And Role Cleanup

Decision: exporter-owned for public metadata; future rich Ability resolver is
deferred.

Ability ownership and `Combat role` correctness are player-facing archive facts.
They need canonical exporter metadata. Rich Ability exports contain tactical
profiles and diagnostics, but they are not imported today and include internal
helpers that should not leak into Codex rows. A future resolver can enrich
details only after importer/store work and product approval.

### Equipment Icons And Missing Granted Ability References

Decision: Codex/exporter-owned.

Equipment has no rich sibling today. Exact granted ability references and item
icon references must come through Codex export metadata or a future explicit
Equipment rich import. Frontend should not infer icons or links from item names,
keys, or SVG filenames.

### District And Improvement Planning Data

Decision: split.

District and Improvement rich exports are already imported, so detail/profile
resolvers are technically low-risk. But public row-ready facts, category/tier
semantics, progression chains, and thin-row content remain exporter-owned when
they need to be canonical Codex/API metadata.

### Population Thresholds

Decision: future rich importer/resolver candidate, not immediate Codex exporter
work.

Population rich export has exact threshold/worker data but is not imported
today. If Populations evolves beyond a reference sheet, import rich Populations
and use a resolver for detail/profile inspection. Add exporter backlog only if a
public Codex/API fact is missing after that audit.

## Art/Icon/Portrait Boundary

Codex export should include art metadata only when it is a stable, semantic,
public UI contract:

- stable icon keys intended for Codex;
- exact Codex references that allow existing icon resolvers to resolve an entry;
- explicit faction/minor-faction references when ownership is proven;
- future portrait/art keys when those assets are part of the public Codex
  presentation contract.

Rich/domain exports should include art or asset IDs that are part of a route or
domain model, such as unit art IDs, hero portrait keys, skill icons, or
progression-node visuals.

Frontend asset manifests own mapping stable semantic keys to actual SVG paths.
They may not invent semantics from raw filenames. Frontend must never infer
icons from display names, prose, key fragments, duplicate titles, or SVG
filenames.

Future portraits/unit art should be referenced by explicit exporter-provided
semantic asset keys or domain art IDs, then resolved by a frontend manifest or
asset resolver. Codex should not hardcode filenames in category components.

## Architecture Options

### Option A: Enrich Codex Exports Aggressively

Pros:

- simple frontend API path;
- easy search/filter/detail availability;
- avoids optional resolver loading.

Cons:

- Codex export drifts toward duplicating rich/domain exports;
- route-owned systems may need to be copied or flattened badly;
- exporter backlog grows with EWShop-only presentation needs.

Use only for shallow public metadata, not deep systems.

### Option B: Build Rich Domain Imports And Use Resolvers Everywhere

Pros:

- rich data stays structured;
- avoids bloating Codex;
- enables higher-trust detail pages.

Cons:

- requires new backend/import/API/store work for several categories;
- can couple Codex to route-owned state if unmanaged;
- not all categories have rich siblings;
- may hide exporter-owned public metadata gaps.

Use only when rich data already exists or a rich route/detail slice justifies
importing it.

### Option C: Hybrid Per-Field Ownership

Pros:

- keeps Codex public and searchable;
- keeps deep systems in domain exports;
- lets EWShop enrich detail pages from exact rich siblings;
- keeps exporter backlog focused on canonical public metadata;
- scales category by category.

Cons:

- requires disciplined boundary docs and tests;
- some overlap remains intentionally split;
- resolver failure states must be explicit and calm.

Decision: choose Option C.

## Persona Review

Frontend tech lead: Option C best matches current architecture. Stores already
own normalized Tech, Units, Districts, Improvements, and Quest Explorer data.
Codex should consume small resolver outputs from those stores, not route
components.

Fullstack/backend tech lead: Codex API remains stable and public. New backend
import/API work should be added only for rich exports that justify a domain data
path, not to patch every Codex row.

Backend/API tech lead: DB Exporter backlog should stay focused on canonical
metadata. Rich resolver work must not become a hidden API contract for public
Codex semantics.

4X gamer/product reviewer: players benefit most from richer detail inspection
for Tech/Units/Heroes, but archive rows should stay fast and focused.

Visual UI/UX reviewer: rich data should improve trust and inspection, not add
heavy cards or route-specific widgets into archive rows.

## Roadmap

| Priority | Title | Owner | Data source | Implementation type | Value | Risk | DB exporter? | Backend/API? | Frontend-only? | Validation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `CODEX-RICH-001` Tech detail prerequisite enrichment | EWShop frontend | Existing `/api/techs` + Codex | Resolver + detail section | High: immediate trust/permalink value | Low/medium: avoid duplicating `/tech` | No | No | Yes | Codex tests, Tech store fixture tests, typecheck/build. |
| 2 | `CODEX-RICH-002` Unit detail evolution/profile links | EWShop frontend | Existing `/api/units` + Codex | Resolver + detail section | Medium/high: useful inspection | Medium: avoid Unit Explorer UI | No unless canonical public metadata desired | No | Yes | Codex + Unit store tests. |
| 3 | District/Improvement detail profile resolver | EWShop frontend | Existing `/api/districts`, `/api/improvements` | Resolver + compact detail profile | Medium: detail trust | Medium: debug/prototype leakage | Maybe for canonical facts | No | Yes | Category detail tests. |
| 4 | Hero/Skills rich import spike | EWShop fullstack/frontend | `heroes_export`, `skills_export` | Import/API/store design only | Medium/high: Hero detail skill trust | Higher: new import path | No for spike | Yes | No | Backend import tests + store tests. |
| 5 | Population rich import/resolver | EWShop fullstack/frontend | `populations_export` | Import/API/store + detail resolver | Medium: small category enrichment | Medium: new import for small scope | Maybe later | Yes | No | Import/store/detail tests. |
| 6 | Ability rich import/resolver investigation | EWShop frontend/fullstack | `abilities_export` | Investigation first | Medium: detail tactical trust | High: internal data leakage | Role/ownership remains exporter-owned | Likely yes | No | Audit before code. |
| 7 | Quest canonical archive grouping | DB Exporter | Codex Quest export | Exporter metadata | High visual cleanup | Requires source authority | Yes | Maybe Codex import only | No | Import + Codex route tests. |
| 8 | Equipment/Traits/Actions/Diplomacy metadata backlog | DB Exporter | Codex exports | Exporter cleanup | Medium | Data-source dependent | Yes | Maybe Codex import only | No | Category tests after new metadata. |
| 9 | Art asset contract cleanup | EWShop + DB Exporter | Codex facts/rich art IDs/icon manifest | Explicit semantic icon/portrait contract | Medium/long-term | Asset naming ambiguity | Split | Maybe | No | Icon resolver tests. |

Immediate next step: implement `CODEX-RICH-001` as a small frontend-only Tech
detail resolver. Do not add a generic resolver framework first.

Implementation result:

- `CODEX-RICH-001` proved the first resolver slice on Codex Tech detail pages.
- The resolver reads the existing frontend `useTechStore` data populated from
  `/api/techs`; Codex does not import local rich JSON directly.
- The current Tech API DTO exposes one `prereq` and one `excludes` field, while
  the resolver also tolerates future
  `technologyPrerequisiteTechKeys`/`exclusiveTechnologyPrerequisiteTechKeys`
  arrays if the API later carries them.
- Only exact public Codex Tech `entryKey` targets render as inline
  link/tooltip affordances.
- Archive rows, the `/tech` route, and backend/exporter contracts remain
  unchanged.

Second implementation result:

- `CODEX-RICH-002` proved the same resolver pattern on Codex Unit detail pages.
- The resolver reads the existing frontend `useUnitStore` data populated from
  `/api/units`; Codex does not import local rich Unit JSON directly.
- The runtime Unit DTO fields used are `unitKey`, `previousUnitKey`, and
  `nextEvolutionUnitKeys`. `evolutionTierIndex` remains available in the DTO but
  was not surfaced in this first slice because tier display has route-specific
  nuance and existing Codex facts already carry public Tier.
- Only exact public Codex Unit targets render as inline link/tooltip
  affordances.
- Rich Unit `abilityKeys` were intentionally not rendered in this first slice
  because Unit Codex details already preview granted abilities from Codex
  sections, and the current DTO does not expose the raw grouped helper ability
  fields from the audit.
- Archive rows, the `/units` route, and backend/exporter contracts remain
  unchanged.

## No-Go / Deferred

- Do not use Quest Explorer export to group Codex Quest rows.
- Do not parse keys for ownership, grouping, faction icons, or progression.
- Do not infer icon/art choices from SVG filenames.
- Do not import Hero/Skills/Populations/Abilities rich exports casually just
  because files exist.
- Do not copy rich route widgets into Codex detail pages.
- Do not delete exporter backlog items simply because a resolver can solve an
  EWShop-only detail display.

## Open Questions

- Should optional rich resolver data be loaded on Codex page mount, per category
  route, or only after entering an enriched detail page?
- Should `/api/techs` eventually expose the full imported prerequisite arrays,
  or is the current single `prereq`/`excludes` DTO enough for EWShop detail
  enrichment?
- Should resolver tests live beside `frontend/src/lib/codex/` or under a future
  `frontend/src/features/codex-enrichment/` area?
- Should District/Improvement existing stores be considered enough for Codex
  enrichment, or should those categories wait until players ask for richer
  detail inspection?
- What public art key contract should future portraits use?

## Final Recommendation

Use the hybrid per-field ownership architecture.

Codex export should stay the public encyclopedia/search/archive contract. Rich
exports should stay structured domain data. Frontend resolvers may enrich Codex
only from exact imported sibling data, through store/helper boundaries, with
fail-closed behavior. DB Exporter backlog remains the right place for explicit
ownership, grouping, identity, reference coverage, and stable public icon/art
metadata.

`CODEX-RICH-001` and `CODEX-RICH-002` proved the resolver architecture, but
also showed that player value can be modest even when implementation risk is
low. Keep those slices as bounded detail-only proof-of-pattern work.

Before starting any additional rich resolver work, use
`docs/active/codex-rich-enrichment-decision-template.md`.

Default posture after the Tech and Unit pilots:

- do not start another resolver simply because a rich export exists;
- prefer exporter backlog items for canonical public metadata such as ownership,
  grouping, identity, reference coverage, and icon contracts;
- prefer defer/no-op when player value is below the template threshold.
