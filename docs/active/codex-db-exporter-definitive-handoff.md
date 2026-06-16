# Codex DB Exporter Definitive Handoff

Status: active definitive DB Exporter/editorial request
Current as of 2026-06-16

This is the single active Codex data-quality handoff for DB Exporter/editorial
work. The intent is to end handoff churn: for every item below, DB Exporter
should either return canonical public data or explicitly confirm that the
canonical public data does not exist and should not be requested again.

## Panel Findings

Panel:

- EWShop Tech Lead: contract boundaries, route/API stability, implementation
  risk.
- Senior Frontend/Product Engineer: Codex UX, player value, browser evidence.
- Senior Backend/API Engineer: DTO/import/API consumption, exact-ref contract.
- Data Contract Reviewer: exporter field semantics, null/absence handling,
  validation.
- QA/Diagnostics Reviewer: reproducibility, examples, acceptance checks.

### Blocking Ambiguity

- "Add context" is too broad unless every ask says which current Codex contract
  fields may carry the context.
- "Where canonical" must be closed by DB Exporter: either return the data, or
  confirm that no public canonical source exists.
- Thin entries must not be interpreted as EWShop display bugs. When public data
  is absent, EWShop should continue rendering exact searchable/linkable targets
  with no invented gameplay summary.
- Status grouping must not be inferred from keys such as `HeroStatus_*` or
  `Status_City_*`. It needs an exported public sub-kind/scope.

### Likely Interpretation Risk

- Resource and effect pages are already top-level shallow reference categories;
  this handoff asks for better data inside that model, not richer dossier pages.
- Modifiers are valid exact link targets, but must stay hidden from top-level
  Codex navigation.
- Treaty Applied Status summaries are implemented for exact refs; this handoff
  asks for missing direct Effects/public text, not a new treaty preview system.
- Action and Status future UI patterns are blocked on data quality, not on a
  frontend redesign.

### Missing Example / Evidence Risks Resolved Here

- Each ask below includes representative entry keys.
- Acceptance criteria are phrased as exported JSON/data-shape outcomes and
  EWShop validation outcomes.
- Every ask includes the required "if data does not exist" confirmation.

### Already Clear / No Change Needed

- EWShop imports, preserves, serves, and renders generic Codex `facts`,
  `sections`, `descriptionLines`, `publicContextKeys`, `referenceKeys`, and
  exact `referenceKey` values.
- EWShop exact-ref summaries are already implemented for Tech Unlocks,
  Population threshold targets, Treaty Applied Statuses, Ability inline Status
  refs, and granted Ability previews.
- Route/query/deep-link behavior is not part of this handoff.
- SEO, graph expansion, fuzzy matching, and broad visual redesign are out of
  scope.

## Contract Shape To Use

Use the current generic Codex export contract. Do not create a new EWShop-only
shape unless DB Exporter and EWShop agree separately.

Allowed public data surfaces:

- `descriptionLines`: concise public summary/prose when a safe public summary
  exists.
- `facts[]`: public label/value pairs for stable attributes. If a value points
  to another current public Codex entry, attach exact `referenceKey`.
- `sections[]`: public grouped content such as `Effects`, `Action mechanics`,
  `Requirements`, `Unlocks`, `Threshold rewards`, `Applied statuses`, or other
  public headings already used by the exporter.
- `sections[].items[]`: public item labels/values. If an item points to another
  current public Codex entry, attach exact `referenceKey`.
- `referenceKeys` / `publicContextKeys`: exact public relationship keys only.

Forbidden data behaviors:

- Do not encode links that require EWShop to match display names or prose.
- Do not export guessed gameplay summaries.
- Do not expose hidden/private/debug/internal source names as public text.
- Do not export a `referenceKey` unless the target is a current public Codex
  entry, or the handoff explicitly says the target entry should also be
  exported.

## Do Not Reopen Without New Evidence

- Resources, Councilor Effects, Partner Effects, and Traits are top-level
  shallow reference categories.
- Modifiers remain hidden from top-level navigation and are only exact
  searchable/linkable targets.
- EWShop does not infer links from display names, prose, keys, or fuzzy
  matching.
- EWShop does not invent strategy/gameplay summaries for thin entries.
- Existing route/query/deep-link behavior stays unchanged.
- Completed exact-ref surfaces should not be reopened solely because generated
  diagnostics count relationships.

## Definitive Exporter / Editorial Asks

