# Quest Explorer Documentation Audit v1

Status: Canonical documentation audit  
Generated: 2026-05-26  
Primary reference: `docs/quest_explorer_canonical_semantics_v1.md`  
Data reference: `local-imports/exports/ewshop_quest_explorer_export_0.80.json`

This audit classifies existing Quest Explorer documentation, design notes, diagnostics,
architecture references, prompt-like artifacts, and relevant test descriptions against
the canonical semantic model established from the live `quest_explorer.v3` export.

This document does not rewrite or delete historical artifacts. It identifies which
documents remain useful, which require small amendments, and which should no longer
guide semantic or frontend-model work.

Migration note, 2026-05-26: the minimal amendment pass added deprecation/status
banners, canonical-reference notes, and archive READMEs. The Lore design note,
handoff note, and design bundle now live under `docs/archive/quest-explorer/`.

## Classification Legend

`KEEP_AS_IS` means the artifact remains valid for its stated purpose and does not
need a semantic warning.

`KEEP_WITH_AMENDMENTS` means the artifact remains useful, but should receive a
short status note or terminology correction before future Quest Explorer work treats
it as guidance.

`ARCHIVE_OUTDATED` means the artifact is historically useful, but its core semantic
model is superseded. It should be moved to an archive area or marked as historical.

`DANGEROUSLY_OUTDATED` means the artifact is likely to mislead future work because
it presents outdated semantics as active, final, authoritative, or implementation
guiding truth.

## Audit Scope

Included:

- Quest Explorer docs under `docs/quest-explorer/`
- active Quest Explorer domain-language docs
- Quest Explorer export-contract and architecture-review docs
- Quest Explorer UX templates and visual references
- diagnostic notes and continuity reports
- frontend architecture and refactor notes that mention Quest Explorer
- relevant frontend tests whose descriptions encode semantic assumptions
- prompt-like design bundles or exporter requests

Excluded:

- generated build output under `frontend/dist/` and backend `target/`
- unrelated generic docs without Quest Explorer semantics
- raw local import JSON files other than the live 0.80 export used by the canonical investigation

No standalone prompt files were found beyond the design bundle and diagnostic
exporter request. Those artifacts are classified below.

## Authoritative Document Hierarchy

Future Quest Explorer work should use this authority order:

1. `docs/quest_explorer_canonical_semantics_v1.md`
2. The live exported `quest_explorer.v3` JSON and explicit topology fields
3. Current frontend implementation, only as evidence of existing behavior
4. Architecture and UX docs after amendment with canonical-semantics references
5. Historical design docs, diagnostic requests, and handoff notes

The old "step/choice/path" model should not be treated as authoritative. These
words may still appear in code identifiers and legacy UI copy until a staged
migration removes or narrows them.

## Audit Table

