# EWShop Return Handoff: Councilor And Partner Effect Codex

Status: implemented and F8-validated
Date: 2026-06-14

## Implemented

- Added generic Codex exportKind `councilorEffects` for effects linked by exported public councilor rows.
- Added generic Codex exportKind `partnerEffects` for effects linked by exported public councilor rows.
- Added exact refs from existing `councilors` Codex rows to the new effect rows.
- Added both new kinds to snapshot/validation default coverage.
- Added inventory report rows for `councilorEffects` and `partnerEffects`.

## Output Files

- `codex/ewshop_councilor_effects_codex_export_<version>.json`
- `codex/ewshop_partner_effects_codex_export_<version>.json`
- Existing `codex/ewshop_councilors_codex_export_<version>.json` remains the same root shape and now has effect fact `referenceKey` values where the effect row exists.

## Public Key Shape

- `CouncilorEffectDefinition_X` projects to public key `CouncilorEffect_X`.
- `PartnerEffectDefinition_Effect_X` projects to public key `PartnerEffect_X`.
- Councilor rows link by canonical `CourtesanDefinition.CouncilorEffect` and `CourtesanDefinition.PartnerEffect`; no display-name matching or fuzzy inference is used.

## Contract Guarantees

- Existing Codex DTO shape is unchanged.
- Existing `councilors` exportKind and file name are unchanged.
- No Resource Codex entities were implemented.
- `CourtesanGenerationData` pools, weights, era prerequisites, and faction-affinity pools are not exported publicly in this pass.
- Unlinked effect definitions are not exported publicly in this pass. Public-safe is currently defined as "referenced by an exported public councilor row" plus a clean public display identity.
- Raw `CouncilorEffectDefinition_*` and `PartnerEffectDefinition_*` keys remain blocked from public refs.

## Mechanics Coverage

- Councilor effects use canonical `CouncilorEffectDefinition` data:
  - `GamePillarAffinity` as public `Role` fact.
  - `CouncilAppointmentDescriptors` through existing descriptor-line resolution.
  - `SimulationEventEffects` through existing effect reference and descriptor-line resolution.
  - `CouncilAppointmentCostModifiers` through the existing bonus mechanics presenter, without falling back to raw modifier reference keys.
- Partner effects use canonical `PartnerEffectDefinition.Effects` scoped to Hero:
  - localized effect description override/UI mapper text when public-safe.
  - descriptor-line resolution for referenced descriptors.
- Partner effects now have a pending one-hop mechanics follow-up:
  - direct `HeroTraitDefinition` references may contribute public descriptor lines.
  - direct `StatusDefinition` references may contribute public descriptor lines and status cost-modifier mechanics.
  - direct cost modifier references may contribute public bonus mechanics.
  - direct `UnitAbility_*` references may contribute public ability text and exact refs.
  - no suffix matching, display-name matching, fuzzy matching, broad DB search, or recursive graph walking is used.

## Known Limitations

- Some effect rows may remain display-name/facts-only if the game definition has no public-safe descriptor or localized effect text.
- Placeholder identities such as `[TBD]` are suppressed rather than exported.
- Gain values on `CouncilorEffectDefinition` were not exported in this pass; they appear AI/heuristic-oriented and need a separate public-safety review before product use.
- Partner effect mechanics depend on public-safe simulation effect text/descriptors; no invented prose was added.
- Partner one-hop mechanics are intentionally limited to direct targets on `PartnerEffectDefinition.Effects`. If unique mechanics require deeper graph traversal, they remain deferred.

## Validation

- Snapshot: `export-snapshots/councilor-partner-effects-codex-filtered-20260614`
- Validation report: `export-reports/councilor-partner-effects-codex-filtered-20260614_validation.md`
- Diff report: `export-reports/thin-entity-context-cdex-exp-010-slice-a-narrow-final-20260614_to_councilor-partner-effects-codex-filtered-20260614_diff.md`
- Full validation passed with 0 errors for `councilors-codex`, `councilorEffects-codex`, and `partnerEffects-codex`.
- `councilors` effect facts: 86 linked facts, 81 unique effect refs, 0 missing/dead refs.
- Leak scan found no `[TBD]`, raw `CouncilorEffectDefinition_*`, raw `PartnerEffectDefinition_*`, descriptor/tag/provenance/debug strings in the new effect files or linked councilor rows.
- BepInEx timings:
  - `Councilor Effects Codex`: 42 rows, 99ms.
  - `Partner Effects Codex`: 39 rows, 13ms.
- Spot checks:
  - Hydracorn / Atea links to `CouncilorEffect_Defense21` and `PartnerEffect_Hydracorn_PartnerTrait01`.
  - `Travels Well` exports as a councilor effect with public `Effects` lines.
  - `Hopeless Romantic` exports as a partner effect with public `Effects` lines.
  - Cost modifier mechanics are present on at least `Iron Magnate`, `Surveyor`, `Librarian`, `Visionary`, and `Harvester`.

## Partner One-Hop Follow-Up Validation

- Snapshot: `export-snapshots/partner-effects-one-hop-20260614`
- Validation report: `export-reports/partner-effects-one-hop-20260614_validation.md`
- Build passed locally before F8, then the DLL was installed to BepInEx.
- F8 validation passed for `partnerEffects-codex`, `councilors-codex`, and related generic Codex files with 0 errors.
- `partnerEffects` row count remains 39.
- All 39 partner effect rows keep the shared canonical Haven-per-hero-level line and now include at least one direct one-hop mechanics line.
- Distinct partner effect description line sets increased to 25.
- Councilor rows still link to partner effects through 43 partner effect facts, 39 unique partner refs, 0 dead refs.
- Leak scan found no raw `CouncilorEffectDefinition_*`, `PartnerEffectDefinition_*`, descriptor/tag/provenance/debug strings, Unity paths, GUIDs, or filesystem paths in `partnerEffects`.
- BepInEx timings:
  - `Councilor Effects Codex`: 42 rows, 144ms.
  - `Partner Effects Codex`: 39 rows, 111ms.
- Spot checks:
  - `PartnerEffect_Hydracorn_PartnerTrait01` / Hopeless Romantic now includes `+1 [MovementPoints] Movement Points outside battle on Units in Hero's Army`.
  - `PartnerEffect_Ametrine_PartnerTrait01` / Steady Heart now includes `+10 [Defense] Defense on Hero`.
  - `PartnerEffect_Noquensii_PartnerTrait01` / Supernova now includes `+1 [Intuition] Intuition on Units in Hero's Army` and `+1 [Determination] Determination`.
  - No direct `UnitAbility_Hero_*`, `Status_Hero_Partner_*`, or direct cost-modifier refs were exposed as public refs in the validated output; the useful mechanics came through direct descriptor/status/trait-supported text paths.
