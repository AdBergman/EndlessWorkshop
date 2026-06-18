# Codex Self-Sustaining Worklog

Status: active execution log  
Current as of 2026-06-17

Use this log as historical evidence from the completed post-exporter-return
Codex story loop. DB Exporter definitive response/import QA is complete, and no
EWShop-owned DB-exporter-response implementation issues are currently open.

Current Codex UI continuation should start from:

1. `docs/active/codex-premium-ui-design-baseline.md`
2. `docs/active/codex-premium-ui-ticket-plan.md`

Next recommended implementation ticket: `EW-CODEX-UI-005` - Ability/Status
refinement reintroduction.

Do not recommit the stashed Ability/Status filter work as-is. Browser/visual QA
is user-owned unless explicitly requested.

## Story Status Snapshot

| Story | Status | Evidence |
| --- | --- | --- |
| `EW-CODEX-NEXT-005` - Exporter Feedback Handoff From Current Diagnostics | completed | Commit `ae9cfce7`; superseded by the DB Exporter definitive response |
| `EW-CODEX-NEXT-001` - Review Tech Unlock Summary UX | completed | Commit `5f695f5b`; Tech unlock summary helper/component/tests |
| `EW-CODEX-NEXT-002` - Resource Top-Level Category Treatment | completed | Commits `c22a2ff8`, `5396e67e`, `0bab089d`; Resources, Councilor Effects, and Partner Effects are top-level shallow reference categories |
| `EW-CODEX-NEXT-004` - Quest Strategy Codex Reference QA | completed | Browser QA found and fixed missing exact `ArmyAction` -> Actions resolution |
| `EW-CODEX-NEXT-006` - Investigate Bonuses Import Failed Rows | completed | Current startup import repro identified two deprecated placeholder bonus rows rejected by display-name normalization |
| `EW-CODEX-NEXT-003` - Clean Effect Detail Context Labels | completed | Effect detail headers now prefer exported Role/Scope and suppress technical effect category strings |
| Current audit ticket regeneration | completed | Regenerated diagnostics and created the now-archived `codex-current-audit-ticket-plan.md` |
| `EW-CODEX-AUDIT-001` - Make Codex Diagnostics Implementation-Aware | completed | Generated diagnostics now mark completed exact-ref surfaces as implemented |
| `EW-CODEX-AUDIT-002` - Browser-QA Population Threshold Summaries | completed | Browser QA confirmed resolved exact refs render and unresolved/text-only rewards remain plain |
| `EW-CODEX-AUDIT-003` - Review Diplomatic Treaty Applied Status Usefulness | completed | Exact applied Status refs now render compact treaty mechanics summaries |
| `EW-CODEX-AUDIT-004` - Harden Quest Strategy Codex Preview Accessibility | completed | Quest Codex preview tooltips now dismiss on outside click/tap and Escape |
| `EW-CODEX-AUDIT-005` - Browser-Review Action Mechanics Presentation | completed | Browser QA found current structured rendering sufficient; thin Actions stay exporter-owned |
| `EW-CAT-UX-001` - Label shallow reference category summaries | completed | Commit `b7ecc475`; category summary labels distinguish reference lists |
| `EW-CAT-UX-005` - Treat Traits as shallow reference rows | completed | Commit `2f9c4f75`; Traits use shallow rows with exact Minor Faction links |
| `EW-CODEX-UI-001` - Contextual Codex Header | completed | Commit `8b57d228`; landing keeps large `Encyclopedia`, category/search/entry views use compact archive/search header, `All` shelf escape hatch restored, autocomplete disabled |
| `EW-CODEX-UI-002` - Landing Page Final Polish | deferred | Tiny CSS-only polish was manually rejected; landing is acceptable until a more deliberate redesign |
| `EW-CODEX-UI-003` - Category Shelf Final Polish | covered | Accepted `EW-CODEX-UI-001` already restored `All`, wrapped the shelf, kept direct access/counts/active state, and hid Modifiers |
| `EW-CODEX-UI-004A` - Partner/Councilor Effects Full-Width Shallow Overview | completed | Commit `92e94047`; Partner/Councilor Effects overview routes use centered full-width reference layout through explicit allow-list |
| `EW-CODEX-UI-004` - Shallow Reference Layout Review | completed | Commits `92e94047`, `0ab94ec9`, `5bf7253d`; Partner Effects, Councilor Effects, and Resources use full-width overview; Extractors are hidden support/reference targets; Traits remain split-layout |
| `EW-CODEX-UI-005` - Ability/Status Refine Reintroduction | not started | Ability/Status metadata work remains parked in `stash@{0}` and must be reviewed selectively |

