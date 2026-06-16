# Codex DB Exporter Definitive Response

Status: implementation and decision record
Current as of 2026-06-16
Source handoff:
`docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/codex-db-exporter-definitive-handoff.md`

This document is the DB Exporter closeout record for the ten
`DB-CODEX-DEF-*` asks. It is intentionally conservative: where the exporter can
prove canonical public data, it records the exported generic Codex surfaces;
where it cannot, it distinguishes permanent non-public data from deferred
source-investigation work so EWShop does not keep reopening nonexistent data or
mistake current exporter shallowness for a game-data absence.

No EWShop-only schema is introduced. All implemented surfaces use the existing
generic Codex contract:

- `descriptionLines`
- `facts[]`
- `sections[]`
- `sections[].items[]`
- item/fact `referenceKey`
- `referenceKeys`
- `publicContextKeys`

## Pass Summary

Fresh code changes in the closeout pass:

- Added `[DEPRECATED]` public-text suppression in generic Codex metadata and
  ReferenceKinds public identity filtering.
- Added validation failure coverage for `[DEPRECATED]` display names in
  reference-kind Codex exports.

Fresh code changes in the targeted DLL/data deep-dive pass:

- Added source-backed `Action mechanics` sections for
  `ActionTypeBuildObservatory`, `ActionTypeBuildCoralSpore`, and
  `ActionTypeStripTile`, based on current decompiled runtime action classes and
  current empire/stance source fields.
- Stopped exporting `ActionTypeBanishPopulationFromSettlement` as a public
  Action row because the current DLL marks it obsolete and excluded from UI
  mapper generation.
- Suppressed the non-Codex `Aspect_DistrictImprovement_00` population reward
  ref while preserving the visible `Unlocks Nutrient Extractor` threshold text.

Fresh validation in this pass:

- Python syntax check passed for
  `tools/export_snapshot_lib/json_validation/codex.py`.
- After the 2026-06-16 EL2 DLL/API compatibility repair,
  `dotnet build EL2.DBExporter.csproj -c Debug` passed with 0 warnings and
  0 errors.
- Fresh F8 export snapshot `export-snapshots/20260616-184514` was captured
  from game version `0.82`.
- Runtime export completed with `succeeded=21, failed=0`.
- Offline validation report:
  `export-reports/20260616-184514_validation.md`.
- Affected quest and trait outputs passed their direct validators:
  `quest_explorer`, `quest_explorer_branch_diagnostics`, `quests-codex`, and
  `traits-codex` all reported 0 errors.
- Follow-up validation snapshot `export-snapshots/20260616-185854` resolved the
  two remaining validation failures from `20260616-184514`:
  `UnitAbility_AlwaysRetaliate` now has source-backed fallback semantics, and
  `ActionTypeMove` now exists as a thin public Army Action target for the fresh
  quest requirement reference.
- Offline validation report:
  `export-reports/20260616-185854_validation.md` passed all registered checks,
  including `abilities-codex` and `quest-reference-kind-links`.
- Product-informed correction validation snapshot
  `export-snapshots/20260616-192650` was captured after the Perisai raw
  biography-key fix.
- Offline validation report:
  `export-reports/20260616-192650_validation.md` passed all registered checks;
  `councilors-codex` reported 43 rows, 0 errors, and 0 warnings.
- Diff report `export-reports/20260616-185854_to_20260616-192650_diff.md`
  shows one changed product row:
  `Notable_FactionQuest_Mukag_Chapter05_Perisai` in `councilors-codex`.
- Targeted deep-dive validation snapshot `export-snapshots/20260616-200204`
  was captured after the Action/Population changes.
- Offline validation report:
  `export-reports/20260616-200204_validation.md` passed all registered checks.
- Diff report `export-reports/20260616-192650_to_20260616-200204_diff.md`
  shows `actions-codex` changed 3 rows and removed
  `ActionTypeBanishPopulationFromSettlement`; `populations-codex` changed
  `Population_Aspect`.

Product-informed correction pass:

- Rechecked the highest-value thin Action, Ability, Councilor, Treaty, Status,
  District/Improvement, and Modifier claims against current game DLL shapes,
  current validated export JSON, and current localization/output evidence.
- Source checks are labelled below as one of:
  - current DLL/data/localization source checked;
  - current validated export snapshot checked;
  - existing exporter-path-only historical check;
  - deferred because a deeper runtime/decompile source path is still required;
  - product/UX decision rather than exporter data absence.
- Permanent `not canonical/public` language is used only when current source
  shape or localization/output evidence supports it.

Final targeted closeout pass:

- Rechecked the remaining deferred/high-uncertainty items from
  DB-CODEX-DEF-002, 003, 005, 006, and 007 against snapshot `20260616-200204`,
  current exporter filters, and targeted current DLL class shapes.
- No additional canonical low-risk exporter fixes were identified.
- This pass updated decision-record wording only; no build/install/F8 cycle was
  required because no code or generated export output changed.

Ability metadata pass:

- Added source-backed additive `abilities-codex` facts for `Ability mechanic`,
  `Ability source`, and `Combat role` where the flattened public ability source
  data exposes them.
- Final accepted snapshot after this pass is `20260616-210540`.
- Snapshot `20260616-200204` remains the accepted evidence snapshot for the
  earlier targeted Action/Population deep dive; it is not the final EWShop
  import snapshot after the ability metadata pass.

Prior implemented surfaces below refer to the already completed June 13/14
exporter batches archived under
`docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/`.

Fresh F8 validation has now been run for this pass. The DLL was built,
installed, exported in game, snapshotted, validated, diffed, and log-checked.
The final build passed, the final F8 completed, snapshot `20260616-210540`
validated with 0 errors across all registered exporter checks, and the BepInEx
log reported `succeeded=21, failed=0`.

## DB-CODEX-DEF-001 - Add Public Gameplay Context To Thin Actions

Status: partially implemented

Summary:

- Implemented previously as the conservative Action mechanics safe subset.
- The exporter emits public action mechanics when backed by cached canonical
  action sources already in the exporter.
- Current DLL/data checks show several Action rows are real public action
  targets; the highest-value source-backed mechanics from this targeted pass
  are now exported.
- Actions without a proven mechanics source remain thin searchable/linkable
  Codex targets unless current source marks them non-public/deprecated.

Entry keys/classes covered:

- `ActionTypeCutForest`
- `ActionTypeMove` as a thin public Army Action target, exported because the
  current quest source references canonical `ArmyActionType.Move` through
  `SimulationPrerequisiteListenerDefinition_ArmyActionUsed`.
- `ActionTypeBuildObservatory`, `ActionTypeBuildCoralSpore`, and
  `ActionTypeStripTile` now export source-backed `Action mechanics` sections.
  Current source checks show `ActionType.BuildObservatory`,
  `ActionType.BuildCoralSpore`, and `ActionType.StripTile` are not excluded
  from UI mapper generation; `ArmyActionType.BuildObservatory`,
  `ArmyActionType.BuildCoralSpore`, and `ArmyActionType.StripTile` are public
  army action values; current quest requirements reference them through public
  Army Action requirement rows; and current runtime action classes expose their
  duration/cost/effect/requirement mechanics.
- `ActionTypeRaze`
- `ActionTypeAbsorbCity`
- `ActionTypeCloseRift`
- `EmpireActionTypeKinOfSheredyn_Military01` where direct movement gain
  mechanics are available.
- Other actions with `ActionCostModifierDefinition.ActionTypes` or
  decompile-backed action formula relationships.

Entry keys/classes not covered:

- Rich mechanics for `ActionTypeMove`. Current source proves public identity
  and quest references, but movement mechanics remain pathfinding/runtime
  behavior rather than a static gameplay summary in the current exporter-safe
  sources checked.
