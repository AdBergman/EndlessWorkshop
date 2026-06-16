# DB Exporter Response Import QA Results

Status: active QA result
Current as of 2026-06-16
Source plan: `docs/active/codex-db-exporter-response-import-qa-plan.md`

## Summary

Final accepted snapshot `20260616-210540` was available as installed local
Codex files under `local-imports/codex/`. The workspace does not contain a
separate `export-snapshots/20260616-210540/` directory, but the installed
`0.82` Codex files match the definitive response row counts for the checked
kinds, including `actions-codex` 139, `abilities-codex` 336,
`bonuses-codex` 585, `resources-codex` 24, `populations-codex` 26,
`diplomaticTreaties-codex` 22, `councilors-codex` 43,
`councilorEffects-codex` 42, and `partnerEffects-codex` 39.

Local startup import completed with `24 imported, 4 skipped, 0 failed`.
Deprecated placeholder rows did not fail import and were absent from the public
API.

Browser QA used local frontend `http://127.0.0.1:5173` backed by
`http://127.0.0.1:8080/api`. DOM evidence was captured with headless Chrome
under `/private/tmp/codex-db-response-qa-doms/`; no screenshots were needed.

Overall result: pass with one DB Exporter data issue. Major Population `Faction`
fact values for six major populations still arrive as raw `Faction_*` values in
the imported JSON/API, even though the definitive response says localized
public faction labels should be preferred. EWShop renders readable labels from
the exact related faction refs, so this is not a frontend/API blocker.

## Diagnostics

