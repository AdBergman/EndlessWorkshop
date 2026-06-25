# Codex Product Experience Review

Ticket: EW-CODEX-UX-001
Date: 2026-06-24
Status: product experience review; no implementation
Area: Codex / Research Atlas

## Purpose

This review evaluates Codex as a complete product experience, not as a set of
individual category pages.

The core question:

Does Codex now feel like a coherent premium knowledge product for Endless
Legend 2, or does it feel like a collection of strong pages that have not yet
fully converged into one product identity?

## Inputs Reviewed

- `docs/archive/codex/design-2026-06-25/codex-creative-direction-review.md`
- `docs/active/codex-spiritual-parent-review.md`
- `docs/archive/codex/design-2026-06-25/codex-landing-premium-redesign-review.md`
- `docs/active/codex-premium-ui-design-baseline.md`
- `docs/quest-explorer/README.md`
- `docs/archive/quest-explorer/quest-explorer-ux-design-template.md`
- Quest Explorer target references in `docs/design-references/`
- Current Codex landing, category overview, and detail screenshots from the
  latest premium pass

The exact `EWShop Premium UX Charter` file was not present under that title in
the active docs; the active premium Codex baseline and Quest Explorer design
template were used as the current product-design references.

## Executive Product Conclusion

Codex has become a useful product, but not yet a fully coherent one.

The strongest work is in **Entry Detail**. Detail pages most often deliver the
Research Atlas promise: the player studies a specific thing, sees what matters,
and follows exact relationships.

The weakest reusable experience is **Category Overview**. It is highly useful,
but it still often feels like entering a filtered list rather than entering a
field of study.

The landing is improving, but it remains more successful at access than at
promise. It tells the player where to begin, but it does not yet make the
player feel, instantly, "this is where I understand Endless Legend 2."

## Experience 1: Landing

### Product Role

The landing should make the first promise:

```text
This is the research atlas of Saiadha.
Start here when you want the world to become legible.
```

It must support both lookup and exploration. A player should feel they can
arrive with a question or arrive with curiosity.

### Current Strengths

- It establishes scale with entry/category counts.
- It exposes all visible categories directly.
- It supports quick retrieval through search.
- It is calmer and less dashboard-like than earlier versions.
- It now has a more premium editorial tone.
- The data freshness/edition idea builds trust.

### Current Weaknesses

- The emotional promise is still soft.
- The first impression is "nice index page" more than "research atlas."
- Search is available, but not yet emotionally framed as research.
- Category cards are readable, but still behave emotionally like a catalogue
  grid rather than fields of study.
- The page establishes access better than atmosphere.
- The edition metadata is useful, but it does not yet fully feel like a source
  of authority.

### Product Assessment

The landing is no longer embarrassing. It is coherent enough for release. But
it is not yet memorable.

It establishes trust and scale reasonably well. It encourages lookup more
strongly than exploration. It does not yet create the feeling of entering a
world-scale knowledge system.

### Landing Score

**7.0 / 10**

Good access surface. Incomplete emotional identity.

## Experience 2: Category Overview

### Product Role

Category overview is where Codex should shift from "whole encyclopedia" to
"field of study."

A player choosing Heroes, Units, Technology, Equipment, Abilities, Districts,
or another category should feel:

```text
I am now studying one domain of the game.
The page is helping me compare, filter, and understand that domain.
```

### Current Strengths

- The shared category structure is practical and fast.
- Filters/rails often support real player questions.
- Many rows now expose meaningful comparison data instead of generic records.
- Search and direct category navigation remain efficient.
- Overview headers provide clear category identity.
- The row work across major categories has dramatically improved scan value.

### Current Weaknesses

- Too many category overviews still feel like "filtered Codex results."
- Field identity varies heavily by category.
- The reusable page pattern does not always communicate why this category
  matters.
- Filters can feel like utility controls rather than research lenses.
- Overview headers name the category but rarely frame the study question.
- The emotional rhythm is flatter than the information quality deserves.

