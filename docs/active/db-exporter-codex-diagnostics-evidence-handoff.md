# DB Exporter Codex Diagnostics Evidence Handoff

Status: active evidence packet  
Created: 2026-06-24  
Source artifact: local Admin Codex diagnostics report
`docs/active/codex-diagnostics-report.txt` (not committed; summarized here)

## Purpose

This packet summarizes the current Admin Codex diagnostics report into
actionable DB Exporter evidence. It intentionally does not duplicate the raw
diagnostics report.

Use this packet when drafting DB Exporter follow-ups about unresolved Codex
references, imported-domain references, or token/icon vocabulary gaps.

## Source Summary

The source diagnostics report was generated from current imported Codex data and
frontend Codex diagnostics tooling.

Reference summary:

- `raw-fallback-ref`: 3,825
- `unresolved-imported-domain-ref`: 42
- `unresolved-ref`: 84
- duplicate references: 0

Diagnostic signal summary:

- high-signal warnings: 35
- token vocabulary gaps: 472
- expected/internal noise: 65
- expected style tokens: 4,398
- other diagnostics: 3,931

Icon/token summary:

- resolved icon tokens: 4,398
- unresolved icon tokens: 552
- manifest categories with no observed/configured frontend use:
  `battle-abilities` and `equipment`

## Interpretation Rules

- `unresolved-imported-domain-ref` is the highest-signal bucket for exporter
  follow-up because the reference points at an imported domain kind, but EWShop
  cannot resolve it to a public Codex target.
- `unresolved-ref` can be exporter-owned, EWShop-owned, or intentionally
  non-public. It needs per-category triage.
- `raw-fallback-ref` is not treated as a missing-data bug. EWShop currently
  resolves these through loose raw-key fallback. This is contract looseness and
  may become a future hardening topic, but it is not an immediate exporter
  defect.
- Unused manifest icon paths are not product bugs by themselves. EWShop only
  uses narrow explicit icon contracts.

## DB Exporter Follow-Up Candidates

### Imported-Domain References That Do Not Resolve To Public Codex Targets

Current count: 42.

Breakdown by source export kind:

- `quests`: 11
- `heroes`: 10
- `factions`: 9
- `units`: 8
- `tech`: 2
- `minorfactions`: 1
- `populations`: 1

Breakdown by imported domain hint:

- `quest`: 11
- `ability`: 10
- `faction`: 9
- `minorFaction`: 7
- `district`: 4
- `unit`: 1

Highest-signal examples:

- `factions:Faction_Aspect` references `District_Base_CityCenter_Tier1`
  (`district`) and `UnitAbility_Aspects_CoordinatedTactics` (`ability`).
- `factions:Faction_KinOfSheredyn` references
  `District_Base_CityCenter_Tier1` (`district`) and
  `UnitAbility_KinOfSheredyn_StandUnited` (`ability`).
- `heroes:Hero_World_Jailer` references `Faction_Hero` (`faction`) and
  `UnitAbility_Hero_WorldHero00` / `UnitAbility_Hero_WorldHero01`
  (`ability`).
- `tech:Mukag_Technology_FactionQuest_Chapter06A` references
  `UnitAbility_Mukag_Illumination_Upgraded` (`ability`).
- `units:Unit_MinorFaction_GreenScion_Final` references
  `MinorFaction_GreenScions` (`minorFaction`).
- `units:Unit_Tormented_Infector` references `Faction_Tormented`
  (`faction`).

Requested exporter clarification:

- For each unresolved imported-domain reference, clarify whether the referenced
  thing is public Codex content, rich-only/source-truth data, internal/debug
  data, or obsolete/prototype content.
- If public, emit a public Codex target or an exact public Codex reference that
  EWShop can resolve without raw-key fallback.
- If non-public, mark or omit it so EWShop does not treat it as a public
  relationship.

### Ability To Status References

Current examples:

- `abilities:UnitAbility_BodyGuard` references `Status_Unit_Bodyguard`.
- `abilities:UnitAbility_Hero_Mukag_Caster02` references
  `Status_Unit_Entangled`.
- `abilities:UnitAbility_Hero_Mukag_Defender02` and
  `abilities:UnitAbility_Hero_Mukag01` reference `Status_Unit_Ecstatic`.
- `abilities:UnitAbility_Hero_WorldHero02` references
  `Status_Hero_BaseAbility_02`.

