# Current Action Priorities

Current as of 2026-06-13.

This list reflects the current product focus:

- Do not work on Units or unit art right now.
- Avoid broad site-wide visual rewrites. Visual work should happen only in
  areas already being touched, and in small independently reviewable passes.

## P0 - Codex Content Quality DB Exporter Handoff

Owner: DB exporter team primarily; EWShop backend/frontend as consumers.

Status: EWShop baseline Codex metadata adoption and presentation polish are
complete for the current local imports. Actions and Diplomatic Treaties are
visible Codex categories, bonus-derived Statuses are visible, and bonus-derived
Modifiers remain hidden from top-level navigation while staying
searchable/linkable as exact targets. The latest exporter batch imported and
served through the current Spring Boot/API path without a Codex importer
migration. Current EWShop frontend polish is stopped unless real bug reports,
browser QA issues, or release-safety concerns appear. The current Codex work is
exporter/editorial player-facing content quality, not metadata plumbing,
frontend polish, or broad EWShop scaffolding.

Verified local Codex metadata coverage:

| Codex export | Entries | With facts | With sections | With public context keys |
| --- | ---: | ---: | ---: | ---: |
| `abilities` | 336 | 336 | 310 | 336 |
| `actions` | 139 | 139 | 52 | 139 |
| `bonuses` | 585 | 585 | 552 | 585 |
| `councilors` | 43 | 43 | 40 | 43 |
| `diplomaticTreaties` | 22 | 22 | 8 | 22 |
| `districts` | 167 | 167 | 76 | 167 |
| `equipment` | 159 | 159 | 159 | 159 |
| `factions` | 5 | 5 | 5 | 5 |
| `heroes` | 79 | 79 | 79 | 79 |
| `improvements` | 123 | 123 | 100 | 123 |
| `minorFactions` | 16 | 16 | 16 | 16 |
| `populations` | 26 | 26 | 25 | 26 |
| `quests` | 292 | 292 | 292 | 292 |
| `tech` | 133 | 133 | 97 | 133 |
| `traits` | 178 | 178 | 130 | 178 |
| `units` | 156 | 156 | 156 | 156 |

`bonuses` remains a source export. EWShop presents bonus-derived Statuses as a
visible category and keeps bonus-derived Modifiers hidden from top-level
navigation while preserving search/link targets.

EWShop Codex search now indexes exported facts, sections, section items,
timeline values, and fallback description text. Autocomplete suggestions use
the same structured preview logic as result rows so metadata-rich entries are
not blank in first-contact discovery.

Detail-page related entries now include structured preview text in each chip
when useful metadata exists, so exact links explain what the target does before
the player clicks through.

Codex preview surfaces:

- Inline clarification: when an exact exported relation clarifies a word or
  mechanic inside current prose, render the term as a compact inline link with
  existing quick-preview behavior. Current example: Ability pages can inline-link
  exact applied Status mentions from resolved related Status entries.
- Compact rendered preview: when the relation explains what the current entry
  does, render a small local preview instead of forcing the player to leave the
  page. Current examples: Unit, Equipment, and Hero pages render resolved
  Granted Abilities as compact clickable rows with icon, metadata, and one
  exported effect line.
- Large-subject summary/card: when the relation points to a broad encyclopedia
  subject, keep the surface to a one-line summary/card and let the player click
  through for depth. Current example: Faction references should stay summary
  oriented rather than expanding into faction dossiers inline.
- Related Entries remain exploration, not repetition. Current examples: Unit,
  Equipment, and Hero pages hide Ability related-entry cards already represented
  by shown Granted Ability preview rows, but keep unrelated Ability links and
  non-Ability links.

This is a product direction, not a generic renderer yet. Current code remains
scoped to proven cases rather than a site-wide link/preview system. Future
candidates worth product review: Diplomatic Treaty -> Status/effect preview,
Population threshold reward target summaries, and Faction references ->
one-line summary only. Unresolved Hero granted Ability refs remain
exporter/editorial follow-up, not frontend inference work.

The default all-category Codex overview now suppresses the giant mixed result
pane until the player searches or chooses a category, keeping the first view
focused on category discovery instead of a database-length record list.

Latest content-quality diagnostic run, 2026-06-13:

- Command: `npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300`
- Scope: 2459 current local Codex entries.
- Result after diagnostic refinement: 250 high exporter/editorial findings and
  no current EWShop-owned findings.
- Interpretation: current EWShop rendering already prefers exported facts and
  sections and suppresses duplicate fallback description lines for metadata-rich
  entries, so the diagnostic no longer treats exact duplicate description lines
  as current player-facing UI defects.
- Current EWShop status: repeated exact structured preview taxonomy is
  suppressed in compact summaries, so equipment and status previews spend more
  space on player-useful differentiators.
- Current UI wording status: Codex overview and category summary surfaces now
  use encyclopedia-style "entries" and "category overview" language instead of
  database-oriented "records" labels.
- Current exporter/editorial opportunity: add player context to
  classification-only entries and replace raw key-like values in public fields.

Actionable next items:

1. Use `docs/active/ewshop-current-export-handoff.md` as the current batch
   import/product review handoff.
2. Use `docs/active/bonuses-descriptor-target-correction-final-20260613_validation.md`
   as the latest exporter validation evidence for bonus descriptor/tag target
   cleanup.