### DB-CODEX-DEF-001 - Add Public Gameplay Context To Thin Actions

Owner: DB Exporter/editorial
Priority: P1

Player-facing problem:
Players cannot answer "what does this action do, when is it available, what
does it cost, and what does it affect?" for facts-only Actions.

Current EWShop behavior:
Actions remain visible/searchable/linkable exact Codex entries. EWShop renders
current facts/sections and does not invent summaries for facts-only rows.

Exact requested data shape:

- `descriptionLines` with a concise public purpose summary, or a public
  `sections[]` entry such as `Action mechanics`.
- Public `facts[]` for source/availability, target constraints, cost,
  cooldown, duration, or UI category when canonical.
- Exact `referenceKey` on facts/items for affected public Codex targets such as
  Districts, Improvements, Units, Populations, Resources, Statuses, or
  Modifiers when those targets are current public entries.

Examples:

- `ActionTypeArmyStealTerritory`
- `ActionTypeBanishPopulationFromSettlement`
- `ActionTypeBuildObservatory`
- `ActionTypeAbsorbCity`
- `ConstructibleAction_RazeDistrict`

If data exists:
Return public purpose/availability/effect/cost/target data using the current
generic Codex `descriptionLines`, `facts`, `sections`, and exact
`referenceKey` fields.

If data does not exist:
Confirm: "No canonical public gameplay summary/source/target data exists for
these Action entries; leave them as thin searchable/linkable Codex targets."

EWShop fallback behavior:
Keep Actions searchable/linkable and render the current thin-state UI. Do not
promote facts-only Actions into a richer action-catalog UI.

Acceptance criteria:

- Facts-only Action count decreases for entries where public data exists.
- No exported Action relationship requires display-name/prose matching.
- Entries with no canonical source are explicitly documented as intentionally
  thin.

Validation:

- `npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300`
- Browser QA `/codex?category=actions&entry=ActionTypeBuildObservatory`.
- Browser QA one mechanics-rich Action, for example
  `/codex?category=actions&entry=ActionTypeAbsorbCity`.

Explicit non-goals:

- Do not export guessed mechanics.
- Do not create a new EWShop action route, graph, SEO page, or inferred link
  layer.

### DB-CODEX-DEF-002 - Add Public Context To Thin Districts And Improvements

Owner: DB Exporter/editorial
Priority: P1

Player-facing problem:
Districts and Improvements are planning surfaces. Facts-only entries do not
answer what the building does, why it matters, what unlocks it, or what it
affects.

Current EWShop behavior:
EWShop keeps Districts and Improvements as rich detail categories. Extractors
remain District entries with Resource links when exact refs exist. EWShop does
not demote the whole category because some rows are thin.

Exact requested data shape:

- Public `descriptionLines` or `sections[]` for effects, strategic purpose,
  requirements, unlocks, extraction, source, tier differences, or availability.
- Public `facts[]` for category, tier, cost, source, resource, faction, terrain,
  or requirement where canonical.
- Exact `referenceKey` on facts/items for related Resources, Tech, Actions,
  Districts, Improvements, Populations, Units, or Statuses when public targets
  exist.

Examples:

- `District_Bridge`
- `District_Tier0_Bridge`
- `DistrictImprovement_Bridge_01`
- `DistrictImprovement_Extractor_01`
- advanced/grand extractor rows such as `Extractor_Luxury01_Tier2`

If data exists:
Return public effects/requirements/unlocks/source/tier context and exact refs
using current generic Codex fields.

If data does not exist:
Confirm: "No canonical public planning context exists for these District or
Improvement entries; leave them as thin exact Codex targets."

EWShop fallback behavior:
Keep rich District/Improvement detail pages for rows with data; render thin
rows plainly without invented summaries.

Acceptance criteria:

- Diagnostic facts-only District/Improvement count decreases where data exists.
- Extractor/Resource exact links continue resolving without display-name
  matching.
- Tier 2/3 extractor rows either gain public Effects/context or are explicitly
  confirmed as intentionally thin.

Validation:

- Content-quality diagnostic command above.
- Browser QA `/codex?category=districts&entry=District_Bridge`.
- Browser QA `/codex?category=improvements&entry=DistrictImprovement_Bridge_01`.
- Browser QA one extractor detail and one Resource detail.

Explicit non-goals:

- Do not ask EWShop to infer building purpose from names, categories, tags, or
  descriptor prose.
- Do not redesign District/Improvement pages.

