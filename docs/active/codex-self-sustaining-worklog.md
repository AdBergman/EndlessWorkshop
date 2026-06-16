# Codex Self-Sustaining Worklog

Status: active execution log  
Current as of 2026-06-16

Use this log for the post-exporter-return Codex story loop. It records the
evidence used, changes made, validation, commits, and next action for each
story so future sessions can continue without reconstructing chat history.

## Story Status Snapshot

| Story | Status | Evidence |
| --- | --- | --- |
| `EW-CODEX-NEXT-005` - Exporter Feedback Handoff From Current Diagnostics | completed | Commit `ae9cfce7`; `docs/active/codex-post-exporter-return-editorial-handoff.md` |
| `EW-CODEX-NEXT-001` - Review Tech Unlock Summary UX | completed | Commit `5f695f5b`; Tech unlock summary helper/component/tests |
| `EW-CODEX-NEXT-002` - Resource Top-Level Category Treatment | completed | Commits `c22a2ff8`, `5396e67e`, `0bab089d`; Resources, Councilor Effects, and Partner Effects are top-level shallow reference categories |
| `EW-CODEX-NEXT-004` - Quest Strategy Codex Reference QA | completed | Browser QA found and fixed missing exact `ArmyAction` -> Actions resolution |
| `EW-CODEX-NEXT-006` - Investigate Bonuses Import Failed Rows | completed | Current startup import repro identified two deprecated placeholder bonus rows rejected by display-name normalization |
| `EW-CODEX-NEXT-003` - Clean Effect Detail Context Labels | completed | Effect detail headers now prefer exported Role/Scope and suppress technical effect category strings |
| Current audit ticket regeneration | completed | Regenerated diagnostics and created `docs/active/codex-current-audit-ticket-plan.md` |
| `EW-CODEX-AUDIT-001` - Make Codex Diagnostics Implementation-Aware | completed | Generated diagnostics now mark completed exact-ref surfaces as implemented |
| `EW-CODEX-AUDIT-002` - Browser-QA Population Threshold Summaries | completed | Browser QA confirmed resolved exact refs render and unresolved/text-only rewards remain plain |
| `EW-CODEX-AUDIT-003` - Review Diplomatic Treaty Applied Status Usefulness | completed | Exact applied Status refs now render compact treaty mechanics summaries |
| `EW-CODEX-AUDIT-004` - Harden Quest Strategy Codex Preview Accessibility | completed | Quest Codex preview tooltips now dismiss on outside click/tap and Escape |
| `EW-CODEX-AUDIT-005` - Browser-Review Action Mechanics Presentation | completed | Browser QA found current structured rendering sufficient; thin Actions stay exporter-owned |

## 2026-06-16 - Loop Bootstrap And State Reconciliation

- Story ID/title: Self-sustaining loop bootstrap / active story reconciliation.
- Start time/date: 2026-06-16 08:37 CEST.
- Current status: completed.
- Evidence used:
  - `git status --short` clean at start.
  - Recent commits: `ae9cfce7`, `5f695f5b`, `c22a2ff8`, `5396e67e`, `0bab089d`.
  - `docs/active/codex-post-exporter-return-next-stories.md`.
  - `docs/active/codex-exporter-return-progress.md`.
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
  - `docs/active/codex-post-exporter-return-next-stories.md`.
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
  - `docs/active/codex-post-exporter-return-next-stories.md`.
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
  - Regenerated `docs/active/codex-preview-surface-audit.md`.
  - Regenerated `docs/active/codex-relationship-value-gap-audit.md`.
  - Created `docs/active/codex-current-audit-ticket-plan.md` with separate
    EWShop and DB Exporter/editorial Jira-style ticket lists.
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
  - Start the next self-sustaining loop with `EW-CODEX-AUDIT-001` from
    `docs/active/codex-current-audit-ticket-plan.md`.

## 2026-06-16 - EW-CODEX-AUDIT-001 Make Diagnostics Implementation-Aware

- Story ID/title: `EW-CODEX-AUDIT-001` - Make Codex Diagnostics
  Implementation-Aware.
- Start time/date: 2026-06-16.
- Current status: completed.
- Evidence used:
  - `docs/active/codex-current-audit-ticket-plan.md`.
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
  - Pending.
- Next recommended action:
  - Stop this self-sustaining loop. All refreshed EWShop audit tickets are
    completed, and remaining Codex value gaps are DB Exporter/editorial-owned
    unless new browser QA or data evidence appears.
