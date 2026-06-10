# Quest Explorer Codex Tooltips Feasibility v1

Status: historical feasibility note with current implementation status
Date: 2026-05-26
Canonical semantic reference: `docs/quest_explorer_canonical_semantics_v1.md`
Related comparison: `docs/quest_explorer_vs_quest_codex_comparison_v1.md`

## Current Status

Updated: 2026-06-10

The first Strategy implementation has landed since this investigation was
written.

Implemented:

- Quest reward and requirement display models preserve Codex reference metadata.
- `resolveQuestCodexReference(...)` resolves exact Codex targets by
  `codexEntryKey`, typed `referenceKind/referenceKey`, then reward
  `assetKind/assetKey`.
- Strategy requirement and reward rows render compact Codex preview affordances
  when a target resolves.
- Tests cover resolver precedence, typed kind mapping, asset fallback,
  formula-only rewards, unresolved rows, desktop hover/focus previews, Codex
  open links, and click isolation inside decision cards.

Still active:

- Review the current browser UX before adding more surfaces.
- Harden mobile/tap behavior if needed.
- Verify less-common reference kinds against real data, especially
  `MinorFaction`.
- Investigate SVG/resource icons in Strategy reward rows separately from Codex
  links.
- Wait for DB exporter Codex metadata expansion before making tooltip content
  richer than a compact description preview.

The original analysis below remains useful as rationale and historical context,
but sections that say metadata is dropped or no tooltip behavior exists are
superseded by the status above.

Primary local evidence:

- `local-imports/exports/ewshop_quest_explorer_export_0.80.json`
- `local-imports/codex/*_codex_export_0.80.json`
- `frontend/src/types/questTypes.ts`
- `frontend/src/features/quests/questExplorerNormalizer.ts`
- `frontend/src/features/quests/questRewardDisplay.ts`
- `frontend/src/features/quests/questStrategyDossier.ts`
- `frontend/src/components/Quests/QuestRewardMeta.tsx`
- `frontend/src/components/Quests/StrategyDossier.tsx`
- `frontend/src/pages/QuestExplorerPage.tsx`
- `frontend/src/components/Tooltips/*`
- `frontend/src/hooks/useCodex.ts`
- `frontend/src/stores/codexStore.ts`
- `frontend/src/lib/codex/codexRefs.ts`

`local-imports/` is local-only evidence and must not be committed.

## Executive Summary

Codex-backed Quest Explorer tooltips are feasible with a small, bounded
frontend link layer. The current backend and frontend Quest Explorer contracts
already carry enough structured metadata for most reward and requirement links:
`referenceKind`, `referenceKey`, `referenceDisplayName`, reward `assetKind`,
`assetKey`, `assetDisplayName`, and formula fields are preserved through the
API and normalizer.

The main implementation gap is adapter/view-model loss, not export or backend
loss. Strategy currently renders reward display metadata, including formula
text, but the reward view-model does not preserve link/reference fields.
Strategy requirements are still reduced to plain strings before rendering, so
their link metadata is also unavailable at the UI boundary.

The existing Tech Tree tooltip components should not be reused directly as the
primary Quest Explorer solution. They are useful evidence and provide reusable
pieces, but `TechTooltip`, `HoverableItem`, and the unit/district/improvement
tooltips are tied to domain-specific stores, Tech Tree positioning, and
Tech/Unit shapes. The safer design is a generic `CodexReferenceTooltip` or
Quest-specific wrapper backed by `useCodexStore`/`useCodex`, `BaseTooltip`,
`hoverHelpers`, and `codexRefs`.

Original recommended first implementation:

1. Preserve reference metadata in Quest Explorer requirement/reward display
   view-models.
2. Add a generic resolver that prefers `codexEntryKey`, then typed
   `referenceKind + referenceKey`, then reward `assetKind + assetKey`.
3. Render lightweight Codex preview tooltips in Strategy reward/requirement
   contexts only.
4. Keep Lore unchanged by default.
5. Fall back gracefully when a reference cannot be resolved.

## Data Availability

### Quest Explorer DTO fields

Quest Explorer requirements expose:

| Field | Available | Notes |
| --- | --- | --- |
| `displayText` | Yes | Primary polished UI text. |
| `referenceKind` | Yes | Populated for linked requirements such as Tech, Unit, District, Improvement, Equipment. |
| `referenceKey` | Yes | Main resolver key when populated. |
| `referenceDisplayName` | Yes | Useful fallback label when Codex lookup fails. |
| `codexEntryKey` | Contract only in live 0.80 | Field exists but live export has zero populated rows. |

