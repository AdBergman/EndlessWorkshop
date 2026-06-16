# DB Exporter Definitive Response Index

Status: current response index
Updated: 2026-06-16

## Current Source Of Truth

Use this document for the DB Exporter closeout record:

- `docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-definitive-response.md`

It supersedes the 2026-06-13/2026-06-14 packet-return handoffs as active
implementation guidance. It records what DB Exporter implemented, partially
implemented, rejected as not canonical/public, deferred to product/export scope,
or confirmed runtime-only.

EWShop-facing follow-up docs:

- `docs/active/codex-db-exporter-response-ewshop-reconciliation.md`
- `docs/active/codex-db-exporter-response-import-qa-plan.md`

## For AI Agents

- Start with the definitive response and the EWShop reconciliation before any
  import, browser QA, frontend work, or new ticket writing.
- Use final accepted snapshot `20260616-210540` for the next EWShop import/QA
  pass.
- Do not revive archived packet requests or old diagnostic recommendations
  without fresh evidence from the final accepted snapshot.
- Do not infer links from names, prose, display labels, or key shapes.
- Keep Modifiers hidden from top-level navigation.
- Keep `resources`, `councilorEffects`, `partnerEffects`, and `traits` as
  shallow reference categories unless product changes that decision.

## Archived Historical Context

The old packet requests, return handoffs, generated audits, and active ticket
plan that were superseded by the definitive response are archived under:

- `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/`
- `docs/archive/codex/superseded-2026-06-13-exporter-packet-inputs/`

Use archived docs only when a user explicitly asks for historical context.
