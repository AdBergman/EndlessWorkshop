# Quest Explorer Domain Language

> [!WARNING]
> Status: SUPERSEDED for Quest Explorer semantics. This document preserves
> historical implementation vocabulary, but it is not canonical. Use
> `docs/quest_explorer_canonical_semantics_v1.md` as the semantic source of
> truth and `quest_explorer_documentation_audit_v1.md` for the documentation
> audit and deprecation plan.

Status: SUPERSEDED - historical vocabulary reference only
Audience: Codex / implementation agents

Authoritative hierarchy:
1. `docs/quest_explorer_canonical_semantics_v1.md`
2. live `quest_explorer.v3` export topology
3. current frontend implementation as behavior evidence
4. this historical vocabulary note

## Historical Model (Superseded)

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
- selected semantic sequence as session UI state
- Strategy/Lore presentation
- rendering
- rail active state

Frontend must not:
- parse keys to infer progression
- reconstruct graph semantics
- expose raw keys in normal UI
- invent continuation