| Artifact | Type | Classification | Finding | Recommended action |
| --- | --- | --- | --- | --- |
| `docs/quest_explorer_canonical_semantics_v1.md` | canonical semantic spec | KEEP_AS_IS | New source of truth for Quest Explorer semantics. | Make this the top semantic reference for future work. |
| `docs/active/quest-explorer-domain-language.md` | active domain-language spec | DANGEROUSLY_OUTDATED | Declares a `questline -> chapter -> step -> choice / branch variant -> continuation step` model as active language. This conflicts with the 0.80 topology where entries, branch rows, continuations, setup rows, aliases, and variants do not form a universal step-choice-step chain. | Done: deprecation banner added. Keep as historical vocabulary only or archive in a later documentation pass. |
| `docs/quest-explorer-export-contract-final.md` | export/API contract spec | DANGEROUSLY_OUTDATED | Presents a final locked contract but omits live topology fields such as branch parentage, prerequisites, reveal metadata, choice groups, convergence groups, section roles, and branch step order. It also makes ordering and alias statements that are incomplete for current semantics. | Add a warning that it is not current semantic authority. Update separately as a contract revision if needed. |
| `docs/quest-explorer-ux-design-template.md` | UX design template | KEEP_WITH_AMENDMENTS | Still useful for visual direction and product posture, but broad "branching archive", "choices", "path", and "progression atlas" language can imply that every continuation is player agency. | Add a canonical-semantics reference and clarify that branch/path copy is UX shorthand only. |
| `docs/quest-explorer-rich-import-architecture-review.md` | architecture review | KEEP_WITH_AMENDMENTS | Useful for backend/API architecture context, but it references older contract assumptions and does not include the canonical semantic corrections. | Add a note that semantic interpretation is governed by the canonical document, not by the older contract review. |
| `docs/archive/quest-explorer/quest_explorer_lore_design.md` | Lore design note | ARCHIVE_OUTDATED | Its core model is `Step 1 lore -> choice -> selected Step 2 lore/outcome -> choice -> selected Step 3 lore/outcome`. This is directly superseded by chapter chronicle semantics. | Archived as historical. Preserve only product principles such as future-lore gating and unresolved-continuation stopping. |
| `docs/quest-explorer/quest_explorer_strategy_design.md` | Strategy design note | KEEP_WITH_AMENDMENTS | Product intent remains useful: Strategy is not a duplicate Lore reader and should support planning. However, "compare branch options" and "simulate a path" must be narrowed to true choices, topology forks, deterministic continuations, and unresolved futures. | Add a status note linking to canonical semantics before using it for Strategy model work. |
| `docs/archive/quest-explorer/quest_explorer_handoff.md` | handoff/reset note | ARCHIVE_OUTDATED | Useful as historical project context, but it was written before the canonical 0.80 semantic investigation and should not steer current terminology. | Archived as historical handoff context. |
| `docs/archive/quest-explorer/quest_explorer_design_bundle.docx` | bundled design/prompt artifact | ARCHIVE_OUTDATED | Bundles the older handoff, Lore, and Strategy notes, including the superseded step-choice-path model. Binary format also makes lightweight amendment harder. | Archived as historical artifact only. Do not use as semantic input without the audit and canonical doc. |
| `docs/diagnostics/quest-branch-continuity/quest-branch-continuity-summary.md` | diagnostic report | KEEP_WITH_AMENDMENTS | Valuable because it identified continuation, ownership, duplicate-label, and hidden-topology problems. Some requested metadata now exists in 0.80, and its counts/status should not be reused as current truth. | Add a supersession note: historical continuity diagnostic, partially fulfilled by 0.80 and superseded by canonical semantics. |
| `docs/diagnostics/quest-branch-continuity/quest-branch-continuity-exporter-request.md` | exporter request / prompt-like artifact | KEEP_WITH_AMENDMENTS | Historically useful request for topology metadata. Many requested fields landed, while others are absent or named differently. | Mark as fulfilled or partially fulfilled. Do not treat as live exporter requirements. |
| `docs/diagnostics/quest-branch-continuity/*.json` and `*.tsv` | diagnostic evidence | KEEP_WITH_AMENDMENTS | Useful historical evidence, but derived from a diagnostic pass and not from the canonical semantic taxonomy. | Keep for traceability. If referenced, note that the canonical document supersedes interpretation. |
| `docs/frontend/self-correcting-frontend-implementation-guide.md` | frontend implementation guide | KEEP_WITH_AMENDMENTS | Mostly aligned with route, state, and data discipline. Quest-specific language about "choice gates" and "selected path" needs narrowing to canonical terms. | Done: keep the Quest Explorer note linking to canonical semantics; treat older examples as shorthand only. |
| `docs/frontend/frontend-architecture-guidelines.md` | frontend architecture guide | KEEP_WITH_AMENDMENTS | The architecture boundary guidance is still valid. References to path state and `questPathFlow` reflect current implementation names, not canonical user semantics. | Keep architecture guidance. Add a reminder that Quest Explorer semantic modeling is governed by the canonical doc. |
| `docs/frontend/frontend-refactor-backlog.md` | refactor backlog | KEEP_WITH_AMENDMENTS | Useful backlog, but contains inherited "path", "choice visibility", and branch-comparison language. | Add a note that any Quest Explorer refactor must preserve behavior and migrate terms through canonical semantics. |
| `docs/ux-visual-review-action-items.md` | visual review notes | KEEP_AS_IS | Visual-quality guidance, not a semantic specification. | Keep as visual reference only. |
| `docs/design-references/quest-explorer-target-left-panel.png` | visual reference | KEEP_AS_IS | Static target visual, no semantic claims. | Keep as visual-only reference. |
| `docs/design-references/quest-explorer-target-strategy.png` | visual reference | KEEP_AS_IS | Static target visual, no semantic claims. | Keep as visual-only reference. |
| `docs/design-references/quest-explorer-target-lore.png` | visual reference | KEEP_AS_IS | Static target visual, no semantic claims. | Keep as visual-only reference. |
| `frontend/src/features/quests/questReaderScopes.test.ts` | test descriptions | KEEP_AS_IS | Tests lore/objective ownership boundaries and mostly aligns with canonical ownership semantics. | Keep. Future amendments can improve wording but are not urgent. |
| `frontend/src/features/quests/questRail.test.ts` | test descriptions | KEEP_AS_IS | Tests visible rail behavior, hidden branch variants, alias routes, and semantic progression counts. It already avoids exposing raw backend entry order as visible progression. | Keep. Treat "step" references as internal projection wording. |
| `frontend/src/features/quests/questPathFlow.test.ts` | test descriptions | KEEP_WITH_AMENDMENTS | Many behavior assertions are valuable, especially reveal metadata, setup gates, and unresolved continuations. Terminology such as "choice path" and broad path-flow framing is partially outdated. | Keep tests. A first naming cleanup pass narrowed misleading descriptions; leave remaining `questPathFlow`/`QuestPathChoice` wording where it names stable compatibility helpers. |
| `frontend/src/features/quests/questLoreFlow.test.ts` | test descriptions | KEEP_WITH_AMENDMENTS | Lore gating and ownership tests are useful, but "selected path" language should remain narrowed to "visible chronicle", "selected decision", or "active continuation" depending on case. | Keep tests. A first naming cleanup pass narrowed continuation wording; continue small wording fixes only when adjacent behavior changes touch the tests. |
| `frontend/src/features/quests/questStrategyDossier.test.ts` | test descriptions | KEEP_WITH_AMENDMENTS | Behavior coverage is useful for Strategy, but compatibility fields such as "selected path" and "branch comparison" still flatten setup rows, continuations, true choices, and unresolved futures. | Keep tests. Preserve compatibility field names until a dedicated DTO migration removes them. |
| `frontend/src/components/Quests/StrategyDossier.test.tsx` | component tests | KEEP_WITH_AMENDMENTS | Contains an important aligned invariant: a single option can render as current task without choice framing. Some UI expectations still use old copy such as "Choose a path" or "No further branch is recorded." | Keep behavior coverage. Replace old copy during UI terminology migration. |
| `frontend/src/pages/QuestExplorerPage.productContinuity.test.tsx` | product continuity tests | KEEP_WITH_AMENDMENTS | Valuable live-like regression suite for setup rows, staged continuations, one-option exits, and hidden variants. Some expected labels still encode the old path/choice vocabulary. | Keep. Update terminology after adapters are migrated, not before. |
| `frontend/src/pages/QuestExplorerPage.test.tsx` | integration tests | KEEP_WITH_AMENDMENTS | Covers routing, debug/raw tools, branch reveal behavior, and UI integration. Several test names and strings inherit the old branch/path model. | Keep. Treat semantic terms in descriptions as legacy until migrated. |
| `frontend/src/features/quests/questExplorerDiagnostic.ts` and `.test.ts` | diagnostic tooling/tests | KEEP_WITH_AMENDMENTS | Useful for debugging current implementation. Diagnostic categories should be revised to canonical concepts such as true-choice groups, topology forks, setup rows, unresolved continuations, and convergence. | Keep tooling stable for now. Plan a diagnostic taxonomy update after adapter semantics are explicit. |
| `frontend/scripts/quest-explorer-diagnostic.ts` | local diagnostic script | KEEP_WITH_AMENDMENTS | Useful script, but diagnostic labels may preserve old branch/choice assumptions. | Keep. Update labels only when diagnostics are revised against canonical semantics. |

