# DB Exporter Request Workflow

Status: active lightweight workflow  
Created: 2026-06-23

## Purpose

Use this workflow when EWShop needs to ask DB Exporter for metadata, public
Codex projection changes, rich/source-truth export changes, or clarification on
exported data.

The handoff ledger remains the chronological memory:
`docs/active/db-exporter-ewshop-handoff-ledger.md`.

This document is the reusable checklist and prompt template layer. Keep it
short; detailed evidence belongs in the specific handoff/request document.

## Executive Recommendation

Future exporter requests should be evidence-led and closure-oriented:

1. Start from the ledger.
2. Prove the issue exists in current JSON/API/UI.
3. Classify ownership before asking DB Exporter.
4. Ask DB Exporter to either emit canonical source-backed data or explicitly
   confirm that no public/source-truth data exists.
5. Update the ledger after the request, response, implementation finding, or
   follow-up.

## Proposed Workflow

1. Read `docs/active/db-exporter-ewshop-handoff-ledger.md`.
2. Check current priorities and the relevant active docs linked by the ledger.
3. Inspect current exported JSON and, when relevant, EWShop import/API/frontend
   behavior.
4. Classify the issue:
   - DB Exporter source-truth gap;
   - Codex projection gap;
   - EWShop importer/API preservation bug;
   - EWShop frontend presentation issue;
   - product/navigation decision;
   - intentionally thin/deferred.
5. Draft the smallest useful request.
6. Include exact examples and current evidence.
7. State non-goals and no-inference boundaries.
8. Ask for a definitive response: implemented, unavailable, unsafe, deferred,
   rejected, or needs product decision.
9. After DB Exporter responds, update the ledger and the affected active docs.

## Before Requesting Exporter Work

Use this checklist before creating a DB Exporter request:

- Have we checked the ledger for prior requests, responses, rejections,
  superseded asks, and implemented fixes?
- Is the issue visible in current local imports, API output, or UI behavior?
- Is the issue genuinely exporter-owned rather than EWShop presentation,
  importer/API preservation, or product navigation?
- Is there exact evidence: category, entry key, exported field/section/ref, and
  current displayed result?
- For unresolved-reference claims, have we generated or attached the Admin
  Codex diagnostics evidence packet, missing-link JSON/Markdown, or diagnostics
  report when available?
- Are we avoiding inference from keys, names, prose, duplicate titles, SVG
  filenames, GUIDs, Unity paths, mapper names, or fuzzy matching?
- Is this request asking for source-backed public metadata or explicit
  source-truth relationships, not frontend convenience labels?
- Did a prior handoff already say the data is unavailable, unsafe,
  runtime-only, obsolete, internal, diagnostics-only, or product-deferred?
- If yes, what new evidence makes this request different?
- Can EWShop proceed without the exporter change by failing closed?
- What should EWShop do if DB Exporter says no canonical public/source-truth
  data exists?

## EWShop To DB Exporter Prompt Template

```md
Goal:
Create a DB Exporter follow-up for [topic].

Read first:
- docs/active/db-exporter-ewshop-handoff-ledger.md
- [specific active handoff/backlog/category docs]

Context:
- Current EWShop behavior:
- Current exported JSON evidence:
- Current API/UI evidence, if relevant:
- Admin Codex diagnostics evidence packet attached, if unresolved refs are claimed:
- Prior related ledger entry:
- Why this is not already answered/superseded:

Problem:
- Player/product impact:
- Exact affected entries:
- Current exported fields/sections/refs:
- Why EWShop cannot solve this safely:

Ownership classification:
- DB Exporter-owned because:
- EWShop-owned parts, if any:
- Product decision needed, if any:

Requested exporter output:
- Field/section/ref shape, if known:
- Exact refs required:
- Absence semantics:
- Validation expectations:

Non-goals:
- No inference from keys/names/prose/SVG filenames/GUIDs.
- No diagnostics-only data in public UI.
- No route-owned experience duplication.

Please respond with:
- implemented / unavailable / unsafe / deferred / rejected / needs product decision
- snapshot/export version
- changed files/export kinds
- compatibility notes
- validation results
- remaining follow-ups
```

## DB Exporter To EWShop Response Template

```md
Topic:
Response for [request/topic].

Snapshot/export version:
- Snapshot:
- Game/exporter JSON version:
- Validation report:

Result:
- implemented / partially implemented / unavailable / unsafe / deferred / rejected / needs product decision

What changed:
- Export kinds/files:
- Fields/sections/refs added or changed:
- Examples:

What did not change:
- Explicitly deferred or unavailable data:
- Why:

Contract compatibility:
- DTO/root shape changes:
- Optional fields:
- Import/API migration expectation:
- Diagnostics-only files:

Source and safety rules:
- Source data used:
- Exact refs emitted:
- Inference avoided:
- Public vs diagnostics boundary:

EWShop implementation notes:
- Backend/import work needed:
- Frontend/store/rendering work needed:
- Product decision needed:

Validation:
- Commands/checks:
- Counts:
- Known warnings:

Follow-ups:
- Exporter-owned:
- EWShop-owned:
- Product-owned:
```

## What Goes In The Ledger

Add concise entries for:

- new EWShop -> DB Exporter requests;
- DB Exporter responses;
- EWShop implementation results from a handoff;
- validated follow-up findings;
- decisions that supersede or close prior handoffs.

Each ledger entry should link to the detailed doc rather than copying it.

## What Stays In Separate Handoff Docs

Use separate handoff/request docs for:

- long evidence tables;
- category-by-category audits;
- exact JSON snippets;
- full validation logs;
- implementation packet details;
- response inventories;
- ticket plans.

## Template Maintenance

Prompt templates should evolve only when a repeated failure mode appears in the
ledger. Update this workflow doc, not every old handoff.

Do not add category-specific examples to the templates unless they reveal a
general process rule.

## Minimum Useful Workflow Change

For future exporter work, the minimum process is:

1. Read the ledger.
2. Run the before-request checklist.
3. Use the EWShop request template.
4. Ask DB Exporter to close ambiguity explicitly.
5. Update the ledger after the response or implementation finding.
