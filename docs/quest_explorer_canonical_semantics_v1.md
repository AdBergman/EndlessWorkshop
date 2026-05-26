# Quest Explorer Canonical Semantics v1

Status: canonical semantic reference
Date: 2026-05-26
Primary evidence: `local-imports/exports/ewshop_quest_explorer_export_0.80.json`
Schema: `quest_explorer.v3`
Game version: `0.80`

This document is the authoritative Quest Explorer semantic reference for the
0.80 data set. Older Quest Explorer docs, prompts, and implementation comments
are historical context only when they conflict with this document.

## Authority Order

Use this order when deciding semantics:

1. Live exported JSON structure.
2. Explicit topology relationships in the data.
3. Current backend/API projection and frontend implementation.
4. Older project docs/specs/prompts.

Do not use title or key parsing as semantic truth. Key and title examples in
this document are identifiers for discussion only. The only exception is the
current Kin tutorial placement, which has no `factionKey` and is explicitly
handled by the current progression projector as a compatibility placement.

## Executive Findings

The 0.80 export does not model a simple `step -> choice -> step` graph. It
models entry-owned chronicles with internal task rows, aliases, objective/lore
anchors, explicit branch rows, and topology links. A branch row is not
automatically a player choice.

`navigation.step` is not meaningful user progression for the major faction
chapters. Canonical chapter entries usually have `step: 0`; visible intra-
chapter progression is carried by aliases, lore `stepIndex`, objective order,
`branches[].branchStepOrder`, and branch dependency metadata.

`nextEntryKeys` means "modeled successor links", not "the user has these
choices". A one-option continuation is usually a deterministic task. Multiple
successor links can represent variant entries, convergence helpers, failure
records, or final chapter variants rather than a decision UI.

The live export uses these branch roles: `artifact`, `continuation`,
`true_choice`, `convergence`, `terminal`, and `unresolved`. These roles must be
interpreted with `choiceGroupKey`, `parentBranchKey`, `prerequisiteBranchKeys`,
`revealedBy*`, `branchStepOrder`, and link arrays.

The raw JSON contains `strategyView.objectives[].choiceKey`, but the current
backend import/API DTOs and frontend type model do not preserve it. Current
frontend objective ownership is therefore reconstructed through lore
`objectiveKey`, branch `choiceKey`, and `branchStepOrder`. That works in many
cases but is not the full raw semantic model.

## Canonical Semantic Glossary

Semantic chapter:
A user-visible quest chronicle unit for a faction questline, usually anchored
by `navigation.chapterOrder` plus the entry's questline/faction family. A
semantic chapter may contain several internal task rows and may have chapter
variants. It is not equal to `navigation.step`.

Entry:
The canonical exported content record identified by `entryKey`. It owns title,
summary, aliases, navigation links, lore sections, strategy objectives, branch
rows, and quality metadata. Entries can be visible chapters, chapter variants,
internal branch outcome records, hidden variant records, or tutorial/setup
records.

Alias:
An alternate source identifier folded into an entry. Aliases are not display
items. In 0.80 they are semantically important because lore sections,
objectives, and branch rows often correspond to internal source steps that are
represented as aliases of one visible entry.

Objective:
A strategy task row in `strategyView.objectives`. In raw JSON an objective is
owned by its entry and also has `objectiveKey`, `choiceKey`, phase,
requirements, rewards, and reveal metadata. In the current API/frontend, the
objective `choiceKey` is dropped, so objective ownership must be recovered
through lore `objectiveKey` and branch metadata until the DTO is migrated.

Branch:
A row in `branches[]`. A branch is a topology/task/outcome row, not necessarily
a player decision. Interpret it by role, order, parent/prerequisite metadata,
reveal metadata, group metadata, and link arrays.

Branch topology:
The directed relationships expressed by `parentBranchKey`,
`parentChoiceKey`, `prerequisiteBranchKeys`, `prerequisiteBranchPath`,
`revealedByBranchKeys`, `revealedByChoiceKeys`,
`revealedByBranchPathAlternatives`, `nextEntryKeys`, `failureEntryKeys`, and
`convergesIntoEntryKeys`.

