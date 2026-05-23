# Quest Branch Continuity Exporter Request

Audience: EL2.DBExporter

Package: `docs/diagnostics/quest-branch-continuity/`

Evidence:
- `quest-branch-continuity-diagnostic.tsv`
- `quest-branch-continuity-diagnostic.json`
- `quest-branch-continuity-summary.md`

## Request

Please extend the Quest Explorer export with explicit branch-continuity metadata. EWShop currently receives branch labels, choice keys, ordering, and link arrays, but cannot determine branch ancestry, branch-local continuation ownership, projected variant grouping, or convergence ownership without unsafe frontend/backend inference.

Do not remove choices from the export to solve this. The current suspicious rows often contain real choices mixed with continuations, variants, outcomes, and unresolved artifacts. EWShop needs additional semantics so it can render them correctly.

## Fields EWShop Needs Added

Add these fields where applicable to exported branch/choice records, projected progression variants, and lore/strategy sections that are anchored to branch choices.

| Field | Type | Required Semantics |
| --- | --- | --- |
| `parentBranchKey` | `string | null` | Immediate parent branch whose selection makes this branch/continuation visible. Null only for root choices. |
| `parentChoiceKey` | `string | null` | Immediate parent source choice key, when different from or more stable than `parentBranchKey`. |
| `prerequisiteBranchKeys` / `prerequisiteBranchPath` | `string[]` | Ordered branch path from the root decision to this branch/section/variant. Prefer one canonical name, but EWShop needs the full ordered path. |
| `branchStepOrder` | `number | null` | Order of this item inside its branch-local continuation path. This must be independent of chapter/step labels and global `sequenceIndex`. |
| `choiceGroupKey` | `string | null` | Stable key for a mutually exclusive choice set shown at one decision point, for example a root `Track` / `Lure` decision or `Pious` / `Open` / `Bold`. |
| `variantGroupKey` | `string | null` | Stable key for projected variants that represent the same visible progression position or branch outcome family. |
| `continuationOwnerEntryKey` | `string | null` | Entry that owns this continuation. This lets EWShop avoid showing Step 2 continuation choices as Step 1 root choices. |
| `convergenceGroupKey` | `string | null` | Stable key for branches/sections that intentionally converge into a shared point. |
| `sectionRole` | `string | null` | Exporter-owned role for lore/strategy sections, distinct from broad display phase. Suggested roles: `setup`, `decision`, `choice_outcome`, `continuation`, `convergence`, `terminal`, `failure`. |

## Why Current Fields Are Not Enough

Current fields such as `branchGroupKey`, `groupKey`, `choiceKey`, `nextEntryKeys`, `failureEntryKeys`, and `convergesIntoEntryKeys` are useful but insufficient for rendering branch continuity.

Specific gaps:
- `choiceKey` often reveals a step number in the key string, but EWShop should not parse semantics from keys.
- `branchGroupKey` groups related content but does not identify the immediate parent branch choice.
- `nextEntryKeys` can point forward but does not say whether a row is a selectable root choice, a continuation, a branch effect, or a projected variant.
- `convergesIntoEntryKeys` identifies link targets but does not group all content that is part of the same convergence.
- Lore `phase` values do not distinguish choice setup, selected outcome, continuation, convergence, or terminal content.

## Acceptance Criteria

For the examples in this package:

- Kin Chapter 4: `Track` and `Lure` should be root choices in one `choiceGroupKey`; `Capture the rogue Lieutenant.` continuations should carry parent ancestry and a Step 2 `continuationOwnerEntryKey`.
- Necrophage Chapter 3: `Claim Lands` and `Seek Facility` should be root choices; `Virgin Lands` rows should be distinguishable as projected variant/title versus branch continuation by `variantGroupKey`, `parentBranchKey`, and `sectionRole`.
- Mukag Chapter 2 and Chapter 4: `Pious`, `Open`, and `Bold` should have a stable choice group, while effect/outcome rows and branch continuations should be separated by `sectionRole` and branch ancestry.
- Last Lord Chapter 6: `A Mortal Life?` must indicate whether it is owned by one parent branch, both branches, or a convergence point using parent path plus `convergenceGroupKey`.

EWShop can then update importer DTOs, persistence, progression projection, and frontend rendering to use explicit contract fields. Until then, EWShop should keep choices visible and avoid heuristic suppression.
