# Codex Category UX Audit

Status: active loop source  
Current as of 2026-06-16

## Purpose

Decide which Codex categories should behave like rich planning pages, which
should behave like shallow reference lists, and which should remain exact
search/link targets. This loop is UI/UX only: no SEO work, no broad graph
expansion, no fuzzy link inference, no invented gameplay summaries, and no
top-level Modifier navigation.

## Browser Evidence

Checked local Codex at `http://127.0.0.1:5173/codex` with the current local
imports. Desktop viewport was 1280x720; narrow viewport was 390x844.

Representative URLs:

- `/codex`
- `/codex?category=resources`
- `/codex?category=counciloreffects`
- `/codex?category=partnereffects`
- `/codex?category=actions`
- `/codex?category=actions&entry=ActionTypeAbsorbCity`
- `/codex?category=actions&entry=ActionTypeBuildObservatory`
- `/codex?category=statuses`
- `/codex?category=statuses&entry=Status_PublicOpinion_YouClosedBorders`
- `/codex?category=statuses&entry=HeroStatus_Loss`
- `/codex?category=abilities`
- `/codex?category=abilities&entry=UnitAbility_CorruptionBurst`
- `/codex?category=abilities&entry=UnitAbility_AlwaysRetaliate`
- `/codex?category=tech&entry=Aspect_Technology_00`
- `/codex?category=units&entry=Unit_Aspect_Giant`
- `/codex?category=heroes&entry=Hero_Aspect_Archer_0`
- `/codex?category=extractors&entry=Extractor_Luxury01`
- `/codex?category=districts&entry=District_Bridge`
- `/codex?category=improvements&entry=DistrictImprovement_Military_00`
- `/codex?category=improvements&entry=DistrictImprovement_Bridge_01`
- `/codex?category=populations&entry=Population_KinOfSheredyn`
- `/codex?category=minorfactions&entry=MinorFaction_DaughterOfBor`
- `/codex?category=factions&entry=Faction_KinOfSheredyn`
- `/codex?category=equipment&entry=Equipment_Accessory_01_Definition`
- `/codex?category=councilors&entry=Notable_Elder_MinorFaction_Hydracorn`
- `/codex?category=traits&entry=ProtectorateTrait_DaughterOfBor_Trait01`
- `/codex?entry=ActionCostModifier_CutForest_Decrease_00`

Observed:

- `resources`, `councilorEffects`, and `partnerEffects` already use the
  shallow-reference summary row pattern. This works: rows carry effect lines,
  source/extractor links where exact refs exist, and no dossier-like bloat.
- `actions` and `statuses` are valid exact targets, but their category browse
  surfaces are noisy. Many rows only expose category/type/duration, and thin
  details correctly show missing-public-summary placeholders.
- `abilities` is mixed. Combat/tactical/passive abilities with exported Effects
  work as mechanics pages; thin passive entries such as
  `UnitAbility_AlwaysRetaliate` do not justify richer UI.
- `modifiers` are hidden from top-level navigation, but direct exact links work.
  `/codex?entry=ActionCostModifier_CutForest_Decrease_00` renders a Modifier
  dossier and related Action while keeping Modifiers out of category chips.
- Rich planning categories with real sections work well: Tech unlocks,
  Population threshold summaries, Units, Heroes, Equipment, Factions,
  Minor Factions, Councilors, and rich District/Improvement entries.
- Narrow viewport has no horizontal overflow in sampled pages. Very large
  categories create long single-column result/summary lists; this is most
  painful for `statuses` and all-entry views, not for shallow reference lists.

## Classification

