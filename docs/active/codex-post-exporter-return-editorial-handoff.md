# Codex Post-Exporter-Return Editorial Handoff

Status: active DB Exporter/editorial feedback  
Current as of 2026-06-16

This note summarizes only evidence from the completed EWShop RET-001 through
RET-006 QA pass and current Codex diagnostics. Use it as the focused follow-up
after the 2026-06-14 exporter return bundle.

Sources:

- `docs/active/codex-exporter-return-progress.md`
- `docs/active/codex-post-exporter-return-next-stories.md`
- `docs/current-action-priorities.md`
- `docs/active/codex-db-exporter-implementation-packets/`

## Diagnostic Snapshot

Command:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
```

Result:

- Entries scanned: 2127
- Findings: 178 high
- Owner split: 178 Exporter/editorial, 0 EWShop
- Issue types: 170 `missing-player-context`, 8 `raw-internal-text`
- Affected categories: actions 87, districts 41, improvements 23, abilities
  19, populations 7, councilors 1

## EWShop-Fixed Items Not To Reopen

- Generic Codex import/API accepts and serves `resources`, `councilorEffects`,
  and `partnerEffects`.
- `resources`, `councilorEffects`, and `partnerEffects` have readable frontend
  labels and are searchable/linkable.
- `resources`, `councilorEffects`, `partnerEffects`, and `modifiers` remain out
  of top-level Codex navigation by product decision.
- Resource and Extractor exact links work for QA examples such as
  `Resource_Luxury01`, `Resource_Strategic01`, and `Extractor_Luxury01`.
- Councilor pages link to Councilor Effect and Partner Effect pages; QA examples
  include `Notable_Elder_MinorFaction_Hydracorn`,
  `CouncilorEffect_Defense21`, and `PartnerEffect_Hydracorn_PartnerTrait01`.
- Tech unlock refs render through EWShop structured metadata for examples such
  as `Aspect_Technology_00` and `KinOfSheredyn_Technology_04`.
- Major faction Population threshold refs render compact summaries where exact
  refs exist; text-only rewards remain plain by design.
- Modifier pages remain hidden from top-level navigation but are searchable and
  linkable when exact public targets exist.

## Exporter/Editorial Asks

### 1. Add Player Context To Thin Actions

Evidence:
- Diagnostic: 87 Action entries still have classification facts only.
- Browser QA: `ActionTypeBuildObservatory` correctly falls back to EWShop's
  generic missing-summary state because current data has no public gameplay
  summary.
- Public-safe examples: `ActionTypeArmyStealTerritory`,
  `ActionTypeBanishPopulationFromSettlement`, `ActionTypeBuildObservatory`.

Expected exporter/editorial fix:
- Add concise public gameplay summaries, effects, source/availability context,
  costs, target constraints, and exact refs where canonical public data exists.
- Leave actions thin when no public canonical mechanics source exists; do not
  export guessed mechanics.

### 2. Add Player Context To Thin Districts And Improvements

Evidence:
- Diagnostic: 41 District entries and 23 Improvement entries still have
  classification facts only.
- Public-safe examples: `District_Bridge`, `District_Tier0_Bridge`,
  `DistrictImprovement_Bridge_01`, `DistrictImprovement_Extractor_01`.

Expected exporter/editorial fix:
- Add effects, unlocks, requirements, source, or strategic summary metadata
  where canonical public data exists.
- Keep exact refs attached to structured section items/facts when the target is
  a Codex entry.

### 3. Replace Raw Internal Population Values

Evidence:
- Diagnostic: 7 Population raw-internal-text findings.
- Public-safe examples:
  - `Population_Aspect` fact value currently exposes `Faction_Aspect`.
  - `Population_KinOfSheredyn` fact value currently exposes
    `Faction_KinOfSheredyn`.
  - `Population_LastLord` fact value currently exposes `Faction_LastLord`.
  - `Population_Mukag` fact value currently exposes `Faction_Mukag`.
  - `Population_Necrophage` fact value currently exposes `Faction_Necrophage`.
  - `Population_Minor_MangroveOfHarmony` threshold fact value currently exposes
    `MangroveOfHarmony_District_Tier1_Money`.

Expected exporter/editorial fix:
- Export public display labels for player-facing fact values.
- When the value points to a Codex entity, attach an exact `referenceKey` to the
  fact or section item so EWShop can link it without display-name matching.

### 4. Improve Thin Resource And Extractor Context Where Canonical

Evidence:
- Browser QA confirms the new Resource/Extractor link shape works, but Resource
  pages are still mostly factual lookup pages rather than strategy context.
- The exporter bundle also marks resource deposits/POI pages as deferred.

Expected exporter/editorial fix:
- For resources and extractors, add concise public context such as use, source,
  extraction relationship, and availability where canonical data exists.
- Keep Resources searchable/linkable for now; top-level browse promotion is an
  EWShop product decision, not an exporter blocker.

### 5. Investigate Bonuses Import Failed-Row Risk

Evidence:
- EWShop local startup import still reports two failed bonus Codex rows.
- RET QA found no player-visible missing page, so this is a risk, not a proven
  broken public surface.

Expected follow-up:
- If exporter logs can safely identify the failing public row keys and failure
  reason, include that in the next return note.
- Do not include hidden/unreleased names in shared diagnostics.
- EWShop should only treat this as player-facing if dead-ref diagnostics or
  browser QA reveal a missing public target.

### 6. Validate Quest Refs Through Quest Strategy, Not Generic Codex

Evidence:
- Current local Codex imports do not include a generic `quests` exportKind.
- RET QA could not validate quest refs through Codex category browsing.

Expected follow-up:
- Validate quest requirement/reward refs through Quest Strategy / Quest
  Explorer workflows.
- Do not assume generic Codex category QA proves Quest ref quality until a
  generic Quest Codex surface exists.

### 7. Keep Treaty/Status Follow-Up Evidence-Based

Evidence:
- `Declaration_CloseBorders` renders an Applied Status and linked
  `Status_PublicOpinion_YouClosedBorders`.
- `Treaty_SharedResearch` renders acceptably as facts/effects-only for current
  data.

Expected follow-up:
- Do not reopen Treaty/Status work broadly from old backlog docs.
- Send only concrete entries where current diagnostics or browser QA show
  missing public mechanics, raw text, or broken exact refs.

## Remaining EWShop-Only Blockers

None blocking the next EWShop Codex story. Current EWShop follow-ups are product
decisions or cosmetic improvements:

- Review Tech Unlock Summary UX using exact refs.
- Decide whether Resources should remain searchable-only or become top-level.
- Clean cosmetic effect context labels such as technical suffixes on effect
  detail pages.