3. Use `docs/active/codex-content-quality-diagnostics.md` to regenerate
   evidence before creating new exporter requests. The old exporter handoff is
   archived at
   `docs/archive/codex/codex-content-quality-exporter-handoff-2026-06-12.md`.
4. Use `docs/active/codex-content-quality-current-diagnostic-handoff.md` as the
   current concise exporter/editorial follow-up from the latest diagnostic run.
5. Keep current text-prefix parsing as fallback only for older exports.
6. Treat baseline Codex metadata preservation, rendering, category exposure,
   and category presentation polish as complete for the current local imports.
7. Do not continue Codex frontend polish without a concrete bug or browser QA
   issue.
8. Use the content-quality diagnostic primarily to produce exporter/editorial
   follow-up until new current EWShop-owned findings appear.
9. Do not expose Modifiers in top-level Codex navigation without product review.

Archived historical context:

- `docs/archive/codex/db-exporter-codex-metadata-handoff-2026-06-10.md`
- `docs/archive/codex/db-exporter-codex-reference-kinds-handoff-2026-06-10.md`
- `docs/archive/codex/codex-metadata-adoption-audit-2026-06-11.md`

## P0 - Quest Documentation Cleanup Only

Owner: EWShop.

Status: high priority, docs-only.

Actionable next items:

1. Mark active Quest docs with canonical-status banners where missing.
2. Archive or mark superseded Quest docs that still imply the old
   step/choice/path model is authoritative.
3. Keep canonical Quest semantics docs intact.
4. Do not change Quest Explorer UI, adapters, routes, or exporter contracts in
   this pass.

## P0 - Routing And SEO Documentation Cleanup

Owner: EWShop.

Status: high priority because several docs still read like active backlogs even
though most tickets are completed.

Actionable next items:

1. Convert `docs/frontend/routing-diagnosis.md` into a short status note.
2. Move completed routing investigation detail to `docs/archive/` if still
   useful.
3. Convert `docs/backend/seo-backend-review.md` into a short current status and
   remaining-risk note.
4. Keep `docs/backend/seo-architecture.md` as the active SEO contract.
5. Leave implementation alone unless a doc cleanup reveals a real stale
   contract.

## P1 - Codex Links For Quest Strategy View

Owner: EWShop frontend, with DB exporter/backend as data-quality follow-up.

Status: initial Strategy implementation is already in place. Quest requirement
and reward display models preserve reference metadata, the frontend has an exact
Quest-to-Codex resolver, and Strategy requirement/reward rows can show compact
Codex preview links when they resolve.

Actionable next items:

1. Keep the current exact-key rule: prefer `codexEntryKey`, then typed
   `referenceKind/referenceKey`, then reward `assetKind/assetKey`.
2. Do not infer links from titles or prose.
3. Prefer exact exported metadata for richer Codex preview content; current
   local Codex metadata is broad enough that follow-up work should be driven by
   product review rather than by the old population-only blocker.
4. Keep the current frontend reward icon rule bounded: use known economy and
   strategic resource icons, and use Codex entry icons only after an exact
   Strategy reward reference resolves.
5. Do not expand Codex links into Lore until Strategy has been reviewed in the
   browser.

Jira-style status:

- `QX-CODEX-001`: Done - exact Quest Codex reference resolver exists in
  `frontend/src/features/quests/questCodexReference.ts`.
- `QX-CODEX-002`: Done - Strategy reward Codex links/previews are wired through
  `QuestRewardMeta`.
- `QX-CODEX-003`: Done - Strategy requirement Codex links/previews are wired
  through requirement display models and `InlineMetaList`.
- `QX-CODEX-004`: Done - tests cover unresolved references, formula-only
  rewards, and no fake links.
- `QX-CODEX-005`: Done for desktop hover/focus - compact Codex previews exist
  for resolved Strategy references.
- `QX-CODEX-006`: P1 - browser review of current Strategy Codex link UX,
  including hover/focus behavior inside clickable decision cards.
- `QX-CODEX-007`: P1 - mobile/tap accessibility hardening for Codex previews
  if the current hover/focus behavior is not sufficient.
- `QX-CODEX-008`: P1 - verify resolver kind coverage with real data,
  especially `MinorFaction` and other less common reference kinds.
- `QX-CODEX-009`: Done for current Strategy rows - reward SVG markers use known
  economy/strategic resource icons and exact Codex entry icons where available.
- `QX-CODEX-010`: Future - consider explicit exporter-provided reward icon or
  resource metadata after the current DB exporter metadata request settles; do
  not open a new backend request for this yet.
- `QX-CODEX-011`: P2 - after product review, improve tooltip content to prefer
  structured facts/sections over plain description preview lines where it
  clearly improves Strategy readability.

## P2 - Local Visual Polish Only Where We Are Working

Owner: EWShop frontend.

Status: site-wide visual cohesion is not a good standalone project right now.

Actionable next items:

1. Do not do a broad site-wide visual pass.
2. When touching a route or component for product work, apply small local visual
   polish that follows existing direction.
3. Keep changes bounded and screenshot-verified.
4. Leave global token systems alone unless a local change clearly needs them.

## Out Of Scope For Now

- Units and unit art.
- Large site-wide restyling passes.