Quest Explorer rewards expose:

| Field | Available | Notes |
| --- | --- | --- |
| `displayText` | Yes | Primary polished UI text. |
| `formulaText` | Yes | Already preserved and rendered in Strategy. |
| `amount` | Yes | Numeric amount when exporter has one. |
| `kind` | Yes | Reward type, e.g. Money, Influence, Resource. Not always a Codex kind. |
| `targetScopeLabel` | Yes | Useful secondary context. |
| `referenceKind` / `referenceKey` / `referenceDisplayName` | Yes | Populated for linked catalog rewards. |
| `assetKind` / `assetKey` / `assetDisplayName` | Yes | Populated for linked catalog rewards; in live 0.80 these mirror reward reference fields. |
| `codexEntryKey` | Contract only in live 0.80 | Field exists but live export has zero populated rows. |

Backend import, domain, persistence, mapper, and response DTOs preserve these
fields. Frontend types and `normalizeQuestExplorer(...)` also preserve them.

### Current frontend loss points

| Area | Current State | Tooltip Impact |
| --- | --- | --- |
| `QuestRewardDisplay` | Keeps `displayText`, `formulaText`, `amount`, `kind`, `targetScopeLabel`. | Drops reward `reference*`, `asset*`, and `codexEntryKey`, so rendered reward rows cannot resolve tooltips yet. |
| Strategy objectives | `dossierObjectives(...)` keeps requirement display text only. | Requirement reference metadata is dropped before Strategy UI rendering. |
| Branch/current task options | `StrategyDossierBranchOption.requirements` is `string[]`; `rewardDetails` are formula-aware but link-blind. | Rewards can show formulas but not Codex tooltips; requirements cannot resolve. |
| `QuestRewardMeta.tsx` | Shared formula renderer for Strategy reward lists. | Good insertion point after reward display view-models carry link metadata. |
| Lore | Does not normally render reward formula details or requirement/reward lists as Strategy does. | Leave Lore untouched for the first tooltip pass. |
| Debug/raw tooling | Uses raw data/debug metadata. | Should remain unchanged; raw `*` formula text and raw keys should stay available there. |

### Strategy rendering contexts

Tooltips would eventually touch these Strategy contexts:

| Context | File | Current Renderer |
| --- | --- | --- |
| Strategy overview rewards | `QuestExplorerPage.tsx` | `OverviewRewardColumn` + `RewardFormulaDetail` |
| Entry strategy objective rewards | `QuestExplorerPage.tsx` | `InlineRewardMetaList` |
| Stage/card rewards | `QuestExplorerPage.tsx` | `InlineStageRewardMeta` |
| Current task rewards | `StrategyDossier.tsx` | `StrategyTaskSummary` + `InlineRewardMetaList` |
| Decision option rewards | `StrategyDossier.tsx` | `StrategyBranchComparisonOption` + `InlineRewardMetaList` |
| Topology alternative rewards | `StrategyDossier.tsx` | `StrategyTopologyAlternatives` + `InlineRewardMetaList` |
| Outcome/projected rewards | `StrategyDossier.tsx` | `StrategyChoiceResult` + `InlineRewardMetaList` |
| Requirements in the same contexts | `QuestExplorerPage.tsx`, `StrategyDossier.tsx` | `InlineMetaList` with plain strings |

## Live 0.80 Reference Coverage

The local 0.80 Quest Explorer export contains:

| Metric | Count |
| --- | ---: |
| Quest Explorer entries | 149 |
| Codex entries across all local Codex exports | 1697 |
| Quest Explorer requirements | 1096 |
| Quest Explorer rewards | 756 |
| Requirements with a reference key | 71 |
| Rewards with a reference or asset key | 406 |
| Formula rewards | 222 |
| Rows with populated `codexEntryKey` | 0 |
| Unique Quest Explorer reference/asset keys | 132 |
| Unique keys resolving to Codex entries | 127 |
| Unique keys not resolving to Codex entries | 5 |

Requirement reference coverage:

| Reference Kind | Rows | Unique Keys |
| --- | ---: | ---: |
| District | 7 | 4 |
| Equipment | 2 | 1 |
| Improvement | 7 | 3 |
| Tech | 43 | 19 |
| Unit | 12 | 5 |

Reward reference and asset coverage:

| Reference/Asset Kind | Rows | Unique Keys |
| --- | ---: | ---: |
| Equipment | 152 | 39 |
| Hero | 24 | 7 |
| Improvement | 10 | 3 |
| Tech | 33 | 11 |
| Trait | 177 | 47 |
| Unit | 10 | 1 |

Formula reward coverage:

| Reward Kind | Formula Rows |
| --- | ---: |
| Food | 2 |
| Influence | 24 |
| Money | 96 |
| Resource | 76 |
| Science | 24 |

Formula examples in the live data:

- `50 + 50 * Technology Era`
- `20 + 20 * Technology Era`
- `10 + 5 * Technology Era`
- `100 + 100 * Technology Era`
- `200 + 200 * Technology Era`

Unresolved Quest Explorer reference/asset keys:

- `Aspect_DistrictImprovement_04`
- `FactionTrait_Aspects_Chapter06_DistrictImprovement_FactionQuest`
- `FactionTrait_KinOfSheredyn_Chapter06_DistrictImprovement_FactionQuest`
- `HeroTrait_Confident`
- `Technology_CampTerraformation_00`

Interpretation:

- The live data is good enough for useful Codex tooltips.
- `codexEntryKey` cannot be used as the only resolver yet because it is empty.
- A typed fallback resolver is required.
- Resource/status/formula-only rewards should not be forced into Codex links
  until those domains have explicit Codex entries or structured keys.

## Existing Tooltip Reuse Analysis

### Reusable pieces

| Existing Piece | Reuse Level | Notes |
| --- | --- | --- |
| `BaseTooltip` | High | Already supports pixel positioning and sticky hover behavior. Good base shell. |
| `hoverHelpers` | Medium | Provides mouse-coordinate helpers for portaled tooltips. Useful for desktop hover. |
| `useTooltip` | Medium | Simple delayed open/close state. Reusable for hover, but not enough alone for mobile/tap accessibility. |
| `TooltipSection` | Medium | Useful small structure for tooltip bodies. |
| `renderDescriptionLine(...)` | High | Codex descriptions use rich token text. Reusing this keeps tooltip text consistent. |
| `useCodex` / `useCodexStore` | High | Already exposes Codex lookup by kind/key and global key. |
| `codexRefs.resolveCodexReference(...)` | High | Existing generic resolver for Codex references. Can be wrapped by Quest-specific typed kind mapping. |
| `codexPresentation` helpers | Medium | Useful for labels/kind names/previews if generic tooltip content needs polish. |

### Partially reusable pieces

| Existing Piece | Why Partial |
| --- | --- |
| `UnitTooltip` | Richer than Codex preview for Units, but depends on `Unit` store shape, selected faction store, unit evolution data, and portaled pixel coords. Good later enhancement, not first pass. |
| `DistrictTooltip` | Simple and reusable if a District store object is available, but Quest references resolve more broadly through Codex. |
| `ImprovementTooltip` | Same as District: useful later for direct-store rich cards, but not a generic resolver. |
| `SkillTooltip` | Focused on Unit skill entries, not general Quest reward/requirement references. |

### Not recommended as direct reuse

| Existing Piece | Reason |
| --- | --- |
| `TechTooltip` | Strongly tied to Tech Tree data and selected faction, expects a full `Tech` object with coordinates, resolves tech unlocks to nested domain tooltips, and includes Tech Tree link/copy behavior. |
| `HoverableItem` | Only supports `Constructible` and `Unit` unlocks and uses direct district/improvement/unit stores. It does not cover heroes, equipment, traits, technologies as generic Codex entries, resources, statuses, or formula-only rewards. |
| Codex page detail components | Good source of presentation patterns, but they are full-page detail/list components rather than hover overlays. |

## Codex/Entity Resolution

The frontend already loads Codex entries through `GameDataProvider` via
`useCodexStore.loadEntries()`. It also loads district, improvement, unit, and
tech stores globally. That means Quest Explorer can usually resolve tooltips
without adding a new API call, as long as it gracefully handles loading and
missing data.

Recommended resolver precedence:

1. `codexEntryKey`, when populated.
2. `referenceKind + referenceKey`, mapped to Codex export kinds.
3. `assetKind + assetKey`, for rewards when reference fields are absent.
4. Global raw `entryKey` fallback only when the key resolves unambiguously.
5. No tooltip when unresolved; optionally show a muted display label and keep
   raw unresolved keys in diagnostics/debug output.

Suggested typed kind mapping:

| Quest Reference Kind | Codex Export Kind(s) |
| --- | --- |
| `Tech` / `Technology` | `tech` |
| `Unit` | `units` |
| `Hero` | `heroes`, with `units` only as a secondary fallback if needed |
| `Trait`, `FactionTrait`, `HeroTrait` | `traits` |
| `Equipment` | `equipment` |
| `District` | `districts` |
| `Improvement` | `improvements` |
| `Faction` | `factions` |
| `Population` | `populations` |
| `MinorFaction` | `minorfactions` |

Do not infer quest semantics from titles or key parsing. Mapping reference kinds
to Codex export kinds is a link-resolution concern only.

## UX Recommendation

Keep the current polished Quest Explorer text primary. Tooltips should be an
optional inspection affordance, not a new wall of raw data.

Recommended desktop behavior:

- Render linked reward/requirement names or whole reward rows with a subtle
  hover/focus affordance.
- Show a compact tooltip on hover and keyboard focus.
- Keep the tooltip sticky enough to inspect without fighting the mouse.
- Include a small "Open in Codex" action only after the basic preview is stable.

Recommended mobile behavior:

- Use click/tap to open the same compact preview.
- Dismiss on outside click, escape, route change, or selecting another tooltip.
- Avoid hover-only behavior as the only access path.

Recommended tooltip content:

1. Title: Codex display name or reference display name fallback.
2. Kind/category: e.g. Tech, Unit, Equipment, Trait.
3. Short description preview: first 2-4 non-empty Codex description lines.
4. For reward rows, keep formula detail near the existing reward text:
   `Formula: 50 + 50 × Technology Era` using the polished multiplication glyph
   in normal UI, while raw debug output keeps `*`.
5. Optional Codex link: `/codex?entry={entryKey}` and `category={exportKind}`
   when resolved.

Unresolved behavior:

- Do not show fake or guessed tooltip content.
- Keep the polished display text.
- Optionally add diagnostics for unresolved references.
- Only expose unresolved raw keys in debug/raw tooling, not normal Strategy UI.

Lore recommendation:

- Do not add tooltip behavior to Lore in the first pass. Lore should remain a
  chronicle, not an encyclopedia-hover surface.
- Consider Lore tooltips later only for explicit inline names if the design
  calls for it.

## Implementation Options

| Option | Description | Effort | Pros | Cons |
| --- | --- | ---: | --- | --- |
| A. Link-only | Render resolved references as links to `/codex?entry=...`. | Low | Simple, accessible, minimal overlay risk. | No hover preview; context switch is heavier for Strategy users. |
| B. Lightweight Codex tooltip | Generic compact tooltip using Codex store lookup, `BaseTooltip`, and description preview helpers. | Medium | Best first product value; low coupling to Tech Tree internals. | Requires new resolver/view-model metadata and hover/tap handling. |
| C. Generic `CodexReferenceTooltip` | Formal shared component with resolver, keyboard/touch support, and optional Codex link. | Medium-high | Clean reusable architecture for Quest Explorer and future surfaces. | Slightly larger first implementation. |
| D. Direct domain tooltips | Use `TechTooltip`, `UnitTooltip`, `DistrictTooltip`, `ImprovementTooltip` where possible. | Medium-high | Rich cards for some domains. | Inconsistent coverage; high coupling; TechTooltip is not suitable as-is. |
| E. Full Codex card overlay | Lazy-render a mini Codex detail card. | High | Richest encyclopedia preview. | Higher layout/performance/accessibility risk; too much for first pass. |

Recommended route: Option C implemented incrementally, starting as Option B in
Quest Explorer Strategy. Build the generic resolver/view-model boundary first,
then add richer domain cards only if the lightweight Codex preview is not
enough.

## Suggested Phased Plan

### Phase 0 - View-model and resolver preparation

Status: done.

- Add a `QuestReferenceDisplay` or similar small view-model:
  - `displayText`
  - `referenceKind`
  - `referenceKey`
  - `referenceDisplayName`
  - `assetKind`
  - `assetKey`
  - `assetDisplayName`
  - `codexEntryKey`
  - `formulaText` for rewards where applicable
- Extend `QuestRewardDisplay` to preserve link metadata.
- Add a requirement display view-model instead of passing only `string[]`.
- Add a Quest-specific resolver helper that consumes Codex store indexes and
  maps Quest reference kinds to Codex export kinds.
- Add resolver tests using compact fixtures for Tech, Trait, Hero, Equipment,
  Unit, District, Improvement, unresolved key, and empty `codexEntryKey`.

