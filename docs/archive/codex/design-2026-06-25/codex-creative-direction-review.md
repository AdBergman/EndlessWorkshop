# Codex Creative Direction Review

Ticket: EW-CODEX-UI-ART-001
Date: 2026-06-24
Status: creative direction; no implementation
Area: Codex landing experience

## Purpose

This review asks what a player should feel when opening the Codex, before any
implementation details are considered.

The Codex should not be only a useful category index. It should make Endless
Workshop feel like a premium companion for a living strategy world: trustworthy,
curated, atmospheric, and worth returning to.

## Inputs Reviewed

- `docs/active/codex-landing-premium-redesign-review.md`
- `docs/active/codex-premium-ui-design-baseline.md`
- `docs/active/codex-premium-ui-ticket-plan.md`
- `docs/quest-explorer/README.md`
- `docs/archive/quest-explorer/quest-explorer-ux-design-template.md`
- Current Codex landing implementation and screenshots from the premium
  catalogue pass

The exact `EWShop Premium UX Charter` file was not present under that title in
the active docs; the active Codex premium baseline and Quest Explorer design
template were used as the current project-level design references.

## Current Emotional Problem

The current Codex is competent. It reads quickly. It communicates structure. It
does not waste the player's time.

Its weakness is memory. After five seconds, a player can say what it does, but
not what it is. It still feels closer to a polished web index than to an
official strategy-game archive.

Quest Explorer has a stronger identity because it offers a point of view:
chronicle, campaign, branching history, and strategy. Codex needs its own point
of view, not a borrowed Quest Explorer mood.

## Creative Directions

### 1. The Imperial Atlas

Emotional identity:
The player feels they have opened a strategic atlas of a newly catalogued world:
part encyclopedia, part command reference, part historical survey.

Visual language:
Dark cartographic depth, restrained gold labeling, thin survey lines, luminous
ink, quiet plate-like category regions, and the feeling of a table-sized
reference volume. The page should imply geography, factions, systems, and
taxonomy without drawing an actual map.

Typography:
A strong editorial serif for the main title, supported by compact technical
metadata in a disciplined small-cap style. Category names should feel like
atlas entries, not dashboard modules.

Spacing philosophy:
Composed and generous, but not empty. The catalogue should sit in a measured
reading field with strong margins, like a double-page atlas spread. Density is
acceptable when rhythm is deliberate.

Information hierarchy:
1. World archive identity.
2. Search as a research instrument.
3. Category catalogue as the atlas index.
4. Counts and version as publication metadata.

Interaction philosophy:
Interactions should feel like selecting a plate, chapter, or index entry. Hover
states can reveal subtle luminous intent, but should not bounce, glow loudly, or
perform. This is a tool for serious strategic reading.

Atmosphere:
Deep charcoal, cool teal-black shadows, controlled amber warmth, and the sense
of an illuminated archive table. Premium comes from restraint and precision.

Why it fits Endless Legend 2:
Endless Legend is about civilizations, terrain, ruins, factions, and long-term
planning. An atlas lets Codex feel strategic rather than merely informational.
It also avoids copying Quest Explorer's chronicle identity.

### 2. The Royal Archive

Emotional identity:
The player feels they are entering an official imperial record office: curated,
authoritative, formal, and permanent.

Visual language:
Archive stamps, ledger-like hierarchy, catalogue plates, restrained separators,
and controlled negative space. The page should evoke a state archive or royal
library without becoming parchment, fantasy framing, or bureaucracy.

Typography:
Formal serif title, highly disciplined labels, and clear category typography.
Metadata should feel like accession records: edition, version, category count,
and entry count.

Spacing philosophy:
More ceremonial than dense. The landing should give the title a formal moment,
then move into a well-ordered catalogue. Category entries can feel like record
cards, but must avoid dashboard boxes.

Information hierarchy:
1. Authority of the archive.
2. Edition/version trust.
3. Category catalogue.
4. Search and direct retrieval.

Interaction philosophy:
Quiet, precise, and archival. The interface should feel like retrieving a
record from a well-maintained collection.

Atmosphere:
Warm dark rooms, illuminated labels, subtle gold, and a sense of institutional
depth. Less strategy-table, more curated repository.

Why it fits Endless Legend 2:
It matches the idea of factions, technologies, heroes, and systems being
catalogued as official knowledge. It risks becoming too static if not balanced
with strategic energy.

### 3. The Research Observatory

Emotional identity:
The player feels they are using an advanced companion observatory: analytical,
futuristic, and alive with extracted game knowledge.

