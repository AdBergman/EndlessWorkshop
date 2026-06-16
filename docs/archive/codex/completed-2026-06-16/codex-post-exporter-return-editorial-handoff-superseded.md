# Codex DB Exporter / Editorial Handoff

Status: archived superseded DB Exporter/editorial action list
Current as of 2026-06-16

Archived note: this concise handoff has been replaced by
`docs/active/codex-db-exporter-definitive-handoff.md`.

Use this note as the current handoff after the completed EWShop
post-exporter-return and category/subtype UX loops. It lists only gaps that
EWShop cannot safely solve without new canonical exporter/editorial data.

Sources:

- `docs/active/codex-category-ux-audit.md`
- `docs/active/codex-current-audit-ticket-plan.md`
- `docs/active/codex-content-quality-diagnostics.md`
- `docs/active/codex-relationship-value-gap-audit.md`
- `docs/active/codex-preview-surface-audit.md`
- `docs/current-action-priorities.md`

## EWShop Baseline Not To Reopen

- Generic Codex import/API accepts and serves current generic exportKinds.
- `resources`, `councilorEffects`, `partnerEffects`, and `traits` are
  top-level shallow reference categories, not rich strategy dossiers.
- `modifiers` remain hidden from top-level Codex navigation and are only
  searchable/linkable exact targets.
- Tech exact unlock summaries, Population exact threshold summaries, Treaty
  exact Applied Status summaries, Ability inline Status links, and granted
  Ability previews are implemented only for exported exact refs.
- EWShop will not infer links, mechanics, summaries, or relationships from
  display names, prose, or fuzzy matching.
- Thin rows are valid searchable/linkable targets, but EWShop will not invent
  gameplay text to make them feel richer.

## Current Diagnostic Snapshot

Latest content-quality diagnostic command:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
```

Result:

- Entries scanned: 2127
- High findings: 178
- Owner split: 178 DB Exporter/editorial, 0 EWShop
- Issue types: 170 `missing-player-context`, 8 `raw-internal-text`
- Affected categories: actions 87, districts 41, improvements 23, abilities
  19, populations 7, councilors 1

## Actionable Exporter / Editorial Work

1. Add public gameplay context to thin Actions.
   Evidence: 87 Action entries are facts-only. Examples:
   `ActionTypeArmyStealTerritory`, `ActionTypeBanishPopulationFromSettlement`,
   `ActionTypeBuildObservatory`.
   Needed: concise public purpose, availability/source, costs, target
   constraints, effects, and exact affected-target refs where canonical.

2. Add public gameplay context to thin Districts and Improvements.
   Evidence: 41 District entries and 23 Improvement entries are facts-only.
   Examples: `District_Bridge`, `District_Tier0_Bridge`,
   `DistrictImprovement_Bridge_01`, `DistrictImprovement_Extractor_01`.
   Needed: public effects, unlocks, requirements, source, strategic summary,
   and exact refs where canonical.

3. Add mechanics context to thin Abilities.
   Evidence: 19 Ability entries are too thin for rich detail pages. Examples:
   `UnitAbility_AlwaysRetaliate`, `UnitAbility_Blossom_1`,
   `UnitAbility_Blossom_2`.
   Needed: public effect/mechanics summaries and exact Status/effect refs where
   canonical.

4. Replace raw internal Population values with public labels and exact refs.
   Evidence: 7 Population findings expose internal keys or unresolved targets.
   Examples: `Population_Aspect` shows `Faction_Aspect`;
   `Population_KinOfSheredyn` shows `Faction_KinOfSheredyn`;
   `Population_Minor_MangroveOfHarmony` references
   `MangroveOfHarmony_District_Tier1_Money`.
   Needed: public display labels plus exact `referenceKey` values when the
   value points to a current Codex entity.

5. Fill Resource and Extractor context where canonical.
   Evidence: Resource/Extractor exact links work in EWShop, but some entries
   remain thin lookup rows. Examples: `Resource_Specific_Corpse`,
   `Resource_Specific_Spirit`, advanced/grand extractor rows with no Effects.
   Needed: public use, source, extraction relationship, availability, and
   effects where canonical. Resource deposits / POI pages remain deferred.

6. Improve Diplomatic Treaty effects and incomplete public text.
   Evidence: 22 Treaties include 11 entries with neither direct Effects nor
   Applied Status refs, and surrender/tribute prose remains incomplete.
   Examples: `Treaty_AskToSurrender`, `Treaty_ProposeSurrender`,
   `Treaty_SharedVictory`.
   Needed: direct public Effects summaries, exact Applied Status refs where
   canonical, and completed public text.

7. Export Status sub-kind/scope and fill thin Statuses.
   Evidence: 337 derived Status entries currently share the broad Status
   grouping; 32 are thin. Examples: `HeroStatus_Loss`,
   `Status_AdministrativeCenter_Subjugation`, `Status_Army_Map_Speed_Immobile`.
   Needed: public sub-kind/scope such as City, Army, Empire, Combat, Hero,
   Public Opinion, Map, or Treaty, plus minimal public mechanics for thin rows.

8. Omit or repair deprecated placeholder bonus rows.
   Evidence: EWShop local import rejects two bonus rows whose display name is
   exactly `[DEPRECATED]`: `ConstructibleCostModifier_UnitCostReduction03` and
   `ConstructibleCostModifier_UnitMoneyCostReduction01`.
   Needed: omit them from public Codex exports, or provide real public names
   and context if they are still valid player-facing targets.

9. Replace the raw Councilor description key.
   Evidence: one Councilor diagnostic still reports raw internal description
   text.
   Needed: public localized prose or no public description field if the entry
   has no safe player-facing description.

## Acceptance Expectations

- Every new relationship must use exact exported keys that resolve to current
  public Codex entries.
- Public prose should answer the player question directly: what it does, when
  it appears, what it affects, and why it matters.
- If no canonical public source exists, leave the entry thin and document that
  it is intentionally not exported as rich browse content.
- Do not require EWShop to infer links from labels or prose.

## Explicit Non-Goals

- Do not ask EWShop to expose `modifiers` in top-level navigation.
- Do not ask EWShop to add SEO, broad graph expansion, or fuzzy link matching.
- Do not ask EWShop to invent gameplay summaries unsupported by exporter data.
- Do not reopen completed EWShop shallow-reference presentation decisions for
  `resources`, `councilorEffects`, `partnerEffects`, or `traits` without new
  product evidence.

## Validation After Exporter Return

- Rerun the content-quality diagnostic against the new local Codex imports.
- Browser-QA representative list and detail pages for Actions, Statuses,
  Abilities, Resources/Extractors, Traits, Population thresholds, and Treaties.
- Confirm exact refs resolve without display-name matching.
- Confirm `modifiers` remain hidden from top-level navigation.
