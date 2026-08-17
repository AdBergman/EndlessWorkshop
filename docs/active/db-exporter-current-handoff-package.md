# Current DB Exporter Handoff Package

Status: active handoff summary  
Created: 2026-06-25  
Audience: EWShop tech/product leads and DB Exporter team

## Purpose

This is the concise package guide for the next EWShop -> DB Exporter handoff.
It identifies what to send now, what to keep internal, and which asks are
currently exporter-owned.

For the canonical active work queue, start with
`docs/active/db-exporter-open-requests.md`.

This document does not replace the detailed handoff docs. It is the cover sheet
that keeps the handoff focused.

## Recommended Files To Send

### Must Send

#### `docs/active/db-exporter-current-handoff-package.md`

- Purpose: cover sheet for the current handoff.
- What DB Exporter should do: use this first to understand the current asks,
  ownership boundaries, and recommended response shape.
- Send status: **must-send**.

#### `docs/active/db-exporter-open-requests.md`

- Purpose: canonical active work queue for the DB Exporter team.
- What DB Exporter should do: treat this as the first file to open when deciding
  what work is currently requested.
- Send status: **must-send**.

#### `docs/active/db-exporter-codex-diagnostics-evidence-handoff.md`

- Purpose: evidence packet from Admin Codex diagnostics, summarized without raw
  diagnostic dump noise.
- What DB Exporter should do: classify unresolved imported-domain refs as public
  Codex, rich-only, internal/prototype, obsolete, or unavailable; emit exact
  public refs/targets where public.
- Send status: **must-send** for unresolved-reference triage.

#### `docs/active/db-exporter-ability-metadata-handoff.md`

- Purpose: focused exporter backlog for Ability role/ownership metadata, plus
  non-blocking category metadata findings discovered during Codex work.
- What DB Exporter should do: prioritize the Ability role/ownership section for
  the next actionable pass; treat later category sections as backlog unless
  explicitly pulled into the current request.
- Send status: **must-send**, with the note that Ability role/ownership is the
  primary active ask.

#### `docs/active/db-exporter-codex-vs-rich-contract-summary.md`

- Purpose: boundary contract for Codex projection exports versus rich/domain
  source-truth exports.
- What DB Exporter should do: use it to decide whether a requested field belongs
  in public Codex, rich source-truth, diagnostics-only output, or not at all.
- Send status: **must-send** because it prevents broad/noisy data from being
  added to the wrong export.

#### `docs/active/db-exporter-ewshop-handoff-ledger.md`

- Purpose: chronological memory of prior EWShop <-> DB Exporter requests,
  responses, implementation results, and open follow-ups.
- What DB Exporter should do: use it as background to avoid reopening answered
  loops; the "Current Open DB Exporter Follow-Ups" section is the most relevant.
- Send status: **must-send as reference**, not as the main request body.

### Optional Context

#### `docs/active/db-exporter-request-workflow.md`

- Purpose: reusable request/response checklist and prompt templates.
- What DB Exporter should do: use the response template if they want a
  structured reply that EWShop can ingest cleanly.
- Send status: **optional**, useful when asking for a formal written response.

#### `docs/active/final-snapshot-release-readiness-review.md`

- Purpose: release assessment after final snapshot adoption.
- What DB Exporter should do: read only the DB Exporter follow-up backlog and
  local-only Victory rationale if more context is needed.
- Send status: **optional/internal context**. Do not send as the primary packet.

#### `docs/active/final-snapshot-import-hygiene-audit.md`

- Purpose: confirms what EWShop imports, skips, persists, exposes, and renders.
- What DB Exporter should do: use it only if there is confusion about whether a
  finding is an EWShop import hygiene problem or exporter contract problem.
- Send status: **optional/internal context**.

## Files Not To Send

Do not send these as part of the current DB Exporter ask unless a specific
question needs historical context:

- `docs/active/db-exporter-final-ewshop-handoff.md`
  - Reason: implementation/source input for EWShop final snapshot adoption. Much
    of it is already implemented or superseded by current findings.
- `docs/active/db-exporter-final-ewshop-codex-context.json`
  - Reason: machine-readable final snapshot context for EWShop planning, not a
    human handoff request.
- `docs/active/final-snapshot-codex-ticket-plan.md`
  - Reason: EWShop Jira-style implementation plan, not an exporter request.
- `docs/active/final-snapshot-ticket-execution-playbook.md`
  - Reason: EWShop execution workflow.
- `docs/active/final-snapshot-technical-refactor-review.md`
  - Reason: EWShop internal refactor planning.
- `docs/active/codex-*-evolution.md`
  - Reason: category history and EWShop presentation decisions. Link only when
    a specific category finding needs provenance.
- Archived DB Exporter response records under `docs/archive/codex/`.
  - Reason: historical evidence already summarized by the ledger. Send only if
    DB Exporter asks to reconstruct prior response history.
- Raw Admin diagnostics artifact under
  `docs/archive/codex/diagnostics-evidence-2026-06-24/`.
  - Reason: the active evidence packet summarizes it; raw diagnostics are too
    noisy for a clean handoff.