| Category/subtype | Current presentation | Player value | Current UI quality | Recommendation |
| --- | --- | --- | --- | --- |
| `actions` | mixed/unclear rich category | mechanics glossary / relationship target | partially works; too thin for 87 facts-only rows | Keep exact search/link targets; split into subtypes only after stronger exported purpose/availability data; exporter/editorial handoff for thin Actions. |
| `actions` with mechanics sections | rich detail category | reference lookup | partially works | Keep current model; no new EWShop UI until summaries improve. |
| facts-only `actions` | searchable/linkable only in practice | relationship/link target | too thin because exporter data is missing | Do not promote; exporter/editorial handoff. |
| `diplomaticTreaties` | rich detail category | high planning surface | partially works | Keep current model; exact Applied Status summaries are enough for now; exporter/editorial handoff for missing Effects/incomplete text. |
| `statuses` | mixed/unclear rich category | mechanics glossary / relationship target | too noisy; wrong presentation model for broad browse | Needs new mechanics-glossary pattern after exported sub-kind/scope data; keep current exact links/search meanwhile. |
| rich `statuses` | rich detail category | mechanics glossary | works well | Keep detail pages; avoid broad category redesign until sub-kind data exists. |
| thin `statuses` | searchable/linkable only in practice | relationship/link target | too thin because exporter data is missing | Do not enrich locally; exporter/editorial handoff. |
| `modifiers` | hidden/link-target only | relationship/link target | works well | Keep hidden/searchable/linkable only; do not expose in top-level navigation. |
| `abilities` | mixed rich category | mechanics glossary / reference lookup | partially works | Keep current detail model; consider subtype browsing only if exported grouping/data quality improves. |
| rich `abilities` | rich detail category | mechanics glossary | works well | Keep current model. |
| thin `abilities` | searchable/linkable only in practice | relationship/link target | too thin because exporter data is missing | Do not enrich locally; exporter/editorial handoff. |
| `traits` | rich detail category | reference lookup | partially works | Candidate for shallow reference list if product wants denser minor-faction trait comparison; defer until after higher-noise categories. |
| `tech` | rich detail category | high planning surface | works well | Keep current model with exact Unlock summaries only. |
| `units` | rich detail category | high planning surface | works well | Keep current model. |
| `heroes` | rich detail category | high planning surface | works well | Keep current model. |
| `districts` | mixed rich category | high planning surface | partially works | Keep current model; Extractors are already separated; exporter/editorial handoff for thin Districts. |
| `extractor` subtype of `districts` | rich detail plus Resource links | reference lookup / planning | partially works | Keep under Districts/Extractors; do not invent missing Tier 2/3 effects. |
| `improvements` | mixed rich category | high planning surface | partially works | Keep current model; exporter/editorial handoff for thin bridge/special rows. |
| `populations` | rich detail category | high planning surface | works well except text-only rewards | Keep current model; exact threshold summaries only; exporter/editorial handoff for unresolved/text-only rewards. |
| `minor factions` | rich detail category | high planning surface / reference lookup | works well | Keep current model. |
| `factions` | rich detail category | high planning surface | works well | Keep current model; avoid extra inline faction dossiers in other categories. |
| `equipment` | rich detail category | high planning surface | works well | Keep current model with granted Ability previews. |
| `councilors` | rich detail category | high planning surface / reference lookup | works well | Keep current model; exact effect links already carry the comparison value. |
| `resources` | shallow reference list | reference lookup | works well | Keep shallow reference list; fill thin resource context via exporter/editorial handoff. |
| `councilorEffects` | shallow reference list | reference lookup / relationship target | works well | Keep shallow reference list; make the category header visually say reference list. |
| `partnerEffects` | shallow reference list | reference lookup / relationship target | works well | Keep shallow reference list; make the category header visually say reference list. |

## Product Decision

Best suited for shallow reference lists now:

- `resources`
- `councilorEffects`
- `partnerEffects`

Possible future shallow-list candidates:

- `traits`, if the desired player task is comparing minor-faction trait effects
  rather than reading individual trait dossiers.
- Thin/facts-only subgroups inside `actions`, `abilities`, `statuses`,
  `districts`, and `improvements`, but only as a demotion/search treatment after
  product review. EWShop should not create a fake shallow list that hides
  missing mechanics.

New presentation type needed:

- `statuses` likely need a mechanics-glossary pattern: grouped by exported
  sub-kind/scope, optimized for scan and exact relationship lookup. The current
  single 337-row rich category is noisy, but EWShop should wait for explicit
  sub-kind/scope data rather than infer from keys or display names.
- `actions` may later need an action-catalog pattern with exported subtype,
  target, cost, source, and availability facets. Current data is too thin for
  this to be an EWShop-only UI story.

## Ticket Plan

### EW-CAT-UX-001 - Label Shallow Reference Category Summaries

Owner: EWShop  
Priority: P1  
Player value: Players can tell that Resources, Councilor Effects, and Partner
Effects are dense reference lists, not full strategy dossiers.

