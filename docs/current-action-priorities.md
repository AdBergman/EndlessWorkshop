# Current Action Priorities

Current as of 2026-06-20.

This list reflects the current product focus:

- Do not work on unit art right now.
- Avoid broad site-wide visual rewrites. Visual work should happen only in
  areas already being touched, and in small independently reviewable passes.
- For the active documentation map and task-specific reading strategy, use
  `docs/active/README.md`.

## P0 - DB Exporter Definitive Response Import And QA

Owner: DB exporter team primarily; EWShop backend/frontend as consumers.

Status: complete for the current definitive response/import QA pass.

Start here:

- `docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-definitive-response.md`
- `docs/active/codex-db-exporter-response-ewshop-reconciliation.md`
- `docs/active/codex-db-exporter-response-import-qa-results.md`

Current result:

1. DB Exporter returned the cleaned definitive response for `DB-CODEX-DEF-*`
   and final accepted snapshot `20260616-210540`.
2. EWShop import/diagnostics/browser QA passed for the final accepted snapshot.
3. No EWShop-owned DB-exporter-response implementation issues are currently
   open.
4. Do not create frontend/API work from this response unless fresh import
   evidence shows EWShop is failing to preserve, serve, or render exported
   generic Codex fields.

Active exporter follow-up:

- `docs/active/final-snapshot-codex-ticket-plan.md` - active EWShop ticket
  plan for final snapshot Codex compatibility work. Start there when deciding
  which public Codex category needs the next small frontend/fullstack slice.
- `docs/active/final-snapshot-ticket-execution-playbook.md` - lightweight
  execution workflow for `FS-CODEX-*` tickets.
- `docs/active/db-exporter-ability-metadata-handoff.md` - focused Ability
  metadata cleanup request for noisy `Combat role` assignments and explicit
  ability ownership metadata. This is exporter-owned follow-up, not an
  EWShop-owned DB-exporter-response implementation blocker.
- `docs/active/db-exporter-codex-vs-rich-contract-summary.md` - active
  DB-exporter-facing contract packet for deciding what belongs in rich/domain
  source-truth exports versus Codex projection exports.
- `docs/active/codex-rich-vs-codex-import-architecture-decision.md` - active
  EWShop architecture decision for Codex export vs rich/domain import ownership.
- `docs/active/codex-rich-enrichment-decision-template.md` - required gate
  before any new Codex rich-import resolver. `CODEX-RICH-001` and
  `CODEX-RICH-002` proved the architecture, but future resolver work should not
  proceed unless player value clearly justifies the docs/tests/code cost.

Current decisions to preserve:

- `resources`, `councilorEffects`, `partnerEffects`, and `traits` remain
  top-level shallow reference categories.
- Modifiers remain hidden from top-level navigation and may only be reached by
  search or exact links.
- Victory Paths and Victory Conditions are local/dev-visible Codex categories:
  keep their imports and direct routes available for QA, but hide them from
  public top-level navigation until their missing/friendly-presentation issues
  are resolved. Run `FS-CODEX-014 - Victory Data Quality Investigation` before
  drafting exporter follow-up or returning Victory categories to public
  top-level browsing.
- Thin/plain entries are not EWShop bugs when DB Exporter marked their richer
  data unavailable, unsafe, runtime-only, obsolete, internal, or deferred.
- `Population_Aspect` should keep `Unlocks Nutrient Extractor` plain because
  `Aspect_DistrictImprovement_00` is not a current public Codex target.
- Deprecated `[DEPRECATED]` bonus/modifier rows should not import as public
  Codex pages.
- ResourceDeposit/POI pages remain product/export-scope deferred.
- Surrender/tribute values for `Treaty_AskToSurrender` and
  `Treaty_ProposeSurrender` remain runtime-only for static Codex export.

DB Exporter archived historical context:

- `docs/archive/codex/db-exporter-codex-metadata-handoff-2026-06-10.md`
- `docs/archive/codex/db-exporter-codex-reference-kinds-handoff-2026-06-10.md`
- `docs/archive/codex/codex-metadata-adoption-audit-2026-06-11.md`
- `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/`
- `docs/archive/codex/superseded-2026-06-13-exporter-packet-inputs/`

## P0 - Codex Premium UI Work

Owner: EWShop frontend/product.

Status: active next Codex implementation direction.

Start here, in order:

1. `docs/active/codex-premium-ui-design-baseline.md`
2. `docs/active/codex-premium-ui-ticket-plan.md`

Next implementation ticket:

- `EW-CODEX-UI-005` - Ability/Status refinement reintroduction.

Current rules:

