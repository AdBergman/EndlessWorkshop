# Final Snapshot Import Hygiene Audit

Status: active audit  
Created: 2026-06-23

## Executive Recommendation

Release is not blocked by import hygiene.

The final snapshot contains noisy, internal, and diagnostic-looking data, but the
important safety boundaries mostly hold:

- Diagnostics-only Codex exports are explicitly skipped by startup import.
- Unsupported rich exports, including rich `abilities` and `populations`, are
  skipped rather than partially imported.
- Public Codex exports import generically and preserve `facts`, `sections`,
  `referenceKeys`, and `svgIcon`.
- Noisy support categories such as `modifiers` and `quests` are hidden from
  top-level Codex browsing while remaining direct/search-linkable.
- Victory Paths and Victory Conditions remain local/dev-visible only.
- Rich District/Improvement APIs expose only the planning-safe fields currently
  needed by Codex enrichment, not raw cost formulas or raw resource IDs.

Recommended next action: add a small EWShop hardening ticket for diagnostics
deny-list coverage and keep the existing DB Exporter follow-ups open. Do not
ask DB Exporter for broad cleanup just because noisy data exists locally.

## Scope And Evidence

Reviewed:

- `local-imports/codex/*`
- `local-imports/exports/*`
- `app/src/main/java/ewshop/app/importing/LocalStartupImportRunner.java`
- backend import DTO/domain/facade/API response shapes
- frontend API clients, stores, Codex category visibility, and enrichment
  helpers
- current DB Exporter handoff ledger and final snapshot release readiness docs

This audit focuses on what reaches DB/API/UI. Local JSON content alone is not a
product problem unless EWShop imports, exposes, or renders it in a player-facing
surface.

## Import Boundary Summary

Startup import is local/dev-only and runs only for `dev`, `local`, `ai`, or
`codex` profiles when `ewshop.local-import.enabled=true`.

`local-imports/codex/` uses the generic Codex `entries[]` contract. Known
diagnostics-only Codex export kinds are skipped:

- `quest_explorer_branch_diagnostics`
- `actions-codex-inventory`
- `bonuses-codex-mechanics`
- `victorycondition-threshold-diagnostics`

`local-imports/exports/` is allow-listed. Supported rich export kinds are:

- `tech`
- `districts`
- `improvements`
- `units`
- `factions`
- `heroes`
- `skills`
- `quest_explorer`

Unsupported rich export kinds are skipped with a log warning.

## Public Codex File Classification

| File / Export Kind | Imported | Persisted | API Exposed | Frontend Consumed | Player Visible | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| `ewshop_abilities_codex_export_0.82.json` / `abilities` | yes | yes | yes | yes | public archive/detail | Low. Ability role quality remains an exporter follow-up, but row/detail UI already demotes noisy roles. |
| `ewshop_actions_codex_export_0.82.json` / `actions` | yes | yes | yes | yes | public shallow archive/detail | Medium-low. Action details preserve exact modifier links, but archive rows suppress noisy mechanics. |
| `ewshop_bonuses_codex_export_0.82.json` / `bonuses` | yes | yes | yes | yes | statuses public; modifiers hidden/direct-linkable | Medium. Modifier entries are noisy by nature and lack provenance, but they are not top-level public browsing content. |
| `ewshop_councilor_effects_codex_export_0.82.json` / `councilorEffects` | yes | yes | yes | yes | public reference sheet | Low. |
| `ewshop_councilors_codex_export_0.82.json` / `councilors` | yes | yes | yes | yes | public generic Codex | Low. |
| `ewshop_diplomatic_treaties_codex_export_0.82.json` / `diplomaticTreaties` | yes | yes | yes | yes | public Diplomacy archive/detail | Low. |
| `ewshop_districts_codex_export_0.82.json` / `districts` | yes | yes | yes | yes | public archive/detail | Low. Rich enrichment is detail-only and exact-ref based. |
| `ewshop_equipment_codex_export_0.82.json` / `equipment` | yes | yes | yes | yes | public archive/detail | Low. |
| `ewshop_factions_codex_export_0.82.json` / `factions` | yes | yes | yes | yes | public generic/detail enriched | Low. |
| `ewshop_heroes_codex_export_0.82.json` / `heroes` | yes | yes | yes | yes | public archive/detail enriched | Low. Rich skill helper data is not rendered directly. |
| `ewshop_improvements_codex_export_0.82.json` / `improvements` | yes | yes | yes | yes | public archive/detail | Low. Rich enrichment is detail-only and exact-ref based. |
| `ewshop_minor_factions_codex_export_0.82.json` / `minorFactions` | yes | yes | yes | yes | public generic/detail enriched | Low. |
| `ewshop_natural_wonders_codex_export_0.82.json` / `naturalwonders` | yes | yes | yes | yes | public `Wonders` reference overview/detail | Low. |
| `ewshop_partner_effects_codex_export_0.82.json` / `partnerEffects` | yes | yes | yes | yes | public reference sheet | Low. |
| `ewshop_populations_codex_export_0.82.json` / `populations` | yes | yes | yes | yes | public archive/detail | Low. Rich population export is not imported. |
| `ewshop_quests_codex_export_0.82.json` / `quests` | yes | yes | yes | yes | hidden top-level; direct/search-linkable | Medium. Duplicate/noisy quest records remain available, but `/quests` owns quest browsing. |
| `ewshop_resources_codex_export_0.82.json` / `resources` | yes | yes | yes | yes | public reference sheet | Low. |
| `ewshop_tech_codex_export_0.82.json` / `tech` | yes | yes | yes | yes | public archive/detail enriched | Low. |
| `ewshop_traits_codex_export_0.82.json` / `traits` | yes | yes | yes | yes | public reference/archive hybrid | Low. |
| `ewshop_units_codex_export_0.82.json` / `units` | yes | yes | yes | yes | public archive/detail enriched | Low. |
| `ewshop_victory_conditions_codex_export_0.82.json` / `victoryconditions` | yes | yes | yes | yes | local/dev top-level only; direct route | Medium. Local-only due product/data quality concerns. |
| `ewshop_victory_paths_codex_export_0.82.json` / `victorypaths` | yes | yes | yes | yes | local/dev top-level only; direct route | Medium. `Master` path reference remains unresolved by exporter data. |

