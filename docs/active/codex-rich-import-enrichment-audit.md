# Codex Rich Import Enrichment Audit

Status: active investigation
Created: 2026-06-21
Scope: compare local Codex exports with richer sibling exports under
`local-imports/`
Boundary decision: `docs/active/codex-export-vs-rich-export-boundary.md`
Architecture decision:
`docs/active/codex-rich-vs-codex-import-architecture-decision.md`

## Purpose

EWShop now has mature category-specific Codex archive modes. Several categories
also have richer sibling exports used by, or intended for, route-owned pages such
as Units, Tech, and Quest Explorer.

This audit asks whether Codex should stay isolated from those richer exports or
whether selected categories can be safely enriched through a clean frontend/domain
resolver layer.

The answer should not be "copy all rich data into Codex". Codex is a searchable
premium archive. Rich routes own progression trees, branching views, and deep
systems exploration.

## Scope

Input folders:

- `local-imports/codex/`
- `local-imports/exports/`

Required safety rules:

- Use exact keys/references only.
- Do not infer from names, prose, keys, SVG filenames, or old context strings.
- Do not leak route-owned rich experiences into Codex.
- Enrichment must fail closed: if rich data is missing, Codex still renders.
- Exporter findings go to
  `docs/active/db-exporter-ability-metadata-handoff.md` only when rich imports
  cannot or should not solve the issue.

## Investigation Method

1. Inventory all local Codex and rich export files.
2. Compare counts, root shapes, top-level fields, diagnostics, and key overlap.
3. For rich sibling categories, compare identity mapping and field richness.
4. Classify fields as row enrichment, detail enrichment, rich-route only,
   risky/noisy, exporter/debug only, or not useful.
5. Recommend architecture and implementation sequencing.

Stop conditions:

- Do not implement UI or importer changes during this audit.
- Do not commit.
- Do not request exporter work when rich imports can solve the issue safely.
- Do not recommend frontend enrichment where it would require key/prose
  inference or route-owned semantics.

## Boundary Decision

This audit is paired with
`docs/active/codex-export-vs-rich-export-boundary.md` and the runtime
architecture decision in
`docs/active/codex-rich-vs-codex-import-architecture-decision.md`.

That boundary document is the source of truth for deciding whether a finding
belongs to:

- Codex export;
- rich/domain export;
- frontend rich-import enrichment resolver;
- DB exporter backlog.

Summary:

- Rich imports can solve EWShop-only detail enrichment for exact sibling records.
- DB Exporter still owns canonical public metadata, explicit ownership/grouping,
  stable icon contracts, public reference coverage, and backend/API-visible
  Codex facts.
- Overlapping items are split, not deleted from the backlog, when resolver work
  can solve UI detail while exporter metadata remains useful for public Codex
  contracts.

Open questions:

- Should Codex load optional rich sibling stores eagerly, lazily, or only after a
  category route is opened?
- Should enrichment be built per category first, then factored into shared
  resolver primitives?
- Should route-owned rich pages expose reusable domain selectors, or should Codex
  use a separate enrichment boundary over the same normalized data?

Decision update:

- Use the hybrid per-field ownership model from the architecture decision.
- `CODEX-RICH-001 - Tech Detail Prerequisite Enrichment` remains the first
  recommended implementation slice.
- Districts and Improvements are already imported through rich/domain endpoints,
  but their resolver use should remain detail/profile-only unless public Codex
  facts are explicitly added by the exporter.
- Hero, Skills, Populations, and Abilities rich exports exist locally but are not
  imported by EWShop today; they require explicit importer/API/store work before
  any resolver can use them.

## Input Files

### Codex exports

| File | exportKind | Entries | Root shape | Diagnostics | Notes |
| --- | --- | ---: | --- | --- | --- |
| `ewshop_abilities_codex_export_0.82.json` | `abilities` | 336 | `entries[]` | no | Facts, sections, references, public context. |
| `ewshop_actions_codex_export_0.82.json` | `actions` | 139 | `entries[]` | no | No rich sibling found. |
| `ewshop_bonuses_codex_export_0.82.json` | `bonuses` | 585 | `entries[]` | no | Support/hidden-style category, no rich sibling reviewed. |
| `ewshop_councilor_effects_codex_export_0.82.json` | `councilorEffects` | 42 | `entries[]` | no | Reference sheet, no rich sibling found. |
| `ewshop_councilors_codex_export_0.82.json` | `councilors` | 43 | `entries[]` | no | No rich sibling found. |
| `ewshop_diplomatic_treaties_codex_export_0.82.json` | `diplomaticTreaties` | 22 | `entries[]` | no | No rich sibling found. |
| `ewshop_districts_codex_export_0.82.json` | `districts` | 167 | `entries[]` | no | Rich sibling exists. |
| `ewshop_equipment_codex_export_0.82.json` | `equipment` | 160 | `entries[]` | no | No rich sibling found. |
| `ewshop_factions_codex_export_0.82.json` | `factions` | 5 | `entries[]` | no | No rich sibling found. |
| `ewshop_heroes_codex_export_0.82.json` | `heroes` | 79 | `entries[]` | no | Rich sibling exists. |
| `ewshop_improvements_codex_export_0.82.json` | `improvements` | 123 | `entries[]` | no | Rich sibling exists. |
| `ewshop_minor_factions_codex_export_0.82.json` | `minorFactions` | 16 | `entries[]` | no | No rich sibling found. |
| `ewshop_partner_effects_codex_export_0.82.json` | `partnerEffects` | 39 | `entries[]` | no | Reference sheet, no rich sibling found. |
| `ewshop_populations_codex_export_0.82.json` | `populations` | 26 | `entries[]` | no | Rich sibling exists. |
| `ewshop_quests_codex_export_0.82.json` | `quests` | 300 | `entries[]` | no | Quest Explorer sibling exists but is not 1:1. |
| `ewshop_resources_codex_export_0.82.json` | `resources` | 24 | `entries[]` | no | Reference sheet, no rich sibling found. |
| `ewshop_tech_codex_export_0.82.json` | `tech` | 133 | `entries[]` | no | Rich sibling exists. |
| `ewshop_traits_codex_export_0.82.json` | `traits` | 178 | `entries[]` | no | No rich sibling found. |
| `ewshop_units_codex_export_0.82.json` | `units` | 156 | `entries[]` | no | Rich sibling exists. |