## Current Exporter-Owned Asks

### 1. Unresolved Imported-Domain Reference Triage

Source: `docs/active/db-exporter-codex-diagnostics-evidence-handoff.md`

Canonical evidence source:

- Generate the raw report from the Admin Import page's Codex diagnostics action.
- The frontend code path is `createCodexDiagnosticsReportText`, which builds
  reference, descriptor/token, and icon usage diagnostics from current
  `/api/codex` data.
- Do not hand the raw report to DB Exporter as-is. It is evidence, not the
  request.

Current evidence:

- 42 `unresolved-imported-domain-ref` diagnostics.
- 84 `unresolved-ref` diagnostics.
- Highest-signal buckets include Quest, Ability, Faction, Minor Faction,
  District, and Unit references.

Ask:

- Classify each high-signal referenced target as public Codex, rich-only,
  internal/prototype, obsolete, or unavailable.
- If public, emit exact public Codex refs or matching public Codex target rows.
- If non-public, mark or omit the reference so EWShop does not present it as a
  public relationship.

Handoff scope:

- Include unresolved imported-domain refs.
- Include true unresolved refs that affect user-visible Codex links.
- Include unknown token/icon vocabulary gaps that need exporter classification.
- Include examples only, not the full diagnostic dump.
- Exclude raw fallback refs, expected style tokens, unused SVG inventory, and
  massive detail dumps unless a narrower contract-hardening request is approved.

### 2. Ability Role Cleanup And Ownership Metadata

Source: `docs/active/db-exporter-ability-metadata-handoff.md`

Ask:

- Clean `Combat role` so each role is supported by public player-facing ability
  content, not low-level mechanics.
- Use canonical public labels `Apply Status` and `Remove Status`.
- Review noisy/ambiguous roles such as `Movement`, `True damage`, `Shield`,
  `Remove Status`, and `Reactivate skill`.
- Emit explicit ability ownership/origin metadata only when source data proves
  it; absence means unknown/not explicitly owned.

### 3. Token/Icon Vocabulary Clarification

Source: `docs/active/db-exporter-codex-diagnostics-evidence-handoff.md`

Ask:

- Clarify whether `DoubleArrow` is a stable public style token EWShop should
  render, or whether it should be replaced/stripped from public prose.
- Clarify whether `PopulationCategory_01`, `PopulationCategory_02`, and
  `PopulationCategory_Homeless` need public token/icon mappings, public display
  labels, or exact public refs.
- Do not require EWShop to infer icon meaning from filenames, keys, prose, or
  manifests.

### 4. Victory Path `Master`

Sources:

- `docs/active/db-exporter-ewshop-handoff-ledger.md`
- `docs/active/db-exporter-ability-metadata-handoff.md`
- `docs/active/final-snapshot-release-readiness-review.md`

Ask:

- Clarify whether `Master` is intended to be a public Victory Path.
- If public, emit a public Victory Path row and exact `referenceKey` values from
  affected Victory Condition facts.
- If non-public, mark/document it as non-public.

EWShop state:

- Victory Paths and Victory Conditions remain local/dev-visible only and hidden
  from normal public top-level Codex navigation.

### 5. Modifier Provenance Metadata

Sources:

- `docs/active/db-exporter-ewshop-handoff-ledger.md`
- `docs/active/db-exporter-ability-metadata-handoff.md`

Ask:

- When source data proves modifier provenance, emit explicit metadata such as
  `sourceKind`, `sourceKey`, `sourceDisplayName`, and `sourceReferenceKey`.
- Optional target metadata is useful only if source-proven.

Goal:

- Allow EWShop to render provenance like "Comes from Technology X" without key
  parsing, naming heuristics, or fuzzy matching.

### 6. Hero Skill Semantics And Defense Zero Clarification

Source: `docs/active/db-exporter-ewshop-handoff-ledger.md`

Ask:

- Clarify what rich Skill `tierIndex` means.
- Clarify what `levelPrerequisite` means.
- Clarify the canonical player-facing projection for Hero skill tiers if there
  is one.
- Confirm whether omitted Hero `Defense` is a stable zero-value convention.

EWShop state:

- Hero detail uses conservative "unlock threshold" language and does not render
  `tierIndex` as player-facing `T1/T2/T3`.
- Missing Hero Defense is rendered as `0 Defense` for comparable stat display;
  Armor is not synthesized.

### 7. Constructible Resource Prerequisite Public References

Source: `docs/active/db-exporter-ewshop-handoff-ledger.md`

Ask:

- If public constructible resource prerequisites are desired, emit exact public
  resource refs or source-backed display metadata.
- Do not expect EWShop to render raw IDs such as `Resource04`.

EWShop state:

- District/Improvement detail enrichment renders exact Tech unlock links,
  District upgrade links, and limited safe placement text.
- Raw resource prerequisite IDs and formula dumps are suppressed.

## EWShop-Owned Issues

