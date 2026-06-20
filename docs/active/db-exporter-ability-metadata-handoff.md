# DB Exporter Ability Metadata Handoff

Status: active exporter follow-up
Created: 2026-06-20
Owner: DB Exporter team primarily; EWShop frontend as metadata consumer

## Purpose

Ability Archive UI work exposed two exporter-owned metadata issues:

- `Combat role` currently includes engine/mechanic tags that do not always match
  what a player can see in the public effect text.
- Ability faction/origin ownership is not explicitly available to the frontend.

This is a focused follow-up. It does not reopen the completed
`DB-CODEX-DEF-*` response/import QA pass, and it does not request frontend-side
inference from ability keys, display names, old context strings, or prose.

## Current Source Documents Audited

Keep active:

- `docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-definitive-response.md`
  - baseline for the current `Ability mechanic`, `Ability source`, and
  `Combat role` exports.
- `docs/active/codex-db-exporter-response-ewshop-reconciliation.md`
  - closed EWShop reconciliation for the definitive exporter response.
- `docs/active/codex-db-exporter-response-import-qa-results.md`
  - current import/API/browser QA pass record for snapshot `20260616-210540`.
- `docs/active/codex-content-quality-diagnostics.md`
  - current workflow for separating EWShop display work from exporter/content
  follow-up.
- `docs/frontend/svg-icon-contracts.md`
  - current frontend-safe icon contract guidance: do not hardcode icon filenames
  or infer icons from raw keys.

Historical context already archived:

- `docs/archive/codex/db-exporter-codex-metadata-handoff-2026-06-10.md`
- `docs/archive/codex/db-exporter-codex-reference-kinds-handoff-2026-06-10.md`
- `docs/archive/codex/codex-metadata-adoption-audit-2026-06-11.md`
- `docs/archive/codex/superseded-2026-06-13-exporter-packet-inputs/`
- `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/`
- `docs/archive/codex/superseded-2026-06-17-premium-ui-baseline/`

No additional docs were archived in this pass. The older
`docs/archive/exporter-handoffs/exporter-handoff-status.md` remains a general
historical/status note, but its DB Exporter pointers are not the current source
of truth for this handoff.

## Current Ability Metadata Baseline

The definitive response says `abilities-codex` now exports additive facts:

- `Ability mechanic`
- `Ability source`
- `Combat role`
- existing `Kind`
- existing `Category`

Current known `Combat role` counts from the accepted snapshot:

- Action token: 3
- Damage: 60
- Heal: 24
- Movement: 91
- Push: 12
- Reactivate skill: 12
- Shield: 48
- Status apply: 70 (current label; target label is `Apply Status`)
- Status remove: 15 (current label; target label is `Remove Status`)
- Summon: 12
- Teleport: 17
- True damage: 59

EWShop currently consumes these values as exported facts only. The frontend does
not derive role values from names, keys, descriptions, hero pages, equipment
pages, or old secondary-context strings.

## Problem 1: Combat Role Is Too Noisy

`Combat role` should be a player-facing gameplay browse/filter label. It should
describe what the public ability does, not every internal effect implementation
tag that contributed to the formula.

Observed bad examples:

- `Choral Onslaught` currently appears with roles like `Damage`, `Movement`,
  `Status apply`, and `True damage`, while the visible public effects support
  damage plus status application. `Movement` and `True damage` appear to be
  implementation leakage.
- `Accusation` can similarly surface `Movement` and `True damage` despite the
  player-facing read being defense ignore, hero damage scaling, determination
  damage, and Weakened application.
- `Power Slash` variants have been observed with `Movement`, `Status remove`,
  and `True damage` even when the public row reads as a direct damage ability.
- `Second Wind` has shown movement/reactivation/shield-style roles while the
  player-facing text reads closer to heal/status application.
- `Rallying Cry` has shown shield-style role leakage while the visible effects
  read closer to damage/status application.
- `Anti Cavalry` reads like a conditional damage modifier and should be reviewed
  against the Damage role rule.

## Combat Role Cleanup Requirements

The exporter should revise role assignment rules so each exported role is
supported by public, player-facing ability content.