## 2026-06-18 - EW-CODEX-UI-004 Resource And Extractor Closeout

- Story ID/title: `EW-CODEX-UI-004` resource/extractor closeout.
- Current status: completed.
- Evidence used:
  - Commits `0ab94ec9` and `5bf7253d`.
  - Manual review that Extractors are support/reference targets rather than
    strong top-level destinations.
  - Manual review that Resources benefit from the same centered full-width
    shallow overview as Partner/Councilor Effects.
- Changes made:
  - Extractors are hidden from visible top-level navigation and `/codex`
    landing cards.
  - Extractor entries remain searchable, linkable, and direct-routable where
    exact refs exist.
  - Resources overview routes now use centered full-width shallow overview.
  - Resource overview rows show icons where exact icon data is available.
  - Resource overview rows sort Luxury A-Z, Strategic A-Z, then Other A-Z using
    exported Type facts.
  - Selected Resource entry routes and search-active Resources keep split
    layout.
  - Traits remain split-layout by design for now.
- Tests/diagnostics/browser QA run:
  - `npm test -- --run src/pages/CodexPage.test.tsx`
  - `npx tsc --noEmit --project tsconfig.json`
  - `npm run build`
  - `git diff --check`
  - Browser/visual QA was user-owned.
- Commit hash if committed:
  - `0ab94ec9`
  - `5bf7253d`
- Next recommended action:
  - Start `EW-CODEX-UI-005` Ability/Status refinement reintroduction. Review
    and selectively reuse the parked stash; do not apply it wholesale.

## 2026-06-17 - EW-CODEX-UI-004A Effect Reference Overview Layout

- Story ID/title: `EW-CODEX-UI-004A` - Partner/Councilor Effects Full-Width
  Shallow Overview.
- Current status: completed.
- Evidence used:
  - `docs/active/codex-shallow-reference-layout-review.md`.
  - Manual visual review accepted hiding the duplicate left results pane for
    Partner/Councilor Effects overview routes after the reference panel was
    centered and width-bounded.
- Changes made:
  - Partner Effects and Councilor Effects category overview routes now use a
    centered full-width shallow reference overview.
  - Selected effect entry routes keep split/detail behavior.
  - Resources, Traits, Tech, and normal categories remain split-layout.
  - Full-width behavior is controlled by the explicit allow-list
    `counciloreffects`, `partnereffects` and helper
    `supportsFullWidthReferenceOverview(kind)`.
  - No generic renderer was introduced; Modifiers remain hidden.
- Tests/diagnostics/browser QA run:
  - `npm test -- --run src/pages/CodexPage.test.tsx`
  - `npx tsc --noEmit --project tsconfig.json`
  - `npm run build`
  - `git diff --check`
  - Browser/visual QA was user-owned.
- Commit hash if committed:
  - `92e94047`
- Next recommended action:
  - Historical note: Resources were later reviewed and implemented in commit
    `5bf7253d`.

## 2026-06-17 - Codex Premium UI Ticket Status Closeout

- Story ID/title: `EW-CODEX-UI-002` / `EW-CODEX-UI-003` closeout and
  `EW-CODEX-UI-004` review start.
- Current status: completed docs/status update.
- Evidence used:
  - Manual visual review rejected the tiny landing CSS-only polish.
  - Accepted `EW-CODEX-UI-001` compact header/category shelf behavior.
  - Current frontend shallow reference code and tests for Resources, Councilor
    Effects, Partner Effects, and Traits.
- Changes made:
  - Marked `EW-CODEX-UI-002` no-op/deferred for now.
  - Marked `EW-CODEX-UI-003` covered by `EW-CODEX-UI-001` unless a specific new
    shelf issue appears.
  - Created `docs/active/codex-shallow-reference-layout-review.md`.
  - At the time, set next recommended implementation to `EW-CODEX-UI-004A`.