These should not be sent as exporter asks:

- Codex category visibility decisions, including hidden Quests, Modifiers,
  Extractors, and local-only Victory categories.
- Action archive row cleanup. EWShop decided Actions are shallow reference rows;
  modifier-heavy mechanics stay out of archive rows.
- Raw fallback reference hardening. EWShop owns whether to keep compatibility
  fallback or later require stricter typed refs.
- Diagnostics deny-list hardening for future diagnostics-only files.
- Admin Import production wiring and local startup import safety.
- Codex landing/category/detail visual design.
- Quest Explorer product behavior. Quest Explorer owns quest browsing,
  branching, chronology, lore, strategy, and graph/tree-like exploration.

## No-Action Or Expected Noise

- Thin entries are not automatically exporter bugs when no public/source-safe
  data exists.
- Raw fallback refs are compatibility looseness, not immediate missing-reference
  defects.
- Unused SVG manifest categories are not bugs by themselves.
- Diagnostics-only exports should remain diagnostics/admin evidence, not public
  Codex imports.
- Broad art/icon/portrait contracts should be a separate future asset packet
  unless a near-term feature requires them.

## Contract Clarity Assessment

The contract is mostly clear enough for DB Exporter to act without adding broad
noisy data again:

- Codex export is public encyclopedia/search/archive projection.
- Rich export is source-truth domain data.
- Diagnostics/internal files are not public imports.
- EWShop consumes exact refs and fails closed.
- EWShop must not infer from keys, names, prose, duplicate titles, SVG
  filenames, Unity paths, GUIDs, mapper names, or fuzzy matching.

The main risk is that some backlog docs still contain broad historical category
asks. The current handoff should therefore state that the active request is not
"make everything richer"; it is "classify/emit exact source-backed public
metadata for the specific validated gaps above."

## Recommended Tightened Wording

Use this wording in the handoff message:

> Please do not broaden public Codex output just because a domain object exists.
> For each requested item, either emit source-backed public Codex metadata/exact
> refs, emit rich source-truth fields if the data belongs to a route/domain
> model, or explicitly classify the data as internal/prototype/obsolete/
> unavailable. Absence is acceptable when source truth is unavailable; EWShop
> will fail closed rather than infer.

For unresolved references:

> For each unresolved imported-domain ref in the evidence packet, classify the
> target as public Codex, rich-only, internal/prototype, obsolete, or
> unavailable. If public, provide the canonical public Codex entry/ref. If not
> public, mark/omit it so EWShop does not surface it as a public relationship.

For public metadata:

> Emit player-facing Codex facts/sections only when supported by public source
> data. Do not project raw implementation mechanics, diagnostics, mapper names,
> Unity paths, GUIDs, or helper rows into public Codex content.

## Open Risks And Questions

- The Ability handoff file is still named as if it only covers Ability metadata,
  but it also contains broader category backlog. That is manageable if this
  cover sheet scopes the current request.
- `db-exporter-final-ewshop-handoff.md` remains active for EWShop adoption
  memory, but it should not be treated as the current request because most
  adoption work has already happened.
- Hero skill semantics may require a DB Exporter response before EWShop can
  build a truthful full Hero planner.
- Victory Paths/Conditions should stay local-only until the `Master` decision is
  answered or product explicitly accepts the caveat.

## Recommended Handoff Message

```md
Hi DB Exporter team,

EWShop has completed most final-snapshot adoption and is preparing a focused
follow-up packet. Please start with:

1. docs/active/db-exporter-current-handoff-package.md
2. docs/active/db-exporter-open-requests.md
3. docs/active/db-exporter-codex-diagnostics-evidence-handoff.md
4. docs/active/db-exporter-ability-metadata-handoff.md
5. docs/active/db-exporter-codex-vs-rich-contract-summary.md
6. docs/active/db-exporter-ewshop-handoff-ledger.md

The current request is not a broad "add more data" ask. The key needs are:

- classify unresolved imported-domain refs from the diagnostics evidence packet;
- clean Ability `Combat role` and use canonical `Apply Status` / `Remove Status`
  labels;
- emit explicit Ability ownership/origin only when source-proven;
- clarify token/icon vocabulary gaps such as `DoubleArrow` and population
  category tokens;
- clarify Victory Path `Master`;
- add Modifier provenance only when source-proven;
- clarify Hero skill tier/threshold semantics and Hero Defense zero semantics;
- provide public constructible resource prerequisite refs only if source-backed.

Please respond using the workflow response shape if possible:

- implemented / unavailable / unsafe / deferred / rejected / needs product
  decision;
- snapshot/export version;
- export kinds/files changed;
- exact fields/sections/refs added or changed;
- examples;
- compatibility notes;
- validation results;
- remaining exporter-owned, EWShop-owned, or product-owned follow-ups.

Important boundary: if source-backed public data does not exist, please say so.
EWShop will fail closed rather than infer from keys, names, prose, SVG filenames,
Unity paths, GUIDs, mapper names, or fuzzy matching.
```