General rules:

- Use explicit source data only.
- Do not infer role from ability key, display name, prose, hero ownership,
  equipment ownership, or old context/footer strings.
- Prefer visible/public effect semantics over raw low-level implementation tags.
- Treat role absence as "no proven public role", not as a frontend issue.
- Keep comma-separated `Combat role` values only when each role is independently
  proven by public source data.

Role cleanup must review both noisy extra roles and wrong or missing role
categories. For example, abilities that visibly apply statuses should receive
`Apply Status`; abilities that visibly remove, cleanse, or dispel statuses
should receive `Remove Status`; neither status role should be assigned from
hidden implementation effects alone.

Use player-facing role labels. The canonical future labels should be:

- `Apply Status`, not `Status apply`
- `Remove Status`, not `Status remove`

EWShop may temporarily map the older labels for compatibility while imports
transition, but the exporter-owned target labels should be the canonical values.

Recommended role taxonomy:

- `Damage`
- `Shield`
- `Heal`
- `Movement`
- `Teleport`
- `Push`
- `Summon`
- `Apply Status`
- `Remove Status`
- `Reactivate skill`

Review before keeping as browse/filter roles:

- `True damage`
- `Action token`

These may be useful detail-page mechanics, but they often read as implementation
or formula details rather than first-class player browse roles. If retained,
they need stricter player-facing assignment rules.

Specific rule guidance:

- `Damage`: emit when public text/effect lines show direct damage, conditional
  damage bonus, or percent/scaling damage.
- `Shield`: emit only when public text/effect lines clearly grant or interact
  with shields.
- `Heal`: emit when public text/effect lines clearly restore health or healing.
- `Movement`: emit only when public text/effect lines clearly move a unit, alter
  movement in player-facing terms, or grant movement as the ability's public
  effect. Do not emit merely because the implementation uses a movement-ratio
  effect internally for targeting or formula support.
- `Teleport`: emit only for public teleport/reposition behavior.
- `Push`: emit only for public push/knockback behavior.
- `Summon`: emit only for public summon/spawn behavior.
- `Apply Status`: emit when public text/effect lines apply a status.
- `Remove Status`: emit when public text/effect lines remove, cleanse, or dispel
  a status.
- `Reactivate skill`: emit when public text/effect lines clearly reactivate,
  refresh, or grant another skill/action use.
- `True damage`: if retained, emit only when public wording makes true damage or
  defense-ignoring damage explicit enough for a player-facing role.

Exporter validation should include a role audit report with:

- role count before/after;
- representative examples per role;
- examples removed from noisy roles;
- false-positive review for Movement, True damage, Shield, Remove Status, and
  Reactivate skill;
- false-negative review for Damage, Heal, Apply Status, and Remove Status.

## Problem 2: Ability Source Is Provenance, Not Role

`Ability source` is useful metadata, but it should remain provenance/classification
metadata rather than player-facing gameplay taxonomy.

Keep source values only when source data proves them. Current values such as
`Battle skill`, `Battle ability`, `Unit ability event`, `Battle reward`, and
`Mixed` are acceptable as exported facts, but EWShop should not need to use
source as a replacement for cleaned gameplay role metadata.

## Problem 3: Explicit Ability Ownership Metadata Is Missing

Some abilities appear faction-specific or faction-originated, but most abilities
are not faction-specific. EWShop should not infer ownership from:

- ability key fragments;
- old footer/context strings such as `Last Lords / Combat / Ability`;
- hero/equipment pages;
- display names;
- prose;
- SVG icon paths.

Frontend needs explicit ownership only when source data proves it. Absence of
ownership must mean "unknown/not explicitly owned", not "neutral/common".

## Faction Ownership Metadata Requirement

Follow the existing exporter/Codex fact and reference style unless there is a
strong reason not to.

Preferred minimal shape:

- emit a normal fact/metadata line for explicit ownership;
- include a stable faction key/reference in the same style already used by
  current Codex metadata, where facts and section items can carry
  `referenceKey`;
- keep the exact exported shape compact and consistent with current contracts.

