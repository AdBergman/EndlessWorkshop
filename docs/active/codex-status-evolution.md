# Codex Status Evolution

Status: Active working document  
Owner: EWShop frontend/product  
Related process: `docs/active/codex-category-evolution-playbook.md`

## Purpose

Statuses are being evolved from a generic Codex category into a premium player-facing archive. The goal is to help 4X players understand conditions, bonuses, maluses, public opinion effects, city effects, and unit combat statuses without opening every detail page.

This document is the durable working memory for Status evolution. It moves decisions and findings out of chat history so future Status work can continue from current evidence instead of re-auditing from scratch.

Use this document together with the Codex Category Evolution Playbook. The playbook defines the process; this file records Status-specific evidence, decisions, open questions, and ticket direction.

## Current State

Statuses currently use the generic Codex split layout:

- top Codex search/category shelf
- left results list
- main overview/detail panel
- generic status detail pages

Current strengths:

- 337 Status entries are visible in the frontend after Codex store normalization.
- All visible Status entries have exported `Scope`.
- Many entries include useful `Status mechanics` sections.
- Exact references exist from some Abilities, Diplomatic Treaties, Actions, and Factions.
- Statuses remain searchable, linkable, and direct-routable.

Current weaknesses:

- Statuses still feel like generic records rather than an archive.
- The generic left result list does not support status planning.
- `Status type` is noisy and incomplete.
- Some status names are raw/debug-like.
- Many entries lack public mechanics/effects.
- Status icons currently resolve through generic kind icon behavior.
- Detail pages expose useful mechanics but are not yet shaped around player inspection.

## STATUS-UI-001 Findings

### Category Classification

Statuses should be treated as an **Archive**.

Why:

- The category has 337 entries.
- Players need browse/filter support.
- Rows should communicate status effects directly.
- Detail pages still matter for formulas, exact mechanics, source links, and permalinks.

Statuses should not be a full-width shallow reference sheet. The category is too broad and heterogeneous.

Statuses should not be a custom Explorer. There is no progression graph or authored journey like Quests, Tech, or Units.

### Data Audit

Frontend-visible Statuses are currently normalized from bonus-derived Codex entries:

- raw `exportKind: statuses`: 0
- frontend-visible normalized `statuses`: 337
- bonus-derived statuses normalized to `statuses`: 337

Fact coverage:

- `Scope`: 337 / 337
- `Status type`: 270 / 337
- `Duration`: 220 / 337
- `Category`: 337 / 337, always `Status`
- `Kind`: 337 / 337, always `Status`

Top scopes:

- Diplomatic Ambassy: 95
- Unit: 86
- City: 73
- Major Empire: 56
- Partner Den: 6
- Treaty: 6
- Hero: 5
- Territory: 5

Sections:

- `Status mechanics`: 301
- `Effects`: 47
- `Linked cost modifier`: 1

Thin/sparse notes:

- 34 statuses have no sections.
- 32 statuses have no rendered mechanics/effect lines.
- Thin examples include `Jinxed II`, `Terrorized I`, `Immobile`, and `Bleeding`.

### Browse Model

The strongest player-facing browse model is **Scope**.

Scope answers where the status applies:

- Unit
- City
- Empire
- Diplomacy
- Treaty
- Hero
- Territory

Potential future effect-family browsing may be useful, but raw `Status type` is not ready for primary navigation.

### Navigation Findings

Recommended first navigation direction:

- Status left rail using exported `Scope`.
- No raw `Status type` filter in the first implementation.
- No duration-first navigation.
- No icons in the left rail unless a later review proves they add value.

Navigation should help players choose a shelf. It should not duplicate row content.

### Row Findings

Future Status archive rows should be content-first.

Recommended row hierarchy:

1. Status name and icon.
2. Mechanics/effect preview.
3. Supporting metadata: Scope and Duration if present.
4. Exact source hint only if it remains compact.

Do not show:

- `Category: Status`
- `Kind: Status`
- raw bonus provenance
- `UnitStatusMalus`, `EmpireStatusMalus`, or similar internal context
- raw/noisy `Status type` as primary row navigation

### Detail Findings

Status detail pages should become inspection/permalink pages.

Detail should add:

- complete mechanics/effects
- affected stat, change, and formula
- exact linked applying/removing/source entries
- source/provenance only when useful for trust
- shareable URL value for guides and discussion

### Relationship Findings

Exact inbound relationship evidence exists for 49 status targets.

Current exact inbound source counts:

- Abilities: 84
- Diplomatic Treaties: 7
- Actions: 3
- Factions: 1

Safe relationship candidates:

- Abilities applying/using statuses
- Diplomatic Treaties that create public opinion statuses
- Actions that create statuses
- Factions with exact status references

Do not infer relationships from names, keys, prose, or SVG filenames.

## STATUS-EVOLUTION-002 - Status Archive Design Exploration

Purpose: define what a premium Status Archive should feel like before implementing navigation or row components.