### Rich exports

| File | exportKind | Entries | Root shape | Diagnostics | Structured fields beyond Codex lines/refs |
| --- | --- | ---: | --- | --- | --- |
| `ewshop_abilities_export_0.82.json` | `abilities` | 364 | `entries[]` | yes | Visibility flags, source category, mechanic kind/tags, tactical profiles, battle summaries, descriptor keys. |
| `ewshop_districts_export_0.82.json` | `districts` | 167 | `districts[]` | yes | Prototype/variant/repair/aspect flags, faction specificity, descriptor keys, raw category/tier. |
| `ewshop_heroes_export_0.82.json` | `heroes` | 79 | `units[]` | yes | Faction/origin keys, hero class, unit class, ability group keys, default skills, applicable skill trees. |
| `ewshop_improvements_export_0.82.json` | `improvements` | 123 | `improvements[]` | yes | Constructible kind, faction key, variant/prototype flags, descriptor keys. |
| `ewshop_populations_export_0.82.json` | `populations` | 26 | `populations[]` | no | Food cost, faction keys, affinity, custom-faction availability, worker lines, threshold rewards. |
| `ewshop_quest_explorer_export_0.82.json` | `quest_explorer` | 156 | `entries[]` | no | Navigation, aliases, lore view, strategy view, branches. |
| `ewshop_skills_export_0.82.json` | `skills` | 147 skills | `skillTrees[]`, `skillTiers[]`, `skills[]`, `heroSkillDefaults[]` | yes | Skill placements, prerequisites, resolved ability summaries, effects, skill tree/tier structure. |
| `ewshop_tech_export_0.82.json` | `tech` | 133 | `techs[]` | yes | Lore, era index, quadrant, prerequisite keys, faction trait prerequisites, structured unlocks. |
| `ewshop_units_export_0.82.json` | `units` | 156 | `units[]` | yes | Faction keys, class keys, grouped ability keys, evolution fields, descriptor keys, visibility flags. |

## Inventory Matrix

| Category | Codex file | Codex count | Rich file | Rich count | Match quality | Notes |
| --- | --- | ---: | --- | ---: | --- | --- |
| Abilities | `ewshop_abilities_codex_export_0.82.json` | 336 | `ewshop_abilities_export_0.82.json` | 364 | partial overlap | All Codex keys match rich entries; rich has 28 extra class/internal/mechanical entries. |
| Units | `ewshop_units_codex_export_0.82.json` | 156 | `ewshop_units_export_0.82.json` | 156 | exact count/key match | Strong enrichment candidate, but evolution/progression belongs behind explicit product approval. |
| Heroes | `ewshop_heroes_codex_export_0.82.json` | 79 | `ewshop_heroes_export_0.82.json` | 79 | exact count/key match | Strong detail/profile enrichment candidate, with Skills sidecar. |
| Tech | `ewshop_tech_codex_export_0.82.json` | 133 | `ewshop_tech_export_0.82.json` | 133 | exact count/key match | Strong exact unlock/prereq enrichment candidate; tree remains `/tech` owned. |
| Improvements | `ewshop_improvements_codex_export_0.82.json` | 123 | `ewshop_improvements_export_0.82.json` | 123 | exact count/key match | Moderate candidate; Codex already has most row-ready effects. |
| Districts | `ewshop_districts_codex_export_0.82.json` | 167 | `ewshop_districts_export_0.82.json` | 167 | exact count/key match | Moderate candidate; progression/variant flags are mostly detail/debug until product-approved. |
| Populations | `ewshop_populations_codex_export_0.82.json` | 26 | `ewshop_populations_export_0.82.json` | 26 | exact count/key match | Strong candidate if Populations becomes a richer archive. |
| Quests | `ewshop_quests_codex_export_0.82.json` | 300 | `ewshop_quest_explorer_export_0.82.json` | 156 | related but not 1:1 | High-risk. Rich export owns `/quests` semantics; do not use it to reconstruct Codex grouping casually. |
| Skills | no Codex category | 0 | `ewshop_skills_export_0.82.json` | 147 skills | related but not 1:1 | Sidecar for Heroes and maybe future Skills category. |
| Equipment | `ewshop_equipment_codex_export_0.82.json` | 160 | none found | 0 | no rich sibling | Existing exporter backlog covers missing item icon/reference issues. |
| Actions | `ewshop_actions_codex_export_0.82.json` | 139 | none found | 0 | no rich sibling | Remains Codex-only. |
| Diplomacy | `ewshop_diplomatic_treaties_codex_export_0.82.json` | 22 | none found | 0 | no rich sibling | Remains Codex-only. |
| Traits | `ewshop_traits_codex_export_0.82.json` | 178 | none found | 0 | no rich sibling | Existing exporter backlog covers ownership/category semantics. |
| Statuses | current local Codex aggregate/API data | varies by import | none found | 0 | no rich sibling | Remains Codex-only for now. |
| Resources | `ewshop_resources_codex_export_0.82.json` | 24 | none found | 0 | no rich sibling | Reference sheet remains Codex-only. |

