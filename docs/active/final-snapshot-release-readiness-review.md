# Final Snapshot Release Readiness Review

Status: active release assessment for the final DB Exporter snapshot adoption cycle  
Created: 2026-06-23

## Executive Recommendation

Recommendation: **Do not release until post-deploy blockers are cleared**.

EWShop has adopted the highest-value final-snapshot public Codex improvements
and the first rich source-truth enrichment paths. The current player-facing
Codex is meaningfully better for planning, comparison, and trust across
Abilities, Statuses, Populations, Heroes, Factions, Actions, Wonders, and
constructible details.

Release should proceed only after the current uncommitted constructible planning
slice is either committed or intentionally excluded from the release branch, and
after a focused browser QA pass covers the checklist below.

Production Admin Import must include both public Codex files and the rich
source-truth exports used by frontend enrichment. Do not rely on `local-imports/`
for production data.

Do not release Victory Paths or Victory Conditions as normal public top-level
categories yet. They remain local/dev-visible only until the `Master` Victory
Path data-quality issue is resolved or explicitly product-accepted.

Post-deploy verification on 2026-06-24 found that production is serving current
Codex/rich data and current Hero/Faction enrichment code, but two release
blockers remain:

- `/api/codex` did not return `Content-Encoding: gzip` when requested with
  `Accept-Encoding: gzip`.
- `/api/data-freshness` returned `available: false`, so the public Codex Game
  Data Version block cannot render in production.

Clear these before treating the final snapshot release as production-ready.

## Completed Ticket Summary

| Work item | Result | Release note |
| --- | --- | --- |
| Ability `svgIcon` support | Completed | Codex preserves optional entry-level `svgIcon`; Abilities render exact `ability-icons` metadata only when exported. |
| Canonical Ability role compatibility | Completed | Ability role handling accepts canonical `Apply Status` / `Remove Status` labels while preserving compatibility with old labels. |
| Trait type compatibility | Completed | Traits use exported `Trait type` for broad Faction/Protectorate filtering instead of stale secondary category behavior. |
| Victory Conditions compact rows | Completed, local-only | Rows render useful exported victory objective/value/duration/caveat data, but category remains local-only after data-quality review. |
| Victory Data Quality Investigation | Completed | `Master` appears as a Victory path value for Supremacy/Insights without a matching public `VictoryPath_*` entry/reference. |
| Local-only category visibility | Completed | Victory Paths and Victory Conditions are visible in local/dev navigation and hidden from public top-level navigation; direct routes remain available. |
| Rich Factions import foundation | Completed | `/api/factions` foundation preserves rich faction source-truth relationships as exported keys. |
| Faction detail enrichment | Completed | Codex Faction and Minor Faction detail pages can use exact rich faction joins without adding a `/factions` route. |
| Heroes + Skills import foundation | Completed | `/api/heroes` and `/api/skills` preserve rich hero/skill data; no public Skills category or `/heroes` route was added. |
| Hero detail enrichment | Completed | Hero details show compact profile enrichment: origin/class, starting skills, skill paths, and exact primary ability links where safe. |
| Population archive mode | Completed | Population rows now show worker effects and threshold rewards from public Codex data. |
| Population metadata polish | Completed | Population row metadata is calmer and faction-oriented; noisy generic availability/food metadata stays detail-only. |
| Wonders reference overview | Completed | Natural Wonders are presented as `Wonders` in the top navigation and use the shallow full-width reference overview pattern. |
| Status polarity/interactions | Completed | Status details/rows can surface exported `Polarity` and exact status interactions without promoting raw Modifiers. |
| Action archive cleanup | Completed | Actions remain shallow reference-style; modifier-heavy `Action mechanics` are not promoted in archive rows. |
| Diagnostics deny-list hardening | Completed | Diagnostics-only final snapshot files are not public-imported as Codex content. |
| Constructible planning enrichment | Implemented, uncommitted | District/Improvement details can show exact Tech unlock links, District upgrade links, and limited safe placement text. Must be committed or excluded before release. |

## Open Ticket Summary