## Outdated Artifact Details

### `docs/active/quest-explorer-domain-language.md`

Classification: `DANGEROUSLY_OUTDATED`

Wrong assumptions:

- It treats "step" as the main user-facing semantic unit.
- It treats choice, branch variant, and continuation as parts of one canonical
  progression chain.
- It implies a universal chapter model where the user advances from step to
  choice to step.
- It makes old wording active project language even though the live export uses
  richer topology fields and section roles.

Misleading terminology:

- "Step"
- "Choice"
- "Branch variant"
- "Continuation step"
- "Path" when used as the visible player progression model

Changed frontend mental model:

The frontend should move toward chapter chronicles, deterministic tasks,
explicit true-choice groups, topology forks, setup rows, branch variants, and
unresolved continuations. A branch row is not automatically a choice, and a
one-option continuation is not automatically a path.

Historical usefulness:

Useful only as a record of the older product language. It should not remain in
`docs/active/` unless it is rewritten as a redirect to the canonical document.

### `docs/quest-explorer-export-contract-final.md`

Classification: `DANGEROUSLY_OUTDATED`

Wrong assumptions:

- It presents itself as final and locked despite not documenting the current
  0.80 topology metadata.
- It treats some ordering fields as sufficient for visible progression.
- It describes aliases mainly as lookup compatibility identifiers, while the
  canonical model treats alias grouping as semantically important for hidden
  topology and variant ownership.