Visual language:
Layered dark glass, sparse data constellations, luminous nodes, cool science
fiction gradients, and precise search-first affordances. It should feel
intelligent, but not like admin telemetry.

Typography:
Modern sans-serif for systems clarity, with a restrained editorial title to
avoid becoming generic SaaS. Labels can be sharper and more technical.

Spacing philosophy:
Airier, with strong modular spacing and selective highlighted panels. It can
support a more modern knowledge-system identity, but must avoid dashboard
metrics.

Information hierarchy:
1. Search and knowledge extraction.
2. Category constellation.
3. System relationships.
4. Freshness and source metadata.

Interaction philosophy:
Fast, responsive, and discovery-oriented. Hover states could feel like focusing
a lens, but not like scanning a database.

Atmosphere:
Cooler and more luminous than the archive directions. It would pair well with
exact references, relationships, and future enrichment.

Why it fits Endless Legend 2:
It connects with science, discovery, and extracted data. The risk is that it
could drift away from Endless Legend's mythic-historical texture and become too
generic-futurist.

### 4. The Living Encyclopedia

Emotional identity:
The player feels they are opening a definitive companion volume that is
continuously updated from the game.

Visual language:
Editorial book design translated to web: title page, index, entries, colophon,
and gentle hierarchy. This is the most literal extension of the current
direction.

Typography:
Serif title, clear category headings, quiet metadata. More bookish than
strategic.

Spacing philosophy:
Readable, calm, and highly conventional. It should feel professional and
durable, but it may not become memorable enough.

Information hierarchy:
1. Encyclopedia title.
2. Search.
3. Alphabetical index.
4. Archive edition.

Interaction philosophy:
Book index behavior: stable, direct, no theatrics.

Atmosphere:
Quiet and scholarly. Premium through polish, not spectacle.

Why it fits Endless Legend 2:
It is safe and understandable. It fits the product, but may undersell the
world's strategic and atmospheric richness.

### 5. The Museum Collection

Emotional identity:
The player feels they are browsing a curated exhibition of systems, factions,
heroes, and artifacts.

Visual language:
Object labels, collection plaques, controlled spotlighting, and category
groupings that feel like exhibit rooms.

Typography:
Elegant museum-label hierarchy: accession label, title, short description,
collection metadata.

Spacing philosophy:
More space around each category, fewer visible entries above the fold, stronger
object focus.

Information hierarchy:
1. Curated collection identity.
2. Highlighted categories or exhibits.
3. Full catalogue.

Interaction philosophy:
Exploratory and contemplative. This is weaker for fast 4X lookup unless kept
very disciplined.

Atmosphere:
Beautiful, calm, and premium. Potentially too passive for a strategy companion.

Why it fits Endless Legend 2:
It could make artifacts, factions, and wonders feel special. It fits lore and
worldbuilding better than planning and comparison.

## Ranking

1. **The Imperial Atlas**
2. **The Royal Archive**
3. **The Living Encyclopedia**
4. **The Research Observatory**
5. **The Museum Collection**

## Top Three Directions

### First: The Imperial Atlas

This is the strongest direction because it combines premium atmosphere with 4X
utility. It can feel strategic, world-specific, and memorable while still
supporting alphabetical scanning and fast lookup.

It gives Codex an identity distinct from Quest Explorer:

- Quest Explorer: a chronicle of events and choices.
- Codex: an atlas of systems, peoples, places, and rules.

### Second: The Royal Archive

This is the most authoritative direction. It would make Codex feel official,
stable, and carefully maintained. It is excellent for trust and durability, but
slightly less exciting than the atlas because it emphasizes custody over
strategy.

### Third: The Living Encyclopedia

This is the safest direction and closest to the current implementation. It
would age well if executed beautifully, but it risks remaining generic: many
products can be a polished encyclopedia, while fewer can own a strategic atlas
identity.

## Winner

**The Imperial Atlas** wins.

It best answers the core product question: the player should feel they are not
just browsing data, but surveying the known world of Endless Legend 2.

Why it wins:

- It is emotionally stronger than a documentation index.
- It is more strategic than a museum collection.
- It is more memorable than a generic encyclopedia.
- It can borrow Quest Explorer's atmospheric confidence without copying its
  chronicle structure.
- It scales to future Codex improvements: factions, heroes, units, tech,
  wonders, victory, resources, and relationships all belong naturally in an
  atlas.

## Professional Design Judgement

Most likely to age well over five years:
**The Royal Archive**. Formal archive design is durable because it relies on
typography, restraint, and structure rather than trend.

Most premium:
**The Imperial Atlas**. It has the strongest mix of atmosphere, strategy, and
world identity.