## Executive Summary

The best direction is a hybrid resolver layer:

- Keep Codex entries shallow and searchable.
- Import selected rich sibling datasets into domain stores or normalized
  frontend data.
- Build category-specific enrichment resolvers that map Codex `entryKey` and
  exact `referenceKeys` to rich records.
- Return optional `CodexEnrichment` view models to Codex row/detail components.
- Do not let Codex components directly reach into route-owned rich page logic.

Highest-value enrichment potential:

1. Tech - exact prerequisites, exclusive prerequisites, structured unlocks.
2. Units - exact evolution fields and grouped ability keys for detail/profile
   inspection.
3. Heroes - exact origin keys, skill trees, default skills, and grouped ability
   keys for detail/profile inspection.
4. Populations - threshold rewards and worker effects are structured and small.
5. Abilities - tactical profiles and battle summaries can improve detail trust,
   but current Ability rows already consume useful Codex effect lines.

Categories where rich import should not be used aggressively:

- Quests - the Quest Explorer export is rich but route-owned. It is not a 1:1
  sibling of Codex Quest rows and should not be used to rebuild branch/path
  semantics inside Codex.
- Improvements and Districts - exact 1:1 rich siblings exist, but current Codex
  rows already carry most row-sized effect content. Rich fields are useful
  mainly for detail/profile polish or exporter diagnostics.

No new exporter backlog additions were made by this audit. Existing backlog
items already cover the exporter-only gaps this investigation re-confirmed:
Ability ownership/role cleanup, Unit evolution metadata, Tech prerequisite
metadata, Hero references/presentation metadata, District/Improvement planning
metadata, Equipment icons/reference coverage, Trait ownership/category semantics,
Action ownership/reference/browse metadata, Diplomacy relationship/icon metadata,
and Quest canonical archive grouping.

## Category Findings

### Abilities

- Codex file: `local-imports/codex/ewshop_abilities_codex_export_0.82.json`
- Rich file: `local-imports/exports/ewshop_abilities_export_0.82.json`
- Count comparison: Codex 336, rich 364.
- Identity mapping: all 336 Codex entries have exact rich entry-key matches.
  Rich has 28 extra entries, including class tags and internal/battle-only
  helpers.

Rich-only fields:

- `isVisibleInUI`, `isClassTag`, `isPlayerFacing`, `isInternal`,
  `isBattleOnly`, `isMovementOrMechanical`, `isHeroRelated`
- `sourceCategory`, `mechanicKind`, `mechanicTags`
- `tacticalProfiles`, `battleAbilitySummaries`, `battleSkillKeys`,
  `battleAbilityKeys`, `descriptorKeys`
- diagnostics including missing referenced ability keys and missing useful
  description rows

Codex-only/public Codex fields:

- facts: `Ability mechanic`, `Ability source`, `Combat role`, `Target`,
  `Range`, `Cost`
- sections: `Effects`, `Battle mechanics`

Safe enrichment candidates:

- Detail-only tactical profile inspection for target/range/shape/cost when the
  rich entry key matches exactly.
- Detail-only battle summary inspection if labels can remain exact/exported and
  do not expose implementation noise as player-facing prose.
- Optional row trust helpers for search if a hidden effect line is exact and
  belongs to the same rich ability record.

Unsafe/risky candidates:

- Using `sourceCategory`, low-level `mechanicTags`, or
  `effectCategories` as player-facing roles. These are exactly where current
  Ability role noise can leak from.
- Inferring faction ownership. Rich Ability entries do not solve explicit
  ownership; existing exporter backlog still owns that.
- Rendering internal/class/helper rich-only entries as public Codex pages.

Row opportunities:

- Low priority. Current Ability Archive rows already show useful effect lines,
  target/range metadata, and exact status links.