Commands run from `frontend/`:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md
npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md
```

Content diagnostic result:

- Entries scanned: 2573.
- Findings: 155 high, all `Exporter` owned.
- Issue types: 148 missing-player-context, 7 raw-internal-text.
- Categories: actions 84, districts 41, improvements 23, populations 7.
- Top EWShop candidates: none.

Generated active reports:

- `docs/active/codex-relationship-value-gap-audit.md`
- `docs/active/codex-preview-surface-audit.md`

Diagnostic note: the relationship-gap report now correctly shows 21/21
Population exact threshold refs resolved and 0 unresolved exact refs, but one
generated blocked-example paragraph still describes the old
`Aspect_DistrictImprovement_00` unresolved-ref state. Treat the QA evidence in
this result doc as the current source for `Population_Aspect`.

## Import And API Evidence

- Raw local files contain expected additions for
  `ActionTypeBuildObservatory`, `ActionTypeBuildCoralSpore`,
  `ActionTypeStripTile`, `ActionTypeMove`, `UnitAbility_AlwaysRetaliate`,
  `UnitAbility_RangedRetaliate`, and `UnitAbility_BreakRetaliate`.
- Raw local files no longer contain public rows/refs for
  `ActionTypeBanishPopulationFromSettlement`,
  `ConstructibleCostModifier_UnitCostReduction03`,
  `ConstructibleCostModifier_UnitMoneyCostReduction01`,
  `Aspect_DistrictImprovement_00`, or
  `Notable_FactionQuest_Mukag_Chapter05_PerisaiDescription`.
- Saved API payload `/private/tmp/codex-api.json` contained 2490 public entries
  after EWShop filtering/splitting.
- API preserved generic `facts[]`, `sections[]`, section items,
  `referenceKeys`, and `publicContextKeys` for sampled entries.
- API omitted the obsolete/deprecated public rows:
  `ActionTypeBanishPopulationFromSettlement`,
  `ConstructibleCostModifier_UnitCostReduction03`, and
  `ConstructibleCostModifier_UnitMoneyCostReduction01`.

## DB-CODEX-DEF-001 - Thin Actions

Expected DB Exporter change: Build Observatory, Build Coral Spore, and Strip
Tile gain source-backed `Action mechanics`; Move is present but thin; Army
Steal Territory may remain thin; Banish Population is omitted.

Imported data contains it: yes.

EWShop API preserves it: yes. API preserves `Action mechanics` sections and
keeps `ActionTypeMove` / `ActionTypeArmyStealTerritory` as public exact
targets. Public API omits `ActionTypeBanishPopulationFromSettlement`.

Frontend renders it correctly: yes.

Browser QA result: pass.

Evidence:

- `/codex?category=actions&entry=ActionTypeBuildObservatory` rendered
  `Action mechanics`, `observatory construction duration`, and
  `Creates and activates an Observatory`.
- `/codex?category=actions&entry=ActionTypeBuildCoralSpore` rendered
  `Action mechanics`, `Coral Spore construction duration`, and
  `Creates a Coral Spore`.
- `/codex?category=actions&entry=ActionTypeStripTile` rendered
  `Action mechanics`, `Strip Tile stance-action duration`, and consumed-terrain
  mechanics.
- `/codex?category=actions&entry=ActionTypeMove` rendered as a thin public
  `Army Action`.
- `/codex?category=actions&entry=ActionTypeArmyStealTerritory` rendered as a
  thin public Action.

Result classification: pass, with expected thin/plain behavior for Move and
Army Steal Territory.

## DB-CODEX-DEF-002 - Districts And Improvements

Expected DB Exporter change: extractor District rows exact-link to Resources;
remaining bridge/thin District/Improvement context stays thin when no public
source exists.

Imported data contains it: yes for the representative extractor/resource path.

EWShop API preserves it: yes. `Extractor_Luxury01_Tier2` preserves exact
`Resource_Luxury01` refs.

Frontend renders it correctly: yes.

Browser QA result: pass.

Evidence:

- `/codex?category=extractors&entry=Extractor_Luxury01_Tier2` rendered
  `Extracted resource` -> `Klax`.
- `/codex?category=resources&entry=Resource_Luxury01` rendered `Extractors`
  with Advanced Klax Extractor.

Result classification: pass.

## DB-CODEX-DEF-003 - Ability Mechanics

Expected DB Exporter change: Always Retaliate, Ranged Retaliate, and Break
Retaliate show improved mechanics/facts; Blossom and hero equipment passive
remain thin when only unsafe placeholder text exists.

Imported data contains it: yes.

EWShop API preserves it: yes. API preserves ability facts such as
`Ability mechanic`, `Ability source`, and `Combat role`.

Frontend renders it correctly: yes.

Browser QA result: pass.

Evidence:

- `/codex?category=abilities&entry=UnitAbility_AlwaysRetaliate` rendered
  `Vengeful Spirit`, `Changes retaliation to multiple uses`, and
  `Ability mechanic: Passive`.
- `/codex?category=abilities&entry=UnitAbility_RangedRetaliate` rendered
  retaliation damage, `Ability source: Battle ability`, and
  `Combat role: Damage`.
- `/codex?category=abilities&entry=UnitAbility_BreakRetaliate` rendered
  `Removes target retaliation before attacking`.
- `/codex?category=abilities&entry=UnitAbility_Blossom_1` rendered as a thin
  Passive ability with no `%Effect_*` placeholder text.
- `/codex?category=abilities&entry=UnitAbility_Hero_BattleAbility_Equipment_Passive_12`
  rendered as a thin Passive ability with no `%Tag_*` placeholder text.

Result classification: pass, with expected thin/plain behavior for Blossom and
the hero equipment passive.

## DB-CODEX-DEF-004 - Population Threshold Refs

Expected DB Exporter change: `Population_Aspect` no longer emits
`Aspect_DistrictImprovement_00`; `Population_Minor_MangroveOfHarmony` keeps
exact `MangroveOfHarmony_District_Tier1_Money`; `Population_Called` remains
text-only where no exact targets exist; localized public faction labels are
preferred over raw major faction keys.

Imported data contains it: mostly. The invalid `Aspect_DistrictImprovement_00`
ref is gone, Mangrove keeps its exact district ref, and Called remains
text-only. However six major Population rows still have raw `Faction_*` as the
`Faction` fact value in imported JSON/API:
`Population_Aspect`, `Population_KinOfSheredyn`, `Population_LastLord`,
`Population_LastLord_Primordial`, `Population_Mukag`, and
`Population_Necrophage`.

EWShop API preserves it: yes. The API preserves the raw fact values and exact
`referenceKey` values it received.

Frontend renders it correctly: yes for sampled pages. EWShop resolves the exact
Faction refs to readable labels in the UI, so `Population_Aspect` rendered
`Aspects` rather than `Faction_Aspect`.

Browser QA result: pass for frontend behavior; DB Exporter data issue for the
raw major Population faction fact values.

Evidence:

- `/codex?category=populations&entry=Population_Aspect` rendered
  `Nutrient Extractor` plain and did not include
  `Aspect_DistrictImprovement_00`.
- `/codex?category=populations&entry=Population_Minor_MangroveOfHarmony`
  rendered the exact threshold target.
- `/codex?category=populations&entry=Population_Called` rendered text-only
  rewards including `Cost modifier` and `Sacred Flames`.

Result classification: DB Exporter data issue, non-blocking for EWShop
frontend/API; expected thin/plain behavior for Aspect and Called rewards.

## DB-CODEX-DEF-005 - Resources And Extractors

Expected DB Exporter change: Resources are generic Codex entries with exact
extractor refs where proven; ResourceDeposit/POI pages remain out of scope.

Imported data contains it: yes.

EWShop API preserves it: yes.

Frontend renders it correctly: yes. Resources remain a shallow top-level
category.

Browser QA result: pass.

Evidence:

- `/codex?category=resources&entry=Resource_Specific_Corpse` rendered as a
  thin Exotic resource with `Not tradable`.
- `/codex?category=resources&entry=Resource_Luxury01` rendered `Klax`,
  `Luxury resource`, `Effects`, and `Extractors`.
- `/codex?category=extractors&entry=Extractor_Luxury01_Tier2` rendered exact
  `Klax` extracted-resource context.

Result classification: pass, with expected thin/plain behavior for Corpses.

## DB-CODEX-DEF-006 - Treaty Effects And Public Text

Expected DB Exporter change: surrender/tribute placeholder text is suppressed;
applied Status exact refs are exported where present.

Imported data contains it: yes.

EWShop API preserves it: yes.

Frontend renders it correctly: yes.

Browser QA result: pass.

Evidence:

- `/codex?category=diplomatictreaties&entry=Treaty_AskToSurrender` rendered a
  facts-only War treaty with no broken tribute placeholder text.
- `/codex?category=diplomatictreaties&entry=Treaty_ProposeSurrender` rendered
  `Applied statuses` and `Surrender accepted`.
- `/codex?category=diplomatictreaties&entry=Declaration_CloseBorders` rendered
  `Closed Borders declared` plus the exact applied Status preview:
  `-25 Public Opinion` with the Public Opinion icon.

Result classification: pass, with expected thin/plain behavior for runtime-only
surrender/tribute values.

## DB-CODEX-DEF-007 - Status Scope And Thin Statuses

Expected DB Exporter change: Statuses expose safe `Scope`, `Status type`, and
`Duration` facts where present; some statuses remain thin.

Imported data contains it: yes.

EWShop API preserves it: yes.

Frontend renders it correctly: yes.

Browser QA result: pass.

Evidence:

- `/codex?category=statuses&entry=HeroStatus_Loss` rendered `Scope: Hero` and
  `4 turns`.
- `/codex?category=statuses&entry=Status_PublicOpinion_YouClosedBorders`
  rendered `Status mechanics` and `-25 Public Opinion`.
- `/codex?category=statuses&entry=Status_Army_Map_Speed_Immobile` rendered
  `Scope: Army` and `1 turns`.

Result classification: pass, with expected thin/plain behavior for Hero Loss
and Immobile.

## DB-CODEX-DEF-008 - Deprecated Bonus Placeholder Rows

Expected DB Exporter change: deprecated `[DEPRECATED]` bonus/modifier rows are
omitted and do not fail local import.

Imported data contains it: yes. The known deprecated rows are absent from local
Codex files and public API.

EWShop API preserves it: yes by omission/filtering.

Frontend renders it correctly: yes; no sampled DOM contained `[DEPRECATED]`.

Browser QA result: pass.

Evidence:

- Public API contains 0 entries for
  `ConstructibleCostModifier_UnitCostReduction03` and
  `ConstructibleCostModifier_UnitMoneyCostReduction01`.
- Startup import logged `0 failed`.

Result classification: pass.

## DB-CODEX-DEF-009 - Councilor Description Key

Expected DB Exporter change: Perisai renders public text/effect refs and does
not show raw `Notable_*Description` text.

Imported data contains it: yes.

EWShop API preserves it: yes.

Frontend renders it correctly: yes.

Browser QA result: pass.

Evidence:

- `/codex?category=councilors&entry=Notable_FactionQuest_Mukag_Chapter05_Perisai`
  rendered `Qan Perisai`, `Chosen of the Eye`, and `Celestial Bond`.
- DOM did not contain
  `Notable_FactionQuest_Mukag_Chapter05_PerisaiDescription`.

Result classification: pass.

## DB-CODEX-DEF-010 - Modifier Public Targets

Expected DB Exporter change: safe public Modifier targets remain exact
search/link targets, while Modifiers stay hidden from top-level navigation.

Imported data contains it: yes.

EWShop API preserves it: yes. `ActionCostModifier_CutForest_Decrease_00`
remains reachable by exact key.

Frontend renders it correctly: yes.

Browser QA result: pass.

Evidence:

- `/codex?entry=ActionCostModifier_CutForest_Decrease_00` rendered
  `Cut Forest money cost -50%`, `Bonus mechanics`, and exact `Cut Forest`
  target context.
- `/codex` rendered top-level shallow categories `Resources`,
  `Councilor Effects`, `Partner Effects`, and `Traits`.
- `/codex` did not render `Modifiers` as a top-level navigation category.

Result classification: pass.

## Remaining Decisions

- Do not create EWShop frontend/API work from this pass.
- Report the raw major Population `Faction_*` fact values back to DB Exporter
  as a data issue if that response claim still matters; EWShop already masks
  it for users through exact ref label resolution.
- Treat remaining thin/plain rows as expected unless new source data appears.
- Treat the generated relationship-gap report's old
  `Aspect_DistrictImprovement_00` blocked-example sentence as stale diagnostic
  wording until the diagnostic script is cleaned up.