- `ActionTypeArmyStealTerritory` rich mechanics. The current `ActionType` enum
  contains the value and does not mark it obsolete/excluded, but the current
  validated quest snapshot has no quest references to it and no static
  mechanics source was mapped in this correction pass.
- `ActionTypeBanishPopulationFromSettlement` as a public target. Current
  `ActionType` marks it `[Obsolete]` and excludes it from UI mapper generation;
  no current quest references were found in snapshot `20260616-185854`.
- Other facts-only Actions where public identity exists but no canonical public
  mechanics source has been mapped.

Exact exported fields added:

- `sections[]`: `Action mechanics`
- `sections[].items[]`: cost modifier, formula, and targeted static action
  mechanics
- `sections[].items[].facts[]`: affected cost, modifier, formula, amount
- item/fact `referenceKey`: only when a public target key is provable
- `referenceKeys`: public action/modifier/formula refs admitted by the existing
  allow-list
- `publicContextKeys`: generated by generic Codex metadata rules

Source basis:

- `ActionCostModifierDefinition.ActionTypes`
- Existing decompile-backed action formula resolver
- `EmpireActionDefinition` and `ConstructibleActionDefinition` fields already
  used by cached formula resolution
- Current DLL/data check:
  - `ActionType` is `[CanGenerateUIMapper]`; `BuildObservatory`,
    `BuildCoralSpore`, `StripTile`, and `ArmyStealTerritory` are current enum
    values, while `BanishPopulationFromSettlement` is obsolete and excluded.
  - `ArmyActionType` is `[CanGenerateUIMapper]`; `Move`, `StripTile`,
    `BuildCoralSpore`, and `BuildObservatory` are current public army action
    values.
  - `SimulationPrerequisiteListenerDefinition_ArmyActionUsed` contains
    `ArmyActionType ActionType` and `int NumberOfUse`, which backs quest
    requirement refs without fuzzy matching.
  - `GameUtils.TryGetActionTypeFromArmyActionType` maps
    `BuildObservatory`, `BuildCoralSpore`, and `StripTile` to corresponding
    `ActionType` values. `Move` remains a quest-referenced Army Action target,
    not a mapped generic `ActionType`.
  - `FormatUtils` has public localization-backed formatting paths for
    `FormatBuildObservatory`, `FormatBuildCoralSpore`, and `FormatStripTile`,
    including duration and terrain-conversion placeholders.
- Targeted current DLL/runtime action check:
  - `ArmyBuildObservatoryAction` uses the owning empire's observatory
    construction duration, money/influence/resource construction costs, and
    creates/activates an Observatory on the target tile.
  - `ArmyBuildCoralSporeAction` uses the owning empire's Coral Spore
    construction duration and money cost, spends acting-army movement, and
    creates a Coral Spore on the target tile.
  - `ArmyStripTileAction` uses Strip Tile stance duration, applies the
    game-speed Strip Tile factor, grants target tile FIMS yields through the
    empire Strip Tile yield multiplier, changes the target tile to consumed
    terrain, resets territory biome, and removes point-of-interest/coral output
    where applicable.
  - `MajorEmpire` exposes the observatory, Coral Spore, and Strip Tile
    properties used by those runtime actions.
  - `ArmyStanceActionController.GetStanceActionDuration` is the current stance
    duration source used by Strip Tile.
- Current validated export snapshot `20260616-200204`:
  - `actions-codex` exports `ActionTypeBuildObservatory`,
    `ActionTypeBuildCoralSpore`, and `ActionTypeStripTile` with
    `Action mechanics` sections.
  - `actions-codex` exports `ActionTypeArmyStealTerritory` and
    `ActionTypeMove` as thin rows.
  - `actions-codex` no longer exports
    `ActionTypeBanishPopulationFromSettlement`.
  - `quest_explorer` references `ActionTypeBuildCoralSpore`,
    `ActionTypeBuildObservatory`, `ActionTypeStripTile`, and `ActionTypeMove`
    from explicit Army Action requirement rows.
- No UI mapper fallback probing and no invented summaries

Unavailable/rejected data:

- `ActionTypeMove` is intentionally thin. Current source proves it as a public
  Army Action requirement target, but movement mechanics are pathfinding/runtime
  behavior rather than a static gameplay summary in the current exporter-safe
  sources checked.
- `ActionTypeBanishPopulationFromSettlement` is the permanent non-public action
  decision in this targeted set: current DLL source marks it obsolete and
  excludes it from UI mapper generation, and the current quest snapshot does
  not reference it. EWShop should not request it as a public Action page unless
  source data changes.
- `ActionTypeArmyStealTerritory` remains deferred, not rejected. Current DLL
  source exposes the enum value, but this pass did not find a quest reference,
  localization summary, or safe static mechanics path.
- Existing exporter-path-only misses remain non-final for other public army
  actions. A thin row means "mechanics not mapped yet", not automatically "no
  canonical data exists".

Validation performed:

- Historical F8 validation:
  `export-snapshots/actions-cdex-exp-004-safe-subset-20260614`.
- Historical report:
  `export-reports/actions-cdex-exp-004-safe-subset-20260614_validation.md`.
- Historical result: `actions-codex` 139 rows, 52 rows with
  `Action mechanics`, 87 intentional thin rows, 0 validation errors/warnings.
- Fresh F8 validation snapshot `20260616-185854`: `actions-codex` has 140 rows,
  0 errors, 0 warnings; `actions-codex-inventory` marks
  `ActionTypeBuildObservatory`, `ActionTypeBuildCoralSpore`,
  `ActionTypeStripTile`, and `ActionTypeMove` as thin army-action rows needing
  investigation rather than permanent rejection.
- Fresh F8 validation snapshot `20260616-200204`: `actions-codex` has 139 rows,
  0 errors, 0 warnings, and 8 info notes. Diff from `20260616-192650` changed
  `ActionTypeBuildObservatory`, `ActionTypeBuildCoralSpore`, and
  `ActionTypeStripTile`, and removed `ActionTypeBanishPopulationFromSettlement`.
  BepInEx log inspection reported `staticMechanicsRows=3`, export
  `succeeded=21, failed=0`, and no plugin load/type/export errors.

EWShop follow-up:

- Keep remaining thin Actions searchable/linkable.
- Do not infer action purpose from names, keys, or prose.
- Browser QA `ActionTypeBuildObservatory`, `ActionTypeBuildCoralSpore`,
  `ActionTypeStripTile`, `ActionTypeMove`, and `ActionTypeArmyStealTerritory`.

## DB-CODEX-DEF-002 - Add Public Context To Thin Districts And Improvements

Status: partially implemented

Summary:

- District and Improvement Codex rows already preserve public-safe descriptor
  lines, generic facts, and public reference keys.
- Extractor District rows now exact-link to Resources where the relationship is
  proven by `ArtificialDepositDistrictDefinition.ResourceType` or the canonical
  `Extractor_<ResourceDefinition.Name>` key pattern.
- Remaining thin District/Improvement context is not filled because the final
  targeted closeout check did not find further canonical public mechanics
  beyond current descriptor/prerequisite/exporter output.

Entry keys/classes covered:

- Extractor District rows such as `Extractor_Luxury01` and tier variants when a
  canonical Resource link exists.
- District and Improvement rows with public descriptor lines already resolved by
  the existing district/improvement exporters.
- `District_Bridge` as a thin public exact target: current export row is
  player-facing, non-hidden, non-prototype, and non-variant, but only exposes
  `Tag_Bridge` and no public effect lines.
