
# EWShop Quest Explorer Export Contract

> [!WARNING]
> Status: SUPERSEDED for live Quest Explorer semantics. This document remains a
> historical contract baseline, but it is not a complete 0.80 topology or
> semantic reference. Use `../../quest_explorer_canonical_semantics_v1.md` for
> canonical semantics and `quest_explorer_documentation_audit_v1.md` for
> documentation status.

Version: v3
Schema Version: quest_explorer.v3
Status: HISTORICAL CONTRACT BASELINE - NOT CANONICAL SEMANTICS
Audience:
- EL2DBExporter team
- EWShop backend importer team
- EWShop frontend Quest Explorer team

---

# Purpose

This historical contract baseline documents the clean Quest Explorer export read
model that the exporter, backend importer, and frontend prototype originally
validated against. It is superseded for semantic authority by
`../../quest_explorer_canonical_semantics_v1.md`.

This document now defines:
- DTO shape
- semantic ownership
- exporter responsibilities
- mapping expectations
- frontend expectations
- backend expectations

---

# Export Root

```ts
QuestExplorerExport {
  exportKind: "quest_explorer"
  schemaVersion: "quest_explorer.v3"

  exportedAtUtc: string
  gameVersion: string
  exporterVersion: string

  entries: QuestExplorerEntry[]
}
```

---

# Entry Contract

```ts
QuestExplorerEntry {
  entryKey: string

  title: string
  summaryLines: string[]

  questType?: string

  isMandatory?: boolean
  isKeyNarrativeBeat?: boolean

  aliases: string[]

  navigation: QuestNavigation

  loreView: QuestLoreView

  strategyView: QuestStrategyView

  branches: QuestBranch[]

  quality?: QuestQualityMetadata
}
```

Notes:
- `entryKey` is the stable canonical quest explorer entry identifier.
- `title` and `summaryLines` must always be display-grade.
- `isKeyNarrativeBeat` is retained only as a legacy exporter/import compatibility field. Normal Quest Explorer UI must not display it or derive behavior from it.
- `aliases` are lookup-only compatibility identifiers.
- Frontend should never display aliases directly.

---

# Navigation Contract

```ts
QuestNavigation {
  factionKey?: string
  factionName?: string

  questLineKey?: string
  questLineName?: string

  chapter?: number
  chapterLabel?: string

  step?: number
  stepLabel?: string

  sequenceIndex: number

  chapterOrder?: number
  stepOrder?: number

  branchGroupKey?: string
  branchLabel?: string
  branchOrder?: number

  isBranchStart?: boolean
  isBranchEnd?: boolean

  previousEntryKeys: string[]
  nextEntryKeys: string[]

  failureEntryKeys: string[]
  convergesIntoEntryKeys: string[]
}
```

Field semantics:
- `sequenceIndex`
  - canonical global ordering
  - deterministic
  - exporter-owned
  - frontend must not infer ordering from labels/keys

- `chapterOrder`, `stepOrder`
  - canonical local ordering inside a questline/chapter

- `branchGroupKey`
  - stable semantic branch grouping identifier
  - not intended for direct UI display

- `branchLabel`
  - display-grade branch family label
  - intended for UI display

- `branchOrder`
  - canonical ordering of branches inside a branch family

- `isBranchStart`, `isBranchEnd`
  - optional
  - only emit when exporter can confidently identify branch boundaries

- `previousEntryKeys`, `nextEntryKeys`
  - canonical progression continuity
  - frontend must not reconstruct these heuristically

- `failureEntryKeys`
  - explicit failure progression

- `convergesIntoEntryKeys`
  - explicit convergence semantics
  - frontend should not reverse-scan entries to infer convergence

---

# Lore View Contract

```ts
QuestLoreView {
  sections: LoreSection[]
}
```

Notes:
- Lore choices are no longer a separate semantic structure.
- Branch rendering comes from the unified `branches` array.

---

# Lore Sections

```ts
LoreSection {
  sectionKey: string

  phase:
    | "start"
    | "success"
    | "failure"
    | "choice"
    | "other"

  choiceKey?: string

  stepIndex?: number

  objectiveKey?: string

  lines: LoreLine[]
}
```

Field semantics:
- `phase`
  - display-facing transcript phase grouping

- `choiceKey`
  - optional semantic anchor to a branch/choice

- `stepIndex`
  - stable progression anchor
  - frontend should not derive transcript ordering heuristically

- `objectiveKey`
  - optional anchor to strategy/objective context

---

# Lore Lines

```ts
LoreLine {
  speakerLabel?: string

  role:
    | "narrator"
    | "character"

  text: string
}
```

Notes:
- `speakerLabel` must be display-safe when present.
- Missing `speakerLabel` is valid.

---

# Strategy View Contract

```ts
QuestStrategyView {
  objectives: StrategyObjective[]
}
```

---