Requested exporter clarification:

- Confirm whether these Status references should resolve to public Status Codex
  entries.
- If yes, emit matching public Status entries or exact refs to the canonical
  public Status keys.
- If no, classify them as internal/non-public so EWShop can keep them out of
  public relationship UI.

### Minor Faction / Protectorate Trait References

Current examples:

- `minorfactions:MinorFaction_Blackhammer` references
  `ProtectorateTrait_Blackhammer_Trait01`.
- `minorfactions:MinorFaction_Blackhammer` references
  `ProtectorateTrait_Blackhammer_Trait02`.

Requested exporter clarification:

- Confirm whether these protectorate traits are public Trait Codex entries,
  rich-only data, or obsolete/internal keys.
- If public, emit exact public Codex references.

### Tech And Constructible Reference Aliases

Current examples:

- `tech:Aspect_Technology_00` references `Aspect_DistrictImprovement_01`.
- `tech:Aspect_Technology_02` references `Aspect_DistrictImprovement_02`.
- `tech:Aspect_Technology_07` references `Aspect_DistrictImprovement_03`.
- `tech:Necrophage_Technology_02_v2` references
  `Necrophage_District_Appendage00_Tier1_v2`.

Requested exporter clarification:

- Confirm whether these are public constructible unlock targets.
- If public, emit exact public Codex refs to the matching District or
  Improvement entries.
- If they are source-only aliases, expose the canonical public target key or
  classify them as non-public.

### Token/Icon Vocabulary Clarification

Current unresolved icon tokens:

- `DoubleArrow`: 472 occurrences, mostly in Ability description lines.
- `PopulationCategory_01`: 39 occurrences.
- `PopulationCategory_02`: 33 occurrences.
- `PopulationCategory_Homeless`: 8 occurrences.

Requested exporter clarification:

- Confirm whether `DoubleArrow` is a stable public style token that EWShop
  should render, or whether exporter should replace/strip it from public prose.
- Confirm whether `PopulationCategory_01`, `PopulationCategory_02`, and
  `PopulationCategory_Homeless` should have public token/icon mappings,
  public display labels, or exact public refs.

## EWShop-Owned Follow-Ups

### Raw Fallback Reference Hardening

Current count: 3,825.

These currently resolve through EWShop raw-key fallback and are not treated as
missing data. Largest buckets:

- `bonuses`: 962
- `units`: 755
- `quests`: 552
- `tech`: 297
- `equipment`: 281
- `actions`: 183

EWShop follow-up:

- Decide whether to keep raw-key fallback as a compatibility layer or gradually
  require typed/exact public Codex refs in new exporter snapshots.
- Do not send raw fallback counts to DB Exporter as missing-reference bugs
  without a narrower contract-hardening request.

### Action / Bonus / Modifier Noise

Many unresolved refs under `bonuses` and `actions` point at cost modifiers,
effect definitions, technology eras, constructible families, or faction gauge
state keys.

EWShop classification:

- Do not promote Modifiers or raw bonus internals to public Codex UI.
- Use the existing Modifier provenance follow-up only when source-backed public
  provenance is needed.

### Admin Diagnostics Link Plumbing

The diagnostics report is useful evidence, but the app currently has an
explicit guard against serving generated root audit artifacts as public
resources. If Admin wants direct downloadable Missing-link JSON/Markdown from
the UI, EWShop should add an admin-safe download path rather than exposing
generated root files publicly.

## No-Action / Expected Noise

- Known style tokens are expected and high-volume: 4,398 occurrences.
- Unused broad SVG manifest categories are not actionable by themselves.
  EWShop intentionally consumes narrow explicit icon contracts rather than
  rendering broad manifest inventory.
- Quest imported-domain refs should not trigger a Codex archive reconstruction.
  Quest Explorer owns quest progression and branching. Only public
  encyclopedia-style questline metadata should return to Codex in the future.
- `DoubleArrow` is a token vocabulary gap, not a relationship gap.

## Recommended Next Request

Create a focused DB Exporter request for unresolved imported-domain refs first.
Ask DB Exporter to classify each referenced target as public Codex, rich-only,
internal/prototype, obsolete, or unavailable, and to emit exact public refs when
the target is public.

Do not combine this with Modifier provenance or Victory Path `Master`; those
already have separate open ledger follow-ups.