- `District_Tier0_Bridge` as a thin public exact target: current export row is
  player-facing and categorized as Foundation tier 0. Its only resolved effect
  line is `+0 [FoodColored] Food if on River`, which remains suppressed from
  Codex as a no-op/unsafe gameplay line.
- `DistrictImprovement_Bridge_01` as a thin public exact target: current export
  row is player-facing and categorized as Bridge, but only exposes
  `Tag_DistrictImprovement_00` and no public effect lines.

Entry keys/classes not covered:

- `Aspect_DistrictImprovement_00`
- Thin advanced/grand extractor rows where no public effects/context source is
  exposed beyond existing facts/refs.
- Any District/Improvement whose only available data is tags, prototypes,
  descriptor keys without public lines, or raw source identifiers.

Exact exported fields added:

- Districts:
  - `sections[]`: `Extracted resource`
  - `sections[].items[].referenceKey`: `Resource_*` where proven
  - `referenceKeys`: `Resource_*` where proven
- Existing generic metadata:
  - `facts[]`: kind/category/tier where available
  - `sections[]`: public effects/stats generated from safe description lines
  - `publicContextKeys`: public reference keys generated by metadata rules

Source basis:

- `DistrictDefinition` descriptor lines
- `DistrictImprovementDefinition` descriptor lines
- `DistrictDefinition` current DLL fields checked: prototype/foundation,
  own/tile/synergy descriptor refs, cost modifiers, terrain/river/POI/village
  prerequisites, exploitation/resource flags, road/shipping/passability flags,
  and district visual/foundation fields.
- `DistrictImprovementDefinition` current DLL fields checked: prototype,
  descriptor refs, cost modifier refs, settlement-wide synergy refs, simulation
  event effects, neighbor prerequisite, family/visual fields, and destroyable
  flag.
- `ResourceDefinition`
- `ArtificialDepositDistrictDefinition.ResourceType`
- Canonical extractor key pattern `Extractor_<ResourceDefinition.Name>` and
  tier variants
- Current validated export snapshot `20260616-200204` targeted check:
  `Aspect_DistrictImprovement_00` is absent from `improvements-codex`;
  `District_Bridge` exists as thin `Temporary Bridge`;
  `District_Tier0_Bridge` exists as thin tier 0 `Bridge`; and
  `DistrictImprovement_Bridge_01` exists as thin `Pile House`.
- Current quest exports reference `District_Tier0_Bridge` and
  `Technology_DistrictImprovement_Bridge_01` as exact public targets, but do
  not add canonical mechanics for bridge pages.

Unavailable/rejected data:

- No canonical public planning context was proven for `District_Bridge`,
  `District_Tier0_Bridge`, or `DistrictImprovement_Bridge_01` beyond current
  player-facing identity, category/tier facts, and filtered descriptor output.
  EWShop should keep these as thin exact Codex targets unless a new public
  source field or localization source is identified.
- Do not request DB Exporter to infer bridge/building purpose from names,
  categories, tags, or descriptor prose. Reason: no canonical source found for
  strategic-purpose summaries.
- This is a closed deferred decision for the current data shape: bridge rows are
  public exact targets, not non-public rows, but richer mechanics are not
  canonical/static-exportable from the checked sources.

Validation performed:

- Historical Resources validation proved extractor/resource exact links:
  `export-snapshots/resources-cdex-exp-003-extractor-key-join-20260614`.
- Historical result: 66 `districts-codex` extractor rows with `Resource_*`
  refs, 0 dead `Resource_*` refs, 0 dead `Extractor_*` refs.
- Fresh final targeted snapshot evidence came from `20260616-200204`; no
  additional District/Improvement exporter code was changed for this item.

EWShop follow-up:

- Keep District/Improvement detail pages rich where exported data exists and
  plain where intentionally thin.
- Browser QA `District_Bridge`, `DistrictImprovement_Bridge_01`, one extractor,
  and its Resource page.

## DB-CODEX-DEF-003 - Fill Thin Ability Mechanics Where Public

Status: partially implemented

Summary:

- Ability Codex rows preserve public-safe rich ability text when already
  present in the flattened ability export.
- Battle mechanics sections are emitted from flattened battle ability summaries
  and formulas.
- Applied Status exact refs are emitted only when the battle summary exposes a
  `Status_*` key.
- Rows whose only available text contains unsafe `%Effect_*`, `%Tag_*`, class,
  descriptor, or zero-value wording remain text-thin.
- Ability Codex rows now also include source-backed additive metadata facts for
  `Ability mechanic`, `Ability source`, and `Combat role` where those values can
  be read from flattened public ability source references or existing public
  mechanic tags.

Entry keys/classes covered:

- `UnitAbility_Quickfooted`
- `UnitAbility_AlwaysRetaliate`, now repaired through the existing
  `RetaliateAlwaysReady` descriptor-token fallback after the game update changed
  its display name to `Vengeful Spirit`.
- `UnitAbility_RangedRetaliate`, source-backed by flattened battle ability
  summary `BattleEffect_ApplyRetaliateDamage` on a retaliation event.
- `UnitAbility_BreakRetaliate`, source-backed by flattened battle ability
  summary `BattleEffect_SetRetaliationToken` with `Remove Retaliation` note.
- `UnitAbility_Hero_Stellar_Defender_01`
- Rich ability rows with battle summaries, formulas, descriptor lines, or
  public-safe tooltip text.
- Rich ability rows that apply `Status_*` through battle action summaries.

Entry keys/classes not covered:

- `UnitAbility_Blossom_1` for richer text/mechanics.
- `UnitAbility_Blossom_2` for richer text/mechanics.
- `UnitAbility_PreparedBreakRetaliation`, which is present in the rich ability
  export as a battle-only/internal retaliation path but is not exported as a
  public `abilities-codex` row.
- `UnitAbility_Hero_BattleAbility_Equipment_Passive_12` for richer
  text/mechanics.
- Any ability whose only available rich text is unsafe/non-public or whose
  mechanics are not present in the flattened ability row.

Exact exported fields added:

- `descriptionLines`: public-safe rich ability tooltip/context lines
- `sections[]`: `Battle mechanics`
- `sections[].items[]`: effect values, formulas, applied statuses
- item `referenceKey`: applied `Status_*` keys only
- `referenceKeys`: public ability/status references after filtering
- `publicContextKeys`: generated by generic metadata rules
- `facts[]`: additive source-backed ability metadata:
  - `Ability mechanic`: `Active`, `Reaction`, `Passive`, or `Mixed`
  - `Ability source`: `Battle skill`, `Battle ability`, `Descriptor`,
    `Unit ability event`, `Battle reward`, or `Mixed` when direct source
    references exist
  - `Combat role`: public labels derived only from existing mapped mechanic
    tags

Source basis:

- Flattened `AbilityExportDto.DescriptionLines`
- Flattened `AbilityExportDto.DescriptorKeys`
- `AbilityBattleAbilitySummaryDto`
- `AbilityBattleActionSummaryDto.StatusKeys`
- `AbilityBattleActionSummaryDto.EffectTypeNames`
- `AbilityBattleActionSummaryDto.Note` and `EventType` where the value is a
  direct public mechanics label rather than a raw source key.
- `AbilityBattleEffectFormulaDto`
- `UnitAbility` current DLL fields checked: `IsVisibleInUI`,
  `IsClassTag`, descriptor refs, battle ability refs, battle skill refs,
  attack shape ref, reward-per-kill refs, unit ability event refs, disabled
  lower abilities, and `OverrideTranslation`.
- `BattleAbilityDefinition` current DLL fields checked: presentation ability
  ref and battle actions.