# Strategy Objectives

```ts
StrategyObjective {
  objectiveKey?: string

  text: string

  phase?: string

  requirements: Requirement[]

  rewards: Reward[]
}
```

Field semantics:
- `phase`
  - display-grade phase grouping
  - exporter-owned
  - frontend should not infer phases from requirement arrays

---

# Unified Branch Contract

```ts
QuestBranch {
  branchKey: string

  choiceKey?: string

  label: string

  orderIndex?: number

  groupKey?: string
  groupLabel?: string

  nextEntryKeys: string[]

  failureEntryKeys?: string[]

  convergesIntoEntryKeys?: string[]

  lore?: {
    outcomePreviewLines?: string[]
  }

  strategy?: {
    conditions: string[]

    requirements: Requirement[]

    rewards: Reward[]
  }
}
```

Field semantics:
- `branchKey`
  - stable branch identifier
  - not intended for direct display

- `choiceKey`
  - optional source linkage identifier

- `label`
  - display-grade branch label

- `orderIndex`
  - canonical branch order

- `groupKey`
  - stable semantic branch family key

- `groupLabel`
  - display-grade branch family label

- `outcomePreviewLines`
  - lightweight branch choice preview text
  - intended for lore mode previews

---

# Requirements Contract

```ts
Requirement {
  requirementKey: string

  kind: string

  displayText: string

  polarity?: string

  groupLabel?: string
  groupOrder?: number

  targetRole?: string
  targetLabel?: string

  requiredCount?: number

  durationTurns?: number

  state?: string

  referenceKind?: string
  referenceKey?: string
  referenceDisplayName?: string

  codexEntryKey?: string
}
```

Field semantics:
- `displayText`
  - fully display-grade

- `kind`
  - semantic metadata
  - NOT intended as final UI text

- `groupLabel`
  - display grouping
  - examples:
    - Selection
    - Completion
    - Failure
    - Forbidden
    - Condition

- `groupOrder`
  - canonical display ordering for groups

- `referenceKind/referenceKey/referenceDisplayName`
  - semantic link to a concrete game concept
  - must be display-safe
  - not provenance

- `codexEntryKey`
  - optional EWShop codex lookup key
  - only emit when exporter can confidently map it

---

# Rewards Contract

```ts
Reward {
  rewardKey: string

  kind: string

  displayText: string

  amount?: number

  groupLabel?: string
  groupOrder?: number

  formulaText?: string

  assetKind?: string
  assetKey?: string
  assetDisplayName?: string

  referenceKind?: string
  referenceKey?: string
  referenceDisplayName?: string

  codexEntryKey?: string

  targetScopeLabel?: string
}
```

Field semantics:
- `amount`
  - fixed numeric amount only
  - do not force formulas into amount

- `formulaText`
  - formula/era-scaled rewards

- `groupLabel`
  - display grouping
  - examples:
    - Resources
    - Equipment
    - Science
    - Dust
    - Status Effects
    - Empire Bonuses

- `groupOrder`
  - canonical UI ordering

- `assetKind/assetKey/assetDisplayName`
  - concrete asset metadata

- `referenceKind/referenceKey/referenceDisplayName`
  - semantic game concept reference

- `codexEntryKey`
  - optional EWShop codex lookup key

---

# REMOVE From Main Export

Remove:
- diagnostics
- sourceRefs
- groupingKey
- groupingReason
- observedValues
- suppression counters
- duplicate counters
- normalization bookkeeping
- provenance metadata
- semantic cleanup bookkeeping

These belong only in optional diagnostics exports.

---

# Optional Diagnostics Export

```text
quest_explorer_diagnostics.json
```

Admin/debug only.
Never imported into production frontend runtime.

---

# Exporter Responsibilities

Exporter owns:
- progression semantics
- branch semantics
- canonical ordering
- display-grade labels
- codex metadata
- reward grouping
- requirement grouping
- transcript anchoring

Frontend must not infer these heuristically.

---

# Frontend Anti-Goals

Frontend must NOT:
- reconstruct graph semantics
- merge semantic arrays heuristically
- infer ordering
- infer branch labels
- humanize raw keys
- reverse-engineer convergence
- repair exporter semantics

---

# Final Direction

This export is intended to become:
- the canonical Quest Explorer contract
- stable frontend read model
- stable backend import model
- premium long-term chronicle foundation

Design goal:

A premium strategic chronicle system for Endless Legend 2.


# Required Acceptance Checks

Only for Exporter: output must prove:
- no root diagnostics in main export
- no sourceRefs in main export
- every entry has navigation.sequenceIndex
- branches are already ordered by orderIndex
- branch labels are display-grade
- requirements and rewards have displayText
- requirements/rewards use groupLabel when grouping is meaningful
- no UI-facing field contains raw localization keys or source identifiers
- next/failure/convergence links reference valid entryKeys or are empty arrays