- Tests/diagnostics/browser QA run:
  - `git status --short`
  - `git diff --check`
  - Browser/visual QA was not run.
- Next recommended action:
  - Historical note: `EW-CODEX-UI-004A` has since been implemented in commit
    `92e94047`.

## 2026-06-17 - EW-CODEX-UI-001 Contextual Codex Header

- Story ID/title: `EW-CODEX-UI-001` - Contextual Codex Header.
- Current status: completed.
- Evidence used:
  - `docs/active/codex-premium-ui-design-baseline.md`.
  - `docs/active/codex-premium-ui-ticket-plan.md`.
  - Manual visual review feedback on the intermediate large category-title and
    compact-header iterations.
- Changes made:
  - Kept `/codex` landing on the large `Encyclopedia` header with category-card
    navigation.
  - Replaced category/search/entry top headers with a compact archive/search
    header instead of a repeated category title.
  - Restored `All` as the first category-shelf control and full encyclopedia
    escape hatch.
  - Made the category shelf wrap inside the page.
  - Bounded compact-header search width.
  - Disabled the Codex autocomplete popup while preserving search filtering.
- Tests/diagnostics/browser QA run:
  - `npm test -- --run src/pages/CodexPage.test.tsx`
  - `npm test -- --run src/components/Codex/CodexSearch.test.tsx`
  - `npx tsc --noEmit --project tsconfig.json`
  - `npm run build`
  - `git diff --check`
  - Browser/visual QA was user-owned.
- Commit hash if committed:
  - `8b57d228`
- Next recommended action:
  - Continue with `EW-CODEX-UI-002` - Landing Page Final Polish.

## 2026-06-16 - Loop Bootstrap And State Reconciliation

- Story ID/title: Self-sustaining loop bootstrap / active story reconciliation.
- Start time/date: 2026-06-16 08:37 CEST.
- Current status: completed.
- Evidence used:
  - `git status --short` clean at start.
  - Recent commits: `ae9cfce7`, `5f695f5b`, `c22a2ff8`, `5396e67e`, `0bab089d`.
  - `docs/archive/codex/completed-2026-06-16/codex-post-exporter-return-next-stories.md`.
  - `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/codex-exporter-return-progress.md`.
  - `docs/current-action-priorities.md`.
- Changes made:
  - Created this worklog.
  - Reconciled active docs with committed post-RET reality: Resources,
    Councilor Effects, and Partner Effects are now top-level shallow reference
    categories; Modifiers remain hidden.
- Tests/diagnostics/browser QA run:
  - Pending for this docs reconciliation.
- Review notes:
  - The active story plan predates the shallow reference category promotion and
    label cleanup commits, so NEXT-002 should be treated as completed.
  - NEXT-003 remains open because it concerns detail-page context labels, not
    shallow list row labels.
- Commit hash if committed:
  - `3c90b833`
- Next recommended action:
  - Continue with `EW-CODEX-NEXT-004` Quest Strategy Codex Reference QA unless
    validation of this docs reconciliation fails.

## 2026-06-16 - EW-CODEX-NEXT-004 Quest Strategy Codex Reference QA

- Story ID/title: `EW-CODEX-NEXT-004` - Quest Strategy Codex Reference QA.
- Start time/date: 2026-06-16 08:37 CEST.
- Current status: completed.
- Evidence used:
  - `docs/archive/codex/completed-2026-06-16/codex-post-exporter-return-next-stories.md`.
  - `docs/current-action-priorities.md` P1 Quest Codex link guidance.
  - Existing Quest Strategy Codex reference tests and current browser QA.
  - Current local quest export has exact refs for `ArmyAction`,
    `FactionAction`, `Tech`, and unresolved `Bonus` rows.
- Changes made:
  - Added exact `ArmyAction` / `ArmyActionType` mapping to Codex Actions in
    the Quest Codex reference resolver.
  - Added resolver and Strategy Dossier tests for the exact ArmyAction path.