- Existing ability semantic classifier and public text filters
- Flattened `AbilityExportDto.BattleSkillKeys`, `BattleAbilityKeys`,
  `DescriptorKeys`, `UnitAbilityEventKeys`, `RewardPerKillInBattleEffectKeys`,
  `DisabledLowerAbilityKeys`, `BattleAbilitySummaries`, `TacticalProfiles`, and
  existing mapped `MechanicTags` for additive metadata facts.
- Current validated export snapshot `20260616-185854`:
  - `UnitAbility_AlwaysRetaliate` rich source has descriptor
    `UnitAbility_Descriptor_RetaliateAlwaysReady`; Codex row exports
    `Changes retaliation to multiple uses.`
  - `UnitAbility_RangedRetaliate` rich source has
    `BattleEffect_ApplyRetaliateDamage` on `Retaliate`; Codex row exports
    `Applies retaliation damage during retaliation.`
  - `UnitAbility_BreakRetaliate` rich source has
    `BattleEffect_SetRetaliationToken` and note `Remove Retaliation`; Codex row
    exports `Removes target retaliation before attacking.`
  - Current targeted snapshot `20260616-200204` shows
    `UnitAbility_PreparedBreakRetaliation` in the rich `abilities` export with
    `BattleAbility_PreparedBreakRetaliation`, `BattleEffect_SetRetaliationToken`,
    note `Remove Retaliation`, and `Status_Unit_PreparedBreakRetaliation`; it
    remains absent from `abilities-codex`, matching the existing public ability
    filtering.
  - `UnitAbility_Blossom_1` and `UnitAbility_Blossom_2` rich source text is
    unsafe placeholder/zero-value text:
    `+0% Specialization Cost if %Effect_UnitVeterancy_Level*`.
  - `UnitAbility_Hero_BattleAbility_Equipment_Passive_12` rich source text is
    unsafe placeholder text:
    `+20% [Damage] Damage on Units of this %Tag_UnitClass_Ranged`.
- Current validated export snapshot `20260616-210540`:
  - `abilities-codex` remains 336 rows and validates with 0 errors.
  - `Ability mechanic` facts: Active 91, Reaction 145, Passive 80, Mixed 12.
  - `Ability source` facts: Battle skill 93, Battle ability 119, Unit ability
    event 26, Battle reward 4, Mixed 10.
  - `Combat role` facts use only mapped public mechanic tags: Action token 3,
    Damage 60, Heal 24, Movement 91, Push 12, Reactivate skill 12, Shield 48,
    Status apply 70, Status remove 15, Summon 12, Teleport 17, True damage 59.
  - Sample row facts: `UnitAbility_AlwaysRetaliate` has `Ability mechanic:
    Passive`; `UnitAbility_RangedRetaliate` has `Ability mechanic: Reaction`,
    `Ability source: Battle ability`, and `Combat role: Damage`;
    `UnitAbility_Blossom_1` and
    `UnitAbility_Hero_BattleAbility_Equipment_Passive_12` have
    `Ability mechanic: Passive` only and remain text-thin.

Unavailable/rejected data:

- `UnitAbility_Blossom_1` and `UnitAbility_Blossom_2` remain thin public exact
  targets and are closed/deferred for richer mechanics in the current data
  shape. Current rich ability export only exposes unsafe
  `%Effect_UnitVeterancy_Level*` placeholder/zero-value text; current
  `UnitAbility` fields do not expose a separate public summary or static
  mechanics field for Blossom.
- `UnitAbility_Hero_BattleAbility_Equipment_Passive_12` remains a thin public
  exact target and is closed/deferred for richer mechanics in the current data
  shape. The current rich ability export exposes `%Tag_UnitClass_Ranged` rather
  than a public localized target/class label; current `UnitAbility` /
  `BattleAbilityDefinition` fields do not expose a safer public summary source
  for this row.
- `UnitAbility_PreparedBreakRetaliation` remains omitted from public
  `abilities-codex`; current source is a battle-only/internal prepared
  retaliation path with a status ref, not a separate public ability page.
- Hero/equipment/retaliation/internal subtype labels are intentionally not
  exported as general taxonomy. Current source fields do not expose those labels
  as a stable public ability subtype; exporting them would require key/name/page
  inference or raw internal type disclosure.
- Do not infer ability mechanics from names, hero equipment page labels, or raw
  `%Effect_*`/`%Tag_*` placeholders.

Validation performed:

- Historical F8 validation:
  `export-snapshots/thin-entity-context-cdex-exp-010-slice-a-narrow-final-20260614`.
- Historical result: `abilities-codex` 336 rows, 0 errors, 23 warnings for
  intentionally unresolved ability rows. Exactly two ability rows changed in
  that slice.
- Fresh F8 validation snapshot `20260616-185854` reports `abilities-codex`
  336 rows, 0 errors, 24 warnings. `UnitAbility_AlwaysRetaliate` now exports
  the source-backed line `Changes retaliation to multiple uses.`
- Fresh F8 validation snapshot `20260616-200204` reports `abilities` 364 rows
  and `abilities-codex` 336 rows, with 0 errors. Diff from `20260616-192650`
  shows no ability or ability Codex changes.
- Fresh F8 validation snapshot `20260616-210540` reports `abilities` 364 rows
  and `abilities-codex` 336 rows, with 0 errors. Diff from `20260616-200204`
  shows only `abilities-codex` content changes for additive ability metadata
  facts; no rows were added or removed.

EWShop follow-up:

- Render exact applied Status refs and ability previews where present.
- Group/filter abilities only from exported facts such as `Ability mechanic`,
  `Ability source`, `Combat role`, existing `Kind`, and existing `Category`;
  do not infer ability subtype from keys, names, hero equipment page labels, or
  source pages.
- Browser QA `UnitAbility_AlwaysRetaliate`, `UnitAbility_CorruptionBurst`,
  `UnitAbility_Blossom_1`, and `UnitAbility_Hero_BattleAbility_Equipment_Passive_12`.

## DB-CODEX-DEF-004 - Replace Raw Population Keys And Complete Threshold Refs

Status: partially implemented

Summary:

- Population facts now prefer localized public faction labels while retaining
  exact faction `referenceKey` values where public.
- Major faction threshold rewards emit exact item/fact refs where the reward
  target is a current public Codex entry.
- Text-only or unresolved threshold rewards remain plain text when no exact
  public target is canonical.
- Population threshold reward refs now reject non-Codex constructible variant
  keys such as `Aspect_DistrictImprovement_00` while retaining player-visible
  threshold text.

Entry keys/classes covered:

- `Population_KinOfSheredyn` -> `KinOfSheredyn_DistrictImprovement_01`
- `Population_LastLord` -> `LastLord_DistrictImprovement_03`
- `Population_Necrophage` -> `Necrophage_DistrictImprovement_01`
- `Population_Mukag` -> `Mukag_DistrictImprovement_06`
- Population faction facts where `FactionDefinition` mapping provides a public
  localized label and exact faction key.
- `Population_Aspect` remains player-visible and keeps `Unlocks Nutrient
  Extractor`, but no longer emits `Aspect_DistrictImprovement_00` as a
  navigable public ref.
- `Population_Minor_MangroveOfHarmony` keeps exact public ref
  `MangroveOfHarmony_District_Tier1_Money`, which is exported in
  `districts-codex`.

Entry keys/classes not covered:

- `Aspect_DistrictImprovement_00`, when it is not present as a current public
  Codex entry.
- `Population_Called` text-only rewards without canonical exact targets.

Exact exported fields added:

- `facts[]`: `Faction`, `Type`, default/custom availability, base food cost
- fact `referenceKey`: exact public faction key where available
- `sections[]`: `Threshold rewards`, `Worker effects`,
  `Forbidden faction traits`