Most memorable to players:
**The Imperial Atlas**. "I opened a strategic atlas of the world" is a more
distinct memory than "I opened a clean encyclopedia index."

## Directional Principles For Future Design

1. Codex should feel surveyed, not listed.
2. Categories should feel like regions of knowledge, not app widgets.
3. Metadata should feel like publication data, not analytics.
4. Search should feel like research, not a utility field dropped onto a page.
5. Counts should support trust and scale without becoming dashboard metrics.
6. Atmosphere should come from depth, light, typography, and spacing, not art
   pasted behind the page.
7. The page should be memorable in five seconds without becoming decorative.
8. The first screen should imply a larger world beyond the visible grid.
9. The design should respect 4X player urgency: beautiful, but never slow to
   scan.
10. Codex should remain distinct from Quest Explorer: atlas versus chronicle.

## Estimated Premium Score If Executed Perfectly

**9 / 10**

The missing final point would require a fully bespoke visual language across
Codex category and detail pages, not only the landing page.

## One-Sentence Emotional Goal

The player should feel they have opened a luminous strategic atlas of Endless
Legend 2, where every faction, system, artifact, and rule belongs to a world
worth mastering.

## First Impression Sentence

This is not a wiki; it is the command atlas for understanding an entire world.

## Appendix: Art Direction Review Of First Imperial Atlas Implementation

Ticket: EW-CODEX-UI-ART-002
Date: 2026-06-24
Verdict: **reject as Imperial Atlas; approve only as a cleaner premium index**

The implementation is materially better than the earlier dashboard/index
presentation. It is calmer, more readable, and less boxed. It does not yet
express the Imperial Atlas direction.

The hard test is this: if the word `Encyclopedia` disappeared, the page would
not read as an atlas. It would read as a well-styled application landing page
with category cards. That is not enough.

### Composition

The eye travels from the app header to the oversized title, then to search,
then to the card grid. This is a normal web-page reading path. It is arranged
clearly, but it is not composed as a world-facing surface.

An atlas composition should feel like one deliberate table spread or survey
plate. The current composition has no central visual idea binding the title,
search, metadata, and categories together. Each layer is competent on its own,
but the whole is still additive rather than authored.

### Visual Weight

The title carries too much of the identity. The category grid carries the
utility. The background carries almost none of the concept.

That means the page's emotional identity depends on a large serif word. Remove
the word and the atlas disappears. In an Imperial Atlas direction, the visual
weight should be shared by:

- a composed reading/survey field,
- cartographic rhythm,
- publication metadata,
- category regions,
- controlled light.

The current design mostly asks typography to do that job alone.

### Atlas Identity

The categories do not yet feel like regions of knowledge. They feel like
quietly improved boxes. The page does not imply geography, surveying,
classification, or world structure.

There is no sense of an archive table, plate system, index map, compass logic,
survey grid, or world catalogue. It does not need literal map art, but it does
need a compositional metaphor stronger than "cards in rows."

### Hierarchy

The page says, "I am entering a page." It does not yet say, "I am entering a
world."

The metadata line is helpful, but it still reads as page statistics. The
freshness block is better as a colophon, but it sits after the grid rather than
helping establish an editioned atlas identity at the moment of arrival.

### Negative Space

The whitespace is cleaner than before, but not fully intentional. The large
upper-left title space feels inherited from editorial web layout, not from an
atlas spread. The space around the grid is useful breathing room, but it does
not create ceremony, direction, or discovery.

Atlas negative space should feel measured, like margins around a plate. Current
negative space feels like responsive page padding.

### Search

Search still feels like an input field. It does not yet feel like research.

It sits under the intro in the right place structurally, but the visual
treatment says "type here" more than "consult the archive." A research control
should feel integrated into the atlas surface: quieter, more intentional, and
less like a generic product search box.

### Categories

The categories are the strongest practical success. They are readable, fast,
and less noisy than before.

But they still feel like boxes. They do not feel like regions, plates, shelves,
or catalogue divisions. The count placement and repeated card geometry keep
pulling the page back toward "application index."

### Atmosphere

Atmosphere cannot be solved by dark background alone. Without artwork, it must
come from:

- lighting that guides the eye through the page,
- gradients that create depth rather than flat darkness,
- rhythm that makes the grid feel surveyed rather than repeated,
- typography that distinguishes title, plate labels, and edition metadata,
- spacing that creates the feeling of a composed object.

The current implementation has darkness and some polish. It does not yet have
spatial drama or cartographic tension.

### Quest Explorer Comparison

