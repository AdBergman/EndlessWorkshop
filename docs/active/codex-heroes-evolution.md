# Codex Heroes Evolution

Status: complete with follow-up recommended
Target category: Heroes  
Internal kind: `heroes`

## Purpose

Heroes is being evolved through the Codex Category Evolution Playbook so it can
become a player-facing planning surface instead of a generic record list. This
document is the durable working memory for Heroes findings, decisions,
implementation results, exporter findings, and closeout.

## Current State

Before this pass, Heroes used the generic split Codex layout. That preserved
routes and detail inspection, but the overview did not help players compare
heroes by faction, class, stats, or granted abilities.

Strengths:

- The local 0.82 export contains compact, consistent Hero records.
- Every Hero has exported `Faction`, `Class`, and a `Stats` section.
- Some Heroes have exact granted ability references through `referenceKeys`.

Weaknesses:

- Generic rows do not surface the stat profile strongly enough.
- The left result list is just navigation, not player-oriented browsing.
- Granted ability references are useful but inconsistent: the section can be
  empty while exact ability references exist in `referenceKeys`.
- No explicit per-Hero icon metadata is exported.

## Phase 1 Findings

### Category Classification

Heroes should be treated as an Archive for the current export.

They are not a Reference Sheet because 79 entries need browsing and comparison.
They are not currently an Explorer because the export does not expose a
progression tree, recruitment system, or build path that would justify a custom
interaction model. If future exporter data adds progression or recruitment
structure, this decision should be revisited.

### Data Audit

Local source: `local-imports/codex/ewshop_heroes_codex_export_0.82.json`

- Entry count: 79.
- Facts:
  - `Faction`: 79 entries.
  - `Class`: 79 entries.
- Sections:
  - `Stats`: 79 entries.
  - `Granted abilities`: 19 entries, often with no lines/items but paired with
    exact ability `referenceKeys`.
- Stat-line counts:
  - 72 Heroes have 8 stat lines.
  - 5 Heroes have 9 stat lines.
  - 1 Hero has 5 stat lines.
  - 1 Hero has 14 stat lines.
- Resolved reference kinds from Hero `referenceKeys`:
  - `factions`: 41 references.
  - `minorFactions`: 33 references.
  - `abilities`: 27 references.
  - unresolved references: 9.

### Browse Audit

Supported browse models:

- Class: strong first browse model. It is present on every Hero and maps to
  tactical role/army use.
- Faction: strong identity browse model. It is present on every Hero and
  matches how 4X players think about faction rosters.

Deferred browse models:

- Archetype/specialization: not explicitly exported beyond `Class`.
- Equipment access: not exported as reliable Hero metadata.
- Active/passive skills: exact granted ability references exist for some
  Heroes, but not consistently enough for first navigation.
- Progression/recruitment source: not exported.

### Navigation Audit

Recommended left rail:

- Class
- Faction

The rail should be orientation, not a second content surface. Counts are useful
because both facts are exact and complete in the local export.

### Main Panel Audit

Future Hero archive rows should show:

- Hero name.
- Stat preview from exact exported `Stats` lines.
- Compact `Grants:` ability links when exact granted ability references
  resolve.
- Quiet right-side metadata: Faction and Class.

Rows should not show:

- raw reference keys
- unresolved ability references
- inferred faction icons
- generic footer/context chains

### Detail Audit

Detail pages remain useful as inspection/permalink pages:

- complete Stats list
- related Faction/Minor Faction entry
- granted abilities where exact references resolve
- shareable URL

No detail redesign is required for the first slice unless product review finds
the generic dossier too weak after row/rail work.

### Relationship Audit

Exact relationships currently available:

- Hero -> Faction/Minor Faction through `referenceKeys`.
- Hero -> Ability for a subset of Heroes through `referenceKeys`.

Do not infer relationships from Hero names, faction names, prose, or SVG
filenames.

### Exporter Audit

Non-blocking exporter/data-quality findings:

- Some Hero references are unresolved in local data, such as `Faction_Hero` and
  several `UnitAbility_Hero_*` keys.
- `Granted abilities` sections can be empty even when exact ability references
  exist in `referenceKeys`.
- Per-Hero icon metadata is absent.
- Progression/recruitment data is absent.

These do not block frontend Hero Archive work.

## Accepted Decisions

- Heroes is an Archive for the current export.
- Use exact exported `Class` and `Faction` facts for first navigation.
- Do not infer major/minor faction grouping locally.
- Use exact `Stats` section lines as row content.
- Use exact resolved ability references for compact `Grants:` row links.
- Do not show unresolved granted ability references as fake links.
- Do not introduce per-Hero icons without explicit metadata.

## Proposed Implementation

### HEROES-UI-001 - Hero Archive Foundation

Scope:

- Add Hero Archive mode.
- Add Hero left rail with Class and Faction groups.
- Filter Heroes by selected Class and/or Faction.
- Selecting/clearing Hero filters from a Hero detail route removes `entry` and
  returns to the Hero archive list.
- Add stat-first Hero archive rows with Faction/Class metadata and compact exact
  `Grants:` ability links.
- Keep Hero detail pages generic for this first slice.

## Product Review Notes