- `sections[].items[].referenceKey`: reward target when public
- `sections[].items[].facts[].referenceKey`: reward target when public
- `referenceKeys` / `publicContextKeys`: public population/faction/reward refs

Source basis:

- `PopulationDefinition`
- `FactionDefinition.Population`
- `PopulationDefinition.PopulationCollection`
- threshold `SimulationEventEffects`
- constructible/unit/action/descriptor/cost-modifier references extracted from
  those effects
- `ImprovementDatabaseExporter` current public filter, which treats
  `Aspect_DistrictImprovement_*` as non-Codex variant improvement keys.
- `DistrictDatabaseExporter` and snapshot evidence showing
  `MangroveOfHarmony_District_Tier1_Money` is a current public district Codex
  entry.

Unavailable/rejected data:

- No public Codex target exists for `Aspect_DistrictImprovement_00` unless that
  target is exported as a current public Codex entry. Keep `Nutrient Extractor`
  plain when the exact target is not public; do not create a placeholder entry.
- No canonical exact target exists for text-only Population rewards such as
  `Population_Called` in the current source data checked by DB Exporter. Leave
  them as text until source data changes.
- Raw faction keys are not used as visible fact values when a localized faction
  label exists. If a future row still shows a raw faction key, that means no
  public localized label was resolved from `FactionDefinition` mapping for that
  population in the current source.

Validation performed:

- Historical F8 validation:
  `export-snapshots/codex-packets-tech-pop-treaties-final-20260613`.
- Historical validator checks major faction threshold reward refs for the four
  covered examples above.
- Fresh validation snapshot `20260616-192650` did not change Population output;
  this item remains historically implemented/partially implemented as recorded.
- Fresh F8 validation snapshot `20260616-200204`: `populations-codex` has 26
  rows, 0 errors, 0 warnings. Diff from `20260616-192650` changed
  `Population_Aspect`; before it emitted `Aspect_DistrictImprovement_00` in
  `referenceKeys` and `publicContextKeys`, after it emits neither. The
  Mangrove threshold still emits `MangroveOfHarmony_District_Tier1_Money` in
  both `referenceKeys` and `publicContextKeys`. `Population_Called` remains
  text-only for threshold rewards.

EWShop follow-up:

- Render exact threshold summaries only where refs resolve.
- Keep unresolved/text-only rewards plain.
- Browser QA `Population_Aspect`, `Population_Minor_MangroveOfHarmony`,
  `Population_Called`, and `Population_KinOfSheredyn`.

## DB-CODEX-DEF-005 - Fill Resource And Extractor Context Where Canonical

Status: partially implemented

Summary:

- Implemented generic Codex exportKind `resources`.
- Resource rows are built from canonical `ResourceDefinition` rows only.
- Extractor/resource exact refs are exported where the relationship is proven.
- Resource deposits/POI pages remain intentionally not exported in the current
  Resources Codex contract.

Entry keys/classes covered:

- `Resource_Luxury01`
- `Resource_Strategic01`
- Public `Resource_*` rows backed by `ResourceDefinition`
- `Extractor_Luxury01`
- `Extractor_Luxury01_Tier2`
- Public extractor district rows linked to resources

Entry keys/classes not covered:

- Resource deposit / POI pages.
- Resource entries created from icon tokens alone.
- Core yield icon tokens such as Food, Industry, Dust, Science unless backed by
  canonical `ResourceDefinition` rows.
- Hidden, prototype, base, debug, or non-player-facing extractor refs.

Exact exported fields added:

- `resources` export kind
- `facts[]`: `Type`, `Booster`, `Trade`, `Stock limit`
- `sections[]`: `Effects`, `Extractors`
- `sections[].items[].referenceKey`: extractor/resource refs where proven
- `referenceKeys` / `publicContextKeys`: exact Resource/Extractor refs
- District extractor rows: `Extracted resource` section with exact `Resource_*`
  item ref

Source basis:

- `ResourceDefinition`
- `LuxuryResourceDefinition.DescriptorReferences`
- `LuxuryCategoryDefinition` descriptor refs
- `ArtificialDepositDistrictDefinition.ResourceType`
- Canonical extractor key pattern `Extractor_<ResourceDefinition.Name>`
- Current DLL `ResourceDepositDefinition` fields checked: tier,
  `ResourceDefinitionReference`, descriptor refs, and inherited
  `PointOfInterestDefinition` visual affinity/vision/battle-tile fields.
- Current DLL `PointOfInterestDefinition` fields checked: visual affinity,
  block-vision flag, battle tile type flag, natural-modifier behavior, and
  inherited tile-definition identity. No current generic POI Codex exporter is
  registered.

Unavailable/rejected data:

- Resource deposit / POI pages are product/export-scope deferred, not proven
  non-public. Current `ResourceDepositDefinition` rows can identify an
  underlying `ResourceDefinition` and descriptors, but DB Exporter currently
  exposes Resources as canonical `ResourceDefinition` pages plus extractor
  links. There is no registered public POI Codex export kind, no EWShop import
  contract for POI pages, and no validated ResourceDeposit page shape.
  EWShop should not request ResourceDeposit/POI Codex pages until product asks
  DB Exporter to add a new source-backed export surface.
- Icon tokens alone are not canonical resource data. EWShop should not request
  Resource Codex pages from `[FoodColored]`, `[DustColored]`, or similar icon
  tokens unless a backing `ResourceDefinition` exists.

Validation performed:

- Historical F8 validation:
  `export-snapshots/resources-cdex-exp-003-extractor-key-join-20260614`.
- Historical result: `resources-codex` 24 rows, 22 resource rows with
  `Extractor_*` reverse refs, 66 district extractor rows with `Resource_*` refs,
  0 dead resource/extractor refs, 0 validation errors/warnings.
- Fresh validation snapshot `20260616-200204` did not change Resource output;
  this item remains historically implemented/partially implemented as recorded.

EWShop follow-up:

- Keep Resources shallow unless product chooses otherwise.
- Browser QA `Resource_Specific_Corpse`, `Resource_Luxury01`,
  `Resource_Strategic01`, and `Extractor_Luxury01_Tier2`.

## DB-CODEX-DEF-006 - Add Treaty Effects And Fix Incomplete Public Text

Status: partially implemented

Summary:

- Diplomatic Treaty Codex export is implemented as `diplomaticTreaties`.
- Treaty category/bilateral/duration facts are exported where canonical.
- Public treaty descriptions are preserved when complete.
- Incomplete runtime-parameter placeholder text is suppressed.
- Applied Status exact refs are exported when present on `TreatyDefinition`.

Entry keys/classes covered:

- `Treaty_SharedResearch`
- `Declaration_CloseBorders` where applied statuses/facts are present
- Treaty rows with `InitiatorAcceptedTreatyStatus` or
  `OtherAcceptedTreatyStatus`

Entry keys/classes not covered:

- `Treaty_AskToSurrender` missing surrender/tribute value text.
- `Treaty_ProposeSurrender` missing surrender/tribute value text.
- Any Treaty whose direct effects are only descriptor/cost/tag/private
  references or incomplete localized placeholders.

Exact exported fields added:

- `diplomaticTreaties` export kind
- `descriptionLines`: complete public treaty text only
- `facts[]`: category, bilateral, duration
- `sections[]`: `Applied statuses`
- `sections[].items[].referenceKey`: `Status_*` applied statuses
- `referenceKeys` / `publicContextKeys`: public Treaty/Status refs

Source basis:

- `TreatyDefinition`
- `TreatyDefinition.Category`
- `TreatyDefinition.IsBilateral`
- `TreatyDefinition.IsTemporary`
- `TreatyDefinition.Duration`
- `TreatyDefinition.InitiatorAcceptedTreatyStatus`
- `TreatyDefinition.OtherAcceptedTreatyStatus`
- localized treaty description when complete
- Current DLL/data check: `TreatyDefinition` exposes category, bilateral/
  temporary/duration fields, cost/cancel-cost descriptor references,
  initiator/other simulation event effects, accepted/refused/cancelled status
  refs, prerequisites, notes, AI effects, and diplomatic voice line tag. It does
  not expose an obvious static public surrender/tribute amount field.
- Current runtime surrender source check:
  - `DiplomaticAncillary.AllocateSurrenderProposition` creates surrender
    propositions for a winner/loser relation and calls
    `InitializeSurrenderProposition`.
  - `DiplomaticAncillary.InitializeSurrenderProposition` sets
    `SurrenderMoneyRetribution.TotalMoneyGain` from
    `DiplomaticRelation.TributeValue.Value` when tribute is needed.
  - `DiplomaticRelation.TributeValue` is a runtime `Property`, alongside
    war-score and basket-value properties, not a static field on
    `TreatyDefinition`.
  - `DiplomaticSurrenderSnapshot` serializes active
    `SurrenderProposition.MoneyRetribution` for UI/runtime state.
  - `OrderChangeSurrenderMoneyState` only toggles whether money tribute is
    included; it does not define a public static amount.
- Current validated export snapshot `20260616-200204`: `Treaty_AskToSurrender`
  exports as a facts-only bilateral War treaty; `Treaty_ProposeSurrender`
  exports as a bilateral War treaty with applied status
  `Status_PublicOpinion_YouSurrenderedToUs`.

Unavailable/rejected data:

- Surrender/tribute values for `Treaty_AskToSurrender` and
  `Treaty_ProposeSurrender` are runtime-source-blocked for static Codex export,
  not permanent `not canonical/public`. Current static treaty source exposes
  statuses/effects and cost descriptors but no public static tribute amount
  field. The amount exists as active diplomatic relation state via
  `DiplomaticRelation.TributeValue.Value` and `SurrenderProposition`, so the
  exporter suppresses incomplete placeholder prose instead of inventing values.
- Direct treaty Effects beyond applied statuses are not exported unless they are
  available as safe public text or exact public `Status_*` refs. Reason:
  private/internal descriptor, cost, tag, and placeholder sources are not public
  Codex data.

Validation performed:

- Historical F8 validation:
  `export-snapshots/codex-packets-tech-pop-treaties-final-20260613`.
- Historical validator confirms technical treaty category/cost/descriptor refs
  and incomplete tribute placeholders do not leak.
- Fresh final targeted snapshot evidence came from `20260616-200204`; no
  additional Treaty exporter code was changed for this item.

EWShop follow-up:

- Render exact Applied Status summaries only where refs resolve.
- Browser QA `Treaty_AskToSurrender`, `Treaty_SharedResearch`, and
  `Declaration_CloseBorders`.

## DB-CODEX-DEF-007 - Export Public Status Sub-Kind/Scope And Fill Thin Statuses

Status: partially implemented

Summary:

- Status rows are exported through `bonuses` as public exact link targets.
- Public `Scope` facts are derived from `StatusDefinition.StartingType`, not
  from keys or display names.
- Public mechanics sections are added where descriptor or cost-modifier
  mechanics collapse to safe public text.
- Residual thin statuses remain exact searchable/linkable rows.

Entry keys/classes covered:

- `Status_City_Approval_High`
- `Status_City_ApprovalLoss_High`
- `Status_PublicOpinion_YouClosedBorders`, including public Opinion mechanics
  in the current validated export.
- `Status_Army_Map_Speed_Immobile`
- `HeroStatus_Loss`
- Status rows with public descriptor-backed or cost-modifier-backed mechanics

Entry keys/classes not covered:

- `Status_AdministrativeCenter_Subjugation` if no canonical mechanics/source
  text beyond facts/scope is available.
- Any thin Status where the source has no public-safe descriptor/mechanics text.

Exact exported fields added:

- `facts[]`: `Scope`, `Status type`, `Duration` when available
- `sections[]`: `Status mechanics` when mechanics are public-safe
- `sections[].items[].facts[]`: affected stat, change, formula
- `referenceKeys` / `publicContextKeys`: public Status and related public refs

Source basis:

- `StatusDefinition`
- `StatusDefinition.StartingType`
- `StatusDefinition.DefaultDuration`
- `StatusDefinition.Descriptor`
- `StatusDefinition.CostModifier`
- Current `StatusDefinition` DLL fields checked: hidden/code-only flags,
  group, descriptor, cost modifier, starting type, inhibited/cancel statuses,
  default duration, game-speed flag, and AI unit ability.
- descriptor/cost-modifier mechanics index
- Current validated export snapshot `20260616-200204` targeted check:
  - `Status_PublicOpinion_YouClosedBorders` exports scope
    `Diplomatic Ambassy`, duration `10 turns`, status type `Public Opinion`,
    and a public mechanics section for `Public Opinion -25`.
  - `Status_AdministrativeCenter_Subjugation` exports as a thin City Status
    with `SettlementStatusMalus` reference only.
  - `HeroStatus_Loss` exports as a thin Hero Status with `4 turns` duration and
    `HeroStatusMalus` reference only.
  - `Status_Army_Map_Speed_Immobile` exports as a thin Army Status with
    `1 turns` duration and `UnitStatusMalus` reference only.
- Current `bonuses-codex-mechanics` diagnostics for
  `Status_AdministrativeCenter_Subjugation`, `HeroStatus_Loss`, and
  `Status_Army_Map_Speed_Immobile` report `relationship=descriptor_only` and
  `mechanicsResolved=false`: each status has descriptor data, but no direct
  cost modifier and no parsed descriptor/effect mechanics row in the current
  cheap-source index.

Unavailable/rejected data:

- Thin Status mechanics are not canonical/public when no public-safe descriptor,
  cost modifier, or localized text exists in the current source checked by DB
  Exporter. EWShop should keep those statuses as exact searchable/linkable rows
  and should not infer groupings from `Status_*` or `HeroStatus_*` keys.
- `Status_AdministrativeCenter_Subjugation`, `HeroStatus_Loss`, and
  `Status_Army_Map_Speed_Immobile` are thin public exact targets and are
  closed/deferred for richer mechanics in the current data shape. Current
  output proves public scope/duration identity; current diagnostics prove the
  remaining source is descriptor-only without a resolved public mechanics row.
- A broader finalized status taxonomy beyond the current safe scope mappings is
  deferred to DB Exporter/product review. Current scope is canonical where
  derived from `StatusDefinition.StartingType`.

Validation performed:

- Historical F8 validation:
  `export-snapshots/referencekinds-status-modifier-clean-20260614`.
- Historical result: `bonuses-codex` 0 errors/warnings; validated examples
  include `Status_Army_Map_Speed_Immobile` and `HeroStatus_Loss`.
- Fresh final targeted snapshot evidence came from `20260616-200204`; no
  additional Status exporter code was changed for this item.

EWShop follow-up:

- Group/filter Statuses only from exported `Scope` facts.
- Do not parse status keys.
- Browser QA `HeroStatus_Loss`,
  `Status_PublicOpinion_YouClosedBorders`, and
  `Status_Army_Map_Speed_Immobile`.

## DB-CODEX-DEF-008 - Omit Or Repair Deprecated Bonus Placeholder Rows

Status: implemented

Summary:

- This pass added a fresh guardrail to suppress `[DEPRECATED]` public text in
  generic Codex metadata and ReferenceKinds public identity filtering.
