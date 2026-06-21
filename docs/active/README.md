# Active Documentation Index

Current as of 2026-06-21.

## Purpose

This is the starting point for Codex and developers who need current EWShop
project documentation. It maps active docs to their purpose, when to read them,
and their current status so work does not depend on chat memory.

This index should stay short. It points to source documents; it does not
duplicate their content.

## Start Here

For most work, read these in order:

1. `docs/current-action-priorities.md` - current product focus, active
   decisions, and out-of-scope work.
2. `docs/active/README.md` - this active documentation map.
3. `AGENTS.md` - repo-wide working rules, verification expectations, and
   high-risk systems.
4. The area-specific docs below.

## Documentation Reading Strategy

Do not read every active doc by default. Start with current priorities and this
index, then select the smallest relevant doc set for the task type.

- Read category evolution/execution docs only for the Codex categories being
  touched.
- Read architecture or boundary docs when the task changes architecture, data
  ownership, enrichment, routing, or frontend structure.
- Read exporter/backlog docs only for data-quality, metadata, or exporter
  ownership issues.
- Read archived docs only when an active doc points there or the user asks for
  historical context.

| Task type | Read first | Also read |
| --- | --- | --- |
| Any task | `AGENTS.md`, `docs/current-action-priorities.md`, `docs/active/README.md` | Area-specific docs only |
| Codex category evolution | `docs/active/codex-category-evolution-playbook.md` | Target category evolution doc and execution plan |
| Codex rich enrichment | `docs/active/codex-rich-enrichment-decision-template.md` | Architecture decision, boundary doc, relevant category docs |
| DB exporter metadata issue | `docs/active/db-exporter-ability-metadata-handoff.md` | Related category evolution doc |
| Quest Explorer work | `docs/quest-explorer/README.md` | `docs/quest_explorer_canonical_semantics_v1.md` |
| Frontend implementation | `docs/frontend/frontend-architecture-guidelines.md` | Route/component-specific docs |
| Visual/Codex UI polish | `docs/active/codex-premium-ui-design-baseline.md` | Current priorities, relevant category docs |
| Docs cleanup | `docs/documentation-guidelines.md` | This active README |

## Current Priorities

- `docs/current-action-priorities.md`
  - Purpose: main status entry point for current product, Codex, exporter, route,
    Quest, and visual-priority decisions.
  - Read when: starting any new task, choosing the next implementation slice, or
    checking whether an idea is in scope.
  - Status: active source of truth.

## Codex

- `docs/active/codex-category-evolution-playbook.md`
  - Purpose: repeatable workflow for evolving Codex categories.
  - Read when: starting or closing out any category-specific Codex work.
  - Status: active process source of truth.

- `docs/active/codex-premium-ui-design-baseline.md`
  - Purpose: accepted Codex premium UI direction and visual guardrails.
  - Read when: doing Codex visual/UI work.
  - Status: active design baseline.

- `docs/active/codex-premium-ui-ticket-plan.md`
  - Purpose: historical/current ticket framing for Codex premium UI slices.
  - Read when: checking how earlier Codex UI tickets were intended or closed.
  - Status: partially historical; use with `current-action-priorities.md`.

- `docs/active/codex-shallow-reference-layout-review.md`
  - Purpose: shallow reference category layout decisions and route behavior.
  - Read when: touching Resources, Councilor Effects, Partner Effects, Traits,
    or similar shallow reference surfaces.
  - Status: active reference decision.

- `docs/active/codex-content-quality-diagnostics.md`
  - Purpose: diagnostic workflow for separating EWShop rendering issues from
    exporter/editorial content issues.
  - Read when: investigating thin/noisy/missing Codex content.
  - Status: active diagnostic guide.

- `docs/active/codex-rich-enrichment-decision-template.md`
  - Purpose: gate for deciding whether rich/domain exports should enrich Codex.
  - Read when: proposing any new Codex rich-import resolver.
  - Status: active decision template.

- `docs/active/codex-rich-vs-codex-import-architecture-decision.md`
  - Purpose: architecture decision for Codex exports, rich/domain exports, and
    frontend enrichment ownership.
  - Read when: deciding whether data belongs in Codex export, rich export, a
    frontend resolver, or exporter backlog.
  - Status: active architecture decision.