`sectionRole`:
The exported role of a branch row. Canonical values observed in 0.80 are:

- `artifact`: setup/context/task row. Often establishes the task that unlocks
  later continuations. Not a player choice by itself.
- `continuation`: a dependent task or follow-up. It may be deterministic, may
  be one option in a topology fork, or may carry a next/chapter link.
- `true_choice`: an explicitly modeled player choice option.
- `convergence`: a row or marker for paths rejoining a modeled point.
- `terminal`: a final outcome option with no further modeled successor.
- `unresolved`: a modeled option/state whose continuation is not identified in
  the export.

Continuation:
A modeled follow-up after an entry or branch row. A continuation can be
deterministic and mandatory. It becomes a selectable decision only when the
surrounding topology marks it as an explicit choice group or a true topology
fork that the product intentionally exposes.

Artifact/setup row:
An `artifact` branch row that represents required setup, context, or an
objective task. It may passively advance reveal context. It should not be shown
as "choose a path" unless paired with explicit decision metadata that makes it
an option.

True player choice:
The safest canonical signal is a group of two or more alternatives marked
`sectionRole: "true_choice"` at the same decision stage. The stage is usually a
shared `choiceGroupKey`; when older rows omit that key, use explicit topology
only: same owner entry, same parent/prerequisite context, same stage order, and
parallel successor links. A single `true_choice` row is a modeled option, not a
comparative decision by itself.

Sequential mandatory task:
A chain of `artifact` and/or `continuation` rows where only one eligible next
row exists at each stage. This is progression, not branching.

Convergence:
A branch or entry that rejoins another modeled point. Signals include
`convergesIntoEntryKeys`, `convergenceGroupKey`, and `sectionRole:
"convergence"`. Do not infer convergence by reverse-scanning titles or keys.

Unresolved continuation:
A row or path state where the export preserves an option but does not identify
the next entry or local continuation. `sectionRole: "unresolved"` is explicit.
The UI should stop gracefully rather than invent a next step.

Terminal/failure state:
A terminal state is an exported final outcome, usually `sectionRole:
"terminal"` or a final chapter with no successor. A failure state is explicit
only through `failureEntryKeys`; failure links may point to visible or hidden
entries.

Branch group:
A semantic set of related branch rows. `choiceGroupKey` is the best explicit
grouping for a decision stage. `groupKey`/`groupLabel` and
`navigation.branchGroupKey`/`branchLabel` identify broader branch families or
variant ownership, not necessarily a decision group.

Chapter variant:
An alternate semantic chapter at the same chapter order, entered from different
prior topology. Chapter variants are visible narrative paths, not duplicate
chapters. Examples include late A/B chapter lines in Aspect, Last Lord, Kin,
and Mukag.

Path fork:
A point with more than one possible successor/topology row. A path fork can be
an explicit true player choice, a terminal choice set, a non-true-choice
topology fork, or an unresolved modeled fork. Do not collapse all forks into
"choices".

`nextEntryKeys` semantics:
At entry level, `nextEntryKeys` is the union of modeled outgoing continuity from
that entry. At branch level, it is the branch row's modeled successor. It does
not imply player agency unless combined with explicit choice topology.

Lore section ownership:
Lore sections are owned by an entry and anchored by `choiceKey`,
`objectiveKey`, `stepIndex`, phase, and reveal metadata. The correct mental
model is a chapter chronicle with owned sections that become visible as the
selected branch context allows.

Objective ownership:
Objectives are owned by an entry and, in raw export, by `choiceKey`. They are
also joinable to lore through `objectiveKey`. Current frontend should continue
using `objectiveKey` and branch/lore context, but future DTOs should preserve
objective `choiceKey`.

## Chapter Topology Taxonomy

Linear sequential chapter:
A chapter with one deterministic task chain and at most one successor at each
stage. Usually `artifact -> continuation -> next chapter`.

Mandatory continuation chapter:
A chapter whose visible progress is a sequence of required tasks. It may have
several internal branch rows, but no explicit player decision.