- ReferenceKinds validation now fails if a `[DEPRECATED]` display name leaks in
  reference-kind Codex output.
- Existing cost-modifier export already skips `CostModifierDefinition.IsObsolete`.

Entry keys/classes covered:

- `ConstructibleCostModifier_UnitCostReduction03`
- `ConstructibleCostModifier_UnitMoneyCostReduction01`
- Any ReferenceKinds action/bonus/treaty entry whose public display identity
  resolves to `[DEPRECATED]`.

Entry keys/classes not covered:

- None known for this request. Final F8 snapshot `20260616-210540` preserves
  the runtime omission of the known deprecated placeholder rows and validates
  the guardrail with 0 registered errors.

Exact exported fields added:

- None. This is omission/validation behavior.

Source basis:

- `CostModifierDefinition.IsObsolete`
- public display identity filtering
- generic public text sanitizer
- reference-kind Codex validator

Unavailable/rejected data:

- These deprecated bonus rows are not public player-facing Codex entries when
  their public identity resolves to `[DEPRECATED]`. EWShop should not request
  public pages for them again unless the game source changes to provide a real
  public display name and public mechanics.

Validation performed:

- Fresh Python syntax validation passed for the changed Codex validator.
- Project build passed after EL2 DLL/API compatibility repair.
- Fresh F8 snapshot `20260616-184514` confirms both known deprecated bonus
  placeholder rows are omitted:
  `ConstructibleCostModifier_UnitCostReduction03` and
  `ConstructibleCostModifier_UnitMoneyCostReduction01`.
- `bonuses-codex` reported 0 validation errors and 0 warnings.
- Final accepted F8 snapshot `20260616-210540` reports `bonuses-codex` 585 rows
  and `bonuses-codex-mechanics` 36 rows, both with 0 validation errors.

EWShop follow-up:

- After a fresh export/import, confirm local import no longer reports the two
  deprecated rows as failed public rows.

## DB-CODEX-DEF-009 - Replace Raw Councilor Description Key

Status: implemented

Summary:

- Councilor descriptions are resolved through `CodexProjectionUtils.ResolveDescription`.
- Missing descriptions and unresolved localization placeholders are suppressed
  by shared localization cleanup before they reach `descriptionLines`.
- This correction pass also suppresses raw councilor `Biography` keys shaped as
  `EntryKeyDescription` / `Notable_*Description` after snapshot
  `20260616-185854` showed a resolved public Perisai description plus a raw
  biography key leak.
- Councilor Effect and Partner Effect exact refs are preserved through facts and
  reference keys where public effect rows exist.

Entry keys/classes covered:

- `Notable_FactionQuest_Mukag_Chapter05_Perisai`
- Other public `CourtesanDefinition` rows.

Entry keys/classes not covered:

- No public biography/description is invented if localization is missing.

Exact exported fields added:

- `descriptionLines`: localized public description/biography when resolved
- `facts[]`: Councilor effect / Partner effect with exact `referenceKey`
- `referenceKeys`: `CouncilorEffect_*` / `PartnerEffect_*` where exposed
- `publicContextKeys`: generated by generic metadata rules

Source basis:

- `CourtesanDefinition.Name`
- `CourtesanDefinition.Biography`
- `CourtesanDefinition.CouncilorEffect`
- `CourtesanDefinition.PartnerEffect`
- `CouncilorEffectDefinition`
- localized description resolution through `DataUtilsProvider`
- Current DLL/data check: `CourtesanDefinition` exposes `Name`, `Biography`,
  descriptor refs, faction ref, councilor effect ref, and partner effect ref.
- Current validated export snapshot `20260616-185854` showed
  `Notable_FactionQuest_Mukag_Chapter05_Perisai` with resolved display name
  `Qan Perisai`, one readable public description line, preserved
  `CouncilorEffect_Clergy06` and `PartnerEffect_Perisai_PartnerTrait` refs, and
  the stale raw biography key
  `Notable_FactionQuest_Mukag_Chapter05_PerisaiDescription`.

Unavailable/rejected data:

- For `Notable_FactionQuest_Mukag_Chapter05_Perisai`, the readable public
  description exists and should be exported; the raw `Biography` key is not
  public text and is omitted. EWShop should render the resolved description and
  effect links, not the raw `Notable_*Description` token.

Validation performed:

- Historical F8 validation:
  `export-snapshots/councilor-partner-effects-codex-filtered-20260614`.
- Historical result: `councilors-codex`, `councilorEffects-codex`, and
  `partnerEffects-codex` passed with 0 errors; effect refs had 0 missing/dead
  refs.
- Snapshot `20260616-185854` revealed the raw Perisai biography-key leak.
- Fresh validation snapshot `20260616-192650` confirms the exporter suppresses
  that raw key while preserving the public description, `CouncilorEffect_*`, and
  `PartnerEffect_*` refs. `councilors-codex` reported 43 rows, 0 errors, and
  0 warnings.

EWShop follow-up:

- Browser QA `Notable_FactionQuest_Mukag_Chapter05_Perisai`.
- Confirm no raw `Notable_*Description` string renders publicly.

## DB-CODEX-DEF-010 - Modifier Public-Target Confirmation

Status: partially implemented

Summary:

- Public Modifier targets remain hidden from top-level navigation as an EWShop
  product/UX decision, not because every modifier lacks canonical exporter data.
- DB Exporter emits safe public modifier rows in `bonuses` when a public target
  and public mechanics are proven.
- Non-public descriptor/tag/provenance targets are omitted from product JSON or
  kept diagnostics-only.

Entry keys/classes covered:

- `ActionCostModifier_CutForest_Decrease_00`
- `TechnologyCostModifierDefinition_Custom_Specific28_CheapMilitaryTech`
- `ConstructibleCostModifier_KinOfSheredyn_DivinieDistrict_CostRising_0`
- `ConstructibleCostModifier_KinOfSheredyn_DivinieDistrict_CostRising_1`
- Other cost modifiers with public target keys and safe mechanics.

Entry keys/classes not covered:

- Cost modifiers whose only target evidence is descriptor/tag/private/internal
  source names.
- Modifiers whose public identity resolves to `[DEPRECATED]`.
- Internal/private modifiers not referenced by public Codex surfaces.

Exact exported fields added:

- `facts[]`: category, affected cost, modifier
- `sections[]`: `Bonus mechanics`
- `sections[].items[].referenceKey`: public target key where proven
- `sections[].items[].facts[].referenceKey`: public target key where proven
- `referenceKeys` / `publicContextKeys`: public target refs admitted by the
  allow-list

Source basis:

- `CostModifierDefinition`
- subtype-specific valid-name arrays such as action/constructible/research/
  population/diplomatic/trade target lists
- bonus mechanics index
- public target filtering and text leak checks

Unavailable/rejected data:

- Modifiers whose targets are only descriptors, tags, class names, generated
  source names, or private/internal mechanics are not public Codex pages.
  EWShop should keep them hidden/unlinked and should not request public modifier
  pages for those rows until source data changes.
- Valid public modifier rows can remain exact searchable/linkable targets while
  staying hidden from top-level navigation. Do not broaden the modifier export
  simply to create nav categories; broaden it only when a current exact public
  target requires source-backed mechanics or refs.

Validation performed:

- Historical F8 validation:
  `export-snapshots/referencekinds-status-modifier-clean-20260614`.
- Historical result: `bonuses-codex` 0 errors/warnings; leak scan found no
  descriptor/tag/provenance/debug target text in product output.
- Fresh static validator guard for `[DEPRECATED]` added in this pass. F8
  validation snapshots `20260616-184514` and final accepted snapshot
  `20260616-210540` confirm the two known deprecated modifier rows were removed
  and no `[DEPRECATED]` identity leaked.

