# DB Exporter Response Import QA Plan

Status: active next-pass plan
Current as of 2026-06-16
Source:
`docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-definitive-response.md`

Use this plan for the next EWShop pass after receiving DB Exporter final
accepted snapshot `20260616-210540`. This is an import, diagnostics, and
bounded browser-QA pass only. Do not implement frontend changes unless the
fresh import proves EWShop is failing to preserve, serve, or render exported
generic Codex data.

## Inputs

- Final accepted snapshot: `export-snapshots/20260616-210540`.
- Final validation report:
  `export-reports/20260616-210540_validation.md`, 0 errors across registered
  checks.
- Final exporter runtime result: `succeeded=21, failed=0`.
- Final diff:
  `export-reports/20260616-200204_to_20260616-210540_diff.md`, no row-count
  changes and only additive `abilities-codex` metadata fact changes after the
  prior Action/Population deep-dive snapshot.

## Required Local Import Steps

1. Put the final accepted Codex export JSON files under
   `local-imports/codex/`. This folder is local-only and must not be committed.
2. Start the backend with local import enabled using the existing dev/local
   workflow.
3. Confirm startup import logs do not report stale deprecated public rows:
   `ConstructibleCostModifier_UnitCostReduction03` and
   `ConstructibleCostModifier_UnitMoneyCostReduction01`.
4. Start the frontend against the local backend.
5. Do not commit files from `local-imports/`.

## Diagnostics To Run

From `frontend/`:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md
npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md
```

Then check:

- Diagnostic output reflects final snapshot `20260616-210540`, not stale
  2026-06-14 local imports.
- Remaining thin/plain rows match the definitive response ownership notes.
- Generated reports do not recommend reopening completed EWShop exact-ref work
  without fresh evidence.

## Browser QA URLs

Use the local frontend URL, for example `http://127.0.0.1:5173`.

Actions:

- `/codex?category=actions&entry=ActionTypeBuildObservatory`
- `/codex?category=actions&entry=ActionTypeBuildCoralSpore`
- `/codex?category=actions&entry=ActionTypeStripTile`
- `/codex?category=actions&entry=ActionTypeMove`
- `/codex?category=actions&entry=ActionTypeArmyStealTerritory`

Abilities:

- `/codex?category=abilities&entry=UnitAbility_AlwaysRetaliate`
- `/codex?category=abilities&entry=UnitAbility_RangedRetaliate`
- `/codex?category=abilities&entry=UnitAbility_BreakRetaliate`
- `/codex?category=abilities&entry=UnitAbility_Blossom_1`
- `/codex?category=abilities&entry=UnitAbility_Hero_BattleAbility_Equipment_Passive_12`

Populations:

- `/codex?category=populations&entry=Population_Aspect`
- `/codex?category=populations&entry=Population_Minor_MangroveOfHarmony`
- `/codex?category=populations&entry=Population_Called`
- `/codex?category=populations&entry=Population_KinOfSheredyn`

Resources and extractors:

- `/codex?category=resources&entry=Resource_Specific_Corpse`
- `/codex?category=resources&entry=Resource_Luxury01`
- `/codex?category=districts&entry=Extractor_Luxury01_Tier2`

Diplomacy and statuses:

- `/codex?category=diplomatictreaties&entry=Treaty_AskToSurrender`
- `/codex?category=diplomatictreaties&entry=Treaty_ProposeSurrender`
- `/codex?category=diplomatictreaties&entry=Declaration_CloseBorders`
- `/codex?category=statuses&entry=HeroStatus_Loss`
- `/codex?category=statuses&entry=Status_PublicOpinion_YouClosedBorders`
- `/codex?category=statuses&entry=Status_Army_Map_Speed_Immobile`

Councilors and modifiers:

- `/codex?category=councilors&entry=Notable_FactionQuest_Mukag_Chapter05_Perisai`
- `/codex?entry=ActionCostModifier_CutForest_Decrease_00`

Category checks:

- `/codex?category=resources`
- `/codex?category=counciloreffects`
- `/codex?category=partnereffects`
- `/codex?category=traits`
- `/codex`

## Expected Wins To Verify

- `ActionTypeBuildObservatory`, `ActionTypeBuildCoralSpore`, and
  `ActionTypeStripTile` show source-backed `Action mechanics` sections.
- `ActionTypeMove` exists as a thin public Army Action exact target.
- `UnitAbility_AlwaysRetaliate` shows the repaired source-backed semantics.
- `UnitAbility_RangedRetaliate` and `UnitAbility_BreakRetaliate` show
  source-backed battle mechanics.