Detail opportunities:

- Moderate. Ability detail could expose exact tactical profile fields more
  cleanly if they are player-facing, especially shape/targeting/cost edge cases.

Rich route boundary:

- No separate rich Ability route exists today, but Ability rich data contains
  implementation-oriented battle summaries. Codex should not become a battle
  debug viewer.

Exporter backlog findings:

- Existing backlog already covers noisy `Combat role`, missing explicit ability
  ownership, and missing public ability references. No new item added.

Recommendation:

- Implement later through `AbilityEnrichmentResolver` only for exact matched
  records. Start with detail enrichment, not row redesign.

Priority: medium.

### Units

- Codex file: `local-imports/codex/ewshop_units_codex_export_0.82.json`
- Rich file: `local-imports/exports/ewshop_units_export_0.82.json`
- Count comparison: Codex 156, rich 156.
- Identity mapping: exact count/key match.

Rich-only fields:

- `factionKey`, `isMajorFaction`, `unitClassKey`, `attackSkillKey`
- grouped ability keys: `ownAbilityKeys`, `abilityKeys`, `combatAbilityKeys`,
  `tacticalAbilityKeys`, `passiveAbilityKeys`, `mechanicalAbilityKeys`,
  `classRuleAbilityKeys`, `hiddenHelperAbilityKeys`
- progression fields: `previousUnitKey`, `nextEvolutionUnitKeys`,
  `evolutionTierIndex`
- visibility/diagnostic flags

Codex-only/public Codex fields:

- facts: `Kind`, `Tier`, `Class`, `Spawn type`, `Faction`
- sections: `Stats`, `Granted abilities`

Safe enrichment candidates:

- Detail-only unit profile data from exact rich record: class key, attack skill,
  grouped public abilities, previous/next evolution keys.
- Compact detail relationships for previous/evolves-into if exact target keys
  resolve to public Codex Unit entries.
- Optional row metadata only when it improves comparison without duplicating the
  existing stat grid.

Unsafe/risky candidates:

- Rebuilding a full evolution tree inside Codex.
- Showing hidden helper abilities as public row content.
- Inferring faction icon/ownership from raw keys when exact Codex references are
  absent.

Row opportunities:

- Low to medium. Current Unit rows already use stat grids and compact exact
  ability links. Rich data could improve unresolved ability handling, but should
  not crowd rows.

Detail opportunities:

- High. A Unit detail profile can use rich progression and grouped ability keys
  as inspection/permalink value.

Rich route boundary:

- If a future `/units` route owns roster/evolution tree exploration, Codex should
  remain a searchable reference/profile layer.

Exporter backlog findings:

- Existing backlog already asks for explicit public Unit evolution relationship
  metadata in Codex style if this should appear in Codex without rich resolver
  coupling. No new item added.

Recommendation:

- Strong candidate for a `UnitCodexEnrichment` resolver. Start with detail
  profile enrichment and exact previous/next links, not row changes.

Priority: high.

### Heroes

- Codex file: `local-imports/codex/ewshop_heroes_codex_export_0.82.json`
- Rich file: `local-imports/exports/ewshop_heroes_export_0.82.json`
- Skills sidecar: `local-imports/exports/ewshop_skills_export_0.82.json`
- Count comparison: Codex 79, rich Heroes 79, rich Skills 147.
- Identity mapping: exact Hero count/key match. Skills are related sidecar data,
  not a 1:1 Hero sibling.

Rich-only fields:

- `factionKey`, `originKind`, `originFactionKey`, `minorFactionKey`
- `heroClassKey`, `unitClassKey`
- grouped ability keys and class-rule ability keys
- `defaultSkillKeys`, `applicableSkillTreeKeys`
- Skills export: `placements`, `prerequisiteSkillKeys`,
  `inhibitedBySkillKeys`, `lockedBySkillKeys`, `effects`,
  `primaryAbilityKey`, `resolvedSummaryLines`

Codex-only/public Codex fields:

- facts: `Faction`, `Class`
- sections: `Stats`, `Granted abilities`

Safe enrichment candidates:

- Hero detail profile: exact origin kind/faction, hero class key, applicable
  skill trees, default skills.
- Compact exact skill references in detail if skill entries are either public
  Codex targets later or a dedicated Skills resolver exists.
- Better grouping of class abilities in detail, if exact ability keys resolve.

Unsafe/risky candidates:

- Turning Hero details into full skill-tree progression pages.
- Rendering unresolved/internal skill or ability refs as public links.
- Inferring portraits/icons if no explicit stable icon or portrait metadata is
  present.

Row opportunities:

- Low. Current Hero rows already improved: stat grid, class/faction metadata,
  compact ability chips, no repeated generic Hero icon.

Detail opportunities:

- High. Hero detail pages could become true profile/permalink pages using exact
  rich Hero and Skills sidecar data.

Rich route boundary:

- Skill tree/progression exploration should remain a future dedicated feature,
  not a generic Codex row expansion.

Exporter backlog findings:

- Existing Hero backlog covers missing presentation metadata and granted ability
  coverage. No new item added.

