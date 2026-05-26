# Quest Branch Continuity Diagnostic Summary

> [!NOTE]
> Status: historical diagnostic evidence. This report helped identify topology
> and ownership gaps, but its counts and labels are not canonical after the 0.80
> semantic investigation. Use
> `../../quest_explorer_canonical_semantics_v1.md` for current Quest Explorer
> semantics.

Packaged: 2026-05-23

Source export: `local-imports/exports/ewshop_quest_explorer_export_0.80.json`

Diagnostic files:
- `quest-branch-continuity-diagnostic.tsv`
- `quest-branch-continuity-diagnostic.json`

## Executive Summary

The Quest Explorer branch-continuity issue is not a product UI filtering problem. The suspicious steps contain real player choices, branch continuation choices, projected variants, unresolved/dead-end artifacts, and duplicate labels in the same visible step, but the current export does not provide enough ancestry or ownership metadata to tell those roles apart deterministically.

EWShop should not suppress or hide choices heuristically. The fix boundary is the exporter/API contract: the export needs explicit branch parentage, prerequisite path, variant grouping, continuation ownership, convergence grouping, and section role metadata so the backend and frontend can render branch-local continuity without guessing from labels, step numbers, aliases, or entry keys.

## Counts

- Total quest entries in source export: 149
- Suspicious `3+` choice steps: 61
- Severe `4+` choice steps: 44
- Diagnostic rows: 313
- Major questlines represented: `FactionQuest_KinOfSheredyn`, `FactionQuest_Aspect`, `FactionQuest_LastLord`, `FactionQuest_Mukag`, `FactionQuest_Necrophage`

Classification row counts:

| Classification | Rows |
| --- | ---: |
| projection/variant of current step | 74 |
| true player choice | 65 |
| unresolved/dead-end artifact | 59 |
| branch continuation; duplicate branch; likely wrong-path leakage | 42 |
| duplicate branch | 38 |
| branch continuation; likely wrong-path leakage | 35 |

Questline step counts:

| Questline | Suspicious Steps | Severe Steps | Max Visible Choices |
| --- | ---: | ---: | ---: |
| `FactionQuest_KinOfSheredyn` | 15 | 12 | 6 |
| `FactionQuest_Aspect` | 12 | 7 | 4 |
| `FactionQuest_LastLord` | 10 | 4 | 11 |
| `FactionQuest_Mukag` | 9 | 6 | 14 |
| `FactionQuest_Necrophage` | 15 | 15 | 11 |

## Worst 20 Cases

| Questline | Chapter | Step | Visible Choices | Diagnostic Rows | Classifications |
| --- | ---: | ---: | ---: | ---: | --- |
| `FactionQuest_Mukag` | 4 | 2 | 14 | 14 | projection/variant of current step; unresolved/dead-end artifact; duplicate branch |
| `FactionQuest_Mukag` | 2 | 2 | 13 | 13 | projection/variant of current step; unresolved/dead-end artifact; duplicate branch |
| `FactionQuest_LastLord` | 6 | 2 | 11 | 11 | projection/variant of current step; unresolved/dead-end artifact; duplicate branch |
| `FactionQuest_Necrophage` | 6 | 4 | 11 | 11 | projection/variant of current step; unresolved/dead-end artifact |
| `FactionQuest_Necrophage` | 6 | 3 | 10 | 10 | projection/variant of current step; unresolved/dead-end artifact; branch continuation; likely wrong-path leakage |
| `FactionQuest_Necrophage` | 3 | 1 | 9 | 9 | projection/variant of current step; true player choice; branch continuation; duplicate branch; likely wrong-path leakage |
| `FactionQuest_Mukag` | 4 | 1 | 8 | 8 | unresolved/dead-end artifact; branch continuation; duplicate branch; likely wrong-path leakage |
| `FactionQuest_Mukag` | 6 | 1 | 8 | 8 | projection/variant of current step; duplicate branch; unresolved/dead-end artifact |
| `FactionQuest_Necrophage` | 6 | 1 | 8 | 8 | projection/variant of current step; unresolved/dead-end artifact; branch continuation; duplicate branch; likely wrong-path leakage; branch continuation; likely wrong-path leakage |
| `FactionQuest_Necrophage` | 6 | 2 | 8 | 8 | projection/variant of current step; unresolved/dead-end artifact; branch continuation; likely wrong-path leakage |
| `FactionQuest_LastLord` | 6 | 1 | 7 | 7 | projection/variant of current step; unresolved/dead-end artifact; duplicate branch; branch continuation; duplicate branch; likely wrong-path leakage |
| `FactionQuest_Mukag` | 2 | 1 | 7 | 7 | unresolved/dead-end artifact; branch continuation; duplicate branch; likely wrong-path leakage |
| `FactionQuest_Necrophage` | 3 | 2 | 7 | 7 | projection/variant of current step; true player choice; duplicate branch |
| `FactionQuest_Necrophage` | 4 | 3 | 7 | 7 | projection/variant of current step; unresolved/dead-end artifact; true player choice |
| `FactionQuest_KinOfSheredyn` | 3 | 1 | 6 | 6 | projection/variant of current step; unresolved/dead-end artifact; branch continuation; likely wrong-path leakage |
| `FactionQuest_KinOfSheredyn` | 3 | 2 | 6 | 6 | projection/variant of current step; unresolved/dead-end artifact; true player choice; branch continuation; likely wrong-path leakage |
| `FactionQuest_KinOfSheredyn` | 3 | 3 | 6 | 6 | projection/variant of current step; unresolved/dead-end artifact; true player choice |
| `FactionQuest_KinOfSheredyn` | 1 | 1 | 5 | 5 | projection/variant of current step; true player choice; branch continuation; likely wrong-path leakage; unresolved/dead-end artifact |
| `FactionQuest_KinOfSheredyn` | 1 | 2 | 5 | 5 | projection/variant of current step; true player choice; branch continuation; likely wrong-path leakage; unresolved/dead-end artifact |
| `FactionQuest_KinOfSheredyn` | 4 | 1 | 5 | 5 | projection/variant of current step; true player choice; branch continuation; duplicate branch; likely wrong-path leakage |

