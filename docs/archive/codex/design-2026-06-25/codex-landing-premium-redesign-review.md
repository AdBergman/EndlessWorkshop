# Codex Landing Premium Redesign Review

Ticket: EW-CODEX-UI-PREMIUM-001
Date: 2026-06-24
Status: proposal only; no implementation yet
Area: Codex landing page

## Implementation Correction

`EW-CODEX-UI-PREMIUM-001A` must keep a single landing hero. The initial
implementation proved that adding a visible `Encyclopedia Index` section below
the main `Encyclopedia` title makes desktop hierarchy worse: search feels
stranded between two title sections and the page becomes less coherent.

The corrected direction is:

1. `Encyclopedia` is the only visible landing title.
2. Intro copy, search, and compact metadata belong in that one hero area.
3. The category catalogue starts immediately below the hero separator.
4. `Archive Edition` remains a bottom colophon.

## Purpose

This review evaluates why `/codex` is useful but still reads as a functional
category dashboard rather than a premium Endless Legend 2 companion archive.

The goal is not to redesign Codex behavior. The goal is to define a restrained
visual direction that keeps alphabetical scanning, search, category counts,
accessibility, and performance intact while making the landing page feel more
like a world archive.

## Inputs Reviewed

- `docs/active/codex-premium-ui-design-baseline.md`
- `docs/active/codex-premium-ui-ticket-plan.md`
- `docs/current-action-priorities.md`
- `docs/quest-explorer/README.md`
- `docs/archive/quest-explorer/quest-explorer-ux-design-template.md`
- `docs/active/codex-hydration-performance-investigation.md`
- `frontend/src/components/Codex/CodexOverview.tsx`
- `frontend/src/pages/CodexPage.tsx`
- `frontend/src/pages/CodexPage.css`
- Quest Explorer visual references in `docs/design-references/`

## Executive Assessment

Premium score: **6 / 10**

Codex is clear, fast to understand, and structurally sound. It does not feel
broken. The current landing fails mostly at atmosphere and hierarchy, not at
information architecture.

The biggest issue is that too many elements compete as equivalent boxes:

- header block
- category count block
- category card borders
- card backgrounds
- freshness separator
- page background grid

Each piece is individually restrained, but together they create a segmented
database-browser feeling. Quest Explorer feels more premium because it uses
fewer competing containers, stronger typography, larger atmospheric fields, and
selective emphasis. Codex currently gives every category the same visual weight.

Recommended direction: **Hybrid archive catalogue**.

The landing should keep the category-card index, but the cards should become
lighter catalogue entries within a more atmospheric page field. Counts should
remain visible but secondary. The page should feel like opening an encyclopedia
index, not reading a grid of admin modules.

## Visual Critique

### Current Hierarchy

The information hierarchy is correct:

1. Encyclopedia landing
2. Search
3. Category index
4. Category counts/descriptions
5. Game data freshness

The visual hierarchy is flatter than the information hierarchy. Category cards,
the category total, and freshness block all use similar line/border language,
so the eye reads them as peer widgets rather than as one composed archive page.

### Typography

The landing uses a compact heading and mostly sans-serif category rows. This is
efficient, but it misses the editorial/premium quality that Quest Explorer gets
from large serif titles and deliberate metadata typography.

Codex should not become narrative-heavy, but the landing can afford one stronger
editorial title treatment and more generous rhythm around category names.

### Card Design

Current category rows are functional mini-cards:

- border
- low-opacity background
- hover border
- icon/title/count top row
- description below

Because every category card has the same frame and surface, the page becomes a
uniform card grid. That supports scanning but weakens atmosphere. The frame
does not communicate category meaning; it mostly says "module."

### Spacing Rhythm

Spacing is compact and efficient. The landing has little breathing-room contrast
between header, grid, and freshness. The page would feel more premium if the
header had a stronger open-field presence and the category grid had a clearer
row rhythm.

### Use Of Borders

Borders are the main organizing device. This is the biggest source of visual
noise.

Useful borders:

- focus states
- selected or hovered category affordance
- one subtle separator after the landing header

Noisy borders:

- every category card border at rest
- bordered category total widget
- freshness block separator competing with grid rhythm
- accumulated page/grid/header line language

