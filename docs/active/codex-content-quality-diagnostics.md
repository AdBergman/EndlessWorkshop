# Codex Content Quality Diagnostics

Status: active workflow
Created: 2026-06-12
Owner: EWShop, with exporter/editorial handoff follow-up

## Purpose

Use the Codex content-quality diagnostic to separate three different problems:

- EWShop presentation noise that is still visible after current Codex rendering.
- Missing metadata where text looks structured but is not exported as facts or
  sections.
- Source/editorial Codex data that needs DB exporter or content-team follow-up.

Use the player-facing content-quality diagnostic when the question is narrower:
which public records are structurally nonempty but still useless to players
because they contain only classification/bookkeeping facts such as `Kind`,
`Category`, `Type`, `Tier`, `Cost`, or faction labels. This check is separate
from reference integrity and does not redefine the strict-thin structural check.

This is not an admin UI workflow yet. The useful surface for current AI-assisted
review is deterministic text output that can be pasted into Codex or attached to
handoff docs.

## Run

From `frontend/`:

```bash
npm run diagnostics:codex-content
npm run diagnostics:codex-player-content
```

Optional inputs:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
npm run diagnostics:codex-content -- --input ../local-imports/codex/ewshop_equipment_codex_export_0.80.json
npm run diagnostics:codex-player-content -- --input ../local-imports/codex --rich-input ../local-imports/exports --limit 300
npm run diagnostics:codex-player-content -- --format json --output ../docs/archive/codex/codex-player-content-quality.json
```

Default input is `../local-imports/codex`. The player-facing diagnostic also
reads `../local-imports/exports` by default so it can classify whether useful
rich-domain source data exists.

## Output Model

Each finding has:

- category and entry key;
- issue kind;
- severity;
- owner;
- exact field path;
- visible value;
- reason;
- recommended next action.

Owners mean:

- `EWShop`: safe display cleanup, such as hiding duplicate fact lines.
- `Exporter`: source data, missing metadata, placeholder text, raw generated
  names, or missing public explanation after evidence/manual review establishes
  an exporter/content-side gap.
- `Both`: EWShop can mask the symptom, but exporter/editorial data should still
  improve.
- `Unresolved`: checked EWShop generic/rich inputs did not contain useful
  content, but ownership needs manual source/export evidence before assignment.

The player-facing diagnostic first identifies candidates, then assigns root
cause only when current generic/rich source evidence supports it.

Candidate kinds:

- `bookkeeping-classification-dominated`: visible public content is limited to
  classification/bookkeeping facts such as `Kind`, `Category`, `Type`, `Tier`,
  `Cost`, scope, slot, rarity, or faction labels.
- `missing-category-gameplay-content`: context or provenance exists, but it
  does not satisfy the small category expectation. For example, a Trait can
  name a quest reward without explaining the trait effect.

Root-cause classifications:

- `ewshop-rich-import-render-gap`: useful current Codex/rich source data exists,
  but EWShop does not preserve, join, or render it in the public Codex surface.
- `no-richer-source-found`: the checked current generic and rich source inputs
  did not contain category-relevant gameplay content. This is an automatic
  evidence status, not by itself proof that canonical source data is genuinely
  absent.
- `likely-internal-support-record`: the public record looks like
  internal/support data and should be hidden unless public content is added.
- `unresolved-manual-evidence-required`: source evidence was not sufficient to
  assign a root cause.

Current category expectations are intentionally bounded:

- Traits, Abilities, and Statuses should expose effect/mechanical description,
  granted abilities, unlocks, requirements, or interactions as appropriate.
- Equipment should expose effects or granted abilities.
- Districts and Improvements should expose effects, unlocks, level-up rules,
  placement constraints, or requirements.
- Actions, Diplomatic Treaties, Resources, Councilor Effects, and Partner
  Effects should expose a public purpose/effect/use/requirement rather than only
  type labels.

## Current Generic Rules

The first diagnostic pass is universal across Codex categories. It flags:

- placeholder-looking text, including `TBD`, `TODO`, `placeholder`, and
  `SpecificNN`;
- raw internal text such as `UnitClass_*`, `ActionType*`, `Effect_*`,
  `*Definition_*`, and cost-modifier keys;
- raw labels such as `Reference key`, `Operation`, `Value type`, `Target scope`,
  and `Display value`;
- fact-shaped description text when structured facts are missing;
- entries with only classification facts and no player context;
- zero-value effect lines such as `+0 Dust`;
- formula-like text that needs a player-facing explanation.

Exact `descriptionLines` that duplicate exported facts are not reported by the
default diagnostic anymore. Current EWShop rendering already prefers exported
facts and sections for metadata-rich entries, so those raw duplicates are source
hygiene rather than current player-facing UI defects.

The implementation has a category-rule hook for future tuning, but the default
rules should stay conservative until a current local import proves a
category-specific rule is worth adding.

## Current Player-Facing Snapshot

The 2026-08-20 local run after category-aware policy refinement:

```bash
npm run diagnostics:codex-player-content -- --input ../local-imports/codex --rich-input ../local-imports/exports --limit 160
```

Scanned 2,588 Codex entries, including 2,030 public entries, and found 196
player-content diagnostic candidates. This is a candidate set, not a proven
per-row exporter ask.

Candidate kind counts:

- `bookkeeping-classification-dominated`: 151
- `missing-category-gameplay-content`: 45

Root-cause counts after checking current generic/rich inputs:

- `ewshop-rich-import-render-gap`: 12
- `no-richer-source-found`: 184

Owner counts:

- `EWShop`: 12
- `Unresolved`: 184

Category counts:

- Abilities: 23
- Actions: 84
- Diplomatic Treaties: 11
- Equipment: 2
- Improvements: 20
- Resources: 2
- Statuses: 20
- Traits: 34

Evaluated public categories with zero candidates:

- Councilor Effects: 42
- Districts: 167
- Partner Effects: 39

Public categories not covered by this category-aware policy:

- Councilors: 43
- Factions: 5
- Heroes: 79
- Minor Factions: 16
- Natural Wonders: 6
- Populations: 26
- Tech: 133
- Units: 156

Sample-reviewed findings:

- `traits:FactionTrait_LastLord_Chapter06AChoice01_FactionQuest` (`Feeding
  Frenzy`) is now flagged as `missing-category-gameplay-content`. The record has
  `Cost: 1`, `Kind: Trait`, `Trait type: Faction`, and quest reward/objective
  context, but no trait effect, granted ability, unlock, or requirement.
- `abilities:UnitAbility_Aoe_1` (`Collateral Damage I`) remains
  `no-richer-source-found`: generic Codex shows only `Shape: AoE 1`, and the
  rich ability export marks the record with `missingUsefulDescription`.
- `abilities:UnitAbility_Hero_BattleAbility_Equipment_Passive_12` (`Master of
  Arrows`) is `ewshop-rich-import-render-gap`: generic Codex shows only
  classification facts, while the rich ability export has `+20% Damage on Units
  of this Ranged class`.
- `equipment:Equipment_Consumable_10_Definition` (`Apotheosis Dirge`) is
  `no-richer-source-found`: current generic equipment data exposes only
  type/slot/rarity/tier/value, and there is no current rich equipment sidecar.
- `statuses:Status_Unit_Frenzy` (`Frenzied`) is `no-richer-source-found`:
  current status-like bonus data has only category/scope/polarity/kind, and
  there is no current rich status sidecar.
- `improvements:DistrictImprovement_Industry_00` (`Builders' Quarters`) is
  `no-richer-source-found`: generic and rich improvement exports have no
  effect/unlock/constraint lines.