## Kin Chapter 4 Deep Dive

`FactionQuest_KinOfSheredyn`, Chapter 4 has two suspicious steps, both with 5 visible choices.

Step 1 contains the real player choices `Track` and `Lure`, plus Step 2 continuation choices labeled `Capture the rogue Lieutenant.`. Those Step 2 choice keys are shown at Step 1 and are marked as likely wrong-path leakage because the DTO has no `parentBranchKey` or prerequisite path that tells EWShop which root choice owns each continuation.

Step 2 still shows the same root choices `Track` and `Lure` next to the duplicated `Capture the rogue Lieutenant.` continuations. The report also notes a numeric/raw questline collapse from `FactionQuest_KinOfSheredyn02` into `FactionQuest_KinOfSheredyn`, which makes stable variant/continuation ownership especially important.

Needed exporter semantics: the initial choices need a shared `choiceGroupKey`, each Step 2 continuation needs `parentBranchKey` / `parentChoiceKey` and `continuationOwnerEntryKey`, and the collapsed numeric variant needs a `variantGroupKey` so EWShop can keep it associated without flattening it into every visible step.

## Necrophage Chapter 3 Deep Dive

`FactionQuest_Necrophage`, Chapter 3 has two suspicious steps.

Step 1 has 9 visible choices. It includes real entry-owned choices `Claim Lands` and `Seek Facility` with modeled continuation targets, but also projected variants and Step 2 choices labeled `Virgin Lands`. The Step 2 choices are duplicated and leak back to Step 1 because the export does not expose their parent branch path.

Step 2 has 7 visible choices. It still includes the root choices, multiple projected entry variants, and duplicate `Virgin Lands` branches. This is a good example where the labels are not enough: `Virgin Lands` appears as an entry title/projection and as continuation branch labels.

Needed exporter semantics: `choiceGroupKey` should group `Claim Lands` / `Seek Facility` as the root decision, `parentBranchKey` and `prerequisiteBranchKeys` should attach each `Virgin Lands` continuation to its selected path, and `variantGroupKey` should distinguish projected entry variants from selectable branches.

## Mukag Chapter 2 And 4 Deep Dive

`FactionQuest_Mukag`, Chapter 2 Step 1 has 7 visible choices and Step 2 has 13. Chapter 4 Step 1 has 8 visible choices and Step 2 has 14, the worst case in the diagnostic.

Both chapters show the same structural pattern: `Pious`, `Open`, and `Bold` appear both as branch variants and as paired `EffectChoiceDefinition` / `ChoiceDefinition` branches. Step 1 shows Step 2 choices as likely wrong-path leakage, while Step 2 shows projected branch variants plus duplicate branch rows. Chapter 4 also includes duplicate unresolved `A Gamble` artifacts.

This is not safe to solve by label de-duplication. The duplicates encode different semantics: some are selectable choices, some are effects/outcomes, some are branch-local continuations, and some appear to be unresolved or terminal artifacts.

Needed exporter semantics: `sectionRole` should separate choice/effect/outcome/continuation sections, `choiceGroupKey` should identify the mutually exclusive `Pious` / `Open` / `Bold` decision, `branchStepOrder` should preserve the branch-local progression, and `continuationOwnerEntryKey` should say which entry owns each continuation row.

## Last Lord Chapter 6 Deep Dive

`FactionQuest_LastLord`, Chapter 6 has two suspicious steps: Step 1 with 7 visible choices and Step 2 with 11.

Step 1 contains `Reclaim` and `Reject`, duplicate branch rows for those labels, and Step 2 continuation choices labeled `A Mortal Life?` leaking into Step 1. Step 2 adds several projected variants, including branch-local outcomes, while unresolved/dead-end artifacts remain indistinguishable from terminal choices in the current contract.

The important ambiguity is whether `A Mortal Life?` belongs under the `Reclaim` branch, the `Reject` branch, both paths, or a convergence point. The current data exposes labels and links, but not enough path ownership to answer that deterministically.

Needed exporter semantics: `parentBranchKey`, `prerequisiteBranchPath`, `branchStepOrder`, and `convergenceGroupKey` are required to tell EWShop whether this is branch continuation, shared convergence, or terminal/outcome content.

## Fault-Boundary Conclusion

The fault boundary is between exporter-owned quest graph semantics and EWShop rendering/import projection. The current export gives EWShop branches, labels, order, next/failure/convergence links, and broad lore phases, but it does not provide the ancestry and role fields required to distinguish:

- root choices from branch-local continuation choices
- selectable choices from projected variants
- duplicate labels from duplicate semantic branches
- terminal/dead-end artifacts from intentional terminal choices
- convergence content from branch-owned continuation content

EWShop should preserve the current visible data and avoid suppression heuristics until EL2.DBExporter emits explicit branch-continuity metadata. Once the exporter adds the requested fields, EWShop can update the importer/progression DTO and render branch continuity from explicit contract fields rather than inferred labels or key patterns.