### Representative Rich Statuses

#### Cumbersome

Current data:

- Scope: `Unit`
- Mechanics:
  - `Disables Action Token`
  - `Disables [MovementPoints] Movement Points`
- Exact source: Ability `Cumbersome`

Archive row should show:

- name and generic status icon
- Scope: Unit
- both disable lines, because they are the status content
- compact source hint only if it does not crowd the row

Detail should show:

- affected stats
- change values
- formulas
- exact source link

Why: this is the clearest example that Status content is mechanics, not metadata.

#### Berserker

Current data:

- Scope: `Unit`
- Mechanics:
  - `+25% [Damage] Damage`
  - `+20% [Focus] Critical`
- Exact sources include `In Their Honor`, `Lightstealer`, `Never Yielding`, and `Shackles Breaker`.

Archive row should show both mechanics lines. Detail should show formulas and the full source list.

#### Ametrine's Gift

Current data:

- Scope: `Major Empire`
- Multiple mechanics for strategic resource stock capacity.

Archive row should show a capped mechanics preview, not every formula. Detail should show the full multi-line mechanic set.

### Representative Normal Statuses

#### Vulnerable I

Current data:

- Scope: `Unit`
- Status type: `Defense`
- Mechanic: `-30% [Defense] Defense`
- Exact sources include `Breaching Attack` and `Fear of God`.

Archive row should show the mechanic line and Scope. The `Defense` type is useful but redundant when the mechanic line is visible.

#### Closed Borders declared

Current data:

- Scope: `Diplomatic Ambassy`
- Status type: `Public Opinion`
- Duration: `10 turns`
- Mechanic: `-25 [PublicOpinion] Public Opinion`
- Exact source: `Close Borders`

Archive row should show public-opinion impact and duration. Detail should show the exact diplomatic source.

#### Ahead in the Polls

Current data:

- Scope: `City`
- Status type: `Approval`
- Duration: `10 turns`
- Effect line and mechanics line are duplicated in meaning.

Archive row should prefer the most concise useful line, usually the mechanics line. Detail can show both if both are exported.

### Thin Status Exploration

Thin examples:

- `Jinxed II`: Scope `Unit`, exact source abilities, no mechanics.
- `Terrorized I`: Scope `Unit`, exact source abilities, no mechanics.
- `Immobile`: Scope `Army`, Duration `1 turns`, no mechanics.
- `Bleeding`: Scope `Unit`, exact source abilities, no mechanics.
- `Hero Status Loss`: Scope `Hero`, Duration `4 turns`, raw/debug-like name.

Recommended archive treatment:

- keep thin statuses visible
- show name, icon, Scope, and Duration when present
- show a quiet fallback line: `No public mechanics exported yet.`
- show source count/link only if the row remains calm

Recommended detail treatment:

- show the same honest empty mechanics state
- show all exact source relationships when available
- preserve shareable URL value

Do not invent mechanics from source ability prose, status keys, or filenames.

### Scope Treatment

Scope should appear in both:

- left rail, as primary browsing model
- archive rows, as compact orientation metadata

Display recommendation:

- `Unit`
- `City`
- `Empire` for exported `Major Empire`
- `Diplomacy` for exported `Diplomatic Ambassy`, pending product/exporter cleanup
- `Treaty`
- `Hero`
- `Territory`

Rows should not rely on color/icon alone for Scope.

### Duration Treatment

Duration should appear:

- in rows when present
- in details when present
- not as first-pass navigation

Rationale:

- Duration exists on 220 / 337 statuses.
- It is especially useful for diplomacy, city, empire, and map statuses.
- It is absent from many unit combat statuses, so row layout must handle missing duration cleanly.

Display cleanup question:

- `1 turns` should become `1 turn` somewhere, but this should be tracked as exporter/display cleanup rather than used to block Status UI.

### Relationship Treatment

Rows:

- Do not show full relationship lists.
- Defer relationship hints until mechanics-first rows are visually accepted.
- If added later, prefer compact hints like `Applied by 2 abilities` or `From Close Borders`.

Details:

- Show grouped source sections.
- Suggested groups:
  - Abilities
  - Diplomatic Treaties
  - Actions
  - Factions
- Show exact links only.

Rationale: sources are trust and exploration value, but row content should answer what the status does first.

### Icon Strategy

Until explicit status icon metadata exists, use the generic Status icon.

Do not use:

- scope icons
- status-effect SVG filename matching
- key/name/prose-derived icons

Rationale: generic icon preserves visual consistency without implying unproven status identity.

### Archive vs Detail Model

Archive answers:

> What does this status do?

Archive should prioritize:

1. Status name.
2. Mechanics/effect preview.
3. Scope.
4. Duration if present.
5. Thin-state fallback if mechanics are missing.

Detail answers:

> What exactly is this status and where does it come from?

Detail should prioritize:

1. Complete mechanics/effects.
2. Affected stat, change, and formula.
3. Duration and Scope.
4. Exact source relationships.
5. Permalink/share confidence.

## Accepted Decisions

- Statuses is an Archive.
- Scope is the strongest first browse model.
- `Status type` is too noisy for primary navigation right now.
- Exact references only.
- No frontend inference from keys, names, prose, or SVG filenames.
- Exporter findings go to the active exporter backlog instead of interrupting frontend category work.
- Thin Status entries remain visible and valid.
- Generic status icons are acceptable until explicit status icon metadata exists.
- Status archive rows should be mechanics/effect-first.
- Scope should appear in both the left rail and rows.
- Duration should appear in rows when present, and in detail when present.
- Full source relationship lists belong in detail first; row source hints are deferred.
- Use the generic Status icon until explicit status icon metadata exists.

## Exporter Findings Recorded

Active exporter backlog:

`docs/active/db-exporter-ability-metadata-handoff.md`

Do not duplicate the full backlog here. Append detailed exporter follow-up there when requested.

| Finding | Status | Backlog |
| --- | --- | --- |
| `Status type` taxonomy is noisy and incomplete. | Non-blocking | Append to active exporter backlog. |
| `Diplomatic Ambassy` spelling appears in exported Scope. | Non-blocking | Append to active exporter backlog. |
| Some Status display names are raw/debug-like. | Non-blocking | Append to active exporter backlog. |
| Some Statuses lack mechanics/effects. | Non-blocking | Append to active exporter backlog. |
| Status-specific icon mapping is not explicit. | Non-blocking | Append to active exporter backlog only if product decides per-status icons are needed. |
| Some status-looking Ability text may lack exact Status references. | Non-blocking | Append to active exporter backlog with examples when found. |
| Singular/plural duration text such as `1 turns` needs cleanup. | Non-blocking | Append to active exporter backlog or handle with accepted display formatting. |

No exporter finding currently blocks Status UI planning if the first slice uses exported `Scope`.

## Open Questions

- After mechanics-first rows are accepted, should rows show compact exact source hints?
- Should thin fallback copy be `No public mechanics exported yet.` or something shorter?
- Should the frontend display-map `Diplomatic Ambassy` to `Diplomacy`, or wait for exporter cleanup?
- Should `1 turns` be display-cleaned locally, or fixed by exporter?
- What cleaned effect-family taxonomy would be useful after `Status type` cleanup?
- Should source relationship cards show source type icons, or simple grouped text links?

## Future Ticket Roadmap

### STATUS-UI-002 - Scope Left Rail Prototype

Goal: Add a Status-specific left rail using exported `Scope`.

Scope:

- Statuses only.
- Use exported `Scope`.
- Keep main panel mostly unchanged.
- Do not add raw `Status type` filters.
- Do not add row relationship hints yet.
- Keep generic Status icon behavior.
- Preserve current detail behavior.

Dependencies:

- Existing exact fact helper.
- Existing Codex left-pane mode patterns.
- Existing Ability Archive rail extraction as a pattern, not a component to copy blindly.

Risk:

- Low data risk.
- Medium visual risk if rail feels too similar to Ability rail.

Ready: yes. STATUS-EVOLUTION-002 found no need for another design pass before STATUS-UI-002.

### STATUS-UI-003 - Status Archive Row Effect Preview

Goal: Make Status overview rows communicate what each status does.

Scope:

- Status overview rows only.
- Show icon/name, Scope, Duration if present, and compact mechanics/effect lines.
- Include thin fallback.

Dependencies:

- Structured description parsing.
- Accepted row hierarchy from STATUS-UI-001A.

Risk:

- Medium, because thin entries need graceful presentation.

### STATUS-UI-004 - Status Detail Effect-First Layout

Goal: Make Status detail pages useful inspection/permalink pages.

Scope:

- Status detail pages only.
- Prioritize effects/mechanics and formula inspection.
- Keep related entries.

Dependencies:

- Row model accepted after visual review.

Risk:

- Low to medium.

### STATUS-UI-005 - Exact Status Relationship Links

Goal: Surface exact source relationships for statuses.

Scope:

- Detail relationship groups first.
- Consider compact row relationship hints only after detail behavior is accepted.

Dependencies:

- Exact reference resolver.
- Product decision on row source hints.

Risk:

- Medium, because relationship coverage is useful but partial.

## Lessons Learned

- Statuses confirms that each category needs its own archive shape; Ability UI should not be copied wholesale.
- Complete facts are not automatically useful facts. `Scope` is ready; `Status type` needs cleanup before primary navigation.
- Thin entries can still be valuable when they are exact link/search targets.
- Relationship value may be directional: Status detail should explain sources even if rows stay focused on mechanics.
- Exporter findings should accumulate in the active backlog while frontend work proceeds on safe exported facts.
- Status archive rows should feel like mechanical condition summaries, not ability cards.
- A category can have complete browse metadata and still need conservative row design because content density varies widely.