EWShop follow-up:

- Browser QA direct exact modifier URL:
  `/codex?entry=ActionCostModifier_CutForest_Decrease_00`.
- Confirm Modifiers remain absent from top-level navigation.

## Remaining Gap Classification Summary

Permanent non-public:

- `ActionTypeBanishPopulationFromSettlement`: obsolete in current DLL source,
  excluded from UI mapper generation, and absent from current quest references.
- Deprecated placeholder bonus/modifier rows whose public identity resolves to
  `[DEPRECATED]`, including
  `ConstructibleCostModifier_UnitCostReduction03` and
  `ConstructibleCostModifier_UnitMoneyCostReduction01`.
- Raw localization/source tokens such as
  `Notable_FactionQuest_Mukag_Chapter05_PerisaiDescription`, `%Effect_*`,
  `%Tag_*`, descriptor/tag/provenance/debug identifiers, and icon tokens not
  backed by canonical public data.

Deferred exporter mapping:

- Rich mechanics for `ActionTypeArmyStealTerritory`, plus other facts-only
  Actions where public identity exists but no safe static mechanics path is
  mapped yet.
- Richer planning/mechanics context for `District_Bridge`,
  `District_Tier0_Bridge`, `DistrictImprovement_Bridge_01`, and thin
  advanced/grand extractor rows beyond current facts/refs.
- Richer public mechanics text for `UnitAbility_Blossom_1`,
  `UnitAbility_Blossom_2`, and
  `UnitAbility_Hero_BattleAbility_Equipment_Passive_12`; final snapshot exports
  safe ability metadata facts where source-backed, but not unsafe placeholder
  text.
- Richer mechanics for `Status_AdministrativeCenter_Subjugation`,
  `HeroStatus_Loss`, `Status_Army_Map_Speed_Immobile`, and other thin Status
  rows whose current diagnostics are descriptor-only without resolved public
  mechanics.

Runtime-only:

- Surrender/tribute values for `Treaty_AskToSurrender` and
  `Treaty_ProposeSurrender`; current source exposes active diplomatic relation
  state through runtime `TributeValue` / `SurrenderProposition`, not a static
  public treaty amount.
- Movement/pathfinding behavior behind `ActionTypeMove` where the missing
  details are runtime behavior rather than a static source-backed Codex
  summary.

Product/export-scope deferred:

- ResourceDeposit/POI Codex pages. Current data can identify underlying
  resources/descriptors, but DB Exporter currently exposes ResourceDefinition
  pages and extractor links, with no registered public POI export kind or
  EWShop import contract.
- Broader top-level Modifier navigation and public modifier category expansion;
  valid exact modifier rows can remain linkable while product keeps Modifiers
  hidden from top-level navigation.
- A broader finalized ability/status subtype taxonomy beyond exported
  source-backed facts. EWShop should group/filter only from exported `facts[]`
  and existing generic fields.

## Export Kinds Changed

Previously implemented/exported kinds relevant to this handoff:

- `actions`
- `bonuses`
- `diplomaticTreaties`
- `resources`
- `councilorEffects`
- `partnerEffects`
- Existing `populations`, `districts`, `improvements`, `abilities`, and
  `councilors` Codex outputs were enriched through existing generic fields.

Fresh export kind changes in this pass:

- None.

## Entry Count Summary

Final accepted snapshot: `20260616-210540`.

Fresh changes accumulated across the June 16 closeout passes:

- Entries enriched per export kind: `abilities-codex` 1 row
  (`UnitAbility_AlwaysRetaliate`); `actions-codex` 3 rows
  (`ActionTypeBuildObservatory`, `ActionTypeBuildCoralSpore`,
  `ActionTypeStripTile`).
- Entries with additive ability metadata facts after the ability metadata pass:
  `abilities-codex` 328 changed rows; no ability rows were added or removed.
- Entries changed per export kind after product-informed correction:
  `councilors-codex` 1 row
  (`Notable_FactionQuest_Mukag_Chapter05_Perisai` raw biography key omitted);
  `populations-codex` 1 row (`Population_Aspect` non-Codex reward ref
  suppressed).
- Entries explicitly omitted by new guardrail: 2 known deprecated bonus rows
  confirmed removed in snapshot `20260616-184514`;
  `ActionTypeBanishPopulationFromSettlement` removed from `actions-codex`
  because current DLL source marks it obsolete and excludes it from UI mapper
  generation.
- New/changed exact refs: `actions-codex` gained 1 thin public target,
  `ActionTypeMove`; the targeted deep-dive added mechanics sections, not new
  navigable refs.
- Removed invalid refs: `Population_Aspect` no longer emits
  `Aspect_DistrictImprovement_00` in `referenceKeys` or `publicContextKeys`.
- Removed raw/internal public text: 1 councilor biography key,
  `Notable_FactionQuest_Mukag_Chapter05_PerisaiDescription`.

Final validated export counts for the EWShop import snapshot:

- `actions-codex`: 139 rows; 3 newly
  enriched source-backed action rows in this pass; obsolete
  `ActionTypeBanishPopulationFromSettlement` omitted.
- `actions-codex-inventory`: 139 rows.
- `resources-codex`: 24 rows; 22 with `Extractor_*` reverse refs.
- `districts-codex`: 167 rows; 66 extractor rows with `Resource_*` refs.
- `improvements-codex`: 123 rows.
- `abilities`: 364 rows.
- `abilities-codex`: 336 rows; 328 rows changed only by additive ability
  metadata facts; 24 warnings remain for intentionally unresolved ability text.
- `bonuses-codex`: 585 rows.
- `bonuses-codex-mechanics`: 36 rows.
- `diplomaticTreaties-codex`: 22 rows.
- `quests-codex`: 300 rows.
- `quest_explorer`: 156 rows.
- `quest_explorer_branch_diagnostics`: 315 rows.
- `traits-codex`: 178 rows.
- `councilorEffects-codex`: 42 rows.
- `partnerEffects-codex`: 39 rows.
- `councilors-codex`: 43 rows; historical councilor/effect batch had
  86 linked effect facts, 81 unique effect refs, and 0 dead refs.

## Final Validation State

EWShop should use final accepted snapshot `20260616-210540` for import/QA.
Snapshot `20260616-200204` is retained as the validated Action/Population
deep-dive evidence point, but it was superseded as the final accepted snapshot
by the ability metadata F8 export.

- Final build: `dotnet build EL2.DBExporter.csproj -c Debug` passed with
  0 warnings and 0 errors.
- Final F8: completed by the user after DLL install.
- Final snapshot: `export-snapshots/20260616-210540`.
- Final validation: `export-reports/20260616-210540_validation.md` reports
  0 errors for every registered exporter check.
- Final diff: `export-reports/20260616-200204_to_20260616-210540_diff.md`
  shows no row-count changes and only `abilities-codex` content changes from
  additive metadata facts.
- Final BepInEx log inspection: no plugin load errors, reflection/type errors,
  export exceptions, or failed export kinds; exporter reported
  `succeeded=21, failed=0`.

For the next runtime-affecting exporter change after this return, rebuild,
install, run a new F8 export, snapshot, validate, diff, and inspect BepInEx
logs before updating the final snapshot again.

EWShop import/QA checklist:

- `npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300`
- `npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md`
- `npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md`
- Browser QA representative URLs listed in
  `docs/active/codex-db-exporter-response-import-qa-plan.md`.
- Confirm shallow categories remain shallow: `resources`, `councilorEffects`,
  `partnerEffects`, `traits`.
- Confirm Modifiers remain hidden from top-level navigation.