### Product Assessment

Category overview is the main product consistency gap.

This is where the Codex has the strongest risk of feeling assembled from many
successful category passes rather than designed as one system. The rows and
filters are often good, but the page-level experience does not always say:
"you are now studying a strategic domain."

Category pages do not need more decoration. They need clearer domain framing:
what this category helps the player understand, compare, and decide.

### Category Overview Score

**6.8 / 10**

Useful and increasingly rich, but still the weakest shared experience.

## Experience 3: Entry Detail

### Product Role

Entry detail should be the research plate: one subject, its identity, its
mechanics, its relationships, and its strategic meaning.

The player should feel:

```text
I am studying a real part of the world, not reading an exported record.
```

### Current Strengths

- Detail pages are often the most premium-feeling Codex surfaces.
- Rich enrichment has made major entries meaningfully more useful.
- Relationships and exact links generally support study instead of noise.
- Detail hierarchy is improving: identity, mechanics, stats, relationships,
  unlocks, and notes usually have distinct roles.
- Hero and faction-style detail enrichment shows the Research Atlas direction
  most clearly.
- The detail experience is where Codex best competes with an official
  companion product.

### Current Weaknesses

- Detail quality varies by available data and category maturity.
- Some entries still expose thin or awkward source material.
- There is not yet a fully unified reading rhythm across all detail types.
- Relationship density can still become high when source data is abundant.
- Some detail pages feel like dossiers; others feel like reference notes. That
  is acceptable, but the distinction needs stronger product language.

### Product Assessment

Entry detail is the strongest reusable experience.

It most clearly answers the player question: "Why does this matter, and what is
it connected to?" This is where the Codex stops being a database and becomes a
study tool.

The next step is not to make all detail pages identical. The next step is to
define shared reading rhythms for entry types: dossier, reference plate,
mechanical rule, progression item, and relationship hub.

### Entry Detail Score

**8.0 / 10**

Strongest current experience. Needs consistency and type-language refinement,
not a broad redesign.

## Consistency Review

### Visual Consistency

Codex now has a recognizable visual tone: dark, restrained, gold-accented,
serif-led for major headings, compact for data surfaces.

The inconsistency is not color or typography alone. It is conceptual weight.
Landing, category overview, and detail pages do not always feel like three
states of one Research Atlas. They feel like:

- landing: premium index;
- category: filtered study table;
- detail: research dossier.

Those are adjacent, but not fully unified.

### UX Consistency

The interaction model is consistent: search, category selection, filters, rows,
details, and exact links generally behave predictably.

The UX gap is purpose clarity. The player understands how to use Codex, but not
always what mode they are in:

- Am I browsing the whole world?
- Am I comparing a domain?
- Am I studying a subject?

The product needs stronger mode language without adding friction.

### Emotional Consistency

The emotional identity is uneven.

Detail pages often feel like study. Landing feels like access. Category
overview feels like utility. For the Research Atlas direction to land, all
three must express different levels of the same promise:

- landing: enter the atlas;
- category: study a domain;
- detail: inspect a subject.

## Reusable Patterns

Current reusable patterns worth preserving:

- Direct search as a primary retrieval tool.
- Alphabetical landing catalogue for broad access.
- Category rails/filters when they answer real player questions.
- Compact archive rows optimized for comparison.
- Detail enrichment through exact relationships.
- Hidden/support categories kept out of top-level browsing when they do not
  serve players.
- Data freshness as trust/edition context.

Patterns needing stronger product language:

- Category overview headers.
- Filter/rail purpose.
- Category row metadata hierarchy.
- Detail type differences.
- Relationship prominence levels.
- Edition/source metadata tone.

## Biggest Remaining UX Debt

The biggest remaining UX debt is **category field identity**.

The Codex has many good rows and many good details, but category pages do not
yet consistently answer:

```text
What am I studying here?
What decisions does this category help me make?
How should I compare these entries?
```