- It omits the raw `strategyView.objectives[].choiceKey` shape that is lost in
  the current API/frontend projection.

Misleading terminology:

- "Final locked contract" for a document that no longer covers the live export
- "Canonical local ordering" if read as user-facing sequence semantics
- "Lookup-only compatibility identifiers" for aliases

Changed frontend mental model:

The frontend must not infer user progression from `navigation.step` alone. It
must respect explicit topology relationships, section roles, choice groups,
convergence groups, reveal metadata, and objective/lore ownership.

Historical usefulness:

Still useful as a baseline contract artifact and import-history reference, but
not as semantic authority.

### `docs/archive/quest-explorer/quest_explorer_lore_design.md`

Classification: `ARCHIVE_OUTDATED`

Wrong assumptions:

- It frames Lore as a sequence of chosen steps and outcomes.
- It assumes visible progression follows repeated choice gates.
- It underrepresents deterministic continuations, setup rows, and hidden
  topology variants.

Misleading terminology:

- "Step 1 lore"
- "choice"
- "selected Step 2 lore/outcome"
- "chapter exit" if treated as a choice outcome rather than a continuation or
  terminal topology condition

Changed frontend mental model:

Lore should be a chapter chronicle with visible narrative progression,
owned lore sections, selected true choices where they exist, deterministic
continuations, and unresolved future stops. Internal branch topology is not the
same thing as the reader's path.

Historical usefulness:

Useful for preserving the principle that future lore should not leak before the
relevant reveal point. Superseded for structure and terminology.

### `docs/quest-explorer/quest_explorer_strategy_design.md`

Classification: `KEEP_WITH_AMENDMENTS`

Wrong or partial assumptions:

- It describes Strategy as comparing branch options and simulating a path, which
  is only valid for true decisions or meaningful topology alternatives.
- It does not distinguish deterministic continuation from optional decision.
- It does not call out setup rows, unresolved futures, or convergence as first
  class Strategy concepts.

Misleading terminology:

- "Branch options" when applied to artifact/setup or mandatory continuation rows
- "Path" when a one-option continuation or deterministic task is shown

Changed frontend mental model:

Strategy should present the current task, optional decision, branch comparison,
projected outcome, continuation status, deterministic continuation, and
unresolved future as different states.

Historical usefulness:

Useful product direction. It should stay available with a status note and a link
to canonical semantics.

### `docs/archive/quest-explorer/quest_explorer_handoff.md`

Classification: `ARCHIVE_OUTDATED`

Wrong or partial assumptions:

- It is a reset/handoff note from before the canonical semantic investigation.
- It inherits some older product-language framing.
- It should not be used to resolve semantic disagreements.

Misleading terminology:

- "Branching quest explorer" when read as "every visible row is a branch"
- "Path" when read as universal player progression

Changed frontend mental model:

Current work should distinguish authored topology from reader-visible
progression. Lore and Strategy can share source data while preserving separate
semantic adapters and state.

Historical usefulness:

Useful as project-history context and design intent. Not current authority.

### `docs/archive/quest-explorer/quest_explorer_design_bundle.docx`

Classification: `ARCHIVE_OUTDATED`

Wrong assumptions:

- It bundles the old handoff, Lore, and Strategy models.
- It reproduces superseded step-choice-path framing.

Misleading terminology:

- Same misleading terms as the bundled Markdown design notes.

Changed frontend mental model:

The binary bundle should not be treated as a live product spec. The canonical
document and this audit supersede it for semantics.

Historical usefulness:

Useful only as a frozen artifact of the design phase that preceded the 0.80
canonical investigation.

### Diagnostic Continuity Artifacts

Classification: `KEEP_WITH_AMENDMENTS`

Wrong or partial assumptions:

- Some diagnostics were written before the current topology fields were fully
  available or understood.
- Counts and suspicious-case labels should not be reused as current canonical
  totals.
- The exporter request is partly fulfilled and partly superseded.

Misleading terminology:

- "Choice" when applied to continuation rows
- "Branch continuity" when used as the whole semantic model
- "Dead-end artifact" where the canonical model may distinguish terminal,
  failure, unresolved future, or setup-only rows

Changed frontend mental model:

Diagnostics should report canonical categories: true-choice groups, topology
forks without true choice, setup/artifact rows, deterministic continuations,
convergence, unresolved continuation, terminal/failure state, aliases, and
variant groups.

Historical usefulness:

High. These artifacts explain why the frontend moved away from naive branch
filtering and why explicit topology metadata matters.

### Frontend Architecture and Refactor Notes

Classification: `KEEP_WITH_AMENDMENTS`

Wrong or partial assumptions:

- Some notes use existing code names such as `questPathFlow` as if they were
  final semantic concepts.
- "Selected path" and "choice visibility" appear in places where canonical terms
  should be more specific.

Misleading terminology:

- "Path state"
- "Choice visibility"
- "Branch comparison" when used without separating true decisions from topology
  forks and deterministic continuations

Changed frontend mental model:

Architecture boundaries remain valid: page orchestration, feature-level pure
derivation, store-owned interactive state, and debug/raw tooling should stay
stable. The semantic model inside those boundaries should migrate to canonical
categories.

Historical usefulness:

High. These docs should remain active after a small Quest Explorer amendment.

### Relevant Tests

Classification: Mostly `KEEP_WITH_AMENDMENTS`, with two `KEEP_AS_IS` cases.

Wrong or partial assumptions:

- Some test descriptions and expected copy use "path", "choice", "branch", and
  "step" as user-facing terms.
- Some tests verify current behavior through `RenderedPathStep`-style flattened
  structures.

Misleading terminology:

- "Choose a path"
- "Next Choices"
- "Path Revealed"
- "selected path"
- "branch choice"

Changed frontend mental model:

Tests should continue to protect behavior, especially route hydration, alias
links, setup gates, one-option continuations, hidden variants, reveal metadata,
debug/raw tooling, Strategy/Lore separation, and lore ownership. Description and
copy changes should wait for a deliberate UI terminology migration.

Historical usefulness:

High. The tests encode important regression cases, even when their names are
semantically stale.

## Global Terminology Deprecation

Deprecate old "step/choice/path" terminology globally for semantic authority.

Use these replacements in new docs and future UI-copy work:

| Deprecated broad term | Preferred semantic wording |
| --- | --- |
| step | entry, task, semantic chapter position, internal navigation step |
| choice | true player choice, decision group, optional decision |
| path | visible progression, selected decision trail, branch variant, topology route |
| branch option | branch row, continuation row, setup row, true-choice option |
| next choice | next task, next decision, deterministic continuation, unresolved continuation |
| path revealed | continuation revealed, future entry revealed, branch variant revealed |

