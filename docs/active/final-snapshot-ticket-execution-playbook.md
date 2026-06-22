# Final Snapshot Ticket Execution Playbook

Status: active workflow for `FS-CODEX-*` tickets  
Created: 2026-06-22

## Purpose

Use this playbook for final DB Exporter snapshot adoption work. It is lighter
than the Codex Category Evolution Playbook because `FS-CODEX-*` tickets are not
full category reinventions. They are compatibility, presentation, or
source-truth adoption slices driven by data that already exists in the final
snapshot.

The older category evolution playbook still applies for:

- player-first review;
- exact-reference discipline;
- separating content, metadata, relationships, and noise;
- frontend tech lead / UX designer / 4X player review;
- final validation and documentation discipline.

Change the process when:

- the ticket is only making newly exported public Codex fields visible;
- the ticket is a rich-import investigation before implementation;
- the work is explicitly compatibility rather than a full category evolution.

## Starting An FS-CODEX Ticket

1. Read `docs/active/final-snapshot-codex-ticket-plan.md`.
2. Read the ticket's relevant source docs:
   - `docs/active/db-exporter-final-ewshop-handoff.md`
   - `docs/active/db-exporter-final-ewshop-codex-context.json`
   - `docs/active/codex-export-vs-rich-export-boundary.md` when ownership is
     unclear
   - `docs/active/codex-rich-enrichment-decision-template.md` for rich import
     or resolver work
3. Inspect the matching local files:
   - public Codex: `local-imports/codex/*`
   - rich/source-truth: `local-imports/exports/*`
4. Inspect current EWShop support:
   - backend importer/API DTOs when DTO shape or rich import is involved
   - frontend Codex types/store/category config/presentation helpers
   - existing tests around the affected category or importer path

Do not read every category evolution doc by default. Read a category evolution
doc only when the ticket touches that category's established UI decisions.

## Compare Exported Data To Current UI

For each ticket, answer before coding:

- What fields/sections/refs exist in the final JSON?
- Are they preserved by import/API/store today?
- Are they rendered in detail pages already?
- Are they rendered in archive rows or navigation?
- Are current filters/rails using the correct exported fact labels?
- Is the issue missing preservation, missing presentation, stale presentation,
  or product uncertainty?

Prefer small local scripts or focused searches over broad manual inspection.

## Classify The Work

Classify every ticket before implementation:

- **Compatibility**: existing public Codex data is preserved but not rendered
  usefully, or labels/filters need small updates.
- **Polish**: current UI works, but new metadata can improve scanability.
- **New feature**: requires new route behavior, rich import, API/store support,
  resolver behavior, or product interaction design.

Compatibility can usually proceed directly after a brief audit. Polish should
stay small and reversible. New features need an explicit product/architecture
decision before implementation.

## Public Codex vs Rich Import

Use public Codex only when the needed data exists in:

- `facts`
- `sections`
- `referenceKeys`
- `publicContextKeys`
- explicit `svgIcon`

Use rich import work only when the needed data is source-truth/domain data under
`local-imports/exports/*` and is not already imported/exposed sufficiently.

Rich import work requires:

- backend importer shape review;
- API DTO review;
- frontend store/type review;
- resolver ownership review;
- failure-closed behavior;
- tests proving no inference.

Do not use rich exports from the frontend until EWShop has explicit
import/API/store support for the relevant fields.

## Review Lenses

Review each implemented or proposed slice as:

- **Frontend tech lead**: bounded change, clear ownership, testable helpers,
  no generic framework overreach, no stale category behavior.
- **UX designer**: row hierarchy, scanability, visual calm, no database-browser
  leakage.
- **4X player**: does this help planning, comparison, discovery, or trust?

If the work does not improve one of those player outcomes, it is probably
cleanup or deferable polish.

## Acceptance Criteria

Every implementation ticket should define acceptance criteria for:

- data source used;
- exact UI behavior changed;
- what remains unchanged;
- no-inference compliance;
- direct/search/detail route behavior if relevant;
- Quests/Codex boundary when Quest data is nearby;
- public Codex versus rich import ownership.

For investigation tickets, acceptance criteria should be a decision-quality
report, not code.

## Validation Expectations

For frontend Codex presentation work, run:

```bash
npm test -- --run src/pages/CodexPage.test.tsx src/lib/codex/codexCategoryConfig.test.ts
npx tsc --noEmit --project tsconfig.json
npm run build
git diff --check
```

Add focused helper/presentation tests when logic moves into helpers.

For backend/API/import work, run the relevant Maven tests for touched modules
and any frontend contract tests that consume changed DTOs.

For docs-only work, run:

```bash
git diff --check
```

Browser smoke is useful for visual row/category work, but do not claim
pixel-level review unless it was actually performed.

## Documentation Update Rules

Update docs when durable direction changes:

- `docs/active/final-snapshot-codex-ticket-plan.md` when ticket order, status,
  or scope changes.
- `docs/current-action-priorities.md` when accepted next direction changes.
- category evolution docs only when the ticket changes that category's durable
  UI/product decision.
- exporter backlog only for genuine exporter-owned findings not already covered.

Do not update docs for tiny mechanical fixes unless an active doc would become
inaccurate.

## No-Inference Rules

Never infer from:

- entry keys;
- display names;
- prose;
- duplicate titles;
- SVG filenames or manifests;
- Unity paths;
- GUIDs;
- fuzzy matching.

Use exported fields and exact references only. Missing metadata means absent or
unknown until the exporter/art contract provides it.

## Stop And Ask Product/Owner When

- A public Codex row fix becomes a new feature.
- A rich import would create a new product surface or route behavior.
- The work requires backend/exporter contract changes.
- A category needs new navigation/filtering not already accepted.
- Quest work risks recreating Quest Explorer inside Codex.
- The implementation would rely on inference.
- Validation fails for reasons that are not local to the ticket.

## When Not To Implement

Do not implement when:

- the ticket is explicitly an investigation;
- exported data is diagnostics-only;
- the data exists only in a rich export that EWShop does not import yet;
- the proposed UI duplicates a route-owned experience;
- the player value is unclear and the change would add lasting complexity;
- the fix only makes a technically interesting field visible without helping
  planning, comparison, discovery, or trust.

