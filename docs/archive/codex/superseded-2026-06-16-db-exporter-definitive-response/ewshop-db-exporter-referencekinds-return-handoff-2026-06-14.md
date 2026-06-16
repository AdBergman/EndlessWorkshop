# EWShop Return Handoff: ReferenceKinds Status + Modifier Batch

Status: validated, ready for EWShop review
Date: 2026-06-14
Source handoff:
`docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-implementation-packets.md`
DBExporter snapshot: `export-snapshots/referencekinds-status-modifier-clean-20260614`
Validation report: `export-reports/referencekinds-status-modifier-clean-20260614_validation.md`

## Scope

Implemented the next conservative ReferenceKinds batch:

- `CDEX-EXP-006` Status Scope Metadata: implemented safe subset.
- `CDEX-EXP-009` Modifier Public Labels: implemented safe subset.

Deferred:

- `CDEX-EXP-004` Actions Gameplay Summaries. No new cached canonical action source was used in this batch. Existing action cost/formula mechanics remain unchanged.
- Resource Codex entity packets. Still blocked by product/backend decision.
- Traits, quests, and broad entity-context enrichment. Not part of this batch.

## Contract Compatibility

No Codex root shape changed.
No `exportKind` changed.
No existing fields were removed or renamed.
No EWShop importer migration should be required.

Changes use existing generic Codex fields only:

- `facts`
- `sections`
- `sections[].items[]`
- `sections[].items[].referenceKey`
- `sections[].items[].facts[].referenceKey`
- `publicContextKeys`

## Status Scope Metadata

Status rows now add public `Scope` facts from `StatusDefinition.StartingType`, which is a serialized status source field. Assembly-qualified game type names are normalized before export.

Public mappings used:

- `Settlement` -> `City`
- `Army` -> `Army`
- `Empire` -> `Empire`
- `Unit` -> `Unit`
- `Hero` -> `Hero`
- battle entity/unit sources -> `Combat`
- diplomacy sources -> `Diplomacy`

`Status type` is added only when canonical descriptor mechanics collapse to one affected public stat, or when a linked cost modifier proves a cost type.

Guardrails:

- Scope is not inferred from status key or display name.
- Unknown/empty scope is omitted.
- Hidden and code-only statuses remain excluded.

Validated examples:

- `Status_City_Approval_High` / Ahead in the Polls: `Scope=City`, `Status type=Approval`, formula `Approval +15`.
- `Status_City_ApprovalLoss_High` / Approval Failure: `Scope=City`, `Status type=Approval`, formula `Approval -15`.
- `Status_Army_Map_Speed_Immobile` / Immobile: `Scope=Army`.
- `HeroStatus_Loss` / Hero Status Loss: `Scope=Hero`.

## Modifier Public Labels

Bonus mechanics now use resolved public target data more directly.

When a modifier has exactly one proven public target:

- the `Bonus mechanics` section item links to that public target with `referenceKey`;
- the `Target` fact also carries the same `referenceKey`;
- generated modifier labels use the target label, cost type, and modifier value.

Example intended shape:

```json
{
  "label": "Cut Forest money cost -50%",
  "referenceKey": "ActionTypeCutForest",
  "facts": [
    {
      "label": "Affected cost",
      "value": "Money"
    },
    {
      "label": "Modifier",
      "value": "-50%"
    },
    {
      "label": "Target type",
      "value": "Actions"
    },
    {
      "label": "Target",
      "value": "Cut Forest",
      "referenceKey": "ActionTypeCutForest"
    }
  ]
}
```

When a descriptor/tag/provenance target cannot be resolved to public Codex rows, product JSON continues to omit the unresolved target wording. Evidence remains diagnostics-only.

Additional product text guardrail:

- Proven public target keys are preserved when they point to public Codex rows.
- Raw/generated target labels containing `Definition`, `Descriptor`, `Tag_`, `UnitClass_`, `Class_`, mapper terms, or provenance text are suppressed from product labels/facts.

Validated examples:

- `ActionCostModifier_CutForest_Decrease_00`: display label `Cut Forest money cost -50%`, item/fact reference `ActionTypeCutForest`.
- `TechnologyCostModifierDefinition_Custom_Specific28_CheapMilitaryTech`: display label `Era 0 research cost -50%`, item/fact reference `TechnologyEra_Era0`.
- `ConstructibleCostModifier_KinOfSheredyn_DivinieDistrict_CostRising_0`: raw target label suppressed; public target key remains linkable.
- `ConstructibleCostModifier_KinOfSheredyn_DivinieDistrict_CostRising_1`: raw target label suppressed; public target key remains linkable.

## Actions

Actions were reviewed as optional/safe-subset only.

No action output changed in this batch because improving action summaries beyond the existing cached cost/formula mechanics would require a separate source investigation. This avoids reintroducing slow UI mapper/title/description probing or speculative purpose text.

## Build And Static Validation

Completed before F8 request:

- `dotnet build EL2.DBExporter.csproj -c Debug`
- `python -m py_compile tools/export_snapshot_lib/json_validation/codex.py`

## Runtime Validation

Fresh F8 export completed.

Snapshot:

- `export-snapshots/referencekinds-status-modifier-clean-20260614`

Validation:

- `export-reports/referencekinds-status-modifier-clean-20260614_validation.md`
- All checked exports passed.
- `actions-codex`: 0 errors, 0 warnings.
- `bonuses-codex`: 0 errors, 0 warnings.
- `bonuses-codex-mechanics`: 0 errors, diagnostics-kind warning only because no kind-specific validator is registered.

Leak checks:

- No `Amplitude.Mercury` assembly-qualified scope text in `bonuses-codex`.
- No `Target scope`, `Operation`, `DescriptorEvaluation`, `Constructibles matching descriptor`, `Constructible With Descriptor`, `Tag_`, `UnitClass_`, or `Class_` leaks found in product `bonuses-codex`.

BepInEx timings from the validated export:

- Actions Codex: `totalMs=70`.
- Bonuses Codex: `totalMs=292`, with `mechanicsIndexMs=154`, `entriesMs=94`.
- Full export session: `totalMs=3764`, `succeeded=18`, `failed=0`.

## Remaining Questions

- Whether EWShop wants a finalized public scope taxonomy beyond the current conservative mappings.
- Whether action summaries should get a separate decompile-backed packet focused on cheap canonical labels/descriptions and completion effects.
