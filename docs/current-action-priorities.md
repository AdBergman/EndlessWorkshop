# Current Action Priorities

Current as of 2026-06-16.

This list reflects the current product focus:

- Do not work on Units or unit art right now.
- Avoid broad site-wide visual rewrites. Visual work should happen only in
  areas already being touched, and in small independently reviewable passes.

## P0 - Codex Exporter Return Import And QA

Owner: DB exporter team primarily; EWShop backend/frontend as consumers.

Status: EWShop import/API verification, frontend searchable-only treatment,
diagnostics refresh, and bounded browser QA are complete for the 2026-06-14
Codex metadata packet return. Continue from evidence-backed issues only; do not
restart old 2026-06-13 backlog assumptions.

Start here:

- `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-codex-metadata-phase-handoff-2026-06-14.md`
- Use packet-level files in
  `docs/active/codex-db-exporter-implementation-packets/` only when exact
  return detail is needed.

The return bundle reports these notable changes:

- Tech unlock exact refs implemented where canonical and public.
- Major faction Population threshold reward exact refs implemented where
  canonical and public.
- Generic Codex `resources` export implemented, with extractor/resource links
  where proven.
- Actions, Diplomatic Treaties, Status scope metadata, Trait refs, Quest refs,
  Modifier labels, and thin Ability context received safe subset improvements.
- New generic Codex exportKinds `councilorEffects` and `partnerEffects`
  landed, including a partner-effect one-hop mechanics follow-up.

Known post-return decisions and gaps:

- `resources`, `councilorEffects`, and `partnerEffects` are now top-level
  shallow reference categories. Their list rows should carry the at-a-glance
  value: differentiating context, full effect lines where exported, and exact
  source/extractor links.
- Modifiers remain hidden from top-level navigation and may only be reached by
  search or exact links.
- Resource deposits / POI pages remain deferred.
- Districts and Improvements thin context remains deferred.
- Some Actions, Diplomatic Treaties, Statuses, and effect pages may still be
  thin where no canonical public mechanics source exists.
- `CouncilorEffectDefinition` gain values were not exported because they need
  public-safety review.
- Bonuses Codex local startup import still reports two failed rows. NEXT-006
  traced them to deprecated placeholder bonus entries whose display names are
  exactly `[DEPRECATED]`; importing them would add Codex noise, so this is an
  exporter/editorial cleanup item unless future dead-ref diagnostics prove a
  missing public target.

Actionable next items:

1. Use `docs/active/codex-exporter-return-progress.md` for the completed
   EWShop verification summary.
2. Report only current, EWShop-proven gaps back to DB Exporter. Do not reopen
   completed packet requests from archived docs without fresh evidence.
3. Do not expose Modifiers in top-level Codex navigation without product review.
4. The post-exporter-return Codex NEXT story loop is complete for current
   evidence. Resume Codex work only from new QA findings, exporter returns, or a
   human product decision.

Archived historical context:

- `docs/archive/codex/db-exporter-codex-metadata-handoff-2026-06-10.md`
- `docs/archive/codex/db-exporter-codex-reference-kinds-handoff-2026-06-10.md`
- `docs/archive/codex/codex-metadata-adoption-audit-2026-06-11.md`
- `docs/archive/codex/superseded-2026-06-13-exporter-packet-inputs/`

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
- `QX-CODEX-006`: Done - browser review of current Strategy Codex link UX
  found and fixed exact `ArmyAction` refs staying plain; `Build Bridge`,
  Hydromatic Laboratory, and Mukag Monsoon Festival now expose Codex links in
  the checked Strategy page.
- `QX-CODEX-007`: P1 - mobile/tap accessibility hardening for Codex previews
  if the current hover/focus behavior is not sufficient.
- `QX-CODEX-008`: P1 - verify resolver kind coverage with future real data,
  especially `MinorFaction` and other less common reference kinds not present
  in the current quest export.
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