Real branch-choice chapter:
A chapter containing an explicit multi-option `true_choice` decision group.
The chosen branch can reveal a continuation task, a chapter exit, convergence,
failure, terminal state, or unresolved future.

Branch topology fork:
A chapter containing multiple non-`true_choice` alternatives at the same
topology stage. These are real topology forks but should not automatically be
called player choices.

Convergence chapter:
A chapter that either begins from converged topology or links onward with
`convergesIntoEntryKeys`/`convergenceGroupKey`.

Unresolved continuation chapter:
A chapter with `unresolved` branch rows or modeled options that lack an
explicit successor where one is expected.

Variant chapter pair:
Two or more visible chapters at the same chapter order representing alternate
narrative paths. These should remain visible as chapter variants, not merged
into a single flat step list.

Hidden/internal alias grouping:
Entries or aliases that exist to anchor internal objectives, branch outcomes,
or branch permutations. These are navigable/debuggable data, but should not
become top-level rail rows unless the progression model says they are visible.

## Topology Counts

Counts below are raw major-faction family counts from the 0.80 export. They
include visible entries, numeric questline variants, hidden/internal variant
entries, and the Kin tutorial. Counts are semantic evidence, not UI control
counts.

| Family | Entries | Branch rows | Artifact | Continuation | True-choice rows | Explicit true-choice groups | Topology fork groups without true_choice | Unresolved rows | Terminal rows | Convergence rows | Failure rows |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Kin | 16 | 52 | 9 | 24 | 11 | 4 | 5 | 1 | 7 | 8 | 0 |
| Aspect | 8 | 24 | 5 | 14 | 4 | 2 | 2 | 0 | 0 | 3 | 0 |
| Last Lord | 13 | 36 | 18 | 12 | 5 | 2 | 3 | 1 | 0 | 0 | 0 |
| Necrophage | 25 | 57 | 7 | 30 | 14 | 2 | 4 | 4 | 0 | 6 | 4 |
| Mukag | 25 | 49 | 14 | 18 | 14 | 2 | 2 | 2 | 1 | 2 | 0 |

Notes:

- "Explicit true-choice groups" counts multi-option decision stages, not every
  single `true_choice` row.
- "Topology fork groups without true_choice" counts multi-row non-true-choice
  stages. These often look like choices if rendered naively, but they are not
  canonical true-choice groups.
- "Convergence rows" includes rows with convergence role or explicit
  convergence links.
- "Failure rows" counts branch rows with `failureEntryKeys`.

## Per-Faction Analysis

### Kin of Sheredyn

Shape:

- The Kin data has a tutorial/prologue entry, `A New Home`, plus two source
  questline variants: `Faction_KinOfSheredyn` and
  `Faction_KinOfSheredyn02`.
- The two source variants invert the early chapter order of `The Missing
  Youth` and `Stirrings`; they are not simple duplicates.
- `A New Home`, `The Missing Youth`, and several later chapters are mandatory
  task chains.
- `Stirrings` and `The Hunt` contain explicit real choices.
- `What Lies Beneath` contains a topology fork in one variant and an
  unresolved alternative in the other.
- `The Kin's Fate` forks to final A/B chapter variants through continuation
  rows, not `true_choice` rows.
- Final chapters use terminal rows and one cross-faction link from `Waiting for
  a Miracle` into Mukag's `A Clean Break`.

Classification:

| Chapter/entry family | Classification |
| --- | --- |
| Tutorial `A New Home` | Mandatory sequential task chain. |
| `The Missing Youth` | Mandatory continuation chapter in both order variants. |
| `Stirrings` | Explicit Search/Build true-choice decision with convergence; Kin02 adds dependent continuation variants. |
| `What Lies Beneath` | Base variant has a non-true-choice Quiet/Noisy topology fork; Kin02 has one modeled true-choice route plus unresolved alternative. |
| `The Hunt` | Explicit two-option true-choice decision followed by mandatory capture continuation. |
| `The Kin's Fate` | Setup plus Punish/Forgive topology fork to final chapter variants, but the fork rows are continuations. |
| `A Place Called Home` | Terminal final option set. |
| `Waiting for a Miracle` | Mixed final state: terminal outcomes plus a true-choice/cross-faction continuation in one source variant. |