Recommendation:

- Build a Hero detail enrichment resolver after Units, because exact Hero and
  Skills sidecar data can add real inspection value.

Priority: high.

### Technologies

- Codex file: `local-imports/codex/ewshop_tech_codex_export_0.82.json`
- Rich file: `local-imports/exports/ewshop_tech_export_0.82.json`
- Count comparison: Codex 133, rich 133.
- Identity mapping: exact count/key match.

Rich-only fields:

- `lore`
- `eraIndex`, `quadrant`, `factionKey`, `isFactionSpecific`
- `technologyPrerequisiteTechKeys`
- `exclusiveTechnologyPrerequisiteTechKeys`
- `factionTraitPrerequisites`
- structured `unlocks[]` with `unlockType`, `unlockCategory`, `targetKind`,
  `targetKey`, `canonicalTargetKey`, `referenceKeys`

Codex-only/public Codex fields:

- facts: `Kind`, `Tier`, `Era`, `Quadrant`, `Faction`
- sections: `Unlocks`, `Effects`

Safe enrichment candidates:

- Detail-only exact prerequisite and exclusive prerequisite links.
- Detail-only grouped unlock inspection using structured unlock categories.
- Optional row-level compact prerequisite hints only if product review wants it
  and exact target Codex entries resolve.

Unsafe/risky candidates:

- Recreating the `/tech` progression tree inside Codex.
- Treating raw `factionTraitPrerequisites` as a player-facing unlock story
  without exact target pages/labels.
- Using duplicate display names as identity.

Row opportunities:

- Medium. Current Tech rows already show effects and exact unlock links. Row
  prerequisites could add planning value, but risk duplicating `/tech`.

Detail opportunities:

- High. Exact prerequisites and structured unlocks are perfect detail/permalink
  enrichment.

Rich route boundary:

- `/tech` owns tree layout and progression exploration. Codex should stay
  archive/search/reference.

Exporter backlog findings:

- Existing Technology backlog already asks for public prerequisite/progression
  metadata if Codex should consume it without rich import resolver. No new item
  added.

Recommendation:

- Best first implementation candidate for rich enrichment, because key matching
  is exact and fields are clean. Start with detail prerequisite/unlock grouping.

Priority: high.

### Improvements

- Codex file: `local-imports/codex/ewshop_improvements_codex_export_0.82.json`
- Rich file: `local-imports/exports/ewshop_improvements_export_0.82.json`
- Count comparison: Codex 123, rich 123.
- Identity mapping: exact count/key match.

Rich-only fields:

- `constructibleKey`, `constructibleKind`
- `isFactionSpecific`, `factionKey`
- descriptor keys and visibility/prototype/variant flags

Codex-only/public Codex fields:

- facts: `Kind`, `Category`
- sections: `Effects`

Safe enrichment candidates:

- Detail metadata: explicit constructible kind and faction key when exact public
  faction target resolves.
- Optional diagnostics/QA checks for thin rows or faction-specific rows.

Unsafe/risky candidates:

- Exposing descriptor keys or prototype/variant flags as player-facing content.
- Inferring build cost, era, unlock tier, or progression if not in rich data.

Row opportunities:

- Low. Current rows already use exported `Effects`, which are the strongest
  player-facing content.

Detail opportunities:

- Medium. Faction-specific identity could help if exact faction refs resolve.

Rich route boundary:

- No dedicated rich Improvements route is currently identified, but Codex should
  not become a constructible debug inspector.

Exporter backlog findings:

- Existing Improvements backlog covers missing planning metadata and thin rows.
  No new item added.

Recommendation:

- Defer. Use rich import only if a future Improvement detail/profile pass needs
  exact faction/constructible metadata.

Priority: low to medium.

### Districts

- Codex file: `local-imports/codex/ewshop_districts_codex_export_0.82.json`
- Rich file: `local-imports/exports/ewshop_districts_export_0.82.json`
- Count comparison: Codex 167, rich 167.
- Identity mapping: exact count/key match.

Rich-only fields:

- `districtKey`
- `isFactionSpecific`, `factionKey`
- `isPrototype`, `isBaseTemplate`, `isPlaceholder`, `isVariant`, `isRepair`,
  `isAspect`, `isHidden`, `isPlayerFacing`
- descriptor keys, raw category/tier

Codex-only/public Codex fields:

- facts: `Kind`, `Category`, `Tier`
- sections: `Effects`, `Extracted resource`

Safe enrichment candidates:

- Detail metadata for faction-specific districts when exact public faction refs
  resolve.
- QA/diagnostic checks for thin rows and missing category/tier coverage.

Unsafe/risky candidates:

- Rendering `isPrototype`, `isVariant`, `isRepair`, or `isAspect` as public row
  taxonomy without product approval.
- Inferring upgrade chains from duplicate names or tier values.
- Creating adjacency/synergy systems from descriptor keys.

Row opportunities:

- Low. Current rows already show exact Effects and compact `Extracts:` resource
  links.

Detail opportunities:

- Medium if product wants exact faction/progression inspection later.

