# Quest Explorer Live 0.80 Semantic Gap Audit

Status: active audit note  
Canonical reference: `docs/quest_explorer_canonical_semantics_v1.md`  
Compared export: `local-imports/exports/ewshop_quest_explorer_export_0.80.json`

## Scope

This audit compares the compact canonical semantic fixtures against the live
0.80 `quest_explorer.v3` export. It uses explicit JSON fields only:
`sectionRole`, branch grouping, parent/prerequisite/reveal metadata,
continuation links, convergence links, failure links, aliases, lore ownership,
objective ownership, and navigation faction/questline metadata.

Keys and titles are used only as human-readable examples, not as semantic
truth.

## Diagnostic Run

Command:

```sh
npm run diagnostics:quests -- ../local-imports/exports/ewshop_quest_explorer_export_0.80.json
```

The live export diagnostic currently exits non-zero because the raw export does
not include backend progression DTO semantics.

For each new Quest Explorer export, rerun the command above and compare the
`Exporter handoff` section first. That section is the active DB/exporter action
queue.

Top-level diagnostic counts:

| Metric | Count |
| --- | ---: |
| Entries | 149 |
| Faction rail items | 87 |
| Minor faction rail items | 31 |
| World rail items | 30 |
| Other rail items | 1 |
| Raw export has `progression` | no |
| Classifier `unknown` rows | 0 |
| Lore ownership gaps | 8 |
| Objective ownership gaps | 0 |

Canonical semantic counts across the live export:

| Semantic category | Count |
| --- | ---: |
| setup/artifact rows | 53 |
| deterministic continuations | 98 |
| explicit decision options | 48 |
| topology fork rows | 0 |
| convergence states | 3 |
| terminal states | 8 |
| failure states/links | 4 |
| unresolved continuations | 74 |
| internal variants | 0 |
| true-choice groups | 11 |
| topology forks without `true_choice` | 0 |
| grouped deterministic continuation groups | 14 |
| alias-owned stages | 0 |
| chapter variants | 0 |

## Current Exporter Handoff

The current live 0.80 run produces these actionable items:

| Item | Status | Action |
| --- | --- | --- |
| Missing `progression` DTO | Blocker for raw-file semantic validation | DB/exporter team should decide whether raw Quest Explorer JSON should include backend progression semantics. |
| Kin chapter 0 link | Accepted compatibility exception | Keep hardcoded link from `TutorialScenario_Quest_KinOfSheredyn_Chapter00_Step01` to `FactionQuest_KinOfSheredyn_Chapter01_Step01`; do not generalize this into frontend inference. |
| End Game lore ownership gaps | Data-quality cleanup | Fix the 8 `EndGameQuest_Event013` lore `choiceKey` references listed by diagnostics. |
| Requirement/reward `codexEntryKey` coverage | Exporter/product decision | Populate direct `codexEntryKey` for linked requirement/reward rows, or confirm frontend should keep resolving from `referenceKey`/`assetKey`. Current live run reports 479 linked rows without direct `codexEntryKey`. |
| Grouped deterministic continuations | Product/export clarification | Keep deterministic unless exporter intentionally marks those rows as topology alternatives. Current live run reports 14 groups. |

The 8 `EndGameQuest_Event013` missing lore `choiceKey` references are:

- `EndGameQuest_GlorifyToGlorify01ChoiceDefinition`
- `EndGameQuest_GlorifyToImpress01ChoiceDefinition`
- `EndGameQuest_GlorifyToMaster01ChoiceDefinition`
- `EndGameQuest_ImpressToGlorify01ChoiceDefinition`
- `EndGameQuest_ImpressToImpress01ChoiceDefinition`
- `EndGameQuest_ImpressToMaster01ChoiceDefinition`
- `EndGameQuest_MasterToGlorify01ChoiceDefinition`
- `EndGameQuest_MasterToImpress01Choice01Definition`

## Major Faction Coverage

The explicit major-faction buckets cover navigation faction keys for:
Kin of Sheredyn, Aspect, Last Lord, Necrophage, and Mukag. Kin chapter 0 is an
accepted compatibility placement and is reported in the `Exporter handoff`
section rather than counted as a missing-navigation exporter issue.

| Faction | Entries | Branches | Setup | Deterministic | Explicit decision | Convergence | Terminal | Failure links | Unresolved | True-choice groups | Linked continuation groups |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Kin of Sheredyn | 15 | 49 | 8 | 22 | 11 | 0 | 7 | 0 | 1 | 4 | 4 |
| Aspect | 8 | 24 | 5 | 14 | 4 | 1 | 0 | 0 | 0 | 2 | 1 |
| Last Lord | 13 | 36 | 18 | 12 | 5 | 0 | 0 | 0 | 1 | 2 | 1 |
| Necrophage | 25 | 57 | 7 | 30 | 14 | 2 | 0 | 4 | 4 | 2 | 2 |
| Mukag | 25 | 49 | 14 | 18 | 14 | 0 | 1 | 0 | 2 | 1 | 2 |
| Explicit buckets total | 86 | 215 | 52 | 96 | 48 | 3 | 8 | 4 | 8 | 11 | 10 |