Canonical counts:

- Explicit true-choice groups: 4.
- True-choice rows: 11.
- Continuation rows: 24.
- Artifact/setup rows: 9.
- Topology fork groups without `true_choice`: 5.
- Unresolved rows: 1.
- Terminal rows: 7.
- Variant structure: two early source questline variants, final A/B chapter
  variants, and one tutorial placement outside normal faction navigation.

### Aspect

Shape:

- Aspect is one source questline with eight visible entries.
- Most chapters are deterministic task chains.
- Chapter 4 is the main explicit branch choice and creates chapter 5/6 variant
  paths.
- Chapter 5A has convergence semantics and a non-true-choice fork.
- Chapter 6B is an explicit final decision. Chapter 6A is deterministic final
  continuation without explicit terminal role.

Classification:

| Chapter/entry family | Classification |
| --- | --- |
| `The Great Dieback` | Mandatory continuation chapter. |
| `Not of the Chorus` | Setup plus Provoke/Excavate topology fork without `true_choice`. |
| `Strangers Call` | Mandatory continuation chapter. |
| `A Relic of the Sages` | Explicit Handover/Refuse true-choice decision to chapter variants. |
| `A Tahuk's Fanaticism` | Convergence chapter with Destroy/Impose topology fork. |
| `An Aspect Reborn` | Mandatory continuation variant chapter. |
| `Siblings' Fury` | Deterministic final continuation. |
| `A Greater Harmony` | Explicit Integrate/Separate final decision. |

Canonical counts:

- Explicit true-choice groups: 2.
- True-choice rows: 4.
- Continuation rows: 14.
- Artifact/setup rows: 5.
- Topology fork groups without `true_choice`: 2.
- Unresolved rows: 0.
- Terminal rows: 0.
- Variant structure: chapter 5/6 path variants after chapter 4.

### Last Lord

Shape:

- Last Lord has visible A/B chapter variants and hidden final objective entries.
- Chapter 2 has one modeled true-choice route plus an unresolved alternative.
- Chapter 3 creates the main variant path fork without explicit `true_choice`
  rows.
- Chapters 4A/5A and 4B/5B are linear variant chains.
- Chapters 6A and 6B contain explicit true-choice final decision groups, plus
  hidden/internal outcome entries.

Classification:

| Chapter/entry family | Classification |
| --- | --- |
| `A Fragile Dawn` | Mandatory continuation chapter. |
| `A Blighted Resurrection` | Partially modeled decision: one `true_choice`, one unresolved alternative. |
| `The Fork in the Road` | Topology fork to A/B chapter variants without `true_choice`. |
| `A Fruitful Alliance` / `The Way of Distrust` | Linear variant chapter pair. |
| `Deeper Studies` / `Dark Revelations` | Linear variant chapter pair. |
| `A Mortal Life?` | Explicit Reclaim/Reject true-choice final decision plus dependent continuation rows. |
| `Welcome Back, Faithful Friend` | Explicit Forgive/Punish true-choice final decision plus dependent continuation rows. |
| Hidden final objective entries | Internal artifact/objective records, not top-level semantic chapters. |

Canonical counts:

- Explicit true-choice groups: 2.
- True-choice rows: 5.
- Continuation rows: 12.
- Artifact/setup rows: 18.
- Topology fork groups without `true_choice`: 3.
- Unresolved rows: 1.
- Terminal rows: 0, although the final chapter structure is terminal in
  topology.
- Variant structure: A/B chapter line from chapter 3 through chapter 6, plus
  hidden final objective entries.

### Necrophage

Shape:

- Necrophage has two numeric source variants: `Faction_Necrophage` and
  `Faction_Necrophage02`.
- The numeric variants share the same chapter families but differ in internal
  variant/failure topology.