Rich route boundary:

- If a future District planning page exists, it should own adjacency/progression
  exploration. Codex should remain archive/detail.

Exporter backlog findings:

- Existing District backlog covers category/tier coverage and upgrade-chain
  metadata. No new item added.

Recommendation:

- Defer rich enrichment until a District detail pass needs explicit
  faction/progression context.

Priority: low to medium.

### Populations

- Codex file: `local-imports/codex/ewshop_populations_codex_export_0.82.json`
- Rich file: `local-imports/exports/ewshop_populations_export_0.82.json`
- Count comparison: Codex 26, rich 26.
- Identity mapping: exact count/key match using `populationKey`.

Rich-only fields:

- `lore`
- `isMinorFaction`, `isDefaultPopulation`,
  `isCreatedByActionOnly`, `isAvailableForCustomFaction`
- `baseFoodCost`
- `factionKey`, `factionName`, `factionAffinity`,
  `overrideFactionAffinityKey`
- `categoryPreferenceKey`, `settlementPresenceKey`,
  `forbiddenFactionTraitKeys`
- `descriptionLines`, `workerDescriptionLines`, `thresholdRewards`

Codex-only/public Codex fields:

- facts: `Type`, `Default population`, `Custom faction availability`,
  `Base food cost`, `Faction`
- sections: `Threshold rewards`, `Worker effects`

Safe enrichment candidates:

- Population detail/profile pages could use exact threshold reward structures,
  worker effects, food cost, and custom-faction availability.
- Archive rows could show worker effect and threshold preview if Populations
  evolve beyond current generic/reference behavior.

Unsafe/risky candidates:

- Rendering unresolved threshold reward keys as fake links.
- Inferring faction icon from affinity names or SVG filenames.
- Overloading Codex with full population collection progression if a richer
  population page later owns that.

Row opportunities:

- Medium if Populations becomes an Archive. Small count means a reference sheet
  may be enough.

Detail opportunities:

- High. The rich export is compact, structured, and player-facing.

Rich route boundary:

- No dedicated rich Population route is identified. This is safe Codex
  enrichment territory if product prioritizes Populations.

Exporter backlog findings:

- No new item added. Existing current priorities note one unresolved threshold
  target that should remain plain.

Recommendation:

- Good second-wave enrichment candidate. Start with detail/profile enrichment
  or a compact reference-row pass.

Priority: medium.

### Quests

- Codex file: `local-imports/codex/ewshop_quests_codex_export_0.82.json`
- Rich file: `local-imports/exports/ewshop_quest_explorer_export_0.82.json`
- Count comparison: Codex 300, rich 156.
- Identity mapping: related but not 1:1. Only 134 exact entry-key matches were
  found in the quick comparison; 166 Codex keys were Codex-only and 22 rich keys
  were rich-only.

Rich-only fields:

- `summaryLines`
- `questType`, `isMandatory`, `aliases`
- `navigation` with chapter/step/order/previous/next/failure/convergence
- `loreView`, `strategyView`, `branches`

Codex-only/public Codex fields:

- facts: `Kind`, `Category`, `Mandatory`, `Chapter`, sparse `Faction`
- sections: `Choices`, `Objective`, `Rewards`, `Requirements`, sparse `Effects`

Safe enrichment candidates:

- Very limited. A direct route could offer an "Open in Quest Explorer" affordance
  if an exact rich Quest Explorer entry exists, but this should be product-
  approved and not confuse ownership.
- Detail-only exact links can stay in Codex if already exported by Codex data.

Unsafe/risky candidates:

- Using Quest Explorer `navigation`, `branches`, aliases, or strategy/lore views
  to group or render Codex Quest archive rows.
- Restoring key-derived progression reconstruction.
- Grouping Codex rows by duplicate display title.
- Reintroducing Quest Explorer semantics into Codex.

Row opportunities:

- Low until exporter provides canonical archive grouping metadata. Quests are
  intentionally hidden from top-level Codex browsing for now.

Detail opportunities:

- Low to medium. Codex Quest details can remain permalink/search targets, but
  `/quests` owns rich exploration.

Rich route boundary:

- Strongest boundary in the audit. `/quests` owns lore, strategy, branching,
  paths, progression, and questline exploration.

Exporter backlog findings:

- Existing Quest backlog already covers canonical archive grouping metadata. No
  new item added.

Recommendation:

- Do not use rich Quest Explorer data for Codex enrichment now. Preserve direct
  links/searchability and hidden top-level category behavior.

Priority: defer.

### Skills

- Codex file: none.
- Rich file: `local-imports/exports/ewshop_skills_export_0.82.json`
- Count comparison: no Codex category, 147 rich skill rows plus skill trees,
  tiers, and hero defaults.
- Identity mapping: sidecar data for Heroes and Ability relationships, not
  currently a Codex category.

Rich fields:

- `skillTrees[]`, `skillTiers[]`, `skills[]`, `heroSkillDefaults[]`
- skill `placements`, `prerequisiteSkillKeys`, `inhibitedBySkillKeys`,
  `lockedBySkillKeys`, `effects`