### DB-CODEX-DEF-003 - Fill Thin Ability Mechanics Where Public

Owner: DB Exporter/editorial
Priority: P1

Player-facing problem:
Abilities are linked from Units, Heroes, Equipment, Traits, and Quest Strategy.
Thin Ability pages break planning because players cannot see what the linked
ability actually does.

Current EWShop behavior:
EWShop renders rich Ability details when Effects/Battle mechanics exist and
keeps thin Ability entries searchable/linkable. Ability inline Status links and
granted Ability previews use exact exported refs only.

Exact requested data shape:

- Public `descriptionLines` or `sections[]` for effects, passive behavior,
  tactical behavior, battle mechanics, map mechanics, source, and restrictions.
- Exact `referenceKey` on section items for applied Statuses, granted
  Abilities, affected Units/Heroes/Equipment, or other current public Codex
  targets.
- Public facts for range, target, cost, kind, source, or ability subtype where
  canonical.

Examples:

- `UnitAbility_AlwaysRetaliate`
- `UnitAbility_Blossom_1`
- `UnitAbility_Blossom_2`
- `UnitAbility_Hero_BattleAbility_Equipment_Passive_12`

If data exists:
Return public mechanics/source/effect data and exact refs through existing
facts/sections/reference fields.

If data does not exist:
Confirm: "No canonical public Ability mechanics/context exists for these
entries; leave them as thin exact Codex targets."

EWShop fallback behavior:
Keep current Ability detail rendering and exact preview behavior. Do not invent
ability summaries from names or source pages.

Acceptance criteria:

- Thin Ability diagnostic count decreases where public mechanics exist.
- Exact applied Status refs still resolve without duplicate preview noise.
- Entries without data are explicitly confirmed as intentionally thin.

Validation:

- Content-quality diagnostic command above.
- Browser QA `/codex?category=abilities&entry=UnitAbility_AlwaysRetaliate`.
- Browser QA one rich Ability, for example
  `/codex?category=abilities&entry=UnitAbility_CorruptionBurst`.

Explicit non-goals:

- Do not export AI-only/private heuristic text.
- Do not add fuzzy Status/Ability linking.

### DB-CODEX-DEF-004 - Replace Raw Population Keys And Complete Threshold Refs

Owner: DB Exporter/editorial
Priority: P1

Player-facing problem:
Population pages are breakpoint-planning pages. Raw faction keys and text-only
threshold rewards block safe links and make the page look like database output.

Current EWShop behavior:
EWShop renders exact Population threshold reward summaries only when exported
exact refs resolve. Text-only rewards and unresolved exact refs remain plain.

Exact requested data shape:

- Public labels in `facts[]` instead of raw keys such as `Faction_Aspect`.
- Exact `referenceKey` on Population fact values when the value is a current
  public Codex entity.
- Exact `referenceKey` on threshold reward section items/facts when the reward
  target is a current public Codex entry.
- If a threshold reward references a public target not currently exported, also
  export that target entry or remove the exact ref and confirm it is not public.

Examples:

- `Population_Aspect` fact value currently exposes `Faction_Aspect`.
- `Population_KinOfSheredyn` fact value currently exposes
  `Faction_KinOfSheredyn`.
- `Population_Aspect` threshold reward exports exact ref
  `Aspect_DistrictImprovement_00`, but that target is not a current Codex
  entry, so `Nutrient Extractor` remains plain.
- `Population_Minor_MangroveOfHarmony` threshold fact value exposes
  `MangroveOfHarmony_District_Tier1_Money`.
- Text-only rewards remain on `Population_Called`.

If data exists:
Return public display labels and exact threshold/fact refs. Ensure referenced
targets are exported as current public Codex entries.

If data does not exist:
Confirm separately for each missing class:

- "No public Codex target exists for `Aspect_DistrictImprovement_00`; keep
  `Nutrient Extractor` plain."
- "No canonical exact target exists for these text-only Population rewards;
  leave them as text."
- "These raw faction keys have no public label source" if that is true.

EWShop fallback behavior:
Keep Population top-level. Render exact summaries for resolved refs only and
plain text for unresolved/text-only rewards.

Acceptance criteria:

- Raw Population fact values are replaced by public labels where data exists.
- Exact threshold refs resolve to current public Codex entries or are removed
  with explicit "not public/no canonical target" confirmation.
- No Population link uses display-name matching.

Validation:

- Relationship-gap diagnostic.
- Browser QA `/codex?category=populations&entry=Population_Aspect`.
- Browser QA `/codex?category=populations&entry=Population_KinOfSheredyn`.

Explicit non-goals:

- Do not ask EWShop to guess threshold targets from reward text.
- Do not create placeholder target entries only to satisfy a ref.

### DB-CODEX-DEF-005 - Fill Resource And Extractor Context Where Canonical

Owner: DB Exporter/editorial
Priority: P2

Player-facing problem:
Resources are now top-level shallow references. Players need source/use/effect
context at a glance; thin Resource or Extractor rows do not explain impact.

Current EWShop behavior:
Resources, Councilor Effects, Partner Effects, and Traits use shallow
reference rows. Resource/Extractor exact links are surfaced when exported. EWShop
does not render Resources as full strategy dossiers.

Exact requested data shape:

- Public Resource `descriptionLines`, facts, or Effects section for use,
  source, stock capacity, economy interaction, availability, or strategic role.
- Public Extractor sections/facts for extracted Resource, tier difference,
  output, stock capacity, requirements, and source.
- Exact `referenceKey` from Extractor to Resource and Resource to Extractors
  where public targets exist.

Examples:

- `Resource_Specific_Corpse`
- `Resource_Specific_Spirit`
- `Extractor_Luxury01`
- `Extractor_Luxury01_Tier2`
- `Resource_Luxury01`
- `Resource_Strategic01`

If data exists:
Return public use/source/effect/extraction context and exact refs using the
current generic Codex fields.

If data does not exist:
Confirm: "No canonical public use/source/effect context exists for these thin
Resource/Extractor entries; keep them as shallow reference rows."

EWShop fallback behavior:
Keep Resources as shallow reference category rows and Extractors under
Districts/Extractors. Do not create invented Resource dossiers.

Acceptance criteria:

- Thin Resource/Extractor rows gain exported public context where canonical.
- Exact Resource/Extractor links continue to resolve without display-name
  matching.
- Resource deposits / POI pages are either returned as public Codex entries or
  explicitly confirmed deferred/not public.

Validation:

- Content-quality and relationship-gap diagnostics.
- Browser QA `/codex?category=resources&entry=Resource_Specific_Corpse`.
- Browser QA `/codex?category=extractors&entry=Extractor_Luxury01_Tier2`.

Explicit non-goals:

- Do not change Resource presentation from shallow reference rows.
- Do not export raw private source names as public prose.

### DB-CODEX-DEF-006 - Add Treaty Effects And Fix Incomplete Public Text

Owner: DB Exporter/editorial
Priority: P2

Player-facing problem:
Diplomatic Treaty pages are decision surfaces. Players need to understand what
changes when they sign, declare, demand, accept, or reject a treaty.

Current EWShop behavior:
EWShop renders Diplomatic Treaties as rich detail pages. Exact Applied Status
summaries are implemented for resolved Status refs. Treaties with neither
direct Effects nor Applied Status refs stay thin.

Exact requested data shape:

- Public `descriptionLines` or `sections[]` for direct treaty Effects.
- Exact `referenceKey` on Applied Status section items when a treaty applies a
  current public Status.
- Completed public text for surrender/tribute/cost/status prose.
- Public facts for bilateral/duration/category/kind where already canonical.

Examples:

- `Treaty_AskToSurrender`
- `Treaty_ProposeSurrender`
- `Treaty_SharedVictory`
- `Declaration_CloseBorders`
- `Treaty_SharedResearch`

If data exists:
Return direct public Effects summaries, exact Applied Status refs, and complete
public prose through current generic Codex fields.

If data does not exist:
Confirm: "No canonical public direct Effects/status/prose exists for these
Treaties; leave current treaty pages facts-only or text-only."

EWShop fallback behavior:
Keep Diplomatic Treaties browseable. Render exact Applied Status summaries
only where refs resolve. Do not infer treaty values from prose or runtime
placeholders.

Acceptance criteria:

- Treaty entries with canonical data have direct Effects and/or exact Applied
  Status refs.
- Surrender/tribute public text no longer exposes incomplete placeholders.
- No Treaty effect is inferred by EWShop.

Validation:

- Relationship-gap diagnostic.
- Browser QA `/codex?category=diplomatictreaties&entry=Treaty_AskToSurrender`.
- Browser QA `/codex?category=diplomatictreaties&entry=Declaration_CloseBorders`.

Explicit non-goals:

- Do not build a broader Treaty preview renderer.
- Do not ask EWShop to infer tribute/cost/status values from runtime text.