## Rich Export File Classification

| File / Export Kind | Imported | Persisted | API Exposed | Frontend Consumed | Player Visible | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| `ewshop_abilities_export_0.82.json` / `abilities` | skipped | no | no | no | no | Safe. Contains helper/internal ability data and diagnostics; public Codex uses `abilities-codex`. |
| `ewshop_districts_export_0.82.json` / `districts` | yes | yes | `/api/districts` | `districtStore` | detail enrichment only | Low-medium. Raw resource IDs/RPN exist locally, but current DTO/UI expose only unlock tech, level-up, and limited placement. |
| `ewshop_factions_export_0.82.json` / `factions` | yes | yes | `/api/factions` | `factionStore` | Codex faction detail enrichment | Low. Mapper keys in JSON are not exposed in the API DTO. |
| `ewshop_heroes_export_0.82.json` / `heroes` | yes | yes | `/api/heroes` | `heroStore` | Codex hero detail enrichment | Medium-low. Helper ability keys are preserved as source truth but filtered from rendered starting-skill primary ability links. |
| `ewshop_improvements_export_0.82.json` / `improvements` | yes | yes | `/api/improvements` | `improvementStore` | detail enrichment only | Low-medium. Raw resource IDs/RPN exist locally, but current DTO/UI expose only unlock tech and limited placement. |
| `ewshop_populations_export_0.82.json` / `populations` | skipped | no | no | no | no | Safe. Public population UI uses `populations-codex`; rich population import is deferred. |
| `ewshop_quest_explorer_export_0.82.json` / `quest_explorer` | yes | yes | `/api/quests/explorer` | `questStore` | `/quests`, not Codex | Low-medium. Route-owned data may contain diagnostics/evidence fields, but Quest Explorer owns rendering and Codex does not consume it. |
| `ewshop_skills_export_0.82.json` / `skills` | yes | yes | `/api/skills` | `skillStore` | Codex hero detail enrichment only | Medium-low. Raw sidecar keys are preserved, but no public Skills category or planner exists. |
| `ewshop_tech_export_0.82.json` / `tech` | yes | yes | `/api/techs` | `techStore` | existing tech/rich enrichment surfaces | Low-medium. Descriptor/modifier keys are source truth; public Codex uses exact projected fields. |
| `ewshop_units_export_0.82.json` / `units` | yes | yes | `/api/units` | `unitStore` | existing unit/rich enrichment surfaces | Low-medium. Helper/class keys are source truth; current public rendering uses bounded unit presentation. |

## High-Risk Findings

### 1. Generic Codex Import Needs Continued Diagnostics Deny-List Discipline

EWShop intentionally imports any Codex file with `entries[]`, except known
diagnostics-only `exportKind` values. This is flexible and useful, but a future
diagnostics file with a new `exportKind` and `entries[]` shape could be imported
until the deny-list is updated.

Owner: EWShop.  
Severity: medium, not release-blocking.  
Recommended action: add/keep tests around diagnostics deny-list behavior and
update the deny-list whenever DB Exporter introduces diagnostics-only Codex
exports.