- Tests/diagnostics/browser QA run:
  - `npm test -- --run src/features/quests/questCodexReference.test.ts src/components/Quests/StrategyDossier.test.tsx`
  - `npm test -- --run src/pages/CodexPage.test.tsx`
  - Browser QA:
    `/quests/FactionQuest_Mukag_Chapter02_Step01?mode=strategy`.
    Before fix, `Use Build Bridge twice` stayed plain while exact Tech and
    FactionAction refs linked. After fix, Build Bridge, Hydromatic Laboratory,
    and Mukag Monsoon Festival all expose exact Codex open links.
- Review notes:
  - Guardrails: exact exported metadata only; no Lore expansion; no inferred
    links; no Quest Explorer redesign.
  - `Bonus` reference rows remain unresolved and move to
    `EW-CODEX-NEXT-006`; no local guessing was added.
- Commit hash if committed:
  - `3c3062ae` for the code/test change.
  - `19a9b1d0` for the worklog commit-hash correction.
- Next recommended action:
  - Continue with `EW-CODEX-NEXT-006` bonuses failed-row investigation.

## 2026-06-16 - EW-CODEX-NEXT-006 Bonuses Import Failed Rows

- Story ID/title: `EW-CODEX-NEXT-006` - Investigate Bonuses Import Failed Rows.
- Start time/date: 2026-06-16 08:48 CEST.
- Current status: completed.
- Evidence used:
  - Current local startup import repro:
    `ewshop_bonuses_codex_export_0.82.json` reports `received=587`,
    `inserted=583`, `failed=2`, while the overall local startup import
    finishes with `0 failed`.
  - `CodexImportAdminFacadeImpl` reports failed rows only when DTO rows cannot
    be mapped into `CodexImportSnapshot` instances.
  - `CodexDisplayNameNormalizer` strips leading bracket-token prefixes from
    Codex display names and rejects names that become empty.
  - Local bonuses JSON contains two rows whose display names are exactly
    `[DEPRECATED]`: `ConstructibleCostModifier_UnitCostReduction03` and
    `ConstructibleCostModifier_UnitMoneyCostReduction01`.
- Changes made:
  - No importer or UI change. Importing deprecated placeholder bonus rows would
    add low-value Codex noise and is not a player-facing EWShop improvement.
  - Updated active docs to classify this as exporter/editorial cleanup rather
    than an EWShop blocker.
- Tests/diagnostics/browser QA run:
  - Restarted the local Spring Boot app with local imports enabled to reproduce
    the current startup import summary.
  - Read-only JSON checks against `local-imports/codex/ewshop_bonuses_codex_export_0.82.json`.
- Review notes:
  - No release-safety gate changes were made.
  - No hidden/unreleased names were exposed.
  - No exact public related link was proven missing from player-facing Codex
    pages.
- Commit hash if committed:
  - `915756aa`
- Next recommended action:
  - Continue with `EW-CODEX-NEXT-003` effect detail context-label cleanup.

## 2026-06-16 - EW-CODEX-NEXT-003 Effect Detail Context Labels

- Story ID/title: `EW-CODEX-NEXT-003` - Clean Effect Detail Context Labels.
- Start time/date: 2026-06-16 08:52 CEST.
- Current status: completed.
- Evidence used:
  - `docs/archive/codex/completed-2026-06-16/codex-post-exporter-return-next-stories.md`.
  - Current local Codex effect entries:
    `CouncilorEffect_Defense21` and
    `PartnerEffect_Hydracorn_PartnerTrait01`.
  - Browser QA for direct Codex detail URLs.
- Changes made:
  - Detail-page context labels for `councilorEffects` and `partnerEffects`
    now prefer exact exported `Role` or `Scope` facts.
  - Technical effect category strings such as `Effect_Defense21` and
    `PartnerEffect...Event003...` are suppressed from the detail header.
  - Structured facts and effect mechanics remain unchanged.
- Tests/diagnostics/browser QA run:
  - `npm test -- --run src/pages/CodexPage.test.tsx`
  - `npx tsc --noEmit --project tsconfig.json`
  - `npm run build`
  - `git diff --check`
  - Browser QA:
    `/codex?category=counciloreffects&entry=CouncilorEffect_Defense21`
    rendered detail meta `Councilor Effects`, `Defense` and preserved both
    exported effect lines.
  - Browser QA:
    `/codex?category=partnereffects&entry=PartnerEffect_Hydracorn_PartnerTrait01`
    rendered detail meta `Partner Effects` and preserved both exported effect
    lines.
