# EWShop Return Handoff: Codex Exporter Packets

Status: ready for EWShop review
Date: 2026-06-13
DBExporter snapshot: `export-snapshots/codex-packets-tech-pop-treaties-final-20260613`
Validation report: `export-reports/codex-packets-tech-pop-treaties-final-20260613_validation.md`

## Scope Completed

Implemented the first safe DBExporter batch from
`docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-implementation-packets.md`.

Implemented:

- `CDEX-EXP-001` Tech Unlock Exact Refs
- `CDEX-EXP-002` Major Faction Population Threshold Reward Refs
- `CDEX-EXP-005` Diplomatic Treaty Effects And Public Text, safe subset

Not implemented:

- Resource Codex entity packets. They remain blocked by product/backend decision.
- Any unrelated Codex enrichment, UI-specific presentation changes, or new category-specific contracts.

## Contract Compatibility

No Codex root shape changed.
No `exportKind` changed.
No existing fields were removed or renamed.
No EWShop importer migration should be required.

Changes are additive or cleanup-only inside existing generic Codex fields:

- `referenceKeys`
- `publicContextKeys`
- `sections`
- `sections[].items[]`
- `sections[].items[].referenceKey`
- `sections[].items[].facts[].referenceKey`
- `descriptionLines`

## Tech Unlock Exact Refs

Tech Codex now emits exact `Unlocks` section item references when the rich tech unlock source has a canonical public target.

Example after export:

```json
{
  "entryKey": "Aspect_Technology_Unit_Specialization_00",
  "sections": [
    {
      "title": "Unlocks",
      "items": [
        {
          "label": "Stinger",
          "referenceKey": "Unit_Aspect_Ranged_SpecializationA",
          "facts": [
            {
              "label": "Unlock type",
              "value": "Unit unlock"
            }
          ]
        }
      ]
    }
  ]
}
```

Rules applied:

- Exact public unlock refs only.
- No refs inferred from display name, prose, or broad `referenceKeys`.
- Descriptor/effect-only unlocks stay text-only.

## Population Threshold Reward Refs

Major faction population threshold rewards now match the existing minor population shape when a canonical public reward target exists.

Validated examples:

- `Population_KinOfSheredyn` -> `KinOfSheredyn_DistrictImprovement_01`
- `Population_LastLord` -> `LastLord_DistrictImprovement_03`
- `Population_Necrophage` -> `Necrophage_DistrictImprovement_01`
- `Population_Mukag` -> `Mukag_DistrictImprovement_06`

Example after export:

```json
{
  "label": "At 5 population",
  "referenceKey": "KinOfSheredyn_DistrictImprovement_01",
  "facts": [
    {
      "label": "Reward",
      "value": "Military Press",
      "referenceKey": "KinOfSheredyn_DistrictImprovement_01"
    }
  ]
}
```

The same reward key is also included in `referenceKeys` and `publicContextKeys`.

## Diplomatic Treaties

Diplomatic treaty Codex output now avoids technical treaty references in product JSON.

Removed from product `referenceKeys`:

- `TreatyCategory_*`
- `TreatyCost_Descriptor_*`
- `TreatyCancelCost_Descriptor_*`
- `Tag_Treaty_*`
- descriptor-like treaty references

Public treaty descriptions are preserved when canonical and complete.

Example preserved:

```json
{
  "entryKey": "Treaty_SharedResearch",
  "descriptionLines": [
    "Signing this Treaty will provide [ScienceColored] Science bonuses to Cities in both Empires and make Technologies discovered by one Empire cost 20% less for the other Empire."
  ],
  "referenceKeys": [
    "Treaty_SharedResearch"
  ]
}
```

Incomplete runtime-parameter placeholders are suppressed.

Example after cleanup:

```json
{
  "entryKey": "Treaty_AskToSurrender",
  "displayName": "Surrender Demand",
  "descriptionLines": null,
  "referenceKeys": [
    "Treaty_AskToSurrender"
  ]
}
```

Known limitation:

- Static treaty definitions did not expose the missing surrender/tribute amount. DBExporter suppressed the broken text instead of inventing a value.

## Validation

Build:

- `dotnet build EL2.DBExporter.csproj -c Debug`
- Result: passed, 0 errors

Runtime export:

- DLL installed before F8.
- Fresh F8 export completed.
- Export log: `succeeded=18`, `failed=0`, `totalMs=5650`

Snapshot validation:

- Snapshot: `export-snapshots/codex-packets-tech-pop-treaties-final-20260613`
- Report: `export-reports/codex-packets-tech-pop-treaties-final-20260613_validation.md`
- Result: all checked exports OK

Targeted validator additions:

- Tech Codex validates exact unlock refs for `Aspect_Technology_Unit_Specialization_00`.
- Population Codex validates major faction threshold reward refs for the four requested examples.
- Diplomatic Treaty Codex validates that technical treaty category/cost/descriptor refs and incomplete tribute placeholders do not leak into product JSON.

## EWShop Review Notes

EWShop should verify:

- Tech pages can render unlock cards/links from `sections[].items[].referenceKey`.
- Population pages can render threshold reward links from item/fact `referenceKey`.
- Diplomatic treaty pages handle text-only entries with `descriptionLines: null` for suppressed broken placeholder copy.
- No importer migration is needed for these changes.

Recommended next decision:

- Confirm whether Resource Codex entities should become product Codex entries and what backend route/category semantics EWShop wants before DBExporter implements that packet.