### DB-CODEX-DEF-007 - Export Public Status Sub-Kind/Scope And Fill Thin Statuses

Owner: DB Exporter/editorial
Priority: P2

Player-facing problem:
Statuses are numerous. Players need to know whether a Status belongs to combat,
city approval, army map movement, empire diplomacy, hero state, public opinion,
or treaty effects. EWShop cannot group safely from keys.

Current EWShop behavior:
Statuses remain visible/searchable/linkable. Rich Status detail pages work when
mechanics exist. Broad Status grouping/filtering is deferred because exported
sub-kind/scope is missing or not public enough.

Exact requested data shape:

- Public `facts[]` field such as `Scope`, `Sub-kind`, or equivalent public
  label with values like City, Army, Empire, Combat, Hero, Public Opinion, Map,
  Treaty, or other DB-approved public groupings.
- Public Effects/mechanics sections for thin Statuses where canonical.
- Exact refs from Status sections/facts to public related entries where
  canonical.

Examples:

- `Status_PublicOpinion_YouClosedBorders`
- `HeroStatus_Loss`
- `Status_AdministrativeCenter_Subjugation`
- `Status_Army_Map_Speed_Immobile`

If data exists:
Return stable public sub-kind/scope facts and mechanics for thin Statuses.

If data does not exist:
Confirm: "No canonical public Status sub-kind/scope exists; EWShop should keep
Statuses as an ungrouped exact search/link category." Confirm separately if
thin Status mechanics do not exist.

EWShop fallback behavior:
Keep current Status category/detail behavior and do not infer groupings from
entry keys, display names, or prose.

Acceptance criteria:

- Every returned Status grouping value is public, stable, and not key-derived
  by EWShop.
- Thin Statuses gain mechanics where canonical or are explicitly confirmed
  intentionally thin.
- EWShop can group/filter only from exported public facts.

Validation:

- Content-quality diagnostic.
- Browser QA `/codex?category=statuses`.
- Browser QA `/codex?category=statuses&entry=HeroStatus_Loss`.
- Browser QA `/codex?category=statuses&entry=Status_PublicOpinion_YouClosedBorders`.

Explicit non-goals:

- Do not expose hidden/internal scope names.
- Do not ask EWShop to parse `Status_*` or `HeroStatus_*` keys.

### DB-CODEX-DEF-008 - Omit Or Repair Deprecated Bonus Placeholder Rows

Owner: DB Exporter/editorial
Priority: P3

Player-facing problem:
Deprecated placeholder bonus rows create import failed-row noise and can obscure
real QA issues. They do not currently prove a broken public player surface.

Current EWShop behavior:
EWShop local import rejects rows whose display name normalizes to no public
name. The two known rows are not treated as release blockers unless dead-ref or
browser QA proves a missing public target.

Exact requested data shape:

- If the rows are not public: omit them from public Codex exports.
- If the rows are public: provide real public `displayName`, public context,
  and exact refs like any other public Modifier/Status/Bonus-derived entry.

Examples:

- `ConstructibleCostModifier_UnitCostReduction03`
- `ConstructibleCostModifier_UnitMoneyCostReduction01`
- Both currently have display name `[DEPRECATED]`.

If data exists:
Return real public names/context and any exact refs required for player-facing
use.

If data does not exist:
Confirm: "These deprecated bonus rows are not public player-facing Codex
entries and should be omitted from public exports."

EWShop fallback behavior:
Continue rejecting empty-public-name rows and treat them as exporter/editorial
cleanup unless current diagnostics show a missing public target.

Acceptance criteria:

- Startup import no longer reports these rows as failed because they are either
  omitted or repaired.
- No `[DEPRECATED]` placeholder name appears in public Codex output.

Validation:

- Local import summary after exporter return.
- Content-quality diagnostic for placeholder/raw display names.

Explicit non-goals:

- Do not make deprecated placeholders searchable just to avoid import warnings.
- Do not expose hidden Modifiers in top-level navigation.

### DB-CODEX-DEF-009 - Replace Raw Councilor Description Key

Owner: DB Exporter/editorial
Priority: P3

Player-facing problem:
A raw internal description key in public Councilor content breaks the
encyclopedia feel and should not be shown to players.

Current EWShop behavior:
EWShop renders exported public text and exact Councilor Effect / Partner Effect
links. It does not know whether a raw-looking string is missing localization or
intentionally absent prose.

