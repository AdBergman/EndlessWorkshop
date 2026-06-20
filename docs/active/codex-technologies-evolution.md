# Codex Technologies Evolution

## Purpose

Technologies are being reviewed through the Codex Category Evolution Playbook so the Codex entry point supports player-facing browsing without duplicating the dedicated `/tech` tree experience.

This document is the working memory for Technologies category evolution. It records findings, accepted decisions, implementation results, exporter findings, and closeout notes.

## Current State

- Codex Technologies now use compact Archive support inside Codex.
- The dedicated `/tech` route already owns the rich progression/tree experience, route hydration, faction/tech selection, and spreadsheet-style tech views.
- Codex Technology detail pages already have stronger structured unlock rendering through exact exported unlock references.

## Data Audit

- Entry count: 133 Technology entries in the local 0.82 Codex export.
- Trustworthy exported facts:
  - `Kind`: 133
  - `Tier`: 133
  - `Era`: 133
  - `Quadrant`: 133
  - `Faction`: 60
- Trustworthy sections:
  - `Unlocks`: 107 entries have unlock sections.
  - `Effects`: 97 entries have public effect lines.
- Exact references:
  - Tech entries include exact references for factions and unlock targets when available.
- Raw tech export includes richer tree/progression fields, but those are owned by the dedicated Tech route and should not be re-derived inside Codex.

## Browse Audit

Technologies are not a pure reference sheet. 133 entries is too many for a flat generic list, and players naturally browse by planning dimensions:

- Era/Tier progression.
- Quadrant such as Defense, Society, Development, Discovery.
- Optional faction-specific techs.
- Unlocks and public effects.

The dedicated `/tech` route remains the proper Explorer for progression. Codex should become an Archive companion for search, reference, and exact unlock inspection.

## Accepted Decisions

- Technologies are an **Existing route-owned Explorer with Codex Archive support**.
- Do not duplicate the `/tech` tree inside Codex.
- Codex Technology rows should emphasize public effects and exact unlocks.
- Era, Quadrant, and Faction are safe exported facts for initial browse/navigation.
- Faction is optional and must remain based on the exported `Faction` fact only.
- Do not infer prerequisites, progression, faction ownership, or icons from names, keys, prose, or SVG filenames.
- Detail pages keep the existing structured unlock summaries.

## Proposed UI Model

### Left Rail

Use a compact Technology archive rail with:

- Era
- Quadrant
- Faction

The rail is orientation and filtering support, not a replacement for the tech tree.

### Archive Rows

Technology rows should show:

- Technology name.
- Public effect preview lines when present.
- Compact exact unlock links when present.
- Quiet right-side metadata:
  - Era
  - Quadrant
  - Faction when present

Rows should not show raw prerequisites, hidden progression state, or generic taxonomy.

### Detail Pages

Technology detail pages should continue to provide:

- Complete exported facts/sections.
- Existing exact unlock summary cards.
- Related entries.
- Shareable URL/permalink inspection value.

## Exporter Findings

No blocking exporter findings.

Potential non-blocking follow-up:

- If future Codex Tech rows need prerequisite/progression hints, exporter should emit explicit public Codex facts rather than requiring frontend derivation from raw tech tree data.

Recorded in the active exporter backlog:

- Technology progression/prerequisite metadata is raw-route data today, not public Codex metadata.

## Open Questions

- Whether Codex rows should later show prerequisite hints if exporter provides public facts.
- Whether the visible Codex category label should remain `Tech` or become `Technologies`; current project convention uses `Tech`.
- Whether faction-specific techs deserve stronger identity once exporter/icon metadata contracts are stable.

## Implementation Roadmap

### TECHNOLOGIES-UI-001 — Technology Archive Rail and Row Foundation

- Add Technology archive mode.
- Add Era/Quadrant/Faction rail filters.
- Add effect-first archive rows with compact exact unlock links.
- Keep detail behavior unchanged.

### Future Follow-Ups

- Consider prerequisite/progression hints only if exported as public Codex facts.
- Consider improved faction identity only with explicit references/icons.

## Closeout Notes

TECHNOLOGIES-UI-001 implemented:

- Added Tech Archive mode.
- Added Era/Quadrant/Faction left rail filters from exported facts only.
- Added effect-first Technology archive rows.
- Added compact exact `Unlocks:` links for resolved unlock references.
- Kept unresolved unlock references out of archive rows.
- Kept Tech detail pages and the dedicated `/tech` route unchanged.

Product review:

- UX designer: the category now has enough orientation for 133 entries without duplicating the Tech tree.
- Frontend tech lead: the implementation follows existing product-specific archive patterns; no generic framework was introduced.
- 4X player: rows answer the archive-level questions: era, branch/quadrant, public effect, and what it unlocks.

Validation:

- Targeted Codex tests passed.
- TypeScript passed.
- Production build passed.
- Browser smoke was attempted through the in-app browser and headless Chrome. The in-app browser connector failed during setup, and the local `127.0.0.1:5173` app refused connection during the Chrome fallback, so no pixel-level browser acceptance was completed.

Completion decision:

- Complete with follow-up recommended.
- Follow-up only if exporter later provides explicit public prerequisite/progression metadata or if product review wants stronger faction identity.
