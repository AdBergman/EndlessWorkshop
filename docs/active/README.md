# Active Documentation

Current as of 2026-06-16.

This folder should contain only current workflows, handoffs, or decisions. Long
completed investigations and superseded handoffs belong in `docs/archive/`.

## Current Codex Docs

- `codex-db-exporter-implementation-packets/codex-db-exporter-definitive-response.md`
  - DB Exporter closeout record for the `DB-CODEX-DEF-*` asks. This is the
  current source of truth for implemented, rejected, deferred, and unavailable
  Codex data decisions.
- `codex-db-exporter-response-ewshop-reconciliation.md` - EWShop-facing
  reconciliation of each definitive response item: data changes, validation
  expectations, frontend/API ownership, and permanent decision notes.
- `codex-db-exporter-response-import-qa-plan.md` - next executable EWShop
  import/diagnostics/browser-QA plan for final accepted snapshot
  `20260616-210540`.
- `codex-content-quality-diagnostics.md` - current EWShop diagnostic workflow
  for separating EWShop presentation issues from exporter/editorial content
  issues.
- `codex-category-ux-audit.md` - current source of truth for the Codex
  category/subtype presentation decisions: shallow reference categories,
  hidden/linkable Modifiers, and no invented summaries.
- `codex-self-sustaining-worklog.md` - historical execution log for the
  post-exporter-return Codex story loop.

The latest EWShop Codex category UI loop has completed its safe frontend
baseline. Resources, Councilor Effects, Partner Effects, and Traits are
top-level shallow reference categories. Modifiers remain hidden from top-level
navigation and are only searchable/linkable exact targets.

Do not reopen the old 2026-06-13/2026-06-14 packet plans as active work. Use
the definitive response reconciliation and import/QA plan for the next EWShop
pass, then regenerate diagnostics against the final accepted snapshot before
creating any new ticket.

## Archived Codex Context

Older Codex metadata adoption reports, reference-kind handoffs, validation
snapshots, packet-return handoffs, generated audits, and EWShop implementation
story docs are archived under:

- `docs/archive/codex/`
- `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/`
  - superseded active docs replaced by the cleaned DB Exporter definitive
    response and the EWShop reconciliation/import QA plan.
- `docs/archive/codex/completed-2026-06-16/codex-post-exporter-return-next-stories.md`
  - completed post-exporter-return story plan.
- `docs/archive/codex/completed-2026-06-16/codex-post-exporter-return-editorial-handoff-superseded.md`
  - superseded concise handoff replaced by the definitive handoff.

Treat those archived docs as historical evidence only. They may describe stale
metadata coverage or already-completed EWShop implementation work.

The 2026-06-13 Codex category audits, packet-building prompts, and pre-return
handoffs are archived at
`docs/archive/codex/superseded-2026-06-13-exporter-packet-inputs/`. Treat them
as packet-phase input history, not current source of truth.