`HEROES-UI-001` implemented the selected Archive foundation:

- Class/Faction rail replaces the generic left result list for Heroes.
- Filters combine and clear without URL params.
- Selecting or clearing a Hero filter from a Hero detail route returns to the
  archive list by removing `entry`.
- Hero archive rows now show exact exported Stats preview lines as primary
  content.
- Faction/Class render as quiet right-side row metadata.
- Exact resolved granted ability references render as compact `Grants:` links.
- Unresolved ability references stay hidden.

Initial product assessment:

- UX designer: the category now has a meaningful browse surface and stat-first
  rows. The Faction rail is long but acceptable for 79 entries and preferable to
  an unfiltered generic list.
- Frontend tech lead: the implementation follows existing explicit category
  mode patterns. It adds product-specific helpers/components rather than a
  generic framework.
- 4X player: Class and Faction answer the first two roster questions; stat
  previews make rows useful without opening every Hero.

Browser/DOM smoke:

- `/codex?category=heroes` rendered Hero Archive rows from local app data.
- Class/Faction rail rendered.
- Rows showed stat preview lines with token icons.
- Faction/Class metadata rendered on the right side of rows.
- Exact granted ability links rendered compactly in row metadata for Heroes with
  resolved ability references.
- No full pixel-level visual QA was claimed; the smoke was DOM/product oriented.

## Exporter Findings Recorded

Findings above were appended to
`docs/active/db-exporter-ability-metadata-handoff.md` during closeout.

## Open Questions

- Should Hero detail pages eventually receive a compact Hero profile strip?
- Should exact Faction/Minor Faction relationship labels be grouped in detail?
- Should future exporter data provide explicit recruitment/progression hooks?
- Should future exporter data provide Hero portrait/icon metadata?

## Future Roadmap

- `HEROES-UI-001`: Hero Archive Foundation - complete.
- `HEROES-UI-002`: Hero Row Polish - complete.
- `HEROES-UI-003`: Relationship presentation, only after exact relationship
  needs are clearer.

### HEROES-UI-002 - Hero Row Polish

Manual review found the archive shape good, but the row hierarchy still needed
one focused polish pass:

- Stats should be easier to scan than a long vertical list.
- `Grants: Flying` was too prominent as a relationship line.
- Exact granted ability links should stay discoverable but become compact
  metadata near Class.
- Faction identity should prefer exact resolved Faction/Minor Faction icons
  where the Hero has a resolvable reference.
- If no exact Faction/Minor Faction icon can be resolved, the row should fall
  back to exported faction text rather than guessing.

Result:

- Hero stat previews now render as a compact three-column grid on desktop.
- Repeated generic Hero icons were removed from archive row titles because they
  added no useful identity without explicit per-Hero icon metadata.
- Exact granted ability links such as `Flying` no longer render as a separate
  `Grants:` relationship row; they are compact metadata beside Class.
- Existing inline Codex link/tooltip behavior is preserved for resolved granted
  ability links.
- Row faction identity now prefers an exact resolved Faction/Minor Faction icon
  when the Hero has an exact related faction entry and the existing icon
  resolver can resolve it.
- Rows fall back to exported faction text when no exact safe icon is available.
- Manual/browser route smoke confirmed the overview and a selected Hero detail
  route render after the polish.

## Closeout

Completion decision: complete with follow-up recommended.

Completed:

- Hero Archive classification.
- Class/Faction rail.
- Stat-first archive rows with compact desktop stat grid.
- Compact exact granted ability links in row metadata.
- Exact faction/minor-faction icon identity when safely resolvable, with text
  fallback.
- Detail routes preserved.
- Search behavior preserved through the shared Codex search pipeline.
- Exporter findings appended to the active exporter backlog.

Deferred:

- Per-Hero portraits/icons until explicit exporter metadata exists.
- Recruitment/progression browsing until public exporter data exists.
- Detail profile polish until product review proves the generic Hero dossier is
  insufficient.

Refactor/stale-code review:

- The implementation follows the existing explicit category-mode pattern.
- No generic archive/filter framework was introduced.
- No stale Hero-specific branches were found after the slice.
- `CodexLeftPane` and `CodexSummaryDetail` continue to grow as more categories
  evolve; this remains acceptable for this slice but should be watched before a
  broad mode-framework refactor.

## Lessons Learned

- Heroes proved that Archive classification can be earned from a small but
  complete data model: exact browse facts plus consistent stat sections are
  enough for a player-facing archive.
- Faction can be useful as navigation even when explicit major/minor grouping is
  not safe yet; display exported values rather than guessing group semantics.
- Hero rows should classify elements before rendering them: stats are primary
  content; faction/class are supporting metadata; exact ability/class tags such
  as `Flying` and `Swarm` are compact metadata/relationship chips; exporter
  leakage and unresolved references stay hidden.
- Stat-heavy categories should optimize for comparison. Compact stat grids are
  better than long vertical stat lists when token/icon rendering can be
  preserved.
- Repeated generic row icons can be visual noise when they add no
  category-specific information. The generic Hero title icon was removed until
  explicit per-Hero icon/portrait metadata exists.
- Exact linked entities are valuable row support, but unresolved references must
  stay hidden until exporter data resolves them.