Exact requested data shape:

- Public localized `descriptionLines` for the Councilor, or omit the raw
  description line entirely.
- Preserve exact Councilor Effect and Partner Effect refs where present.

Example:

- `Notable_FactionQuest_Mukag_Chapter05_Perisai`
- Raw value:
  `Notable_FactionQuest_Mukag_Chapter05_PerisaiDescription`

If data exists:
Return readable public copy.

If data does not exist:
Confirm: "No public Councilor description exists for this entry; omit the raw
description key from public Codex output."

EWShop fallback behavior:
Render Councilor facts/effects/links without invented biography text.

Acceptance criteria:

- No raw description key is exported as player-facing text.
- Councilor Effect and Partner Effect exact links remain intact.

Validation:

- Content-quality diagnostic.
- Browser QA `/codex?category=councilors&entry=Notable_FactionQuest_Mukag_Chapter05_Perisai`.

Explicit non-goals:

- Do not expose private narrative/source identifiers as public text.

### DB-CODEX-DEF-010 - Modifier Public-Target Confirmation

Owner: DB Exporter/editorial
Priority: P3

Player-facing problem:
Modifiers can be useful exact relationship targets, but exposing raw or hidden
Modifiers broadly would add noise and could leak non-public mechanics.

Current EWShop behavior:
Modifiers are hidden from top-level navigation. They remain searchable/linkable
only when exact public targets exist, for example direct links from Actions or
Related Entries.

Exact requested data shape:

- For public Modifier targets: public `displayName`, facts/sections describing
  the effect where canonical, and exact refs to source/affected entries.
- For non-public/internal Modifiers: omit from public generic Codex exports or
  confirm they should remain hidden/unlinked.

Examples:

- `ActionCostModifier_CutForest_Decrease_00`
- Modifier refs attached to Action cost mechanics.

If data exists:
Return public labels/context for exact Modifier targets that are safe to show
as hidden/searchable/linkable references.

If data does not exist:
Confirm: "These Modifiers are internal/non-public; EWShop should keep them
hidden or omit them as public link targets."

EWShop fallback behavior:
Keep Modifiers out of top-level navigation. Do not create inferred Modifier
links.

Acceptance criteria:

- Public Modifier targets have safe public labels/context.
- Non-public Modifiers are not exported as public browse content.
- No UI change exposes Modifiers as a top-level category.

Validation:

- Browser QA direct exact Modifier URL, for example
  `/codex?entry=ActionCostModifier_CutForest_Decrease_00`.
- Confirm Modifiers are absent from top-level category navigation.

Explicit non-goals:

- Do not expose Modifiers in top-level navigation.
- Do not treat every internal Modifier as a public Codex page.

## Required DB Exporter Response Format

For each `DB-CODEX-DEF-*` item, respond with one of:

- `implemented`: list returned fields/sections/refs and representative entry
  keys.
- `partially implemented`: list entries/classes covered, entries/classes not
  covered, and why.
- `not canonical/public`: explicitly confirm the requested data does not exist
  as canonical public data and should not be requested again until source data
  changes.
- `deferred`: include the owner and blocking reason. Do not use `deferred` for
  data that is actually nonexistent; use `not canonical/public`.

## EWShop Validation After Return

From `frontend/`:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md
npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md
```

Browser QA representative pages:

- `/codex?category=actions&entry=ActionTypeBuildObservatory`
- `/codex?category=districts&entry=District_Bridge`
- `/codex?category=improvements&entry=DistrictImprovement_Bridge_01`
- `/codex?category=abilities&entry=UnitAbility_AlwaysRetaliate`
- `/codex?category=populations&entry=Population_Aspect`
- `/codex?category=resources&entry=Resource_Specific_Corpse`
- `/codex?category=extractors&entry=Extractor_Luxury01_Tier2`
- `/codex?category=diplomatictreaties&entry=Treaty_AskToSurrender`
- `/codex?category=statuses&entry=HeroStatus_Loss`
- `/codex?category=councilors&entry=Notable_FactionQuest_Mukag_Chapter05_Perisai`
- `/codex?entry=ActionCostModifier_CutForest_Decrease_00`

Validation must confirm:

- Exact refs resolve without display-name matching.
- Missing data remains plain/thin by explicit exporter confirmation.
- Modifiers remain hidden from top-level navigation.
- Shallow reference categories remain shallow: `resources`,
  `councilorEffects`, `partnerEffects`, and `traits`.
