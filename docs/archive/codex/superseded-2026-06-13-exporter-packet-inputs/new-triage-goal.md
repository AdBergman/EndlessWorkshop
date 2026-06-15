Triage the full Codex category backlog and create DB-exporter-ready implementation packets only where justified. Do not implement code.

Context:
The current planning docs are useful but not yet enough for DB exporter implementation:
- docs/active/codex-category-review-matrix.md
- docs/active/codex-category-jira-backlog.md
- docs/active/codex-relationship-value-gap-audit.md
- docs/active/codex-content-quality-current-diagnostic-handoff.md
- docs/current-action-priorities.md

The DB exporter team does not know EWShop frontend internals. They know the JSON files they export. They need exact requested JSON shape, examples, validation, and guardrails.

Goal:
Review the entire Codex category backlog, decide which tickets actually need exporter-ready implementation packets now, and create those packets only for justified exporter/backend/editorial work.

This is a triage + handoff refinement pass.
It is not implementation.
It is not a blanket “make every ticket bigger” task.

Deliverables:
1. Create:
   docs/active/codex-db-exporter-implementation-packets.md

2. Update:
   docs/active/README.md if needed.

Part A — Full backlog triage:
Review every ticket in docs/active/codex-category-jira-backlog.md.

For each ticket, create a triage row with:
- Ticket ID
- Title
- Owner
- Priority
- Triage status:
  - exporter packet now
  - frontend-only
  - product decision needed
  - blocked by missing evidence
  - already covered
  - defer / not worth doing now
- Reason
- Whether a DB exporter implementation packet is needed
- If not, what should happen instead

The triage must evaluate whether the work actually needs doing. Do not blindly promote every ticket.

Part B — Exporter implementation packets:
Create detailed exporter/backend/editorial implementation packets only for tickets classified as “exporter packet now.”

Expected likely packet candidates, but verify rather than blindly include:
- CDEX-CAT-001 - Export exact Tech unlock refs.
- CDEX-CAT-003 - Export exact major faction Population threshold reward refs.
- CDEX-CAT-004 - Establish Resource Codex entities and Extractor -> Resource refs.
- CDEX-CAT-005 - Add gameplay summaries and affected targets for thin Actions.
- CDEX-CAT-006 - Clean Diplomatic Treaty Effects and public text.
- CDEX-CAT-007 - Export Status sub-kind/scope metadata.
- CDEX-CAT-009 - Resolve Trait unlock and granted Ability references.
- CDEX-CAT-011 - Clean Quest reward and requirement public refs.
- CDEX-CAT-015 - Clean Modifier public labels where they appear as targets.
- CDEX-CAT-016 - Fill thin District, Improvement, Ability, and Status entries.

Do not create exporter packets for frontend-only tickets unless they have a clear exporter prerequisite.

For each implementation packet, include:

1. Packet ID and source Jira ticket.
2. Triage status and why this packet is worth doing now.
3. Owner: DB exporter, editorial, backend/product, or mixed.
4. Player problem in plain 4X terms.
5. Current exported shape:
   - exact current JSON pattern if known
   - current missing fields
   - concrete current example entry keys
6. Desired exported shape:
   - exact JSON fields to add
   - example JSON before/after
   - field naming recommendation
   - whether field is required, optional, or omitted when unknown
7. Mapping/source guidance:
   - what game/exporter source concept likely owns the relationship
   - what should count as canonical
   - what should stay text-only
8. EWShop rendering expectation:
   - what frontend will be able to do once this metadata exists
   - what frontend must continue not doing
9. Validation:
   - exact diagnostic command(s) to rerun
   - expected diagnostic improvement
   - browser review targets
   - example entries that should pass after fix
10. Guardrails:
   - do not export inferred display-name matches
   - do not expose unreleased/hidden content
   - do not put raw internal keys in public fields
   - do not force public entries where no player-safe content exists
11. Open questions for product/exporter.

Important detail requirements:
- Be concrete enough that an exporter engineer can implement without reading EWShop frontend code.
- Use current local examples from the backlog/audits.
- Prefer exact JSON shape examples over prose.
- Mark packets as “ready”, “partial”, or “blocked by product decision.”
- Keep the handoff readable. One packet per section.
- Do not create dozens of tiny packets.
- Do not add frontend implementation prompts except a short “EWShop after this lands” note.

Required known rules:
- EWShop must not infer links from display names, prose, or fuzzy matching.
- Tech unlocks need exact Unlock section refs before Tech preview UI.
- Major faction Population threshold rewards need item/fact referenceKey metadata.
- Resource icons/tokens are not Resource Codex entries.
- Modifiers remain hidden from top-level navigation.
- Faction package is frontend-owned QA/polish, not exporter handoff unless exact faction trait/action/resource refs are requested.

Validation:
- If only docs changed, run git diff --check.

Report back:
1. Document created/updated.
2. Number of tickets triaged.
3. Triage counts by status.
4. Packets created and their readiness status.
5. Tickets deliberately not expanded into packets and why.
6. Open product questions.
7. Validation run.
8. Suggested commit message.

Do not commit before review.