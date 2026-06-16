# EWShop Return Handoff: CDEX-EXP-007 Trait Refs

Status: validated
Date: 2026-06-14
Source handoff:
`docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-implementation-packets.md`

## Scope

Implemented `CDEX-EXP-007` only:

- exact trait `Unlocks` section items from canonical trait simulation effects;
- source-backed `Granted abilities` items when the target exists as a public trait ability ref;
- source-backed `Removed abilities` items when the target exists as a public trait ability ref;
- conservative `Ability replacements` items only when a trait has exactly one public removed ability and exactly one public granted ability;
- public-target filtering for trait ability refs so unresolved/non-Codex `UnitAbility_*` refs do not become broken frontend links.
- suppression of raw trait action fallback lines such as `Unlocks action: ...` when no exact public action ref/text is available.

Not implemented:

- Quests packet.
- Resources packet.
- Actions packet.
- Broad thin entity cleanup.
- Fuzzy/prose/display-name inferred links.

## Contract Compatibility

No Codex root shape changed.
No `exportKind` changed.
No existing fields were removed or renamed.
No EWShop importer migration should be required.

Changes use existing generic Codex fields only:

- `referenceKeys`
- `publicContextKeys`
- `sections`
- `sections[].items[]`
- `sections[].items[].referenceKey`
- `sections[].items[].facts[]`
- `sections[].items[].facts[].referenceKey`

## Source Rules

Trait refs are generated only from canonical `SimulationEventEffect` definitions:

- `SimulationEventEffect_AddEmpireUnitAbility`
- `SimulationEventEffect_RemoveEmpireUnitAbility`
- `SimulationEventEffect_UnlockTechnology`
- `SimulationEventEffect_UnlockConstructible`
- `SimulationEventEffect_ProhibitConstructibles`

Battle ability, quest, action, descriptor, tag, class, mapper, and internal refs are not promoted into trait metadata.

Raw action fallback names are omitted from public trait text for this packet. This does not implement the Actions packet; it only prevents trait pages from exposing unverified action enum/source names.

## Ability Ref Policy

Trait `UnitAbility_*` refs are emitted only when the ability key is present in the public trait ability cache built from visible `UnitAbility` definitions and passes the public key filter.

After the first runtime validation, the cache was tightened to prefer exact keys loaded from the generated abilities Codex export. This prevents visible-but-not-Codex ability definitions from becoming dead trait links.

If a trait source references an ability that is not public/Codex-resolvable:

- keep existing readable text fallback when available;
- omit the exact `referenceKey`;
- do not add a broken `Granted abilities` or `Unlocks` item;
- suppress the unresolved ability from trait `referenceKeys`.

## Expected Validation Targets

After F8:

- Harmonious Tactics
- Deadly Corals
- Radiance
- Chant of the Rocks

Expected behavior:

- `Radiance` should gain an exact `Unlocks` item for its technology ref.
- Public trait ability refs should resolve against `abilities-codex`.
- Unresolved trait ability refs should drop instead of appearing as broken frontend links.
- Protectorate traits such as Chant of the Rocks should remain stable if no canonical unlock/ability target exists.

## Runtime Validation Notes

First F8 validation produced one actionable failure:

- `FactionTrait_VictoryCondition_MasterReward02` linked `UnitAbility_FightingTormented`, but that ability was not present in `abilities-codex`.

Correction:

- Trait ability refs now prefer the exact generated abilities Codex keyset.
- If abilities Codex is unavailable in an unusual standalone run, the exporter falls back to the old visible-ability cache, but normal F8 export order should use the exact Codex keyset.

Second review finding before handoff:

- `Radiance` was still text-only because its trait relationship comes from the existing technology prerequisite reverse index, not a direct trait effect.

Correction:

- The cached technology fallback now also emits exact `Unlocks.items[]` metadata when the target technology is public and canonical.

Final validation snapshot:

- `export-snapshots/trait-refs-cdex-exp-007-validated-20260614`
- `export-reports/trait-refs-cdex-exp-007-validated-20260614_validation.md`
- `export-reports/referencekinds-status-modifier-clean-20260614_to_trait-refs-cdex-exp-007-validated-20260614_diff.md`

Final validation results:

- Build passed.
- F8 export completed with `succeeded=18, failed=0`.
- Full snapshot validation passed.
- `trait-ability-reference-links` passed with `0` errors.
- `traits-codex` passed with `0` errors and `0` warnings.
- Trait Codex timing: `totalMs=168`, `elapsedMs=173`.
- Traits loaded exact ability keyset from abilities Codex: `publicAbilityKeysFromCodex=336`, `publicAbilityKeysFromFallback=0`.
- Exact trait `Unlocks` items in final JSON: `31`.
- Exporter structured unlock additions before duplicate section merge: `34`.
- Source-backed public `Granted abilities` items: `1`.
- Suppressed unresolved trait ability refs: `10`.
- Suppressed raw action fallback lines: `12`.

Validated examples:

- `FactionTrait_Aspects_BattleAffinity` / Harmonious Tactics: unresolved `UnitAbility_Aspects_CoordinatedTactics` link removed; text fallback preserved.
- `FactionTrait_Aspects_Chapter05AStep01_FactionQuest` / Deadly Corals: unresolved `UnitAbility_Aspects_CoordinatedTactics*` links removed; text fallback preserved.
- `FactionTrait_Aspects_Chapter05AStep02_FactionQuest` / Radiance: `Unlocks.items[]` now includes `referenceKey=Aspect_Technology_08` with `Unlock type=Technology`.
- `ProtectorateTrait_Ametrine_Trait01` and `ProtectorateTrait_Ametrine_Trait02` / Chant of the Rocks: unchanged because no canonical ability/unlock target was found.
- `FactionTrait_Custom_Specific36` / Heightened Senses: remaining trait ability ref resolves to `UnitAbility_Aware` in abilities Codex.

Remaining limitation:

- Some trait effects grant or remove ability-like gameplay concepts whose keys are not currently public abilities Codex entries. Those remain text-only to avoid dead frontend links. If EWShop wants pages for those ability concepts, that should be handled as a separate ability visibility/export decision, not inferred from trait prose.

## Build And Static Validation

Completed before F8 request:

- `dotnet build EL2.DBExporter.csproj -c Debug`
- `python -m py_compile tools/export_snapshot_lib/json_validation/codex.py tools/export_snapshot_lib/validation_report.py`

## Runtime Validation Plan

After a fresh F8 export:

1. Capture a new snapshot.
2. Run exporter validation.
3. Diff `traits-codex` against `export-snapshots/referencekinds-status-modifier-clean-20260614`.
4. Confirm cross-export `trait-ability-reference-links` passes.
5. Confirm no raw quest/action/internal keys leaked into trait section refs.
6. Spot-check the target examples listed above.

## Open Notes

- Ability replacement is intentionally conservative. It is emitted only for exactly one public removed ability plus exactly one public granted ability on the same trait.
- If EWShop wants non-public trait-referenced abilities to become Codex pages, that should be a separate ability visibility/export decision, not inferred inside trait metadata.