### Search Treatment

Search is functionally important and should remain prominent. Visually, it
still reads as a utility input more than part of the archive experience. The
input does not need to be hidden or moved, but it should sit more quietly in the
landing composition, with categories remaining the main browse affordance.

### Freshness Block

The freshness block is valuable trust-building content. It currently reads as a
small technical info panel because it is separated by another line and laid out
like a two-column metadata widget.

It should feel like a quiet archival colophon: useful, calm, and subordinate.

### Atmospheric Depth

Codex has a subtle background grid and dark gradients, but the depth is very
even. Quest Explorer feels more atmospheric because it creates larger luminous
fields, stronger type moments, and selective ornamental depth. Codex should use
layered darkness and restrained gold/ivory emphasis, not heavy fantasy frames.

### Similarity To Quest Explorer

Quest Explorer feels premium because it has:

- a clear primary reading surface
- a strong editorial title
- selective gold separators
- atmospheric dark depth
- fewer equal-weight utility boxes
- clear distinction between navigation, content, and metadata

Codex feels more utilitarian because it has:

- many same-weight category cards
- many rest-state borders
- modest title scale
- flat grid repetition
- category counts presented almost as metrics
- little difference between primary and supporting information

## UX Critique

The UX model is correct: `/codex` is an encyclopedia index and category cards
are primary navigation. The issue is presentation, not flow.

What should remain:

- alphabetical category ordering
- all visible categories discoverable
- category counts
- category descriptions
- global search
- loading placeholders
- data freshness block

What should change:

- fewer hard card frames at rest
- stronger page-level title/intro hierarchy
- calmer count treatment
- category cards that feel like catalogue entries
- freshness presented as archival trust copy, not admin metadata

## Design Direction Exploration

### A. Archive Catalogue

Categories become catalogue entries in an archive index. The grid remains, but
entries rely more on spacing, typography, and a subtle left/accent marker than
on full card borders.

Strengths:

- strong fit for encyclopedia identity
- keeps fast scanning
- reduces box-heavy feeling
- easy to implement incrementally

Risks:

- if too light, clickable affordance may weaken
- needs careful hover/focus treatment for accessibility

Verdict: strong candidate.

### B. Premium Codex Shelves

Categories feel like organized shelves or index plates. Icon and title become
stronger; counts become small secondary metadata.

Strengths:

- makes categories feel like destinations
- supports icon identity
- reduces dashboard metric feel

Risks:

- "shelf" can become decorative or gamey if overdone
- rows could become too tall and reduce scanning speed

Verdict: useful ingredient, not the whole direction.

### C. Atmospheric Landing

The page gets a subtler environmental field: layered charcoal/teal darkness,
faint gold depth, and broader open space.

Strengths:

- makes Codex feel more like a world archive
- visually aligns with Quest Explorer without copying it

Risks:

- easy to overdo
- background art/noise could hurt performance and readability

Verdict: use as restrained background polish only.

### D. Hybrid

Keep the current information model, but restyle the landing as an open archive
index with lighter catalogue entries, stronger title hierarchy, quieter counts,
and a colophon-style freshness block.

Strengths:

- preserves current behavior
- keeps scan speed
- improves premium feel
- lowest product risk

Risks:

- needs real visual QA; small CSS-only tweaks may not be enough

Verdict: recommended direction.

## Proposed Redesign Direction

Use **Hybrid Archive Catalogue**.

The landing should feel like:

```text
Encyclopedia
Short archival intro and search

Subtle separator

Category catalogue
Alphabetical entries in a calm multi-column grid
Each entry: icon, name, secondary count, one-line description

Quiet data freshness colophon
```

This keeps current interaction and ordering. It changes visual emphasis:

- page title and intro become stronger
- cards become lighter catalogue entries
- counts become metadata, not metrics
- background gains subtle depth
- freshness becomes trust copy, not an admin panel

## Mock Layout Descriptions

### Desktop Landing

Top area:

- Large `Encyclopedia` title with refined serif or current title treatment tuned
  toward editorial weight.
- One concise intro line below.
- Search remains in the existing header zone and keeps current behavior.
- Remove the bordered category-total widget or turn it into inline copy such as
  `18 categories` near the intro, using quiet metadata styling.

