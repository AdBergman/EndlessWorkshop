# Current Action Priorities

Current as of 2026-06-10.

This list reflects the current product focus:

- Do not work on Units or unit art right now.
- Avoid broad site-wide visual rewrites. Visual work should happen only in
  areas already being touched, and in small independently reviewable passes.

## P0 - DB Exporter Handoff For Codex Metadata Coverage

Owner: DB exporter team primarily; EWShop backend/frontend as consumers.

Status: backend/frontend support exists, but exporter-populated Codex metadata
is currently only present for populations in the local 0.80 Codex payloads.
EWShop cannot complete this by parsing prose harder; the exporter needs to emit
more structured metadata for high-value Codex kinds.

Verified local Codex metadata coverage:

| Codex kind | Entries | With facts | With sections | With public context keys |
| --- | ---: | ---: | ---: | ---: |
| `populations` | 26 | 26 | 25 | 26 |
| `abilities` | 326 | 0 | 0 | 0 |
| `councilors` | 47 | 0 | 0 | 0 |
| `districts` | 167 | 0 | 0 | 0 |
| `equipment` | 159 | 0 | 0 | 0 |
| `factions` | 5 | 0 | 0 | 0 |
| `heroes` | 79 | 0 | 0 | 0 |
| `improvements` | 123 | 0 | 0 | 0 |
| `minor_factions` | 16 | 0 | 0 | 0 |
| `quests` | 292 | 0 | 0 | 0 |
| `tech` | 133 | 0 | 0 | 0 |
| `traits` | 178 | 0 | 0 | 0 |
| `units` | 157 | 0 | 0 | 0 |

Actionable next items:

1. Use `docs/active/db-exporter-codex-metadata-handoff.md` as the active DB
   exporter/backend handoff.
2. Ask for the next exporter metadata domain after populations.
3. Recommended first exporter slice: `equipment`.
4. After exporter delivery, add backend/API/frontend fixture tests proving the
   metadata survives import and renders in Codex detail.
5. Keep current text-prefix parsing as fallback only for older exports.

Recommended first slice: `equipment`, because current Codex text already has
stable prefixes for type, slot, rarity, tier, access pool, and value.

## P0 - Quest Documentation Cleanup Only

Owner: EWShop.

Status: high priority, docs-only.

Actionable next items:

1. Mark active Quest docs with canonical-status banners where missing.
2. Archive or mark superseded Quest docs that still imply the old
   step/choice/path model is authoritative.
3. Keep canonical Quest semantics docs intact.
4. Do not change Quest Explorer UI, adapters, routes, or exporter contracts in
   this pass.

## P0 - Routing And SEO Documentation Cleanup

Owner: EWShop.

Status: high priority because several docs still read like active backlogs even
though most tickets are completed.

Actionable next items:

1. Convert `docs/frontend/routing-diagnosis.md` into a short status note.
2. Move completed routing investigation detail to `docs/archive/` if still
   useful.
3. Convert `docs/backend/seo-backend-review.md` into a short current status and
   remaining-risk note.
4. Keep `docs/backend/seo-architecture.md` as the active SEO contract.
5. Leave implementation alone unless a doc cleanup reveals a real stale
   contract.

## P1 - Codex Links For Quest Strategy View

Owner: EWShop frontend/backend, when Quest Strategy work is back in scope.

Status: likely doable with current app data, but should be mapped into
actionable Jira-style tickets before implementation.

Actionable next items:

1. Create Jira tickets for a generic Codex reference resolver.
2. Start with Strategy rewards, then requirements.
3. Use exact keys only: `codexEntryKey`, `entryKey`, known aliases, or typed
   reference keys.
4. Do not infer from titles or prose.
5. Keep Quest copy primary; Codex preview/linking should be secondary context.

Draft Jira ticket shape for later:

- `QX-CODEX-001`: Build exact Codex reference resolver.
- `QX-CODEX-002`: Add Strategy reward Codex links.
- `QX-CODEX-003`: Add Strategy requirement Codex links.
- `QX-CODEX-004`: Add tests for unresolved references and no-title-inference.
- `QX-CODEX-005`: Add optional compact Codex preview/tooltip after links are
  stable.

## P2 - Local Visual Polish Only Where We Are Working

Owner: EWShop frontend.

Status: site-wide visual cohesion is not a good standalone project right now.

Actionable next items:

1. Do not do a broad site-wide visual pass.
2. When touching a route or component for product work, apply small local visual
   polish that follows existing direction.
3. Keep changes bounded and screenshot-verified.
4. Leave global token systems alone unless a local change clearly needs them.

## Out Of Scope For Now

- Units and unit art.
- Large site-wide restyling passes.