- Chapter 3, `Virgin Lands`, is the main explicit true-choice decision in both
  variants.
- Chapter 4, `A Fresh Lead`, contains a non-true-choice fork and explicit
  failure links.
- Chapter 5, `The Holy Grail`, is a convergence chapter.
- Chapter 6, `A Bitter Truth`, is a dense internal topology fork with unresolved
  hidden outcomes and cross-variant failure/continuation links.

Classification:

| Chapter/entry family | Classification |
| --- | --- |
| `Brave New World` | Mandatory sequential chain in both source variants. |
| `You Scratch My Back` | Single modeled `true_choice` row; not a comparative decision by itself. |
| `Virgin Lands` | Explicit Claim Lands/Seek Facility true-choice decision; internal branch outcome variants exist. |
| `A Fresh Lead` | Mandatory setup followed by Help/Scare topology fork and failure links. |
| `The Holy Grail` | Convergence chapter with deterministic continuation. |
| `A Bitter Truth` | Dense final topology fork; hidden variant outcomes include unresolved rows. |

Canonical counts:

- Explicit true-choice groups: 2.
- True-choice rows: 14.
- Continuation rows: 30.
- Artifact/setup rows: 7.
- Topology fork groups without `true_choice`: 4.
- Unresolved rows: 4.
- Terminal rows: 0.
- Failure rows: 4.
- Variant structure: two numeric source variants collapsed by the current
  projection, visible/internal chapter 3 variants, hidden choice/outcome
  entries, and cross-variant failure links.

### Mukag

Shape:

- Mukag has one source faction key but many internal branch outcome entries.
- Chapters 2 and 4 are topology forks after setup rows. They present
  Pious/Open/Bold branch outcomes through continuation rows and internal
  variant entries, not canonical `true_choice` groups on the chapter entry.
- Chapter 6 has two explicit decision areas: `The Disciples` and `A Clean
  Break`.
- `A Sublime Belief` has final variant/outcome rows, including unresolved hidden
  endings and one terminal row.

Classification:

| Chapter/entry family | Classification |
| --- | --- |
| `New Dawn` | Mandatory continuation chapter. |
| `Forgotten Power` | Setup plus Pious/Open/Bold topology fork without `true_choice`; internal branch outcome entries. |
| `Precious Find` | Mandatory continuation chapter. |
| `A Gamble` | Setup plus Pious/Open/Bold topology fork without `true_choice`; internal branch outcome entries and convergence links. |
| `The Confrontation` | Mandatory sequential task chain. |
| `The Disciples` | Explicit Pious/Open/Bold true-choice decision to final variants, although group metadata is uneven. |
| `A Sublime Belief` | Final variant structure with single modeled rows, one terminal row, and unresolved hidden outcomes. |
| `A Clean Break` | Explicit Reform/Abolish true-choice final decision with dependent continuations. |

Canonical counts:

- Explicit true-choice groups: 2.
- True-choice rows: 14.
- Continuation rows: 18.
- Artifact/setup rows: 14.
- Topology fork groups without `true_choice`: 2.
- Unresolved rows: 2.
- Terminal rows: 1.
- Variant structure: internal Pious/Open/Bold outcome entries in chapters 2
  and 4, final A/B-style variants in chapter 6, hidden unresolved final
  outcomes.

## Frontend Mismatch Audit

Wrong or outdated assumptions:

- The old `step -> choice -> step` model is not canonical. The export models
  entry-owned chapter chronicles with internal task rows and topology metadata.
- `navigation.step`/`stepLabel` should not be treated as user-visible progress
  for major faction chapters.
- A branch row should not automatically be rendered or named as a "choice",
  "branch", or "path".
- A one-option continuation is not a path decision.
- Multiple `nextEntryKeys` do not automatically mean the user is choosing among
  those entries.
- Internal branch variant entries are not automatically semantic chapters or
  rail rows.
- Artifact/setup rows should not be rendered as player choices.
- Continuation rows should not be rendered as "Next Choices" unless topology
  marks them as a real exposed fork.