Until that is solved, Codex will feel like a very good encyclopedia with strong
detail pages, not yet a fully authored Research Atlas.

## Top 10 Future UX Tickets

### 1. Strengthen Category Field Identity

Why:
Category overviews are the weakest shared experience and often feel like
filtered lists.

Expected player value:
Players will understand what each domain helps them compare and decide.

Estimated effort:
Medium-high.

Dependencies:
Requires product language for category modes and careful review across major
category families.

### 2. Define Research Atlas Mode Language

Why:
Landing, category overview, and detail need shared language that describes
their roles without becoming instructional text.

Expected player value:
The product will feel coherent and intentional across navigation depth.

Estimated effort:
Medium.

Dependencies:
Should follow the Research Atlas direction from the spiritual parent review.

### 3. Improve Landing Promise

Why:
The landing provides access but does not yet create enough emotional arrival.

Expected player value:
First-time players immediately understand Codex as the place to master the
game's systems, not merely browse categories.

Estimated effort:
Medium.

Dependencies:
Requires the Atlas Field composition problem to be solved first.

### 4. Refine Detail Reading Rhythm

Why:
Detail pages are strongest, but rhythm varies across entry types.

Expected player value:
Players can study different entry types with less relearning and more
confidence.

Estimated effort:
Medium.

Dependencies:
Requires defining detail types: dossier, reference plate, mechanics plate,
progression item, relationship hub.

### 5. Research Atlas Metadata Language

Why:
Counts, game version, snapshot, relationships, and metadata sometimes feel like
statistics or source data rather than authority marks.

Expected player value:
Trust improves without making the product feel technical or administrative.

Estimated effort:
Low-medium.

Dependencies:
Works best after mode language is decided.

### 6. Rebalance Relationship Prominence

Why:
Some relationships belong as primary content, some as compact chips, and some
only in detail.

Expected player value:
Players see what matters without link noise.

Estimated effort:
Medium.

Dependencies:
Should build on existing relationship-presentation lessons from Heroes, Units,
Equipment, and Actions.

### 7. Establish Category Comparison Grammar

Why:
Rows are increasingly useful, but comparison patterns vary category by
category.

Expected player value:
Players can compare units, heroes, techs, improvements, districts, equipment,
and abilities faster.

Estimated effort:
Medium-high.

Dependencies:
Requires auditing row comparison needs by category family, not isolated page
polish.

### 8. Define Shallow Reference Experience

Why:
Some categories are intentionally thin references. They should not feel lesser
or unfinished.

Expected player value:
Players understand when a category is a quick reference sheet rather than a
deep dossier.

Estimated effort:
Low-medium.

Dependencies:
Should align Resources, Councilor Effects, Partner Effects, Wonders, Traits,
and similar categories.

### 9. Align Data Freshness With Product Trust

Why:
Freshness is valuable, but it should read as authoritative edition context
rather than backend provenance.

Expected player value:
Players trust what they are seeing and understand its snapshot nature.

Estimated effort:
Low.

Dependencies:
Depends on import history data being reliable in production.

### 10. Create Future Planner Boundaries

Why:
Codex will increasingly point toward planning features, but should not absorb
every planner into itself.

Expected player value:
Players get better bridges from study to action without Codex becoming bloated.

Estimated effort:
Medium.

Dependencies:
Needs product direction for faction, hero, constructible, victory, and tech
planning surfaces.

## Scores

Landing: **7.0 / 10**

Category Overview: **6.8 / 10**

Entry Detail: **8.0 / 10**

Overall Codex: **7.3 / 10**

## Overall Product Maturity

Codex is release-credible as a useful premium encyclopedia, but not yet mature
as a fully authored Research Atlas.

It has crossed the line from "database browser" to "valuable companion
product." It has not yet crossed the next line: a coherent, memorable knowledge
system with a distinct emotional identity at every depth.

## Design Priority Recommendation