The exporter team should decide the final field name and shape. It must satisfy:

1. EWShop can reliably detect explicit ability ownership.
2. EWShop can resolve the faction display/icon target without parsing prose,
   ability keys, or old context strings.
3. Missing ownership metadata means unknown/not explicitly owned.
4. Ownership is emitted only when source data proves it.

Compact acceptable patterns include:

- a normal Codex fact such as `Origin faction: Kin of Sheredyn` with
  `referenceKey: Faction_KinOfSheredyn`;
- `factionKey: "Faction_KinOfSheredyn"` if an existing DTO path already uses
  this style;
- `originFactionKey: "Faction_KinOfSheredyn"` if that better expresses source
  semantics;
- `factionSvgKey: "kinOfSheredyn"` only if this is already a stable exporter to
  frontend icon contract.

Do not introduce a large new nested JSON object unless the current exporter/Codex
contract already has a strong matching pattern. Do not require EWShop to resolve
faction icons by parsing keys or display text.

## Non-Goals

- No frontend key/name/prose inference.
- No faction icon inference from ability icon keys or SVG filenames.
- No rewrite of the Codex importer/API contracts unless the exporter team
  decides the current fact/reference style is insufficient.
- No new generic metadata framework.
- No changes to hidden Modifiers or hidden top-level Extractors.
- No request to make every ability faction-owned.
- No request to invent ownership where source data is ambiguous.

## Equipment Metadata Backlog Additions

Discovered during Equipment category evolution on 2026-06-20.

These are non-blocking frontend findings. EWShop can continue the Equipment
Archive using current exported facts and exact references, but exporter review
would improve trust and presentation.

### Equipment Granted Ability Reference Coverage

Current Equipment Codex export includes `Granted abilities` section items whose
`referenceKey` values do not resolve to current public Codex Ability entries.

Observed examples:

- `Talisman of Focus` -> `UnitAbility_Hero_BattleAbility_Equipment_Passive_52`
- `Tear of the Lost` -> `UnitAbility_Hero_Equipment_Consumable09`
- `Apotheosis Dirge` -> `UnitAbility_Hero_Equipment_Consumable10`
- multiple Equipment entries granting `Heavy Strike` ->
  `UnitAbility_PreparedBreakRetaliation`
- `Keensight's Katana` -> `UnitAbility_Hero_ActiveSkill_Equipment_32`

Request:

- verify whether these granted abilities should be exported as public Codex
  Ability entries;
- or omit/mark the references if they are internal, obsolete, runtime-only, or
  otherwise not public.

EWShop frontend will not infer missing ability pages from keys or labels.

### Equipment Icon Metadata

Current frontend can safely render a generic Equipment kind icon, and can render
Ability icons for exact granted Ability references. It does not have explicit
per-item Equipment icon metadata.

Request:

- if per-item Equipment icons are intended for public Codex presentation, emit a
  stable icon reference using the existing exporter/Codex icon contract style;
- do not require EWShop to infer item icons from Equipment keys, display names,
  or SVG filenames.

### Equipment Access Pool Coverage

`Apotheosis Dirge` currently lacks an `Access pool` fact while most Equipment
entries emit one.

Request:

- verify whether `Access pool` should be emitted for this item;
- if unavailable, absence is acceptable, but the exporter should make that
  intentional.

## Trait Metadata Backlog

These are non-blocking frontend findings discovered during the Traits category
evolution pass. EWShop can continue using the current exported facts and exact
references, but exporter cleanup would improve future Trait presentation.

### Trait Ownership Metadata

Current Trait Codex data does not expose explicit major-faction ownership for
Faction traits. Some ownership may be suggested by keys or source data, but
EWShop frontend must not infer ownership from keys, names, prose, or SVG paths.

Request:

- emit explicit Trait ownership metadata only when source data proves ownership;
- include a stable faction reference key using the existing Codex fact/reference
  style;
- leave ownership absent when it is unknown or not source-proven.

### Trait Category Semantics

Current Trait facts use `Category` for both broad category values such as
`Faction`/`Protectorate` and secondary browse/category values such as
`Defense`, `Discovery`, or `Affinity - Tahuks`.