- `RenderedPathStep` currently flattens entry, projected step, task, decision,
  continuation, and variant semantics into one object. That loses distinctions
  the export makes.
- Current backend/API/frontend types do not preserve raw
  `strategyView.objectives[].choiceKey`, so objective ownership is less direct
  than the raw export.
- The old export contract document does not include newer live fields such as
  `branchStepOrder`, parent/prerequisite metadata, reveal metadata,
  `choiceGroupKey`, `convergenceGroupKey`, or `sectionRole`.

Partially right assumptions:

- Backend progression is useful for rail grouping and deep-link resolution, but
  it is a derived projection, not the full semantic model.
- Alias-expanded steps help reveal internal task/lore order, but aliases are
  not display items.
- Hiding no-link artifacts, unresolved rows, and ungated continuations in normal
  mode is directionally correct.
- Passive setup advance for a single artifact gate is correct for chapters such
  as Mukag's setup-before-fork structure.
- Lore narrative ownership by stable section/body identity is correct and
  should remain.
- Strategy's current behavior of treating a sole option as current task rather
  than showing a comparison section is aligned with the canonical model.
- Strategy/Lore state separation is correct and should remain.
- Debug/raw hidden row tooling is important because the live export contains
  hidden/internal topology that should be inspectable.

Assumptions that should become canonical:

- Use `sectionRole`, `branchStepOrder`, `choiceGroupKey`,
  `parentBranchKey`, prerequisites, reveal metadata, and explicit links as the
  topology basis.
- Lore is a chapter chronicle whose visible sections are owned by entry,
  objective, choice, stage, and reveal context.
- Strategy is a planning dossier scoped to the current task, explicit decision,
  projected outcome, and continuation status.
- The UI must stop gracefully at unresolved futures.
- The UI must not invent missing successors or convergence.
- Hidden/internal variant entries should be reachable through debug/deep-link
  resolution but not promoted to top-level rail chapters unless the progression
  model explicitly makes them visible.

UI terminology to retire or narrow:

- Retire generic "Choose a Path" for every branch moment.
- Retire "Next Choices" for deterministic continuation tasks.
- Retire "Path Revealed" for mandatory continuation rows.
- Retire "No further branch is recorded" when the state is simply a completed
  deterministic chapter or terminal outcome.
- Narrow "branch" to topology/debug contexts or explicit branch comparison.
- Use "Current task", "Decision", "Options", "Continuation", "Outcome",
  "Converges", "Failure", "Unresolved", and "Terminal" based on semantics.

## Corrected Frontend Semantic Model

### Lore adapter semantics

Build a `ChapterChronicle` model rather than treating every rendered step as a
choice gate. The model should contain ordered chronicle beats:

- setup/current task rows from `artifact` and deterministic continuation rows;
- owned lore sections by `choiceKey`, `objectiveKey`, `stepIndex`, and reveal
  context;
- optional decision groups only when explicit decision topology exists;
- deterministic continuations as "next task" or inline chronicle progression;
- topology forks without `true_choice` as a separate semantic kind;
- terminal/unresolved states as endings, not choices.

Preserve the current Lore behavior that avoids future lore leakage and claims
repeated lore once. Do not make Lore a graph canvas.

### Strategy adapter semantics

Strategy should derive these concepts:

- current task: the active objective/branch row to inspect;
- optional decision: a multi-option explicit true-choice or terminal decision
  group;
- branch comparison: only for true decision groups or product-approved topology
  forks;
- projected outcome: the selected option's owned continuation/objective/result;
- continuation status: deterministic local continuation, chapter exit,
  convergence, failure, unresolved future, or terminal completion.

A single visible continuation should stay in the Current task area with a Next
status. It should not create a comparison section by itself.

### Progression semantics

Use backend progression for rail grouping and deep-link location, but do not
equate backend projected steps with player choices. Display step counts as
internal chronicle/task counts where appropriate. Treat `navigation.step` as
debug/export metadata, not the main user-facing progress label.

### Branch semantics

Derive a semantic branch row kind before rendering:

- setup task;
- deterministic continuation;
- explicit decision option;
- topology fork option without true-choice role;
- convergence marker;
- failure outcome;
- terminal outcome;
- unresolved outcome;
- internal variant/outcome entry.

Only explicit decision options should use decision language.

### Navigation semantics

Entry deep links should resolve through entry identity and aliases to the owning
semantic chapter/variant. Hidden/internal branch variant entries should map
back to their owning chapter when possible. Raw/debug tooling should continue
to expose the unresolved details.

## Migration Recommendations

Phase 0 - Documentation and tests:

- Treat this document as the canonical Quest Explorer semantic reference.
- Add semantic fixture tests derived from 0.80 topology counts. Do not rely on
  `local-imports/` as committed test data; extract minimal fixtures.
- Add tests proving one-option continuations do not produce decision UI.
- Add tests for topology forks without `true_choice` in Mukag chapters 2/4,
  Aspect chapter 2, Kin chapter 5, and Necrophage chapter 4.

Phase 1 - View-model semantics only:

- Introduce a semantic adapter layer that classifies branch rows before
  `LoreReader` or `StrategyDossier` receives them.
- Keep existing route/deep-link hydration, debug panels, stores, and
  Strategy/Lore state separation stable.
- Keep `RenderedPathStep` as a compatibility wrapper initially, but add a richer
  semantic model beside it.
- Rename internal UI concepts away from generic `choice/path` only where the
  view model can provide accurate semantics.

Phase 2 - Lore cleanup:

- Convert Lore labels from "Choose a Path" and "Next Choices" to semantic
  labels.
- Render deterministic continuation tasks as chronicle progression, not choices.
- Keep future-lore suppression and lore ownership tracking.

Phase 3 - Strategy cleanup:

- Make the comparison section appear only for explicit decision groups or
  approved topology forks.
- Separate Current task, Decision, Projected outcome, and Continuation status in
  the adapter model.
- Replace "No further branch is recorded" with terminal/complete/unresolved
  language based on semantics.

Phase 4 - API/DTO migration, not now:

- Preserve raw `strategyView.objectives[].choiceKey` through import, domain,
  response DTOs, normalizer, and TypeScript types.
- Update the export contract document to include live topology fields.
- Do this only as a bounded API contract migration with frontend type/client
  verification.

Do not touch yet:

- Backend exporter/schema/API in this documentation pass.
- Share hydration, route/deep-link hydration, startup lifecycle ordering,
  tooltip timing, or GameDataProvider orchestration.
- Importer, DB, or Flyway layers unless an explicit DTO migration is scheduled.
- Debug/raw hidden row tooling.
- Strategy/Lore selected state separation.

## Documents And Assumptions To Retire

Retire as canonical:

- `docs/active/quest-explorer-domain-language.md`: the `questline -> chapter
  -> step -> choice / branch variant -> continuation step` model is too
  simplistic for 0.80.
- `docs/quest-explorer/quest_explorer_lore_design.md`: the
  `Step 1 lore -> choice -> selected Step 2 lore` model should become a
  historical design note.
- `docs/quest-explorer/quest_explorer_strategy_design.md`: still useful as a
  product direction note, but not a semantic spec.
- `docs/quest-explorer/quest_explorer_handoff.md`: historical reset context
  only.

Revise or annotate:

- `docs/quest-explorer-ux-design-template.md`: keep the premium UX direction,
  but revise broad "branching progression flow", "choices", and "path"
  language to distinguish tasks, continuations, forks, and true decisions.
- `docs/quest-explorer-export-contract-final.md`: keep as the schema contract
  baseline, but update it or add a pointer to this document for live topology
  fields and objective ownership.
- Frontend tests and fixtures that use generic "choice/path/branch" wording for
  artifact rows, mandatory continuations, and topology forks.

Retire these assumptions everywhere:

- Every branch row is a choice.
- Every continuation is a player decision.
- Every one-option row is a path.
- Every next link is a choice.
- Every branch variant is a chapter.
- `navigation.step` is the user-facing step.
- Old docs are more authoritative than live 0.80 topology.