Quest Explorer has presence because every layer participates in its idea:
chronicle structure, ornamental separators, left navigation, active questline,
step rhythm, objective/reward grouping, atmospheric image depth, and warm/cool
lighting all say "campaign record."

Codex currently has title, search, metadata, and category cards. Those are
correct parts, but they do not yet add up to a distinctive object. Quest
Explorer feels authored. Codex still feels assembled.

### AAA Design Review Decision

I would not approve this as the Imperial Atlas direction.

I would approve it as an interim premium index because it is usable and calmer
than the previous version. But as an art-direction milestone, it fails the
central identity test: it is not memorable enough, and it does not project a
world.

Reasons for rejection:

1. Atlas identity is not visible without the title.
2. The composition lacks a unifying survey/plate metaphor.
3. Category entries still read as cards, not regions of knowledge.
4. Search remains a generic input rather than a research instrument.
5. Atmospheric depth is too even and too passive.
6. Metadata still leans statistical rather than publication-grade.
7. The page is pleasant, but not iconic.

### Strongest Success

The strongest success is restraint. The page is not noisy, gimmicky, or
over-decorated. It preserves fast scanning and avoids fantasy-frame excess.
That restraint is valuable and should not be thrown away.

### Biggest Failure

The biggest failure is conceptual authorship. The implementation improved the
surface, but it did not transform the experience into a strategic atlas. It is
still a page of well-behaved category tiles.

### Five Highest-Impact Visual Changes

1. **Create a true atlas field.**
   The landing needs a composed survey surface that binds title, search,
   metadata, and catalogue together. This does not mean adding a heavy frame.
   It means the first screen should feel like a plate or table spread, not
   separate page elements stacked vertically.

2. **Make categories read as regions of knowledge.**
   Replace the equal-card rhythm with a more atlas-like catalogue rhythm:
   entries should feel indexed, plotted, or plated. They can remain
   alphabetical, but their visual grouping should imply a world taxonomy rather
   than a component grid.

3. **Turn search into a research instrument.**
   Search should feel embedded in the archive system. It needs visual language
   closer to a lookup field in a reference atlas: precise, quiet, authoritative,
   and integrated with the publication metadata.

4. **Use lighting to create arrival.**
   The page needs directional light and depth. The current background is dark
   but not especially spatial. A controlled luminous field should guide the eye
   from title to catalogue and imply hidden depth beyond the visible entries.

5. **Recast metadata as edition marks.**
   Entry count, category count, game version, and snapshot should feel like
   publication marks on an atlas edition. They should not compete as stats or
   sit as loose text.

If only one thing could change:
**Create the true atlas field.** Without that, every other improvement remains
surface polish on a conventional web index.

### Expected Premium Score After Those Five Changes

**8.8 / 10**

That would likely be strong enough for release-quality premium identity while
preserving speed and clarity. A full 9+ would require carrying the same atlas
language into category overview and detail pages, not only the landing.

## Appendix: Atlas Field Composition

Ticket: EW-CODEX-UI-ART-003
Date: 2026-06-24
Verdict: **reject current first viewport as a single composition**

The current first viewport is improved, but it is still a sequence:

```text
Title
Subtitle
Search
Metadata
Catalogue
```

That is a clear arrangement, not an authored atlas field.

The Atlas Field should be the complete first-screen composition. It is not a
new section, panel, decoration, or frame. It is the visual condition that makes
everything above and including the first catalogue row feel like one strategic
survey surface.

### Eye-Flow Sketch

Current eye flow:

```text
App logo/navigation
    ↓
Large title
    ↓
Subtitle
    ↓
Search field
    ↓
Metadata line
    ↓
Card grid
```

The eye stops at each object. Each element asks to be read independently.

Desired eye flow:

```text
World-entry title
    ↘
        research/search instrument
            ↘
                edition marks
                    ↘
                        first row of knowledge regions
                            → continued atlas catalogue
```

The eye should not fall down a stack. It should glide through a single
composed field, from identity to research to surveyed knowledge.

### Composition Critique

The current page is balanced in a conventional web sense: title at top, search
below, grid beneath. It is not balanced in an atlas sense.

An atlas spread has a governing field. The title, labels, scale marks, and
plates feel like they share one invisible geometry. Current Codex does not yet
have that invisible geometry. The title sits above. Search sits below. Metadata
sits below that. The catalogue starts afterward.

This creates a psychological seam: the player reads the top as "page header"
and the catalogue as "navigation content." The Atlas Field must remove that
seam. The catalogue should feel like it is already part of the title's world,
not the next block after it.

### Visual Gravity Analysis

Current visual gravity:

1. The title.
2. The repeated category tiles.
3. The app navigation.
4. Search.
5. Metadata.