Request:

- review whether broad Trait type and secondary Trait category should be emitted
  as distinct facts;
- preserve current values if they are intentional, but make the distinction
  explicit enough that EWShop does not need to interpret duplicate `Category`
  facts.

### Trait Reference Coverage

Some Trait references in the current Codex export do not resolve to public Codex
entries, especially custom district, improvement, and technology refs.

Observed examples:

- `Barter System` -> `Aspect_DistrictImprovement_01`
- `Relic Seekers` -> `DistrictImprovement_Science_05`
- `Relic Seekers` -> `DistrictImprovement_Science_08`
- `Tower Defense` -> `Necrophage_District_Appendage01_Tier1_v2`
- `Suburban Dream` -> `District_Tier1_Food_Custom_Specific24`

Request:

- verify whether unresolved Trait references should point to public Codex
  entries;
- otherwise omit or mark references as internal, obsolete, runtime-only, or not
  public.

### Trait Icon Metadata

Current Trait data does not include explicit per-trait icon metadata.

Request:

- if per-trait icons are intended for public Codex presentation, emit a stable
  icon reference using the existing Codex icon contract style;
- do not require EWShop to infer trait icons from keys, display names, prose, or
  SVG filenames.

## Action Metadata Backlog

These are non-blocking frontend findings discovered during the Actions category
evolution pass. EWShop can continue using the current exported `Category` facts
and exact references, but exporter cleanup would improve future Action
presentation.

### Action Ownership Metadata

Current Action Codex data exposes broad categories such as `Faction Action` and
`Empire Action`, but does not expose complete explicit ownership metadata for
which faction or empire-state system owns an action.

Request:

- emit explicit Action ownership metadata only when source data proves
  ownership;
- include stable faction/reference keys using the existing Codex fact/reference
  style;
- leave ownership absent when it is unknown or not source-proven.

### Action Reference Coverage

Current Action references include unresolved public keys, especially action
visual affinity and empire faction state references.

Observed examples:

- `Rebuild Village` -> `ActionVisualAffinity_RebuildVillage`
- `Kin Of Sheredyn Economy01` -> `KinOfSheredyn_Economy01`
- `Mukag Knowledge01` -> `EmpireActionCategory_Mukag_Knowledge`
- `Mukag Knowledge01` -> `EmpireFactionState_MukagBalanced`
- `Mukag Light01` -> `EmpireFactionState_MukagEnlighted`

Request:

- verify whether these references should resolve to public Codex entries;
- otherwise omit or mark references as internal, obsolete, runtime-only, or not
  public.

### Action Browse Metadata Coverage

Current `Action type` and `UI category` facts are too sparse for frontend
navigation:

- `Action type` appears on 12 entries.
- `UI category` appears on 5 entries.

Request:

- verify whether these facts are intentionally sparse;
- if they are intended as public browse metadata, emit them consistently enough
  for EWShop to use without inference.

## Diplomacy Metadata Backlog

These are non-blocking frontend findings discovered during the Diplomatic
Treaties category evolution pass. EWShop can continue using current exported
`Category`, `Bilateral`, `Duration`, descriptions, effects, and applied Status
sections.

### Treaty Runtime Values

Surrender/tribute values for `Treaty_AskToSurrender` and
`Treaty_ProposeSurrender` remain absent from the static public export.

Request:

- keep them absent if they are genuinely runtime-only;
- if a source-proven public static value becomes available, emit it as normal
  treaty metadata/effects;
- do not require EWShop to invent or infer tribute amounts.

### Treaty Relationship Direction

Current treaty data has exact applied Status sections, but broader relationship
direction/outcome metadata is limited.

Request:

- preserve exact applied Status references;
- if broader treaty relationships become public and source-proven, emit them as
  explicit facts/sections/references;
- do not rely on EWShop parsing treaty names or prose for relationship
  direction.

### Treaty Icon Metadata

Current Diplomatic Treaty data does not include explicit per-treaty icon
metadata.

Request:

- if per-treaty icons are intended for public Codex presentation, emit stable
  icon metadata using the existing Codex icon contract style;