Manual sample review:

- Actions: 10 sampled candidates had no description lines or sections in the
  current `actions-codex` export and no current rich Action sidecar.
- Traits: 10 sampled candidates confirmed three policy false positives, `Pitch
  Perfect`, `Honorary Knighting`, and `Process Rationalization`, where
  past-tense or disabling mechanical lines were present. The policy now accepts
  bounded effect verbs such as `decreased`, `increased`, and `disables`.
- Abilities: 10 sampled `no-richer-source-found` candidates either had
  zero-valued rich modifier lines such as `+0 Damage` or rich
  `missingUsefulDescription` shape-only records.
- Statuses: 10 sampled candidates had only status category/scope/polarity
  bookkeeping in the current bonus-derived status export.
- Improvements: 10 sampled candidates had empty generic description/sections;
  sampled rich improvement rows also had empty `descriptionLines` and no
  player-facing effect/unlock/constraint. Raw resource prerequisite IDs were
  not treated as player-useful constraints because they are not public refs.

Sample-reviewed non-findings:

- Traits such as `FactionTrait_Aspects_BattleAffinity` and quest reward traits
  with real `Effects` sections are not flagged.
- Abilities such as `UnitAbility_AlwaysRetaliate` and
  `UnitAbility_BloodMending_1` are not flagged because they expose mechanical
  effect lines.
- Statuses such as `HeroStatus_NecroEggCarrier` and
  `Status_City_Approval` are not flagged because their `Status mechanics`
  sections contain stat changes and formulas.
- Equipment and constructibles with `Effects`, granted abilities, level-up
  rules, or placement/yield lines are not flagged.

The diagnostic deliberately ignores quest provenance such as `Quest reward` and
`Reward objective` when deciding whether a Trait/Ability/Status explains its
mechanics. It also does not treat zero-valued modifier lines such as `+0 Damage`
as proof that useful rich source data exists.

## Review Workflow

1. Run the diagnostic against current local Codex imports.
2. Read the summary by owner and issue type.
3. For `EWShop` findings, batch only high-value low-risk display fixes.
4. For `Unresolved` findings, sample current generic/rich source evidence before
   assigning exporter/content ownership.
5. For `Both` findings, decide whether EWShop masking is enough for the current
   release or whether exporter/editorial follow-up should remain explicit.
6. Keep active docs short; archive completed evidence bundles under
   `docs/archive/`.

## Not In Scope

- SEO work.
- Graph visualization.
- New Codex categories.
- Inventing strategy summaries not supported by current data.
- Treating diagnostics as release gates before product review.