- Browser/visual QA is user-owned unless explicitly requested.
- The stashed Ability/Status filter work must not be committed as-is.
- Keep direct category access for 4X players.
- Do not promote Modifiers.
- Do not touch backend/import/exporter contracts for UI tickets.
- `EW-CODEX-UI-002` is deferred after rejected tiny CSS-only landing polish.
- `EW-CODEX-UI-003` is covered by the accepted compact category shelf behavior
  from `EW-CODEX-UI-001`.
- The compact category shelf is navigation, not analytics: keep it count-free
  while preserving counts in landing cards, overview headers, and search.
- Actions use compact Action Archive mode: Type rail (`All`, `Action`,
  `Faction`, `Empire`, `Constructible`, `Terraforming`, `Army`) plus shallow
  reference-style rows/details. Mechanic-first Action rows are rejected for the
  current snapshot because exported Action mechanics are too modifier-heavy and
  implementation-oriented; archive rows should only show exported description or
  `Effects` text when present.
- Diplomacy uses compact Diplomacy Archive mode: Treaty Category rail
  (`All`, `War`, `Defense`, `Discovery`, `Society`, `Declarations`, `Economy`)
  plus treaty rows with quiet Category/Bilateral/Duration metadata.
- Districts use compact District Archive mode: District Focus rail (`All`,
  City, Food, Industry, Dust, Science, Influence, Military, Resource, Bridge,
  Population, Trade, Foundation, Wonder, Anomaly) plus content-first rows from
  exported Effect lines and compact exact `Extracts:` resource links.
- Heroes use compact Hero Archive mode: Class/Faction rail plus stat-grid rows,
  Faction/Class metadata, exact faction icon identity where safely resolvable,
  and compact exact granted ability links where references resolve. Repeated
  generic Hero title icons were removed as visual noise.
- Improvements use compact Improvement Archive mode: Improvement Focus rail
  (`All`, City, Food, Industry, Dust, Science, Influence, Approval, Military,
  Resource, Bridge, Population, Trade) plus content-first rows from exported
  Effect lines.
- Quests are hidden from top-level Codex browsing because repeated titles are
  not safe identity and Codex should not recreate Quest Explorer. Quest Codex
  records remain searchable/direct-linkable, and `/codex?category=quests` still
  works intentionally. If Quests return to top-level Codex, the current
  direction is encyclopedia-style Questline entries backed by exporter-provided
  source-truth metadata. The dedicated `/quests` route remains the route-owned
  Quest Explorer.
- Units use compact Unit Archive mode: Class/Faction/Tier rail plus stat-grid
  comparison rows, Faction/Class/Tier metadata, and compact exact granted
  ability links where references resolve. Rich evolution-chain UI remains
  deferred until explicit Codex evolution metadata exists. `CODEX-RICH-002`
  adds Unit detail-only previous/evolves-into links from the existing rich Unit
  store when exact public Codex Unit targets resolve; archive rows and `/units`
  remain unchanged. Do not expand rich Unit enrichment without using the
  decision template.
- `EW-CODEX-UI-004A` is implemented in commit `92e94047`: Partner Effects and
  Councilor Effects overview routes use centered full-width reference overview
  layout.
- Resources full-width shallow overview, resource icons, and resource ordering
  landed in commit `5bf7253d`.
- Traits use a compact Trait Archive mode: Type rail (`All`, `Faction`,
  `Protectorate`) plus reference-style rows; selected Trait entries and
  search-active Traits stay split-layout.
- Tech uses compact Technology Archive support inside Codex: Era/Quadrant/Faction
  rail, effect-first rows, compact exact `Unlocks:` links, and quiet
  Era/Quadrant/Faction metadata. The dedicated `/tech` route remains the
  route-owned progression explorer. `CODEX-RICH-001` adds Tech detail-only
  prerequisite links from the existing rich Tech store when exact public Codex
  Tech targets resolve; archive rows and `/tech` remain unchanged. Do not expand
  rich Tech enrichment without using the decision template.
- Extractors are hidden support/reference targets as of commit `0ab94ec9`;
  they remain searchable, linkable, and direct-routable where exact refs exist.
- Future full-width shallow categories must be added deliberately to the
  explicit frontend allow-list.
- Final snapshot Codex compatibility follow-up is tracked in
  `docs/active/final-snapshot-codex-ticket-plan.md`; the recommended Victory
  follow-up is `FS-CODEX-014 - Victory Data Quality Investigation`, because
  Victory Paths/Conditions remain local-only pending data-quality and
  presentation review. Do not mechanically adopt exported fields unless they
  improve player planning, comparison, discovery, or trust.
- No `EW-CODEX-UI-006` ticket is currently defined.

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

- Unit art.
- Large site-wide restyling passes.
