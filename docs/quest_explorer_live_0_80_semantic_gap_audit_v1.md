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
| failure states/links | 0 |
| unresolved continuations | 74 |
| internal variants | 0 |
| true-choice groups | 11 |
| topology forks without `true_choice` | 0 |
| grouped deterministic continuation groups | 14 |
| alias-owned stages | 0 |
| chapter variants | 0 |

## Major Faction Coverage

The explicit major-faction buckets cover navigation faction keys for:
Kin of Sheredyn, Aspect, Last Lord, Necrophage, and Mukag. One tutorial/major
entry has no explicit `navigation.factionKey` or `navigation.questLineKey`, so
it is reported separately rather than assigned by key/title parsing.

| Faction | Entries | Branches | Setup | Deterministic | Explicit decision | Convergence | Terminal | Unresolved | True-choice groups | Linked continuation groups |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Kin of Sheredyn | 15 | 49 | 8 | 22 | 11 | 0 | 7 | 1 | 4 | 4 |
| Aspect | 8 | 24 | 5 | 14 | 4 | 1 | 0 | 0 | 2 | 1 |
| Last Lord | 13 | 36 | 18 | 12 | 5 | 0 | 0 | 1 | 2 | 1 |
| Necrophage | 25 | 57 | 7 | 30 | 14 | 2 | 0 | 4 | 2 | 2 |
| Mukag | 25 | 49 | 14 | 18 | 14 | 0 | 1 | 2 | 1 | 2 |
| Explicit buckets total | 86 | 215 | 52 | 96 | 48 | 3 | 8 | 8 | 11 | 10 |

Unassigned explicit-navigation gap:

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

## Next Step

The next surgical cleanup should be a diagnostics-only enhancement that can
optionally print per-faction semantic counts for a supplied export path. That
would make future live-export audits repeatable without temporary scripts.
