# Codex Landing Evolution Review

Ticket: EW-CODEX-UI-CONCEPT-002
Date: 2026-06-25
Status: product design direction; no implementation
Area: Codex landing

## Purpose

This review defines the smallest meaningful evolution for the Codex landing
before release.

The landing is already useful. It is not being redesigned. The task is to make
the current landing feel more premium and memorable without damaging the
validated retrieval model.

## Validated Constraints

These are treated as product facts:

- Alphabetical categories work.
- Semantic grouping made retrieval worse.
- Players immediately scan alphabetically.
- Search is heavily used.
- Category counts are useful.
- Rich category cards are useful.
- Fast retrieval is sacred.
- The landing page is visited briefly.
- The real product begins after clicking a category.

Any future landing work must protect these facts.

## What Is Already Correct

### Alphabetical Catalogue

The alphabetical category catalogue is the right navigation model. It serves
the way 4X players actually scan: quickly, directly, and with known terms in
mind.

### Search Prominence

Search is correctly present on arrival. It supports the high-intent user who
already knows what they want and should remain a primary retrieval path.

### Category Counts

Counts are useful because they establish scale and set expectations. They help
players understand whether a category is broad, narrow, shallow, or deep.

### Rich Category Cards

The current cards do useful work: icon, title, count, and description give
enough context to choose quickly without forcing another navigation layer.

### Directness

The landing does not over-explain. This is good. Players do not live on the
landing page; they pass through it.

### Trust Signals

Game version and data freshness are correct in principle. They tell players
that EWShop knows what data it is showing and when it was extracted.

## What Should Never Be Changed

- Do not replace alphabetical scan with semantic groups.
- Do not hide categories behind another level of navigation.
- Do not remove category counts.
- Do not demote search.
- Do not turn the landing into a story page.
- Do not create a large hero experience that delays category access.
- Do not reduce the information density that makes the landing useful.
- Do not make the landing the main product. It is the front door, not the room.

## What Should Evolve

### First Viewport Composition

The current landing is correct in parts but still reads as stacked elements:

```text
title
subtitle
search
metadata
catalogue
```

The next evolution should make those parts feel like one composed research
field. The player should not feel that the catalogue begins after the header.
The catalogue should feel like it emerges from the same surface.

### Emotional Promise

The page currently promises access. It should also promise mastery.

Not with more copy. Not with more ornament. With a clearer first impression:

```text
This is where the game's systems become legible.
```

### Research Instrument Feel

Search should remain fast and obvious, but it should feel less like a generic
web input and more like a consultation point inside the Codex.

### Edition Metadata

Entries, categories, and game version should keep their utility while feeling
more like edition marks than statistics.

### Catalogue Continuity

The first row of category cards should feel connected to the landing field.
The catalogue should remain alphabetical, card-based, and fast, but the first
viewport should feel less like a header followed by a grid.

## Ideas To Permanently Reject

### Semantic Category Grouping

Rejected because it harmed retrieval. Do not revisit without new user evidence
stronger than the original validation.

### New Navigation Model

Rejected for this release direction. The navigation is not the problem.

### Giant Hero Section

Rejected because it would overvalue the landing and delay the real product:
category and detail exploration.

### Fantasy Frames Or Decorative Theming

Rejected because premium should come from composition, rhythm, and restraint,
not theatrical framing.

### More Statistics

Rejected because the landing already has enough scale/trust information.
Additional metrics would pull it back toward dashboard territory.

### Artwork-Driven Atmosphere

Rejected for this slice. It risks performance, inconsistency, and a false sense
of quality. The current problem is composition, not missing art.

### Category Reordering

Rejected because alphabetical scanning is validated.

### Landing As Destination

Rejected because the landing is a gateway. The product begins after category
selection.

## If Only One Design Change Is Allowed

**Unify the first viewport into one Research Atlas field.**

This means title, subtitle, search, edition metadata, and the first catalogue
row should feel like one deliberate composition.

Why this is the one change:

- It does not harm alphabetical retrieval.
- It does not change category organization.
- It does not add navigation complexity.
- It improves emotional quality immediately.
- It makes the landing feel authored without slowing players down.
- It directly addresses the jury finding: the page is good, but still feels
  like stacked UI.

This is the smallest conceptual move with the highest emotional return.

## Next Logical Implementation Slice

### EW-CODEX-UI-EVOLUTION-001 - Research Atlas Field

Goal:
Evolve the existing landing first viewport so it feels like one composed
Research Atlas field.

Scope:

- Landing page only.
- Preserve alphabetical category order.
- Preserve search position and behavior.
- Preserve category cards, descriptions, and counts.
- Preserve data freshness/edition information.
- Preserve performance and fast retrieval.

Design target:

The first screen should feel like a compact research surface where lookup,
edition context, and category catalogue belong together.

Acceptance criteria:

- The page still scans alphabetically.
- Search remains immediately discoverable.
- Category cards remain rich and fast to parse.
- Counts remain visible and useful.
- The first catalogue row feels visually connected to the header area.
- The page feels more premium within five seconds.
- The page does not feel slower, heavier, or more decorative.

Do not include:

- semantic category grouping;
- new navigation;
- large hero expansion;
- decorative frames;
- extra metrics;
- artwork-led atmosphere;
- category/detail page redesign.

### EW-CODEX-UI-EVOLUTION-002 - Anchored Landing Surface

Implementation correction:

Research Atlas field means a composed retrieval surface, not a detached
decorative glow field. The landing should stay visually anchored to the
Endless Workshop shell/content rhythm, keep a comfortable max width, and avoid
obvious artificial gradients or lighting washes.

Keep from `EW-CODEX-UI-EVOLUTION-001`:

- title, subtitle, search, metadata, and catalogue should read as one field;
- search and metadata should feel related;
- category cards should remain calm, readable, and fast to scan.

Correct from `EW-CODEX-UI-EVOLUTION-001`:

- do not center the landing surface so far that it creates a large blank left
  gutter;
- do not use visible landing-only glow/lighting effects as the source of
  premium feeling;
- prefer anchoring, spacing, typography, and quiet surfaces.

### EW-CODEX-LANDING-001 - Production Layout Cleanup

Accepted correction:

The Research Atlas identity remains useful as product language, but the
experimental landing implementation is not the release baseline. The current
accepted landing baseline is the production-style layout:

- content stays left-aligned to the Endless Workshop shell;
- the `Encyclopedia` header remains compact;
- the category catalogue stays wide, alphabetical, and scan-first;
- category cards keep counts and descriptions;
- search remains immediately available;
- no atlas-field lighting, decorative gradients, hero expansion, semantic
  grouping, or centered landing surface.

Small cleanup is allowed when it improves the existing production layout:

- remove duplicate or standalone analytical chrome;
- soften unnecessary divider lines;
- lightly improve search/card polish;
- preserve category/detail pages.

## Final Recommendation

Codex should evolve, not reinvent.

The landing's product model is right. The release-quality baseline is the
production-style, retrieval-first catalogue layout. Future work should improve
that baseline with restraint instead of introducing a new landing composition.