This is backwards for the Imperial Atlas.

The true focal point should be the field itself: the moment where world
identity, research, edition marks, and category regions converge. The title
should name the field, not dominate it. Search should sit inside the field, not
interrupt it. Metadata should certify the field, not summarize the page.

The catalogue should carry more conceptual weight than the title because it is
where the world becomes visible.

### Negative Space

Current empty space is mostly functional. It separates stacked elements. It
does not yet create arrival.

Intentional Atlas Field space should behave like margin around a printed plate:
measured, tense, and directional. It should make the player feel that the
visible knowledge has been placed with care. Empty areas should guide the eye
toward the first catalogue row and imply depth beyond it.

Accidental space:

- the gap between metadata and catalogue, which reads as block separation;
- the open darkness to the right of the title area, which does not yet hold
  meaning;
- the lower emptiness after the partial final catalogue row, which feels like
  leftover page rather than atlas continuation.

### Relationships

Elements that belong together:

- title, subtitle, search, entry count, category count, game version;
- search and metadata, because both are research/context tools;
- first catalogue row and the header field, because the catalogue is the
  evidence of the world being surveyed.

Elements that should separate:

- global app navigation from the Atlas Field;
- archival colophon from primary arrival, unless it is treated as a quiet
  edition mark rather than a bottom note;
- individual category descriptions from atmospheric identity. Descriptions
  should support scanning, not become the emotional voice of the page.

### Search

Search should feel like a research instrument inside the atlas.

It should not feel like a generic web input dropped under a heading. A research
instrument has purpose, restraint, and authority. It feels like the player is
consulting the archive, not filling out a form.

Compositionally, search should participate in the same visual gravity as the
title and edition marks. It should help complete the Atlas Field. It should not
create a separate stop in the eye path.

### Metadata

Entries, categories, and game version should feel like edition marks printed
inside an atlas.

They should answer:

- What edition is this?
- What world snapshot does it describe?
- How complete is this volume?

They should not feel like analytics. "2,505 entries" is not a KPI. It is an
accession mark. "21 categories" is not a dashboard stat. It is the structure of
the volume. "Endless Legend 2 v0.82" is not support metadata. It is the edition
stamp.

### Arrival

Arrival should come from composition, not ornament.

The first instant should communicate:

- this is a deliberate place;
- the world has been surveyed;
- the knowledge is authoritative;
- the catalogue is alive below the surface.

Without artwork, this must be created through:

- directional light that gathers the first viewport into one field;
- a measured rhythm between title, research, marks, and catalogue;
- depth that makes the page feel spatial rather than flat;
- typography that separates world title from edition marks;
- category rhythm that suggests mapped knowledge rather than equal cards.

### First Viewport Composition Description

The Atlas Field should feel like a dark strategic table viewed from above. The
title is the inscription at the top of the plate. The subtitle is a quiet
orientation line, not a marketing sentence. Search is embedded like an index
lookup on the plate. Metadata appears as edition marks printed into the same
surface. The catalogue begins before the eye feels it has left the field.

The first row of categories should feel like the first visible territories of
the atlas. The rows below should feel like continuation, not a separate grid.

The light should not spotlight the title alone. It should move diagonally
through title, search, metadata, and first catalogue row, creating a single
path of arrival.

### Top Five Composition Changes

1. **Bind the header and first catalogue row into one field.**
   The first catalogue row must feel like it emerges from the same visual
   surface as the title and search. This is the core Atlas Field correction.

2. **Shift visual gravity from title to field.**
   The title should become an inscription within the composition, not the
   composition itself.

3. **Make search and metadata part of one research band.**
   Search, entries, categories, and version should read as one atlas control
   layer: lookup plus edition marks.

4. **Create directional movement through light and spacing.**
   The eye should move diagonally or rhythmically into the catalogue, not drop
   vertically from widget to widget.

5. **Reduce the card-grid reading of the first row.**
   The first row should feel like knowledge regions on a survey plate. Later
   rows can remain highly scannable, but the entry into the catalogue must
   carry more world identity.

### Single Highest-Impact Change

**Bind the header and first catalogue row into one Atlas Field.**

If that relationship is solved, the rest of the page can remain restrained and
efficient. If it is not solved, every polish pass will continue to feel like
making a web page nicer rather than making a world archive real.

### Composition Score

Current first-viewport composition: **5.8 / 10**

It is competent and readable. It is not yet authored.

Expected premium score after solving the Atlas Field: **8.7 / 10**

That score assumes the catalogue remains fast, alphabetic, and readable while
the first viewport gains a true sense of arrival.