- `docs/active/codex-export-vs-rich-export-boundary.md`
  - Purpose: boundary map between Codex export, rich export, frontend resolver,
    and DB exporter backlog ownership.
  - Read when: a data-quality issue overlaps frontend enrichment and exporter
    responsibility.
  - Status: active boundary document.

- `docs/active/codex-rich-import-enrichment-audit.md`
  - Purpose: audit of possible Codex enrichment from rich/domain imports.
  - Read when: evaluating future enrichment candidates after using the decision
    template.
  - Status: active audit with post-pilot notes.

- `docs/active/codex-self-sustaining-worklog.md`
  - Purpose: execution log for an earlier Codex workstream.
  - Read when: reconstructing how previous Codex UI/exporter tasks landed.
  - Status: historical active reference; do not treat as current backlog.

### Codex Category Evolution Docs

Category evolution docs are durable memory for individual Codex categories.
Read them before touching that category.

- `docs/active/codex-actions-evolution.md`
- `docs/active/codex-diplomacy-evolution.md`
- `docs/active/codex-districts-evolution.md`
- `docs/active/codex-equipment-evolution.md`
- `docs/active/codex-heroes-evolution.md`
- `docs/active/codex-improvements-evolution.md`
- `docs/active/codex-quests-evolution.md`
- `docs/active/codex-status-evolution.md`
- `docs/active/codex-technologies-evolution.md`
- `docs/active/codex-traits-evolution.md`
- `docs/active/codex-units-evolution.md`

Status: active category memory. These are not chat summaries; they record
accepted decisions, rejected approaches, open questions, exporter findings, and
closeout results.

### Codex Category Execution Plans

Execution plans preserve long-running task state and should be updated during
future multi-slice category work:

- `docs/active/codex-actions-execution-plan.md`
- `docs/active/codex-diplomacy-execution-plan.md`
- `docs/active/codex-districts-execution-plan.md`
- `docs/active/codex-equipment-execution-plan.md`
- `docs/active/codex-heroes-execution-plan.md`
- `docs/active/codex-improvements-execution-plan.md`
- `docs/active/codex-quests-execution-plan.md`
- `docs/active/codex-technologies-execution-plan.md`
- `docs/active/codex-traits-execution-plan.md`
- `docs/active/codex-units-execution-plan.md`

Status: active durable task memory. Update them when reopening those categories.

## DB Exporter / Import Metadata

- `docs/active/db-exporter-ability-metadata-handoff.md`
  - Purpose: active DB exporter metadata backlog. Despite the filename, it now
    also contains non-blocking category metadata findings beyond Abilities.
  - Read when: recording exporter/data-quality issues discovered during frontend
    category evolution.
  - Status: active exporter backlog/handoff.

- `docs/active/db-exporter-codex-vs-rich-contract-summary.md`
  - Purpose: DB-exporter-facing contract summary for rich/domain exports versus
    Codex projection exports, including the current rich export gap review.
  - Read when: deciding whether a finding belongs in rich source-truth export,
    Codex projection export, EWShop resolver work, or exporter backlog.
  - Status: active contract packet.

- `docs/active/codex-db-exporter-implementation-packets/README.md`
  - Purpose: index for the definitive DB exporter response closeout packet.
  - Read when: reopening a DB exporter definitive-response question.
  - Status: current response index / closed response record.

- `docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-definitive-response.md`
  - Purpose: definitive DB exporter response for `DB-CODEX-DEF-*` asks.
  - Read when: checking implemented, rejected, deferred, unavailable, or
    runtime-only exporter decisions.
  - Status: closed source-of-truth response.

- `docs/active/codex-db-exporter-response-ewshop-reconciliation.md`
  - Purpose: EWShop-facing reconciliation of definitive exporter response items.
  - Read when: deciding whether a response item still requires EWShop work.
  - Status: closed reconciliation record.

- `docs/active/codex-db-exporter-response-import-qa-results.md`
  - Purpose: import, diagnostics, and browser-QA result for the final accepted
    exporter snapshot.
  - Read when: checking whether EWShop preserved and rendered the final accepted
    snapshot.
  - Status: closed QA record.

## Quest Explorer

- `docs/quest-explorer/README.md`
  - Purpose: current Quest Explorer documentation entry point.
  - Read when: starting any `/quests` work.
  - Status: active entry point.