The old terms do not need to disappear from code identifiers immediately.
`questPathFlow`, `RenderedPathStep`, and existing tests can remain stable while
adapters migrate. New documentation should avoid using these terms unless it
defines the narrower meaning in the same paragraph.

## Recommended Authoritative Set

Authoritative now:

- `docs/quest_explorer_canonical_semantics_v1.md`
- `docs/quest_explorer_documentation_audit_v1.md`

Authoritative after small amendment:

- `docs/frontend/frontend-architecture-guidelines.md`
- `docs/frontend/self-correcting-frontend-implementation-guide.md`
- `docs/quest-explorer-ux-design-template.md`
- `docs/quest-explorer-rich-import-architecture-review.md`

Historical or archived:

- `docs/archive/quest-explorer/quest_explorer_lore_design.md`
- `docs/archive/quest-explorer/quest_explorer_handoff.md`
- `docs/archive/quest-explorer/quest_explorer_design_bundle.docx`

Retain as product-direction note with amendment:

- `docs/quest-explorer/quest_explorer_strategy_design.md`

High-priority deprecation:

- `docs/active/quest-explorer-domain-language.md`
- `docs/quest-explorer-export-contract-final.md`

## Minimal Amendment Recommendations

1. Add a status banner to `docs/active/quest-explorer-domain-language.md`:
   this document is superseded for Quest Explorer semantics by
   `docs/quest_explorer_canonical_semantics_v1.md`.

2. Add a status banner to `docs/quest-explorer-export-contract-final.md`:
   this is no longer a complete live 0.80 semantic contract and must not be used
   as the source of truth for topology semantics.

3. Add one canonical-reference paragraph to the UX template:
   UX language may use "path" or "branch" as presentation shorthand, but product
   behavior must distinguish true choices, mandatory continuations, setup rows,
   topology forks, variants, convergence, and unresolved continuations.

4. Add one canonical-reference paragraph to frontend architecture and
   self-correcting implementation guides:
   Quest Explorer derivation should follow the canonical semantics document, and
   existing `questPathFlow` naming is legacy implementation vocabulary.

5. Add a historical-status note to the Lore design note, handoff note, design
   bundle, and diagnostic continuity folder.

6. Do not bulk-rename tests now. Preserve regression coverage until adapter and
   UI-copy migrations are staged.

## Migration and Deprecation Notes

Recommended first changes:

- Update active docs with status banners and canonical links.
- Record the canonical glossary in any future PR description touching Quest
  Explorer semantics.
- Amend diagnostic labels before using diagnostic output to justify UI behavior.
- Update Strategy/Lore test descriptions when semantic adapters change.

Recommended later changes:

- Rename frontend view-model concepts away from `path` only after behavior is
  covered by canonical tests.
- Split decision, continuation, setup, topology fork, convergence, and unresolved
  states in adapter output.
- Add tests that assert one-option continuation is not rendered or described as
  a player path by default.
- Add tests that assert topology forks without `true_choice` are not described as
  player decisions.

Do not touch yet:

- Backend/exporter/schema/API contracts.
- Debug/raw JSON tooling.
- Route and deep-link behavior.
- Strategy/Lore state separation.
- Existing visual reference assets.
- Existing broad regression tests whose names are stale but whose assertions are
  valuable.

## Final Recommendation

Yes: old "step/choice/path" terminology should be deprecated globally as the
semantic model for Quest Explorer.

No: it should not be mass-deleted or mass-renamed in one pass. Treat it as legacy
implementation and historical-design vocabulary until the frontend adapters and
copy can migrate safely.

The canonical replacement is:

- Lore: chapter chronicle with owned lore sections, visible narrative
  progression, deterministic tasks, optional decision points, setup rows,
  convergence, and unresolved future stops.
- Strategy: current task, optional decision, branch comparison when real,
  projected outcome, deterministic continuation, convergence state, and
  unresolved future.
- Navigation: route/deep-link addressing and reader position, not proof that
  `navigation.step` is meaningful user progression.