| Ticket | Status | Release impact |
| --- | --- | --- |
| `FS-CODEX-006` Victory Paths Presentation Decision | Deferred | Blocked by/secondary to Victory data-quality decision; keep local-only. |
| `FS-CODEX-007` Ability Role Cleanup Follow-Up | Deferred | Exporter-owned role cleanup remains valuable but not release-blocking. |
| `FS-CODEX-008` Trait Origin Faction Row Metadata Review | Deferred | Optional polish; not release-blocking. |
| `FS-CODEX-012` Quest Explorer Chapter Root Evidence Investigation | Deferred | Quest Explorer improvement candidate; not a Codex release blocker. |
| Rich Populations import | Deferred | Public Population archive is already useful enough for this release. |
| Public Skills category | Not recommended now | Skills should remain Hero sidecar data until a product surface is approved. |
| `/factions` or `/heroes` strategy routes | Not recommended now | Current enrichment adds detail-page value without creating large new route-owned experiences. |

## Local-Only Categories

Local/dev-visible, hidden from normal public top-level Codex navigation:

- Victory Paths
- Victory Conditions

Rationale:

- Victory Path `Master` is referenced by Victory Conditions but has no matching
  public Victory Path entry/reference in `victorypaths-codex`.
- Victory Conditions are useful for QA but still need product/data-quality
  review before public browsing.
- Direct routes and local QA visibility should remain so the categories are not
  forgotten.

Hidden/support categories that should remain hidden from top-level browsing:

- Quests, because Quest Explorer owns quest browsing and Codex must not recreate
  questline/progression exploration.
- Modifiers, because they are inspection targets, not player-facing browse
  destinations.
- Extractors and other support/reference categories already intentionally hidden
  by current Codex visibility rules.

## DB Exporter Follow-Up Backlog

Validated non-blocking exporter findings:

- **Victory Path `Master` clarification**: `Master` appears as a Victory path
  value for Supremacy/Insights but has no matching public `VictoryPath_*` row or
  exact reference. Exporter should clarify whether `Master` is public; if
  public, emit a public Victory Path row and exact refs; if non-public,
  mark/document it as such.
- **Modifier provenance metadata**: EWShop can resolve exact Action -> Modifier
  and Modifier -> affected Action, but cannot safely show what grants/unlocks a
  Modifier. Exporter should emit explicit `sourceKind`, `sourceKey`,
  `sourceDisplayName`, and `sourceReferenceKey` only when source data proves it.
- **Hero progression / skill-path gaps**: Current Hero detail enrichment is
  honest about starting/default skills, applicable skill paths, and exported
  skill options grouped by tree and conservative unlock threshold. Exported
  `tierIndex` is not treated as player-facing `T1/T2/T3`; exporter
  clarification is needed before showing canonical hero skill tiers. Full hero
  progression, point-cost rules, stat-vs-skill spending, recruitment,
  portraits/icons, or planner behavior require explicit source-backed
  metadata/art contracts and should not be inferred.
- **Ability role and ownership cleanup**: Ability `Combat role` still has
  exporter-owned quality follow-up, and explicit ability ownership remains
  missing unless source-proven facts/refs are emitted.

No new speculative exporter requests are introduced by this review.

## Production Risk Assessment

Overall risk: **moderate but manageable**.

Low-risk areas:

- Public Codex generic import remains intact and continues to preserve
  `facts`, `sections`, `referenceKeys`, `publicContextKeys`, and optional
  `svgIcon`.
- Diagnostics-only files are not promoted to public Codex categories.
- Quest Explorer ownership remains preserved.
- Rich Factions, Heroes, and Skills are additive API/store foundations and do
  not create new public routes.

Moderate-risk areas:

- The current working tree includes uncommitted constructible planning changes,
  including a Flyway migration. Release from this workspace requires committing
  or excluding that slice deliberately.
- Rich import APIs add new backend/API/store surface area. Focused tests pass,
  but browser QA should verify Codex detail pages after production Admin Import.
- Hero enrichment requires populated `/api/heroes` and `/api/skills`; Faction
  enrichment requires populated `/api/factions`. Production deploys must import
  those rich exports through Admin Import, because `local-imports/` only covers
  development/local startup.
- Victory categories must stay local-only; accidentally exposing them publicly
  would ship a known data-quality caveat as normal browse content.

High-risk areas to avoid:

- Promoting Modifiers, Skills, Quests, or Victory data into broad public
  navigation without product/data ownership decisions.
- Inferring ownership, icons, provenance, quest grouping, victory paths, or
  constructible planning semantics from keys, names, prose, SVG filenames, GUIDs,
  or duplicate titles.

## Browser QA Checklist

Run against a production build or release-like local build after Admin Import.

Production import order:

1. Import public Codex files from `local-imports/codex/` or the equivalent final
   snapshot Codex bundle.
2. Import supported rich/source-truth exports: factions, heroes, skills, tech,
   units, districts, improvements, and quest_explorer as needed by the release.
3. Verify `/api/factions`, `/api/heroes`, and `/api/skills` are populated before
   checking Faction/Hero Codex enrichment.

1. `/codex`
   - Category navigation is stable.
   - Victory Paths and Victory Conditions are hidden in public mode.
   - Wonders appears near the end alphabetically with Victory categories in
     local/dev navigation.
2. `/codex?category=abilities`
   - Ability icons render only for exported `ability-icons` `svgIcon`.
   - Apply/Remove Status roles still filter correctly.
3. `/codex?category=statuses`
   - Polarity and exact interactions render where exported.
   - Thin statuses remain honest.
4. `/codex?category=populations`
   - Worker effects and threshold rewards are visible.
   - Population metadata is faction-oriented and not noisy.
5. `/codex?category=naturalwonders`
   - Header says `All Wonders`.
   - Rows use shallow reference overview with effects and footprint metadata.
6. `/codex?category=actions`
   - Archive rows are shallow and do not show modifier-heavy mechanics.
   - Detail pages still preserve full exported sections and related entries.
7. `/codex?category=factions` and `/codex?category=minorfactions`
   - Detail enrichment shows exact rich faction package links where available.
   - No giant link wall or inferred icon/art behavior appears.
8. `/codex?category=heroes`
   - Hero details distinguish starting skills from skill paths.
   - No public Skills category appears.
9. `/codex?category=districts` and `/codex?category=improvements`
   - If constructible slice is included, detail pages show `Planning` only when
     exact unlock/upgrade/placement data resolves.
   - Archive rows remain unchanged.
10. `/quests`
    - Quest Explorer still owns quest browsing and is not affected by Codex
      Quest decisions.

## Suggested Release Notes

- Codex now uses the final DB Exporter snapshot metadata more effectively across
  major planning categories.
- Ability rows/details can render exact exported ability icons where available.
- Populations, Statuses, Actions, Wonders, Heroes, and Factions received
  player-facing Codex improvements focused on planning clarity and safer exact
  references.
- Hero details now show compact starting skill and skill-path information from
  rich Hero/Skill exports.
- Faction detail pages now use rich faction source-truth joins for safer
  cross-category identity.
- Victory Paths and Victory Conditions remain local/dev-visible while a
  validated `Master` Victory Path data-quality follow-up is resolved.
- Quest Explorer remains the authoritative quest browsing experience.

## Recommended Next Major Feature Direction

Recommended next direction after release: **Faction strategy/profile product
shape**.

Reasoning:

- Factions are the strongest cross-category strategy hub unlocked by the final
  snapshot.
- The rich Factions foundation and Codex detail enrichment are already in place.
- A carefully scoped faction profile experience could connect traits,
  populations, units, heroes, gated technologies, protectorate traits, and
  Quest Explorer entry points without duplicating existing route-owned systems.

Recommended next investigation before implementation:

- Define whether Faction profiles should remain Codex detail enrichment, become
  a small `/factions` route, or wait for art/icon/portrait contracts.

## Things Explicitly Not Recommended

- Do not make Victory Paths or Victory Conditions public top-level categories
  before the `Master` issue is resolved.
- Do not create a public Skills Codex category yet.
- Do not build a skill-tree planner as part of Hero Codex enrichment.
- Do not build `/factions` or `/heroes` dashboards in the release branch.
- Do not recreate Quest Explorer inside Codex.
- Do not promote Modifiers to top-level browsing.
- Do not infer icons, ownership, provenance, grouping, or progression from keys,
  names, prose, SVG filenames, GUIDs, Unity paths, or duplicate titles.
- Do not mechanically expose every final-snapshot field just because it exists.