- `docs/quest_explorer_canonical_semantics_v1.md`
  - Purpose: semantic authority for Quest Explorer terminology and topology.
  - Read when: touching Quest Explorer data semantics, lore/strategy adapters,
    progression, branches, or route-owned Quest concepts.
  - Status: active semantic authority.

Quest Codex docs under `docs/active/codex-quests-*.md` describe the Codex
category boundary. The rich `/quests` route owns Quest exploration.

## Frontend Architecture

- `docs/frontend/frontend-architecture-guidelines.md`
  - Purpose: React/TypeScript boundaries for pages, helpers, components, hooks,
    Zustand, CSS, tests, and refactors.
  - Read when: changing frontend code or reviewing AI-generated frontend work.
  - Status: active frontend style guide.

- `docs/frontend/frontend-testing-strategy.md`
  - Purpose: testing shape and AI-assisted test heuristics.
  - Read when: adding or restructuring frontend tests.
  - Status: active guidance.

- `docs/frontend/frontend-production-smoke-checklist.md`
  - Purpose: production-build smoke checklist.
  - Read when: validating production builds or release-like route checks.
  - Status: active checklist.

- `docs/frontend/frontend-refactor-backlog.md`
  - Purpose: known frontend refactor backlog and review signals.
  - Read when: planning a bounded refactor.
  - Status: active backlog, not an instruction to refactor immediately.

- `docs/frontend/self-correcting-frontend-implementation-guide.md`
  - Purpose: rigorous implementation workflow for complex frontend tasks.
  - Read when: a frontend task needs an explicit spec/design/test/runtime loop.
  - Status: active guidance.

- `docs/frontend/svg-icon-contracts.md`
  - Purpose: icon handoff and SVG usage contract.
  - Read when: adding or resolving icons.
  - Status: active icon contract.

## SEO / Routing

- `docs/frontend/public-route-contract.md`
  - Purpose: active route ownership matrix for SPA routes, generated SEO routes,
    redirects, admin routes, and hard 404s.
  - Read when: touching routes, deep links, SEO pages, or redirects.
  - Status: active routing contract.

- `docs/backend/seo-architecture.md`
  - Purpose: active SEO backend architecture.
  - Read when: changing generated SEO backend behavior.
  - Status: active backend SEO contract.

- `docs/frontend/routing-diagnosis.md`
  - Purpose: completed routing diagnosis and cleanup record.
  - Read when: historical route incident context is needed.
  - Status: historical context, not active backlog.

## Visual / UX

- `docs/active/codex-premium-ui-design-baseline.md`
  - Purpose: Codex visual/product direction.
  - Read when: doing Codex UI polish or category surface work.
  - Status: active design baseline.

- `docs/active/codex-premium-ui-ticket-plan.md`
  - Purpose: Codex UI ticket history and remaining framing.
  - Read when: reconstructing accepted/rejected Codex UI slices.
  - Status: partially historical; confirm current scope in priorities first.

## General Maintenance Docs

- `docs/documentation-guidelines.md`
  - Purpose: rules for active vs archived docs.
  - Read when: creating, archiving, or cleaning docs.
  - Status: active documentation policy.

- `docs/dependency-and-ci-maintenance.md`
  - Purpose: dependency, CI, and workflow maintenance rules.
  - Read when: changing dependencies, CI, or workflow tooling.
  - Status: active maintenance policy.

- `docs/backend/java-code-style.md`
  - Purpose: Java/backend coding style.
  - Read when: changing backend Java code.
  - Status: active backend style guide.

## Archives

`docs/archive/` is historical context only. Do not start there unless an active
doc points to a specific archived record or the user explicitly asks for history.

Archived docs may contain superseded handoffs, old audits, design templates,
completed investigations, and implementation bundles. They are evidence, not
current instructions.

## Maintenance Rules

- When creating a new active doc, add it to this index.
- When archiving, replacing, or superseding a doc, update this index.
- Update active docs only when durable project knowledge changes; routine
  implementation work does not need doc churn unless an active doc becomes
  inaccurate.
- Keep `docs/current-action-priorities.md` as the main status entry point.
- Keep category evolution docs as durable memory, not chat summaries.
- Do not duplicate large content here; link to source docs with short purpose
  and status notes.
- If a doc seems stale but you are unsure, leave it active and report it as
  ambiguous rather than archiving it silently.
