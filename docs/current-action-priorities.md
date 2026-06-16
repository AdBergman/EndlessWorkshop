# Current Action Priorities

Current as of 2026-06-16.

This list reflects the current product focus:

- Do not work on Units or unit art right now.
- Avoid broad site-wide visual rewrites. Visual work should happen only in
  areas already being touched, and in small independently reviewable passes.

## P0 - Codex Exporter Return Import And QA

Owner: DB exporter team primarily; EWShop backend/frontend as consumers.

Status: EWShop import/API verification, frontend category treatment,
diagnostics refresh, bounded browser QA, and the category/subtype UX baseline
are complete for the 2026-06-14 Codex metadata packet return. Continue from
evidence-backed issues only; do not restart old 2026-06-13 backlog assumptions.

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

- `resources`, `councilorEffects`, `partnerEffects`, and `traits` are now
  top-level shallow reference categories. Their list rows should carry the
  at-a-glance value: differentiating context, full effect lines where exported,
  and exact source/extractor links.
- Modifiers remain hidden from top-level navigation and may only be reached by
  search or exact links.
- Resource deposits / POI pages remain deferred.
- Districts and Improvements thin context remains deferred.
- Some Actions, Diplomatic Treaties, Statuses, and effect pages may still be
  thin where no canonical public mechanics source exists.
- Major faction Population threshold summaries render for resolved exact refs.
  `Population_Aspect` still has unresolved exact ref
  `Aspect_DistrictImprovement_00`, so `Nutrient Extractor` remains plain until
  that target is exported as a current Codex entry.
- Diplomatic Treaty pages render exact applied Status mechanics summaries where
  current metadata resolves, for example Close Borders now exposes its Public
  Opinion impact without requiring a Related Entries click-through.
- Quest Strategy exact Codex preview tooltips dismiss on outside click/tap and
  Escape; resolver/link behavior remains exact-ref-only.
- Action mechanics browser QA found existing structured rendering acceptable
  for current mechanics-rich Actions. Facts-only/thin Actions remain
  exporter/editorial-owned.
- `CouncilorEffectDefinition` gain values were not exported because they need
  public-safety review.
- Bonuses Codex local startup import still reports two failed rows. NEXT-006
  traced them to deprecated placeholder bonus entries whose display names are
  exactly `[DEPRECATED]`; importing them would add Codex noise, so this is an
  exporter/editorial cleanup item unless future dead-ref diagnostics prove a
  missing public target.

Actionable next items:

1. Use `docs/active/codex-category-ux-audit.md` as the current category UX
   loop source of truth. It currently has no safe EWShop-owned implementation
   item left without new exporter/editorial data.
2. Use `docs/active/codex-db-exporter-definitive-handoff.md` for the current
   DB Exporter/editorial action list.
3. Report only current, EWShop-proven gaps back to DB Exporter. Do not reopen
   completed packet requests from archived docs without fresh evidence.
4. Do not expose Modifiers in top-level Codex navigation without product
   review.
5. Use `docs/active/codex-current-audit-ticket-plan.md` for ticket detail when
   exact diagnostic counts or older completed EWShop story context is needed.
   The previous post-exporter-return NEXT story list is archived as completed.

Archived historical context:

- `docs/archive/codex/db-exporter-codex-metadata-handoff-2026-06-10.md`
- `docs/archive/codex/db-exporter-codex-reference-kinds-handoff-2026-06-10.md`
- `docs/archive/codex/codex-metadata-adoption-audit-2026-06-11.md`
- `docs/archive/codex/superseded-2026-06-13-exporter-packet-inputs/`

## P0 - Quest Documentation Cleanup Only

Owner: EWShop.

Status: completed for the current documentation pass.

Current result:

1. `docs/quest-explorer/README.md` is the current entry point.
2. `docs/quest_explorer_canonical_semantics_v1.md` remains semantic authority.
3. Active Quest design/architecture notes carry canonical-semantics caveats.
4. Historical Quest design notes, handoff notes, contract baselines, and bundle
   artifacts live under `docs/archive/quest-explorer/`.
5. No Quest Explorer UI, adapter, route, or exporter contract changes are
   implied by this cleanup.

## P0 - Routing And SEO Documentation Cleanup

Owner: EWShop.

Status: completed for the current documentation pass.

Current result:

1. `docs/frontend/routing-diagnosis.md` is a historical diagnosis and completed
   cleanup record.
2. `docs/backend/seo-backend-review.md` is a historical review and completed
   cleanup record.
3. `docs/backend/seo-architecture.md` remains the active SEO backend contract.
4. `docs/frontend/public-route-contract.md` remains the active public route
   ownership matrix.
5. No implementation change is needed from the current doc cleanup.

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
- `QX-CODEX-007`: Done - compact Codex previews dismiss on outside click/tap
  and Escape.
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
