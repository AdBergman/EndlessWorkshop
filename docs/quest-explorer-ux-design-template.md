# EWShop Quest Explorer UX Design Template

Version: v1 Status: ACTIVE FRONTEND UX TEMPLATE Audience:

- EWShop frontend team
- Codex frontend implementation sessions
- UI/UX design sessions
- Figma exploration
- Future Quest Explorer iteration work

This document complements:

- `/docs/quest_explorer_canonical_semantics_v1.md`
- `/docs/quest_explorer_documentation_audit_v1.md`
- `/docs/archive/quest-explorer/quest-explorer-export-contract-final.md`
- `EWShop_Premium_UX_Design_Charter_v1.docx`
- `EWShop_Quest_Explorer_Active_Design_Spec_v1.json`

Semantic authority note:

This UX template remains active for visual and product-direction guidance, but
it is not the canonical Quest Explorer semantic model. UX language may use
"path" or "branch" as presentation shorthand, but product behavior must follow
`docs/quest_explorer_canonical_semantics_v1.md` and distinguish true choices,
mandatory continuations, setup rows, topology forks, variants, convergence, and
unresolved continuations.

Priority order:

1. Quest Explorer canonical semantics
2. Quest Explorer documentation audit
3. Quest Explorer Export Contract for DTO/schema baseline only
4. This UX template
5. Active Design Spec
6. Premium UX Charter
7. Existing EWShop frontend conventions

---

# 1. Purpose

This document defines the intended frontend UX structure for the EWShop Quest Explorer.

It exists to:

- stabilize the frontend direction
- prevent UX drift
- prevent graph UI regression
- prevent dashboard-card overload
- preserve the premium chronicle direction
- guide Codex implementation sessions
- validate the Quest Explorer export contract

This document is intentionally:

- frontend-oriented
- UX-oriented
- implementation-aware
- NOT exporter-oriented

---

# 2. Product Identity

The Quest Explorer is NOT:

- a raw quest database
- a graph visualizer
- a node editor
- a wiki clone
- a generic dashboard
- an MMO quest tracker
- a visual novel UI

The Quest Explorer IS:

- a premium strategic chronicle
- a branching faction archive
- a progression atlas
- a lore exploration environment
- a strategic analysis surface

The experience should feel:

- atmospheric
- calm
- premium
- readable
- interconnected
- spatially understandable
- strategically useful

---

# 3. Core UX Modes

The product has TWO primary modes.

---

# 4. Lore View

## Purpose

Lore View is:

- a chronicle reader
- a transcript explorer
- a branching progression flow
- a narrative progression mode

The user should feel like:

- they are reading a faction chronicle
- they are walking through branching events
- they are exploring a campaign archive

---

## Lore View Priorities

Highest priority:

1. transcript readability
2. progression continuity
3. branch clarity
4. emotional pacing
5. atmospheric presentation

NOT:

- giant graph nodes
- visual novel bubbles
- chat-app aesthetics
- RPG popup recreation

---

## Lore View Structure

```text
Quest Title
Summary

Transcript Sections

Choices

Outcome Preview

Next Progression
```

---

## Transcript Presentation

Preferred:

```text
Pirazeh:
May the mists stay dispersed.

Leader:
What happened here?
```

Avoid:

- giant speech bubbles
- neon dialogue frames
- MMO quest formatting
- cinematic over-stylization

---

## Transcript Sections

Sections should:

- feel archival
- feel readable
- support long-form reading
- preserve pacing

Use:

- soft spacing
- subtle separators
- atmospheric panel depth
- elegant typography

Avoid:

- excessive nested cards
- borders everywhere
- dashboard stacking

---

## Choices UX

Choices should feel:

- deliberate
- branching
- meaningful
- easy to compare

Choice presentation:

```text
[ Hatch ]
Small lore preview
Potential outcomes

[ Burn ]
Small lore preview
Potential outcomes
```

Avoid:

- giant graph edges
- force-directed visuals
- tiny node labels
- abstract graph semantics

---

# 5. Strategy View

## Purpose

Strategy View is:

- a planning surface
- a branch comparison tool
- a reward inspection mode
- a strategic progression explorer

Dialogue is secondary here.

---

## Strategy View Priorities

Highest priority:

1. objectives
2. requirements
3. rewards
4. branch comparison
5. progression continuity

---

## Strategy View Structure