- ability links: `primaryAbilityKey`, `unitAbilityKeys`, `battleSkillKeys`,
  `battleAbilityKeys`
- `resolvedDisplayName`, `resolvedSummaryLines`, `resolvedMechanicKind`,
  `resolvedMechanicTags`

Safe enrichment candidates:

- Hero detail skill tree/profile hints when exact Hero and Skill records line up.
- Future Skills Codex category if product wants searchable Hero skills.

Unsafe/risky candidates:

- Adding a Skills category without first doing category evolution.
- Using skill placement/prerequisite data to rebuild a full hero skill tree
  inside generic Codex.
- Linking unresolved ability refs.

Recommendation:

- Treat Skills as a sidecar for future Hero detail enrichment. Do not make it a
  Codex category yet.

Priority: medium for Hero detail, low as standalone category.

## Cross-Category Patterns

### Exact 1:1 siblings are the safest enrichment base

Units, Heroes, Tech, Improvements, Districts, and Populations have exact
entry-key/count matches. These can support optional resolver enrichment without
changing exporter contracts.

### Rich diagnostics are useful for QA, not UI

Most rich exports include diagnostics and visibility/prototype/internal flags.
They are valuable for import QA and backlog triage, but should not become
player-facing row content.

### Rich fields often contain both public content and implementation noise

Ability rich data is the clearest example. Tactical profiles and battle
summaries can improve trust, but low-level mechanic/effect categories are risky
if promoted into browse labels.

### Progression data should usually be detail-only or route-owned

Tech prerequisites, Unit evolutions, Quest branches, and Hero skill trees are
high value but can easily turn Codex into a second rich route. Codex should
surface compact exact relationships in detail, not reproduce progression UI.

### Duplicate display names are not identity

Tech, Districts, Improvements, Units, Abilities, and Quests all have duplicate
display names. Grouping must use exported canonical identifiers, not titles.

### Rich import can reduce exporter pressure

For exact sibling categories, many gaps do not need Codex exporter changes if
EWShop can load rich exports through a clean resolver. Exporter backlog should
remain focused on canonical metadata that neither Codex nor rich imports provide
safely.

## Architecture Options

### A. Keep Codex isolated

Codex uses only Codex imports. Rich pages use rich imports.

Pros:

- Lowest risk.
- Preserves current importer boundaries.
- Codex remains resilient and simple.

Cons:

- Codex detail pages stay thinner than they need to be.
- Exact rich relationships already available locally cannot help archive
  inspection.
- More pressure lands on Codex exporter to duplicate rich fields.

Assessment:

- Acceptable as current baseline, but leaves high-value exact Tech/Unit/Hero
  enrichment unused.

### B. Import selected rich data into frontend/domain stores

Existing rich imports become normalized domain stores. Codex uses those stores
through category-specific selectors.

Pros:

- Uses already structured data.
- Avoids bloating Codex exporter.
- Lets rich routes and Codex share canonical imported records.

Cons:

- Codex components might accidentally reach into route-specific stores.
- More loading/hydration paths.
- Needs careful optional/fail-closed behavior.

Assessment:

- Good foundation if wrapped in a resolver boundary.

### C. Add everything to Codex exporter

Codex exporter emits all fields needed by rich routes and Codex views.

Pros:

- Single Codex data source.
- Simpler frontend lookup for Codex pages.

Cons:

- Not preferred by the task.
- Bloats Codex with route-owned data.
- Risks making exporter flatten complex domain graphs into encyclopedia records.
- Still does not solve route-boundary questions.

Assessment:

- Avoid except for canonical metadata that must be public and cannot be safely
  sourced from rich imports.

### D. Hybrid resolver layer

Codex entries stay shallow. Rich sibling stores provide optional exact
enrichment. A resolver maps Codex `entryKey` and exact `referenceKeys` to rich
records and returns category-specific safe view models.

Pros:

- Best balance of safety and usefulness.
- Fails closed when rich data is missing.
- Keeps route-owned logic out of Codex components.
- Reduces exporter requests for fields already available in rich imports.
- Encourages product-specific enrichment instead of a generic mega framework.

Cons:

- Requires careful loading and tests.
- Needs explicit per-category boundaries.
- Could become a hidden generic framework if overbuilt.

Assessment:

- Recommended direction.

## Architecture Recommendation

Use a hybrid resolver layer.

Suggested shape:

- Domain/rich imports load into existing or new normalized stores.
- A small `frontend/src/lib/codex/codexRichEnrichment*` layer owns optional
  lookup and category-specific derived view models.
- Codex page/components receive enrichment through view-model props, not direct
  route-store reads.
- Each category starts with a product-specific resolver:
  - `buildTechCodexEnrichment`
  - `buildUnitCodexEnrichment`
  - `buildHeroCodexEnrichment`
  - `buildPopulationCodexEnrichment`
- Shared utilities should remain small: exact-key map creation, resolved public
  Codex reference filtering, fail-closed helpers.
- Do not create a generic archive framework before two or three real enrichment
  implementations prove the same contract.