### 2. Bonuses Split Uses Existing Compatibility Heuristics

`bonuses-codex` imports generically, then the frontend normalizes entries into
`statuses` and `modifiers`. It prefers exported `category`/`kind`, but also has
legacy key-based fallbacks for status/modifier classification.

Owner: split. EWShop owns the compatibility shim; DB Exporter should continue
emitting explicit public category/kind metadata.  
Severity: medium-low.  
Release impact: not blocking. The safety default is acceptable because
`bonuses` and `modifiers` are hidden from top-level navigation.

### 3. Modifiers Are Preserved But Lack Provenance

Modifier records are imported, persisted, API-exposed, and direct/search
available, but hidden from top-level Codex browsing. EWShop can resolve exact
Action -> Modifier and Modifier -> affected Action links, but cannot safely say
what grants a modifier.

Owner: DB Exporter for explicit provenance metadata; EWShop for keeping
Modifiers hidden and not promoting them.  
Severity: medium-low.  
Release impact: not blocking.

### 4. Quest Codex Records Are Noisy But Safely De-Prioritized

Quest Codex records import and remain direct/search-linkable. They are hidden
from top-level Codex browsing because repeated titles are not safe grouping
keys, and `/quests` owns the rich quest experience.

Owner: product/EWShop for keeping Codex Quests hidden; DB Exporter only if a
future public Questline encyclopedia projection is explicitly requested.  
Severity: medium-low.  
Release impact: not blocking.

### 5. Victory Remains Local-Only For Validated Data Quality Reasons

Victory Paths and Victory Conditions import and are direct-routable. They are
local/dev-visible in top-level navigation, not public. `Master` appears as a
Victory path value for Supremacy/Insights, but no matching public Victory Path
entry/reference exists.

Owner: DB Exporter for `Master` clarification; EWShop for keeping Victory
local-only until product/data quality improves.  
Severity: medium.  
Release impact: not blocking because public top-level visibility is suppressed.

### 6. Hero/Skill APIs Preserve Helper Data, UI Fails Closed

Rich Hero and Skill APIs intentionally preserve helper/internal key arrays such
as hidden helper ability keys and skill sidecar keys. Codex Hero detail
enrichment renders only starting skills, non-hidden skill paths, summaries, and
primary ability links when exact public Codex Ability targets resolve.

Owner: EWShop.  
Severity: medium-low.  
Release impact: not blocking. Do not add a public Skills category or planner
without a separate product slice.

### 7. Constructible Raw Resource Prerequisites Exist Locally But Are Not Rendered

Rich District/Improvement exports contain raw resource IDs and RPN/cost data.
Current DTO/UI enrichment exposes only unlock tech links, district level-up
links, and limited player-facing placement text.

Owner: DB Exporter if public resource prerequisite display is desired later;
EWShop for continuing to suppress raw resource IDs and formula dumps.  
Severity: medium-low.  
Release impact: not blocking.

## Safe / No-Action Findings

- Rich `abilities` export is skipped; public Ability Codex data remains the
  supported player-facing import.
- Rich `populations` export is skipped; public Population Codex data is enough
  for the current archive foundation.
- `advisorUIMapperKey` appears in rich faction JSON but is not exposed in
  `FactionDto`.
- Raw construction cost/RPN data appears in rich District/Improvement JSON but
  is not exposed in current API DTOs.
- Natural Wonders are public as a shallow `Wonders` reference overview and do
  not expose live map/discovery/ownership state.
- Victory local-only behavior is a product safety boundary, not an importer
  failure.

## EWShop Fixes Needed

No release-blocking EWShop fixes were found.

Recommended follow-up:

1. Add a small diagnostics deny-list hardening ticket if it is not already
   covered by tests. The generic Codex importer is correct, but diagnostics
   safety depends on maintaining the deny-list.
2. Keep Modifiers, Quests, and Victory categories suppressed according to their
   current visibility rules.
3. Avoid adding rich population, rich ability, public Skills, Victory, or Quest
   grouping work as part of import hygiene.

## DB Exporter Follow-Ups

No new exporter-owned findings were discovered by this audit.

Existing validated follow-ups remain:

- Victory Path `Master` public/non-public clarification.
- Modifier provenance metadata.
- Hero full selectable skill progression metadata/art contracts, if a future
  hero planner is desired.
- Constructible public resource prerequisite refs/display metadata, if future
  planning UI needs them.
- Ability role/ownership metadata cleanup.

## Release Blocker Decision

Import hygiene does not block release.

Release readiness still depends on the normal product/code state of the working
tree, especially whether current uncommitted constructible planning work is
included, excluded, or committed.