No visible UI change is required in this phase.

### Phase 1 - Strategy reward tooltips

Status: done for the core Strategy reward contexts. Overview reward parity and
visual reward-icon treatment remain separate follow-ups.

- Add a lightweight `CodexReferenceTooltip` or `QuestCodexReferenceTooltip`.
- Use it inside `InlineRewardMetaList` and `InlineStageRewardMeta`.
- Preserve current primary display text and formula secondary line.
- Show tooltip only when the resolver returns a Codex entry.
- Keep debug/raw output unchanged.
- Add UI tests for:
  - formula reward with no reference does not show a fake tooltip,
  - linked reward shows a tooltip preview,
  - unresolved key falls back to plain display text,
  - Codex route link is formed from resolved entry key if included.

### Phase 2 - Strategy requirement tooltips

Status: done for Strategy requirement contexts.

- Replace local requirement `string[]` display plumbing with requirement display
  view-models in Strategy adapters.
- Render requirement tooltips in current task, decision option, topology
  alternative, and outcome contexts.
- Keep existing de-duplication behavior by deduping on display text plus
  resolved Codex identity.

### Phase 3 - Mobile and accessibility hardening

Status: active follow-up after browser review.

- Add tap/click behavior, focus behavior, escape dismissal, and outside-click
  dismissal.
- Verify keyboard navigation in Strategy cards and buttons.
- Ensure portaled tooltip z-index does not conflict with Quest Explorer rails,
  debug panels, or Codex page overlays.

### Phase 4 - Optional richer domain cards

Status: deferred. Keep the current compact Codex preview until DB exporter
metadata coverage improves.

- Consider using direct Unit/District/Improvement cards after the generic Codex
  preview is stable.
- Do not wire `TechTooltip` directly unless it is first extracted into a
  Tech-reference tooltip that does not depend on Tech Tree coordinates or copy
  link behavior.

## Tests Required

Minimum test set for the first implementation:

- Frontend normalizer still preserves `referenceKind`, `referenceKey`,
  `referenceDisplayName`, `assetKind`, `assetKey`, `assetDisplayName`,
  `codexEntryKey`, and `formulaText`.
- Reward display view-model preserves reference metadata and formula metadata.
- Requirement display view-model preserves reference metadata.
- Resolver prefers `codexEntryKey` when populated.
- Resolver maps `referenceKind + referenceKey` to Codex export kind.
- Resolver maps reward `assetKind + assetKey` when reference fields are absent.
- Resolver does not invent links for formula-only rewards.
- Strategy reward tooltip renders resolved Codex title, kind, and description
  preview.
- Strategy requirement tooltip renders in current task and decision option
  contexts.
- Unresolved references render plain text and do not throw.
- Lore does not show formula or Codex tooltip content by default.
- Debug/raw tooling remains unchanged.

## Risks

- `codexEntryKey` is empty in live 0.80, so the first implementation must rely
  on typed fallback resolution.
- Requirement metadata is now preserved in Strategy display models; keep tests
  around this boundary because it was a previous loss point.
- Reward metadata is now preserved in `QuestRewardDisplay`; keep formula-only
  and unresolved-reference tests so the resolver does not invent fake links.
- Some live references do not resolve to Codex entries.
- Resource/status/formula-only rewards do not currently have a first-class
  Codex target in the local exports.
- Direct reuse of Tech Tree tooltip components risks coupling Quest Explorer to
  Tech Tree positioning, selected faction state, and unlock resolution.
- Tooltip overlays need careful desktop/mobile accessibility.
- Portaled tooltip z-index and hover stickiness can become fragile if mixed with
  large clickable Strategy cards.
- Loading state must be graceful if Codex data has not finished loading.

## Non-Goals

- Do not change backend/exporter/schema/API for the tooltip feature.
- Do not make Codex data required for Quest Explorer core rendering.
- Do not infer quest topology or semantic decisions from Codex keys.
- Do not add Lore tooltips in the first pass.
- Do not rewrite Tech Tree tooltip internals as part of Quest Explorer tooltip
  work.
- Do not expose raw unresolved keys in normal Strategy UI.
- Do not remove debug/raw tooling.

## Recommendation

Quest Explorer can support rich Codex-backed tooltips safely, but it should do
so through a generic Codex reference layer rather than direct Tech Tree tooltip
reuse. The first implementation should be Strategy-only, start with rewards,
then requirements, preserve polished Quest Explorer copy as primary, and treat
Codex preview content as optional secondary context.