Resolver rules:

- Match by exact `entryKey` first.
- Use exact `referenceKeys` only for links.
- Return no enrichment when exact rich record is absent.
- Do not parse keys, titles, prose, or filenames.
- Include a `source: "rich-import"` marker only for debugging/tests if needed,
  not as UI.
- Keep row enrichment capped and detail enrichment complete enough for trust.

## Proposed Implementation Roadmap

1. Tech detail enrichment pilot.
   - Load rich Tech by exact `entryKey`.
   - Add detail-only prerequisite/exclusive-prerequisite sections with exact
     links where targets resolve.
   - Keep `/tech` tree untouched.
   - Validate route/deep-link behavior.

2. Unit detail enrichment.
   - Use exact rich Unit records for previous/evolves-into links and grouped
     public ability inspection.
   - Keep current stat-grid rows unchanged.
   - Do not build an evolution tree.

3. Hero detail profile enrichment.
   - Use exact rich Hero records and Skills sidecar for class/origin/skill tree
     profile sections.
   - Keep Hero archive rows compact.
   - Do not build full skill tree UI.

4. Population archive/detail evolution.
   - If product prioritizes Populations, use rich population threshold rewards,
     worker effects, base food cost, and custom-faction flags.
   - This can likely become a compact Reference/Archive hybrid.

5. Ability detail tactical profile review.
   - Use rich Ability tactical profiles only for exact matched public entries.
   - Do not use rich mechanic tags to replace exporter-owned `Combat role`
     cleanup.

6. Defer Quests rich enrichment.
   - Keep `/quests` route-owned.
   - Wait for exporter canonical archive grouping metadata before revisiting
     top-level Quest archive behavior.

## Exporter Backlog Additions

No new exporter backlog entries were appended during this audit.

Existing active backlog items already cover the exporter-only gaps re-confirmed
here:

- Ability `Combat role` cleanup and explicit ability ownership metadata.
- Equipment granted ability reference coverage and icon metadata.
- Trait ownership, category semantics, reference coverage, and icon metadata.
- Action ownership/reference/browse metadata.
- Diplomacy runtime values, relationship direction, and icon metadata.
- Improvement planning metadata and thin rows.
- District planning metadata and upgrade-chain/progression metadata.
- Hero reference/granted ability coverage and presentation metadata.
- Unit reference/roster coverage and evolution relationship metadata.
- Technology prerequisite/progression metadata.
- Quest canonical archive grouping metadata.

See `docs/active/codex-export-vs-rich-export-boundary.md` for the overlap
decision. Several items are split ownership: a rich resolver can solve EWShop
detail UI from exact sibling records, while DB Exporter remains owner of
canonical public metadata if the same information must be served by Codex
exports, backend APIs, or non-rich-import consumers.

## Open Questions

- Should Tech be the first pilot because it has exact 1:1 mapping and obvious
  detail-only prerequisite value?
- Should rich imports be loaded in production from backend APIs, static local
  imports, or a future normalized frontend data service?
- Should Codex category detail components be split before adding rich
  enrichment, or can the first resolver be integrated narrowly?
- How should tests mock rich sibling data without making `CodexPage.test.tsx`
  even larger?
- Should Populations become a full category evolution target now that the rich
  sibling is compact and structured?

## Final Recommendation

Adopt the hybrid resolver direction, but pilot it narrowly.

Recommended first implementation slice:

`CODEX-RICH-001 - Tech Detail Prerequisite Enrichment`

Scope:

- Tech detail pages only.
- Exact `entryKey` match from Codex Tech entry to rich Tech record.
- Render prerequisite and exclusive-prerequisite links only when exact target
  Codex entries resolve.
- Keep archive rows and `/tech` route unchanged.
- Fail closed when rich data is absent.

Why Tech first:

- 133 Codex Tech entries exactly match 133 rich Tech entries.
- Rich prerequisites/unlocks are structured and player-facing.
- Current Codex Tech rows already show effects/unlocks; detail pages are the
  right place for prerequisite trust.
- The `/tech` route boundary is clear: tree/progression visualization remains
  route-owned.

Do not start with Quests. Quest Explorer data is too rich, not 1:1 with Codex,
and strongly route-owned.

## CODEX-RICH-001 Result

Implemented as a frontend-only Tech detail resolver.

- Runtime source: existing `useTechStore` records from `/api/techs`.
- Matching rule: selected Codex Tech `entryKey` must exactly match the rich Tech
  `techKey`.
- Target rule: prerequisite targets render only when they resolve to exact public
  Codex Tech entries.
- Rendering: compact Codex detail section with existing inline link/tooltip
  behavior.
- Fail-closed behavior: no section appears when rich Tech data is unavailable or
  targets do not resolve.
- Intentionally not implemented: Tech archive row changes, `/tech` changes,
  unlock graph/tree rendering, generic resolver framework, and local JSON
  imports.

The current EWShop Tech API DTO carries one `prereq` and one `excludes` field.
The resolver is compatible with those fields and with future richer prerequisite
arrays if the existing API/store boundary is expanded later.