Catalogue area:

- Alphabetical multi-column grid remains.
- Each category entry becomes a light open tile:
  - no strong border at rest,
  - subtle background wash or transparent rest state,
  - icon and title as primary,
  - count aligned right or after title as secondary,
  - description one or two lines maximum.
- Hover/focus adds a visible but elegant accent: soft left line, slight
  background lift, stronger title color.

Freshness:

- Move visually below the catalogue as a calm archive note.
- Use `Game Data Version` as small label, game version as main text, snapshot
  as secondary text.
- Avoid a two-column panel feel.

### Narrow Layout

- Preserve one-column card flow.
- Keep touch targets large.
- Keep descriptions visible.
- Counts remain visible but not dominant.
- Freshness becomes a compact stacked colophon.

## Top 10 Recommended Improvements

1. Replace rest-state category card borders with lighter catalogue-entry
   styling.
2. Make category hover/focus use a clear accent line/background instead of
   relying mainly on border color.
3. Demote category counts from metric blocks to secondary metadata within each
   entry.
4. Remove or soften the bordered category-total widget in the overview header.
5. Give the landing title/intro a stronger editorial hierarchy.
6. Treat the data freshness block as an archival colophon rather than a
   separate metadata panel.
7. Increase vertical rhythm between title, catalogue, and freshness while
   avoiding large empty gaps.
8. Add subtle atmospheric depth to the landing field with gradients already in
   the CSS system, not images or heavy effects.
9. Keep category icons, but make icon/title alignment more intentional so the
   icon feels like identity, not a list bullet.
10. Preserve the loading skeleton but restyle it to match the lighter catalogue
    entry treatment.

## Before / After Rationale

Before:

- Every category is a similar framed unit.
- Counts look like small analytics metrics.
- The header count and freshness treatment add more boxes.
- The page scans well but feels like an admin index.

After:

- The page reads as one archive surface.
- Categories are still fast to scan but feel like catalogue destinations.
- Counts remain available without dominating.
- Freshness reassures users without introducing backend/admin mood.
- Borders are reserved for interaction and meaningful separation.

## Implementation Complexity

Estimated complexity: **medium-low**.

Why:

- The behavior can remain unchanged.
- Most work is CSS and minor `CodexOverview` markup adjustments.
- No API changes are needed.
- No category config changes are needed.
- Existing loading and freshness data can be reused.

Risk areas:

- maintaining accessible focus states after reducing borders;
- preserving scan speed with lighter cards;
- avoiding a too-empty layout;
- ensuring mobile/touch targets remain strong;
- avoiding changes to category/detail pages through shared CSS selectors.

## Recommended First Implementation Slice

Implement **EW-CODEX-UI-PREMIUM-001A - Codex Landing Catalogue Surface**.

Scope:

- `/codex` landing only.
- `CodexOverview.tsx` and Codex landing CSS only.
- No category/detail/search behavior changes.
- No data/API changes.

Acceptance criteria:

- Category ordering remains alphabetical.
- Counts remain visible.
- Search behavior remains unchanged.
- Category cards still have clear hover/focus/touch affordance.
- Landing feels less boxed and more like an archive catalogue.
- Data freshness remains visible when available and hidden when unavailable.
- Category/detail pages are visually unchanged.

Suggested validation:

- `npm test -- --run src/pages/CodexPage.test.tsx`
- `npx tsc --noEmit --project tsconfig.json`
- `npm run build`
- `git diff --check`
- Browser review:
  - `/codex`
  - `/codex?category=heroes`
  - `/codex?category=equipment`
  - selected detail route
  - narrow viewport

## Things Not Recommended

- Do not add large fantasy frames.
- Do not add background art or noisy image treatments.
- Do not animate the catalogue heavily.
- Do not group or reorder categories.
- Do not remove counts.
- Do not move search.
- Do not copy Quest Explorer layout directly.
- Do not make the landing a dashboard with metric panels.

## Final Recommendation

Proceed with a focused landing-only visual slice after product approval.

The strongest path is not a broad Codex redesign. It is a careful de-boxing and
catalogue treatment of the existing landing index, preserving the current
information architecture while giving the page a more premium archive identity.
