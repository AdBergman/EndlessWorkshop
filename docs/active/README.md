# Active Documentation

Current as of 2026-06-20.

This folder should contain only current workflows, handoffs, or decisions. Long
completed investigations and superseded handoffs belong in `docs/archive/`.

## Current Codex UI Source Of Truth

- `codex-premium-ui-design-baseline.md` - current Codex premium UI design
  baseline after DB Exporter metadata enrichment and manual UI iteration.
- `codex-premium-ui-ticket-plan.md` - current small-slice implementation plan
  for the next Codex UI work.

Next implementation ticket:

- `EW-CODEX-UI-005` - Ability/Status refinement reintroduction.

Current UI guardrails:

- Do not commit the stashed Ability/Status metadata filter work as-is.
- Browser and visual QA are user-owned unless explicitly requested.
- Modifiers remain hidden from visible category navigation.

## Current Codex DB Exporter Closeout Docs

- `codex-db-exporter-implementation-packets/codex-db-exporter-definitive-response.md`
  - DB Exporter closeout record for the `DB-CODEX-DEF-*` asks. This is the
  current source of truth for implemented, rejected, deferred, and unavailable
  Codex data decisions.
- `codex-db-exporter-response-ewshop-reconciliation.md` - EWShop-facing
  closed reconciliation of each definitive response item: data changes,
  frontend/API ownership, and permanent decision notes.
- `codex-db-exporter-response-import-qa-results.md` - completed final accepted
  snapshot import/diagnostics/browser-QA result.

DB Exporter definitive response/import QA is complete. No EWShop-owned
DB-exporter-response implementation issues are currently open.

Active exporter follow-up:

- `db-exporter-ability-metadata-handoff.md` - focused DB Exporter handoff for
  Ability `Combat role` cleanup and explicit ability ownership metadata.

## Current Codex Diagnostics And Logs

- `codex-content-quality-diagnostics.md` - current EWShop diagnostic workflow
  for separating EWShop presentation issues from exporter/editorial content
  issues.
- `codex-self-sustaining-worklog.md` - historical execution log for the
  completed post-exporter-return Codex story loop.

Resources, Councilor Effects, Partner Effects, and Traits remain top-level
shallow reference categories. Modifiers remain hidden from top-level navigation
and are only searchable/linkable exact targets.

Do not reopen the old 2026-06-13/2026-06-14 packet plans as active work. Use
the premium UI baseline and ticket plan for new Codex UI implementation work.

## Archived Codex Context

Older Codex metadata adoption reports, reference-kind handoffs, validation
snapshots, packet-return handoffs, generated audits, and EWShop implementation
story docs are archived under:

- `docs/archive/codex/`
- `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/`
  - superseded active docs replaced by the cleaned DB Exporter definitive
    response and the EWShop reconciliation/import QA result.
- `docs/archive/codex/superseded-2026-06-17-premium-ui-baseline/`
  - superseded active UI/category audit docs, generated reports, and the
    completed DB Exporter import QA plan.
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
