# Active Documentation

Current as of 2026-06-16.

This folder should contain only current workflows, handoffs, or decisions. Long
completed investigations and superseded handoffs belong in `docs/archive/`.

## Current Codex Docs

- `codex-db-exporter-implementation-packets/README.md` - current index for the
  DB Exporter -> EWShop Codex metadata packet return bundle.
- `codex-db-exporter-implementation-packets/ewshop-db-exporter-codex-metadata-phase-handoff-2026-06-14.md`
  - current aggregate return handoff. Start here before importing, browser-QA,
  or planning the next Codex work.
- `codex-content-quality-diagnostics.md` - current EWShop diagnostic workflow
  for separating EWShop presentation issues from exporter/editorial content
  issues.
- `codex-preview-surface-audit.md` - regenerated preview-surface diagnostic
  report against current local Codex imports.
- `codex-relationship-value-gap-audit.md` - regenerated relationship/value gap
  diagnostic report against current local Codex imports.
- `codex-current-audit-ticket-plan.md` - current EWShop and DB
  Exporter/editorial Jira-style ticket source generated from diagnostics,
  current implementation, and the 2026-06-14 exporter handoff.
- `codex-db-exporter-definitive-handoff.md` - single active DB
  Exporter/editorial handoff for current Codex data-quality gaps. Start here
  when sending work back to DB Exporter.
- `codex-category-ux-audit.md` - current source of truth for the Codex
  category/subtype presentation audit. Continue the self-sustaining UI/UX loop
  from this file.
- `codex-exporter-return-progress.md` - completed EWShop-side progress tracker
  for the 2026-06-14 exporter return verification tickets. Use as evidence,
  not as a current backlog.
- `codex-self-sustaining-worklog.md` - historical execution log for the
  post-exporter-return Codex story loop.

The latest EWShop Codex category UI loop has completed its safe frontend
baseline. Resources, Councilor Effects, Partner Effects, and Traits are
top-level shallow reference categories. Modifiers remain hidden from top-level
navigation and are only searchable/linkable exact targets.

Regenerate diagnostics against current local imports before reopening any
2026-06-13 Codex backlog item or any completed post-exporter-return story.

## Archived Codex Context

Older Codex metadata adoption reports, reference-kind handoffs, validation
snapshots, and EWShop implementation story docs are archived under:

- `docs/archive/codex/`
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