- Review notes:
  - Guardrails: no mechanics rewrite, no generic renderer, no search or
    navigation changes, and Modifiers remain hidden from top-level navigation.
  - Result-row context is unchanged; this story only targeted detail-page
    header roughness.
- Commit hash if committed:
  - `e1abfc45`
- Next recommended action:
  - Stop the self-sustaining post-exporter-return Codex loop for now. The
    active NEXT story plan has no remaining actionable EWShop story backed by
    current evidence.

## 2026-06-16 - Current Codex Audit Ticket Regeneration

- Story ID/title: Current Codex implementation/data audit and ticket
  regeneration.
- Start time/date: 2026-06-16.
- Current status: completed.
- Evidence used:
  - Current local Codex JSON files in `local-imports/codex/`.
  - 2026-06-14 DB Exporter aggregate handoff and packet return docs.
  - Current EWShop implementation state recorded in this worklog and
    `docs/current-action-priorities.md`.
  - Regenerated content-quality, preview-surface, and relationship-gap
    diagnostics.
- Changes made:
  - Regenerated the now-archived `codex-preview-surface-audit.md`.
  - Regenerated the now-archived `codex-relationship-value-gap-audit.md`.
  - Created the now-archived `codex-current-audit-ticket-plan.md` with
    separate EWShop and DB Exporter/editorial Jira-style ticket lists.
  - Updated active docs index and priorities to point the next self-sustaining
    loop at the refreshed audit-backed ticket plan.
- Tests/diagnostics/browser QA run:
  - `npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300`
  - `npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md`
  - `npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md`
- Review notes:
  - The content-quality diagnostic reports 178 high findings, all
    Exporter/editorial-owned.
  - Several generated preview/relationship recommendations point at already
    completed EWShop features, so the ticket plan overlays current
    implementation status instead of copying generated rankings blindly.
- Commit hash if committed:
  - `d47b228f`
- Next recommended action:
  - Historical next step was `EW-CODEX-AUDIT-001`; this was completed before
    the definitive response superseded the ticket plan.

## 2026-06-16 - EW-CODEX-AUDIT-001 Make Diagnostics Implementation-Aware

- Story ID/title: `EW-CODEX-AUDIT-001` - Make Codex Diagnostics
  Implementation-Aware.
- Start time/date: 2026-06-16.
- Current status: completed.
- Evidence used:
  - `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/codex-current-audit-ticket-plan.md`.
  - Current local Codex JSON files in `local-imports/codex/`.
  - Existing diagnostic scripts:
    `frontend/scripts/codex-preview-surface-audit.ts` and
    `frontend/scripts/codex-relationship-value-gap-audit.ts`.
- Changes made:
  - Updated preview-surface diagnostics so exact Tech Unlock summaries and
    exact Population threshold reward summaries are marked implemented instead
    of recommended as future EWShop work.
  - Updated relationship-gap diagnostics so Resources are treated as current
    top-level shallow reference entries, not deferred searchable-only targets.
  - Regenerated the active preview-surface and relationship-gap reports.
- Tests/diagnostics/browser QA run:
  - `npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md`
  - `npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md`
  - `npx tsc --noEmit --project tsconfig.json`
  - `git diff --check`
- Review notes:
  - No Codex UI, release gate, Modifiers navigation, or exporter contract was
    changed.
  - Remaining diagnostics still show exporter/editorial gaps for text-only Tech
    Unlocks, text-only Population rewards, thin Resource/Extractor entries, and
    thin Action/Treaty content.
- Commit hash if committed:
  - `9ad93a33`
- Next recommended action:
  - Continue with `EW-CODEX-AUDIT-002` Population threshold summary browser QA
    if validation passes and the commit is clean.

## 2026-06-16 - EW-CODEX-AUDIT-002 Browser-QA Population Threshold Summaries

- Story ID/title: `EW-CODEX-AUDIT-002` - Browser-QA Population Threshold
  Summaries.