- otherwise EWShop will keep generic diplomacy/category treatment.

## Improvements Metadata Backlog

These are non-blocking frontend findings discovered during the Improvements
category evolution pass. EWShop can continue using current exported `Category`
facts and `Effects` sections.

### Improvement Planning Metadata

Current Improvement Codex facts expose `Kind` and `Category`, but do not expose
era, construction progression, build cost, or unlock tier metadata.

Request:

- keep absent metadata absent if it is not public, stable, or source-proven;
- if era/progression/build-cost metadata becomes public and source-proven, emit
  it as normal Codex facts using existing exporter style;
- do not require EWShop to infer progression from keys, names, tech unlocks, or
  prose.

### Thin Improvement Entries

Local 0.82 data includes 23 Improvement entries with no public `Effects` lines
or description. Existing DB Exporter notes indicate some thin
District/Improvement rows are intentional when public data is unavailable.

Request:

- preserve public effect lines when source-proven;
- keep entries thin when no public-safe mechanics are available;
- do not emit inferred descriptions merely to fill archive rows.

## District Metadata Backlog

These are non-blocking frontend findings discovered during the Districts
category evolution pass. EWShop can continue using current exported `Category`,
`Tier`, `Effects`, and exact `Extracted resource` references.

### District Planning Metadata Coverage

Local 0.82 data includes District entries with incomplete planning facts:

- 8 District entries lack exported `Category`.
- 29 District entries lack exported `Tier`.

Request:

- keep absent metadata absent if it is not public, stable, or source-proven;
- if Category/Tier/progression metadata is public and source-proven, emit it as
  normal Codex facts using the existing exporter style;
- do not require EWShop to infer Category or Tier from keys, display names,
  prose, or SVG filenames.

### Thin District Entries And Upgrade Chains

Many District upgrade/special entries have no public `Effects` lines, and no
explicit District upgrade-chain/progression relationship is exported.

Request:

- preserve public effect lines when source-proven;
- keep entries thin when no public-safe mechanics are available;
- if upgrade-chain/progression relationships become public and source-proven,
  emit them as explicit facts/sections/references;
- do not emit inferred descriptions merely to fill archive rows.

## Heroes Metadata Backlog

These are non-blocking frontend findings discovered during the Heroes category
evolution pass. EWShop can continue using current exported `Faction`, `Class`,
`Stats`, and exact resolved ability references.

### Hero Reference And Granted Ability Coverage

Local 0.82 data includes Hero references that do not resolve to current public
Codex entries, such as `Faction_Hero` and several `UnitAbility_Hero_*` keys.
Some `Granted abilities` sections are empty even when exact ability references
exist in `referenceKeys`.

Request:

- preserve exact granted ability references when source-proven;
- if granted abilities are intended as public Hero content, emit them in a
  structured section as well as exact references using the existing Codex style;
- keep unresolved/internal ability references absent from public Hero rows;
- do not require EWShop to infer ability links from Hero names, keys, prose, or
  SVG filenames.

### Hero Presentation Metadata

Current Hero data does not include explicit per-Hero icon/portrait metadata or
recruitment/progression structure.

Request:

- if per-Hero icons or portraits are intended for public Codex presentation,
  emit stable icon metadata using the existing Codex icon contract style;
- if recruitment/progression data becomes public and source-proven, emit it as
  normal facts/sections/references;
- do not require EWShop to infer faction group, portrait, recruitment, or
  progression from keys, names, prose, or SVG filenames.

## Units Metadata Backlog

These are non-blocking frontend findings discovered during the Units category
evolution pass. EWShop can continue using current exported `Class`, `Faction`,
`Tier`, `Stats`, and exact resolved granted ability references.

### Unit Reference And Roster Coverage

Local 0.82 data includes 2 Unit entries without exported `Faction` facts and a
small set of references that do not resolve in the current public Codex data,
including `Faction_Tormented`, `MinorFaction_Dungeon`,
`MinorFaction_GreenScions`, and `Unit_MinorFaction_MangroveOfHarmony_Final`.

Request:

- keep absent metadata absent if it is not public, stable, or source-proven;
- preserve exact Faction/Minor Faction references when source-proven;
- resolve or intentionally omit public references that should not appear in
  EWShop;
- do not require EWShop to infer faction ownership from Unit keys, display
  names, prose, or SVG filenames.

### Unit Evolution Relationship Metadata

The raw Units export contains useful progression fields such as
`previousUnitKey`, `nextEvolutionUnitKeys`, and `evolutionTierIndex`, but generic
Codex Unit entries do not expose a dedicated public evolution section/fact.

Request:

- if Unit evolution/progression is intended for public Codex presentation, emit
  explicit evolution relationships using the existing Codex fact/section and
  exact reference style;
- preserve relationship direction where possible, such as previous/evolves into;
- do not require EWShop to infer evolution chains from unit reference lists,
  keys, names, prose, or tier numbers.

## Technologies Metadata Backlog

These are non-blocking frontend findings discovered during the Technologies
category evolution pass. EWShop can continue using current exported `Era`,
`Quadrant`, optional `Faction`, public `Effects`, and exact `Unlocks`
references. The dedicated `/tech` route remains the progression explorer.

### Technology Prerequisite And Progression Metadata

The raw Tech export contains useful progression fields such as prerequisite and
exclusive-prerequisite keys, but generic Codex Technology entries do not expose
public prerequisite/progression facts or sections.

Request:

- if prerequisite/progression hints are intended for public Codex presentation,
  emit them as explicit public Codex facts/sections/references using the
  existing exporter style;
- preserve relationship direction where possible, such as prerequisite,
  exclusive prerequisite, or unlock progression;
- do not require EWShop to infer technology progression from raw tech route
  data, keys, names, prose, or tier numbers.

## Quests Metadata Backlog

These are non-blocking frontend findings discovered during the Codex Quests
category evolution pass. Current EWShop behavior remains correct, but the
archive remains visually noisy when many exported records share a display title.

### Canonical Archive Grouping Metadata

Quest Codex export contains many records sharing the same display title.

Observed example:

- `A Bitter Truth` -> 18 records.

These records are not duplicates. They differ in:

- objectives;
- requirements;
- rewards;
- references;
- choices.

Frontend cannot safely determine:

- canonical quest identity;
- variant identity;
- archive grouping;
- chapter ownership;
- record role;

without using title heuristics or key parsing. Both are rejected in EWShop's
Codex category evolution workflow.

Requested exporter metadata, using the existing Codex fact/reference style where
possible:

- `archiveGroupKey`;
- `archiveGroupTitle`;
- `questlineKey`;
- `chapterKey`;
- `variantKey`;
- `recordRole`;
- `factionKey`;
- a stable archive grouping identifier.

Goal:

- allow Codex archive grouping without key parsing or title-based heuristics.

Priority:

- non-blocking. Current frontend behavior remains correct but visually noisy.

## Expected Exporter Validation

Before returning the next ability metadata snapshot, provide:

- `Combat role` count changes before/after cleanup.
- Before/after counts for `Apply Status` and `Remove Status`, including any
  mapping from current labels `Status apply` and `Status remove`.
- A sampled role audit for each retained role.
- Explicit examples for Choral Onslaught, Accusation, Power Slash variants,
  Second Wind, Rallying Cry, and Anti Cavalry.
- A list of abilities with explicit faction ownership emitted.
- A list of abilities reviewed but left without ownership because source data did
  not prove ownership.
- Confirmation that `Origin faction` or equivalent ownership metadata includes a
  stable faction reference key when emitted.
- Confirmation that absent ownership is intentionally absent, not defaulted to
  common/neutral.

## EWShop Follow-Up After Exporter Return

After a new exporter snapshot is available, EWShop should:

1. Import the snapshot and confirm facts/reference keys are preserved by the
   existing Codex importer/API/store path.
2. Re-run the Ability role audit against the returned data.
3. Update Ability Archive role filters only from cleaned exported facts.
4. Render optional faction identity markers only from explicit exported
   ownership metadata.
5. Keep current no-inference rules for keys, display names, prose, and SVG paths.