Accepted explicit-navigation exception:

| Entry | Quest type | Faction key | Questline key | Branch kinds |
| --- | --- | --- | --- | --- |
| `TutorialScenario_Quest_KinOfSheredyn_Chapter00_Step01` | Major Faction | null | null | setup, deterministic, deterministic |

## Fixture Coverage Result

All live classifier kinds are covered by the canonical fixture set:

- `setup_task`
- `deterministic_continuation`
- `explicit_decision_option`
- `convergence`
- `terminal`
- `unresolved`

The fixture set intentionally also covers canonical kinds not present in this
raw live export:

- `topology_fork_option`
- `failure`
- `internal_variant`

Those remain useful because they protect known canonical semantics and DTO
shapes even though the raw 0.80 file does not currently exercise them.

## Newly Observed Live Pattern

The live export has grouped continuation rows where multiple rows share a
group and are all explicitly marked `sectionRole: continuation`. Examples
include:

- Kin of Sheredyn: Stirrings grouped Trail/Units continuations
- Kin of Sheredyn: The Kin's Fate Punish/Forgive continuations
- Aspect: A Tahuk's Fanaticism Destroy/Impose continuations
- Last Lord: The Fork in the Road continuations
- Necrophage: A Fresh Lead Help/Scare continuations
- Mukag: Forgotten Power and A Gamble Pious/Open/Bold continuations

These are not `true_choice` groups and should not be promoted to topology forks
solely because several continuation rows share a group. The explicit
`sectionRole: continuation` field keeps them in deterministic continuation
semantics.

Action taken:

- Added a compact canonical fixture for grouped deterministic continuation
  rows.
- Added a diagnostic count label: `grouped deterministic continuation groups`.

No product behavior changed.

## Gaps And Recommendations

### Export/API Contract Gap

The raw live 0.80 export has no `progression` DTO. As a result, when this file
is normalized directly in the frontend, semantic Lore/Strategy adapters cannot
activate for selected entries; the page falls back to entry-level opening and
overview behavior.

Recommendation: treat this as an exporter/API contract gap for future backend
or import work. Do not reintroduce frontend progression inference as a silent
replacement.

Kin chapter 0 remains the sole explicit exception and links to chapter 1 as a
compatibility placement.

### Classifier Gaps

No classifier gap was found for current live branch rows:

- `unknown` count is 0.
- Live branch rows map cleanly into canonical kinds.
- Grouped continuation rows remain deterministic, as intended.

### Adapter Gaps

No direct live adapter mismatch can be proven from the raw file because the raw
file lacks progression DTOs. Adapter behavior remains covered by compact
fixtures and existing product-continuity tests.

Recommendation: if a future live/API payload includes progression, rerun this
audit against that payload and compare Lore/Strategy stage kinds per selected
major chapter.

### Diagnostic Gaps

Diagnostics previously counted deterministic continuation rows but did not
surface grouped deterministic continuation groups. That made live continuation
groups look invisible unless a custom script scanned group topology.

Action taken: diagnostics now expose grouped deterministic continuation groups.

### Lore/Object Ownership Gaps

All 8 live lore ownership gaps are outside the major faction buckets and point
to `EndGameQuest_Event013` choice references that do not match exported
branch/choice keys. Objective ownership gaps are 0.

Recommendation: leave major-faction semantic work unblocked. Track the End Game
references separately as data-quality cleanup.

### Codex Entry Key Coverage

The live export has linked requirement/reward rows with `referenceKey` or
`assetKey` but no direct `codexEntryKey`. The diagnostic reports these as
`codex_entry_key_coverage_gap` with bounded examples.

Recommendation: DB/exporter team should either populate direct `codexEntryKey`
where targets are known, or confirm that frontend resolution should continue to
use typed `referenceKey`/`assetKey` fallback.

### Alias/Internal Variant Gaps

The raw live export has many alias lists and branch navigation rows, but no
progression variants, alias-owned stages, or chapter variants because the raw
file lacks `progression`.

Recommendation: keep existing internal variant fixtures. They represent the
canonical DTO shape expected when progression semantics are supplied, not the
raw fallback shape of this export file.

## Behavior Changes Avoided

This audit intentionally did not:

- change backend/exporter/schema/API behavior
- infer progression in the frontend
- reclassify grouped `sectionRole: continuation` rows as topology forks
- change Lore or Strategy rendering
- change navigation, route, or state ownership
- parse keys/titles as semantic truth

## Follow-Up Status

Implemented follow-up: Quest Explorer diagnostics now print per-faction
semantic summaries and exporter handoff items for configured major faction
keys. Future live-export audits can use
`npm run diagnostics:quests -- <export-path>` without temporary scripts for the
main faction coverage and DB/exporter action view.