- Start time/date: 2026-06-16.
- Current status: completed.
- Evidence used:
  - Current local Codex imports in `local-imports/codex/`.
  - Browser QA against local backend/frontend with local Codex imports enabled.
  - Existing focused Codex page tests for exact threshold Improvement and Unit
    summaries.
- Changes made:
  - No frontend UI change was needed.
  - Updated relationship-gap diagnostics to distinguish resolved exact
    Population threshold refs, unresolved exact refs, and text-only rewards.
  - Updated active progress/planning docs to record the current Aspect
    unresolved-target evidence.
- Tests/diagnostics/browser QA run:
  - Browser QA:
    `/codex?category=populations&entry=Population_KinOfSheredyn` rendered
    `Military Press` as a threshold summary.
  - Browser QA:
    `/codex?category=populations&entry=Population_LastLord` rendered
    `Altar of Channeling` as a threshold summary.
  - Browser QA:
    `/codex?category=populations&entry=Population_Necrophage` rendered
    `Larval Pulp` as a threshold summary.
  - Browser QA:
    `/codex?category=populations&entry=Population_Mukag` rendered
    `Astronomy Club` as a threshold summary.
  - Browser QA:
    `/codex?category=populations&entry=Population_Minor_DaughterOfBor`
    rendered `Bor’s Sparring Ring` and did not repeat its Improvement card in
    Related Entries.
  - Browser QA:
    `/codex?category=populations&entry=Population_Minor_Horatio` rendered
    `Horatio Clone` as a Unit threshold summary.
  - Browser QA:
    `/codex?category=populations&entry=Population_Aspect` left
    `Nutrient Extractor` plain because exact ref
    `Aspect_DistrictImprovement_00` is not present as a current Codex entry.
  - Browser QA:
    `/codex?category=populations&entry=Population_Called` left text-only
    threshold rewards plain.
  - `npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md`
  - `npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md`
  - `npm test -- --run src/pages/CodexPage.test.tsx`
  - `npx tsc --noEmit --project tsconfig.json`
  - `git diff --check`
- Review notes:
  - Exact resolved threshold refs behave as intended.
  - No display-name/prose inference was added.
  - Remaining issue is exporter/editorial/backend data: provide
    `Aspect_DistrictImprovement_00` as a public Codex entry or change/remove
    the unresolved ref.
- Commit hash if committed:
  - `82beedda`
- Next recommended action:
  - Continue with `EW-CODEX-AUDIT-003` Diplomatic Treaty applied Status
    usefulness review if validation passes and the commit is clean.

## 2026-06-16 - EW-CODEX-AUDIT-003 Diplomatic Treaty Applied Status Usefulness

- Story ID/title: `EW-CODEX-AUDIT-003` - Review Diplomatic Treaty Applied
  Status Usefulness.
- Start time/date: 2026-06-16.
- Current status: completed.
- Evidence used:
  - Browser QA for `Declaration_CloseBorders`,
    `Declaration_EmbraceCoralSymbiosis`,
    `Declaration_FactionQuest_Aspect_Chapter06AStep02`, and
    `Treaty_SharedResearch`.
  - Current local Codex Status metadata for exact treaty Status refs.
- Changes made:
  - Added a narrow Diplomatic Treaty Applied Status summary helper and
    component.
  - Applied Status section items now show a compact clickable Status mechanics
    summary only when their `referenceKey` resolves to a Status entry.
  - Related Entries remain unchanged.
  - Updated diagnostics so treaty applied Status summaries are treated as
    implemented, while broader Treaty preview work remains deferred.
- Tests/diagnostics/browser QA run:
  - Browser QA:
    `/codex?category=diplomatictreaties&entry=Declaration_CloseBorders`
    shows `Closed Borders declared` with `-25 Public Opinion`.
  - Browser QA:
    `/codex?category=diplomatictreaties&entry=Declaration_EmbraceCoralSymbiosis`
    shows `You embraced Coral Symbiosis` with `+5 Public Opinion`.
  - Browser QA:
    `/codex?category=diplomatictreaties&entry=Declaration_FactionQuest_Aspect_Chapter06AStep02`
    shows `Victim of the Coral Siphon Declaration` with
    `-10 Public Opinion` while preserving the existing Effects text.
  - Browser QA:
    `/codex?category=diplomatictreaties&entry=Treaty_SharedResearch` remains
    Effects-only with no extra Status summary.
  - `npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md`
  - `npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md`
  - `npm test -- --run src/pages/CodexPage.test.tsx`
  - `npx tsc --noEmit --project tsconfig.json`
  - `npm run build`
  - `git diff --check`
