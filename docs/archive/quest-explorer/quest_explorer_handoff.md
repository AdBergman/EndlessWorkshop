# EWShop Quest Explorer Reset Context

> [!WARNING]
> Status: archived historical handoff. This document preserves reset context
> from an earlier implementation pass and should not be used as canonical Quest
> Explorer semantics. Use `../../quest_explorer_canonical_semantics_v1.md`
> instead.

## Current Status
Quest Explorer has had many rapid implementation/refactor passes. A large amount of code changed, but the product still does not work correctly in all cases. Treat the current implementation as unstable.

## Project
- Project: EWShop
- Feature: Quest Explorer

Goal:
A premium branching quest explorer with:
- Lore as a sequential chronicle reader
- Strategy as a strategic decision dossier

## Core Product Model

### Lore Mode
Narrative-first, reveal-driven, sequential chronicle reading.

### Strategy Mode
Chapter-scoped strategic planning and branch comparison.

## Recommended Reset Process
1. Audit current implementation against intended UX.
2. Fix behavior before visual polish.
3. Resume premium visual refinement only after reader correctness is stable.