Evidence/examples:
- `/codex?category=resources`
- `/codex?category=counciloreffects`
- `/codex?category=partnereffects`

Proposed UI model:
- Keep the existing shallow row renderer.
- Change only the selected category summary treatment so the meta/lead says
  "Reference list" for shallow-reference categories.

Acceptance criteria:
- Shallow category summaries are visibly distinguished from ordinary category
  overviews.
- No route/query/deep-link behavior changes.
- No category membership changes.

Explicit non-goals:
- Do not expose Modifiers in top-level navigation.
- Do not convert additional categories.
- Do not redesign Codex layout.

Validation:
- `npm test -- --run src/pages/CodexPage.test.tsx`
- `npx tsc --noEmit --project tsconfig.json`
- `npm run build`
- Browser QA for `/codex?category=resources` and one non-shallow category.
- `git diff --check`

### DB-CAT-UX-002 - Export Status Sub-Kind/Scope For Glossary UX

Owner: DB Exporter/editorial  
Priority: P1  
Player value: Statuses can become a useful mechanics glossary instead of a
single noisy list.

Evidence/examples:
- `/codex?category=statuses`
- `Status_PublicOpinion_YouClosedBorders`
- `HeroStatus_Loss`

Proposed UI model:
- Future EWShop glossary grouped by exported public sub-kind/scope, such as
  Public Opinion, City Approval, Army Map, Combat, Hero, Treaty, or Empire.

Acceptance criteria:
- Exported grouping fields are public, stable, and do not require key parsing.
- Thin statuses remain identifiable as data gaps.

Explicit non-goals:
- Do not ask EWShop to infer grouping from entry keys, display names, or prose.

Validation:
- Exporter sample packet with grouped Status examples.
- EWShop browser QA after import.

### DB-CAT-UX-003 - Add Public Action Purpose/Availability Context

Owner: DB Exporter/editorial  
Priority: P1  
Player value: Action pages should answer what the action does, when it is
available, what it costs, and what it targets.

Evidence/examples:
- `ActionTypeAbsorbCity` has cost mechanics but little purpose context.
- `ActionTypeBuildObservatory` is facts-only.
- `ActionTypeArmyStealTerritory` is facts-only in the list.

Proposed UI model:
- Keep Actions searchable/linkable now; later consider action-catalog facets
  only after exported public data exists.

Acceptance criteria:
- Public summaries/effects/source/availability are exported where canonical.
- Exact affected-target refs are exported where public and current.

Explicit non-goals:
- Do not infer links or mechanics from names/prose.

Validation:
- Content-quality diagnostic shows fewer facts-only Actions.
- Browser QA for one rich and one previously-thin Action.

### DB-CAT-UX-004 - Fill Thin Construction Rows

Owner: DB Exporter/editorial  
Priority: P2  
Player value: Districts and Improvements are planning surfaces, but thin rows
feel like database stubs.

Evidence/examples:
- `District_Bridge`
- `DistrictImprovement_Bridge_01`
- advanced/grand extractor rows with no effect lines.

Proposed UI model:
- Keep rich District/Improvement pages; do not demote the whole category.

Acceptance criteria:
- Public effects, unlocks, requirements, source, and exact refs are exported
  where canonical.

Explicit non-goals:
- Do not ask EWShop to invent summaries.

Validation:
- Content-quality diagnostic and browser QA.

### EW-CAT-UX-005 - Revisit Traits As A Shallow Reference Candidate

Owner: EWShop  
Priority: P3  
Player value: Minor-faction trait comparison may be faster as dense effect
rows than as individual dossiers.

Evidence/examples:
- `/codex?category=traits`
- `ProtectorateTrait_DaughterOfBor_Trait01`

Proposed UI model:
- Consider the existing shallow-reference row pattern for `traits` only if
  product review confirms comparison is the main task.

Acceptance criteria:
- A product decision is documented before code changes.
- Exact minor-faction links remain intact.

Explicit non-goals:
- Do not convert Actions, Statuses, or Abilities as part of this ticket.

Validation:
- Browser QA before/after if implemented.

## Chosen Baseline Item

Implement `EW-CAT-UX-001`. It is the smallest EWShop-owned improvement with
clear value and low risk: the shallow row model already exists and works, but
the category summary still uses generic "Category overview" wording.