- Review notes:
  - This is intentionally not a generic preview renderer.
  - No display-name/prose inference was added.
  - Broader Treaty preview expansion remains deferred until exporter/editorial
    Effects improve.
- Commit hash if committed:
  - `41a4ce9f`
- Next recommended action:
  - Continue with `EW-CODEX-AUDIT-004` Quest Strategy Codex preview
    accessibility if validation passes and the commit is clean.

## 2026-06-16 - EW-CODEX-AUDIT-004 Quest Strategy Codex Preview Accessibility

- Story ID/title: `EW-CODEX-AUDIT-004` - Harden Quest Strategy Codex Preview
  Accessibility.
- Start time/date: 2026-06-16.
- Current status: completed.
- Evidence used:
  - Browser QA on
    `/quests/FactionQuest_Mukag_Chapter02_Step01?mode=strategy`.
  - Existing Quest Strategy Codex reference tests.
- Changes made:
  - Added outside pointer-down and Escape-key dismissal for Quest Strategy
    Codex preview tooltips.
  - Kept exact Codex open links, resolver behavior, and Quest layout unchanged.
- Tests/diagnostics/browser QA run:
  - Browser QA confirmed exact Codex open links remain visible and in-bounds on
    a 390px viewport.
  - Browser QA confirmed `Build Bridge` preview opens on click/tap and now
    dismisses on outside click/tap and Escape.
  - `npm test -- --run src/features/quests/questCodexReference.test.ts src/components/Quests/StrategyDossier.test.tsx`
  - `npx tsc --noEmit --project tsconfig.json`
  - `npm run build`
  - `git diff --check`
- Review notes:
  - No Quest Explorer redesign, Lore expansion, or inferred refs were added.
  - The fix stays inside the Quest Codex reference link component.
- Commit hash if committed:
  - `ab4b6bee`
- Next recommended action:
  - Continue with `EW-CODEX-AUDIT-005` Action mechanics browser review if
    validation passes and the commit is clean.

## 2026-06-16 - EW-CODEX-AUDIT-005 Action Mechanics Browser Review

- Story ID/title: `EW-CODEX-AUDIT-005` - Browser-Review Action Mechanics
  Presentation.
- Start time/date: 2026-06-16.
- Current status: completed.
- Evidence used:
  - Browser QA for current Action pages with local Codex imports.
- Changes made:
  - No frontend UI change was needed.
  - Updated active docs to record that current structured rendering is
    sufficient for mechanics-rich Actions and that thin/facts-only Actions
    remain exporter/editorial-owned.
- Tests/diagnostics/browser QA run:
  - Browser QA:
    `/codex?category=actions&entry=ActionTypeAbsorbCity` renders its
    Influence cost multiplier mechanics and related Modifier.
  - Browser QA:
    `/codex?category=actions&entry=ActionTypeCloseRift` renders multiple Turn
    cost multiplier mechanics and related Modifiers.
  - Browser QA:
    `/codex?category=actions&entry=ConstructibleAction_RazeDistrict` renders
    Production cost mechanics and explanatory current-game-state text.
  - Browser QA:
    `/codex?category=actions&entry=ActionTypeBuildObservatory` correctly stays
    facts-only with the action-specific no-public-summary placeholder.
  - `git diff --check`
- Review notes:
  - No summaries or mechanics were invented.
  - No release-safety gates were changed.
  - Cost modifier wording is still somewhat database-like, but improving it
    safely requires exporter/editorial public gameplay summaries rather than a
    frontend heuristic.
- Commit hash if committed:
  - `a0dc8d04`
- Next recommended action:
  - Stop this self-sustaining loop. All refreshed EWShop audit tickets are
    completed, and remaining Codex value gaps are DB Exporter/editorial-owned
    unless new browser QA or data evidence appears.
