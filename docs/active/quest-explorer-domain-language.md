# Quest Explorer Domain Language

Status: ACTIVE
Audience: Codex / implementation agents

## Authoritative model

Quest Explorer progression is:

questline
  -> chapter
    -> step
      -> choice / branch variant
        -> continuation step

Examples:
- Chapter 1 Step 1 may continue to Chapter 1 Step 2A or Step 2B.
- Chapter 1 Step 3C may continue to Chapter 2 Step 1B.
- Failed objectives may continue to alternate step/objective variants.
- Branch variants belong under steps.
- The rail shows chapters/steps, not graph permutations.

## Allowed domain terms

Use these in code, DTOs, tests, diagnostics:
- questline
- chapter
- step
- choice
- branch
- branchVariant
- continuation
- path
- progression
- stepKey
- detailEntryKey
- projectionKind

## Avoid

Do not use these in code unless explicitly defined:
- beat
- node
- graph
- arc
- segment
- flowNode
- branchNode

## Identity rules

- stepKey = progression identity
- detailEntryKey = content/detail identity
- detailEntryKey may repeat across virtual/alias-expanded steps
- branch variants do not become rail rows
- frontend must not infer missing progression
- missing continuation stops gracefully

## Ownership

Backend/domain owns:
- progression grouping
- chapter/step projection
- branch grouping
- continuation semantics

Frontend owns:
- selected choice path as session UI state
- Strategy/Lore presentation
- rendering
- rail active state

Frontend must not:
- parse keys to infer progression
- reconstruct graph semantics
- expose raw keys in normal UI
- invent continuation