- Ability rows expose additive facts such as `Ability mechanic`,
  `Ability source`, and `Combat role` where exported.
- `Population_Aspect` still shows `Unlocks Nutrient Extractor` text, but does
  not link to `Aspect_DistrictImprovement_00`.
- `Population_Minor_MangroveOfHarmony` resolves
  `MangroveOfHarmony_District_Tier1_Money`.
- `Resource_Luxury01` and `Extractor_Luxury01_Tier2` keep exact
  Resource/Extractor refs.
- `Declaration_CloseBorders` shows exact applied Status mechanics through
  `Status_PublicOpinion_YouClosedBorders`.
- `Notable_FactionQuest_Mukag_Chapter05_Perisai` shows resolved public
  description text and exact Councilor/Partner Effect refs.
- `ActionCostModifier_CutForest_Decrease_00` remains directly reachable.

## Expected Thin Or Plain Entries

These should stay thin/plain unless final imported data contains new public
fields that contradict the definitive response:

- `ActionTypeMove`: public exact target, runtime/pathfinding behavior not a
  static mechanics summary.
- `ActionTypeArmyStealTerritory`: public exact target with no mapped static
  mechanics source in the response.
- `UnitAbility_Blossom_1`: unsafe `%Effect_*` placeholder/zero-value rich text
  remains suppressed.
- `UnitAbility_Hero_BattleAbility_Equipment_Passive_12`: unsafe `%Tag_*`
  placeholder text remains suppressed.
- `Population_Called`: text-only threshold rewards without canonical exact
  targets.
- `Resource_Specific_Corpse`: may remain thin if no additional public context
  is exported.
- `Treaty_AskToSurrender` and `Treaty_ProposeSurrender`: runtime-only
  surrender/tribute amounts stay absent.
- `HeroStatus_Loss` and `Status_Army_Map_Speed_Immobile`: thin public exact
  Status targets with current descriptor-only/no resolved public mechanics
  source.

Do not treat these as EWShop bugs.

## Exact Refs That Should Resolve

- `ActionTypeBuildObservatory`
- `ActionTypeBuildCoralSpore`
- `ActionTypeStripTile`
- `ActionTypeMove`
- `UnitAbility_AlwaysRetaliate`
- `UnitAbility_RangedRetaliate`
- `UnitAbility_BreakRetaliate`
- `MangroveOfHarmony_District_Tier1_Money`
- `Resource_Luxury01`
- `Extractor_Luxury01_Tier2`
- `Declaration_CloseBorders`
- `Status_PublicOpinion_YouClosedBorders`
- `Notable_FactionQuest_Mukag_Chapter05_Perisai`
- `ActionCostModifier_CutForest_Decrease_00`

## Invalid Or Dead Refs That Should Be Gone

- `Aspect_DistrictImprovement_00` from `Population_Aspect` `referenceKeys` and
  `publicContextKeys`.
- `ActionTypeBanishPopulationFromSettlement` as a public Action row.
- `ConstructibleCostModifier_UnitCostReduction03`.
- `ConstructibleCostModifier_UnitMoneyCostReduction01`.
- Raw biography token
  `Notable_FactionQuest_Mukag_Chapter05_PerisaiDescription`.
- Public `%Effect_*` / `%Tag_*` placeholder text from the known thin ability
  rows.

## Navigation And Category Checks

- Modifiers remain absent from top-level Codex navigation.
- Direct exact Modifier URL `/codex?entry=ActionCostModifier_CutForest_Decrease_00`
  still works.
- These categories remain shallow reference categories:
  - `resources`
  - `councilorEffects`
  - `partnerEffects`
  - `traits`
- Shallow category rows should show exported at-a-glance values and exact links
  where present, but should not become rich dossier pages.

## Stop Conditions

Stop and record evidence instead of implementing if:

- A row is thin because DB Exporter marked the richer data unavailable,
  runtime-only, unsafe, obsolete, internal, or product/export-scope deferred.
- The desired link requires display-name, prose, or key-shape inference.
- The requested change would promote Modifiers or redesign Codex navigation.
- The issue requires DB Exporter/editorial source data rather than EWShop
  preservation/rendering.

Frontend/API work is justified only if fresh import evidence shows EWShop
drops exported generic fields, loses exact refs, fails to serve imported data,
or renders a resolved exact ref incorrectly.