Next six months of design work should prioritize:

1. Category field identity.
2. Research Atlas mode language.
3. Detail reading rhythm.

Landing should continue improving, but category overview is the deeper product
problem. A better landing will attract players. Stronger category field
identity will make them feel the whole Codex is one coherent system.

## Appendix: Independent Jury Review

Ticket: EW-CODEX-UI-JURY-001
Date: 2026-06-24
Role: independent design jury
Verdict: **B. Ship with one critical improvement**

### First Impression

In five seconds, the page reads as competent, restrained, and useful. It does
not read as embarrassing, unfinished, or amateur.

It also does not quite read as memorable. The first thought is:

```text
This is a well-made index page for a strategy companion.
```

The desired thought is:

```text
This is the official knowledge surface for understanding a strategy world.
```

Those are close, but they are not the same.

### Eye Tracking

The eye travels:

1. global logo/navigation;
2. large `Encyclopedia` title;
3. subtitle;
4. search;
5. metadata;
6. category tiles.

That is orderly, but too literal. The eye descends through page elements rather
than entering a single authored surface.

The eye should travel from world identity into research, then into the first
visible field of knowledge. The catalogue should feel like the natural reveal
of the promise, not the block after the header.

### What The Page Is Trying To Say

The page is trying to say:

```text
This is where you understand Endless Legend 2.
```

What it actually says:

```text
This is a polished category index for Endless Workshop.
```

The current version succeeds at utility and clarity. It underdelivers on world
authority and emotional arrival.

### Emotion Created

The page creates:

- clarity;
- calm;
- trust;
- mild curiosity.

It does not yet create:

- wonder;
- authority at first glance;
- the feeling of entering a world;
- the feeling of consulting an official strategic reference.

### Biggest Design Mistake

The biggest design mistake is that the landing does not have a single visual
idea.

It is made of good parts, but the parts remain visible as parts: title, search,
metadata, catalogue. A premium landing needs one governing composition.

### Strongest Design Success

The strongest design success is restraint.

The page avoids the usual traps: no fake fantasy frame, no loud glow, no busy
artwork, no dashboard statistic wall. It respects the player and remains fast
to scan.

### One-Day Improvement

If the jury had one day before release, the single change would be:

**Make the title/search/metadata area and the first catalogue row feel like one
composed field.**

Do not add more decoration. Do not add another section. Make the first viewport
feel authored rather than stacked.

### Product Comparisons

Wikipedia:
It is more atmospheric and visually premium than Wikipedia, but Wikipedia is
not the benchmark.

Civilopedia:
It would feel plausible as a modern web Civilopedia, though slightly too
generic and not yet iconic.

Stellaris:
It would feel too warm/bookish for Stellaris, but the information density and
dark UI would be acceptable.

Age of Wonders:
It would feel at home as a polished companion index, though it lacks enough
fantasy/world presence to feel official.

Official Endless Legend Companion:
It is close enough to ship with a critical polish pass, but not strong enough
to be celebrated. It needs a more authored first viewport to feel official.

### Quest Explorer Comparison

Emotionally, Quest Explorer has presence because it makes a promise
immediately: chronicle, progression, consequence.

Codex makes a weaker promise: organized access.

They feel like the same product family in palette and restraint, but not yet in
emotional confidence. Quest Explorer feels designed around a dramatic job.
Codex feels designed around making information reachable.

### Jury Verdict

**B. Ship with one critical improvement.**

The landing is not fundamentally wrong. It is not a failed direction. It is
clear, useful, respectful, and visually controlled.

But a professional design team would not call it finished premium work yet.
They would require one more composition pass before release: make the first
viewport feel like a single knowledge surface instead of stacked UI.

### Scores

Emotional score: **6.4 / 10**

Premium score: **7.2 / 10**

Release recommendation:
Ship only if the one-day composition improvement is made. Otherwise it can
ship as functional product work, but not as the intended premium Codex landing.