```text
Quest Header

Objectives
Requirements
Rewards
Branch Outcomes
Next Steps
```

---

## Strategy Presentation

The UI should feel:

- dense but readable
- premium
- calm
- structured
- expert-focused

NOT:

- enterprise admin dashboard
- giant KPI cards
- generic card grids

---

## Objectives

Objectives should:

- be scannable
- grouped logically
- preserve phase information

Preferred:

```text
Objective
Requirements
Rewards
```

---

## Rewards

Rewards should:

- support codex linking
- support iconography
- support grouping
- support quick comparison

Possible grouping:

- Resources
- Equipment
- Science
- Dust
- Status Effects
- Empire Bonuses

---

## Branches

Branches should:

- show consequences
- show progression continuity
- show requirements/rewards
- remain lightweight

Good:

```text
Choice
 ├─ Requirements
 ├─ Rewards
 └─ Leads to
```

Bad:

- sprawling graph canvases
- edge spaghetti
- node editor aesthetics

---

# 6. Left Progression Rail

The left rail is one of the MOST IMPORTANT UX elements.

It provides:

- spatial memory
- progression continuity
- chapter orientation
- branch understanding
- long-session navigation

---

## Rail Structure

```text
Faction
 └─ Questline
     ├─ Chapter
     │   ├─ Entry
     │   ├─ Entry
     │   └─ Branch
     └─ Chapter
```

---

## Rail UX Rules

### Current step

- strongest contrast
- brightest emphasis
- subtle glow/accent

### Completed/visited

- muted illuminated state

### Future steps

- subdued
- atmospheric fade

### Branches

- thin connectors
- restrained indicators
- no graph explosion

---

# 7. Navigation Rules

The user should ALWAYS understand:

- where they are
- what branch they are on
- what came before
- what comes next
- what other branches exist

The explorer should support:

- deep linking
- direct entry navigation
- alias routing
- branch continuity

---

# 8. Atmosphere + Visual Language

Visual direction:

- luminous darkness
- atmospheric depth
- restrained premium styling
- Endless Legend 2 inspired mood

Use:

- deep teal
- fog charcoal
- muted gold
- pale ivory
- restrained turquoise
- layered darkness

Avoid:

- flat black
- neon sci-fi
- glowing dashboards
- fantasy border overload
- generic enterprise gradients

---

# 9. Typography

Typography is a PRIMARY design tool.

Use:

- serif for narrative emphasis
- refined sans-serif for metadata
- generous line-height
- strong spacing rhythm
- comfortable reading width

Large transcript sections must remain readable.

---

# 10. Motion Philosophy

Motion should support:

- orientation
- focus
- progression understanding

Preferred:

- soft fades
- subtle transitions
- restrained expansion
- layered emphasis

Avoid:

- excessive movement
- flashy transitions
- long delays
- motion-heavy decoration

---

# 11. Mobile / Narrow Layout

On narrow screens:

- collapse left rail into overlay
- collapse strategy sections progressively
- preserve progression continuity
- preserve current-context awareness

The user must never feel lost.

---

# 12. Frontend Architecture Expectations

The frontend SHOULD:

- derive lightweight view models
- separate Lore View and Strategy View
- use Zustand selectors/view models
- preserve stable navigation semantics
- support future iteration

The frontend SHOULD NOT:

- reconstruct exporter internals
- infer missing semantics aggressively
- rebuild graph architecture
- parse diagnostics in production UI

---

# 13. Backend Contract Expectations

The frontend expects:

- stable progression links
- stable branch semantics
- stable lore sections
- stable rewards/requirements
- stable aliases

The frontend should NOT need to:

- invent next-entry links
- parse source refs
- repair exporter cleanup logic
- reverse-engineer graph semantics

---

# 14. Codex Guidance

When implementing:

DO:

- prioritize readability
- prioritize progression continuity
- prioritize premium atmosphere
- prioritize transcript usability
- prioritize strategic clarity

DO NOT:

- build graph canvases
- build dashboard UIs
- over-componentize prematurely
- recreate RPG popup layouts
- use generic admin aesthetics

---

# 15. Final Direction

The Quest Explorer should feel like:

A premium strategic chronicle system for Endless Legend 2.

The target experience is:

- readable
- atmospheric
- interconnected
- branch-aware
- strategically useful
- narratively immersive
- premium
- enduring
