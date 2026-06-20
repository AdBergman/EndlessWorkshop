# DB Exporter Ability Metadata Handoff

Status: active exporter follow-up
Created: 2026-06-20
Owner: DB Exporter team primarily; EWShop frontend as metadata consumer

## Purpose

Ability Archive UI work exposed two exporter-owned metadata issues:

- `Combat role` currently includes engine/mechanic tags that do not always match
  what a player can see in the public effect text.
- Ability faction/origin ownership is not explicitly available to the frontend.

This is a focused follow-up. It does not reopen the completed
`DB-CODEX-DEF-*` response/import QA pass, and it does not request frontend-side
inference from ability keys, display names, old context strings, or prose.

## Current Source Documents Audited

Keep active:

- `docs/active/codex-db-exporter-implementation-packets/codex-db-exporter-definitive-response.md`
  - baseline for the current `Ability mechanic`, `Ability source`, and
  `Combat role` exports.
- `docs/active/codex-db-exporter-response-ewshop-reconciliation.md`
  - closed EWShop reconciliation for the definitive exporter response.
- `docs/active/codex-db-exporter-response-import-qa-results.md`
  - current import/API/browser QA pass record for snapshot `20260616-210540`.
- `docs/active/codex-content-quality-diagnostics.md`
  - current workflow for separating EWShop display work from exporter/content
  follow-up.
- `docs/frontend/svg-icon-contracts.md`
  - current frontend-safe icon contract guidance: do not hardcode icon filenames
  or infer icons from raw keys.

Historical context already archived:

- `docs/archive/codex/db-exporter-codex-metadata-handoff-2026-06-10.md`
- `docs/archive/codex/db-exporter-codex-reference-kinds-handoff-2026-06-10.md`
- `docs/archive/codex/codex-metadata-adoption-audit-2026-06-11.md`
- `docs/archive/codex/superseded-2026-06-13-exporter-packet-inputs/`
- `docs/archive/codex/superseded-2026-06-16-db-exporter-definitive-response/`
- `docs/archive/codex/superseded-2026-06-17-premium-ui-baseline/`

No additional docs were archived in this pass. The older
`docs/exporter-handoff-status.md` remains a general historical/status note, but
its DB Exporter pointers are not the current source of truth for this handoff.

## Current Ability Metadata Baseline

The definitive response says `abilities-codex` now exports additive facts:

- `Ability mechanic`
- `Ability source`
- `Combat role`
- existing `Kind`
- existing `Category`

Current known `Combat role` counts from the accepted snapshot:

- Action token: 3
- Damage: 60
- Heal: 24
- Movement: 91
- Push: 12
- Reactivate skill: 12
- Shield: 48
- Status apply: 70
- Status remove: 15
- Summon: 12
- Teleport: 17
- True damage: 59

EWShop currently consumes these values as exported facts only. The frontend does
not derive role values from names, keys, descriptions, hero pages, equipment
pages, or old secondary-context strings.

## Problem 1: Combat Role Is Too Noisy

`Combat role` should be a player-facing gameplay browse/filter label. It should
describe what the public ability does, not every internal effect implementation
tag that contributed to the formula.

Observed bad examples:

- `Choral Onslaught` currently appears with roles like `Damage`, `Movement`,
  `Status apply`, and `True damage`, while the visible public effects support
  damage plus status application. `Movement` and `True damage` appear to be
  implementation leakage.
- `Accusation` can similarly surface `Movement` and `True damage` despite the
  player-facing read being defense ignore, hero damage scaling, determination
  damage, and Weakened application.
- `Power Slash` variants have been observed with `Movement`, `Status remove`,
  and `True damage` even when the public row reads as a direct damage ability.
- `Second Wind` has shown movement/reactivation/shield-style roles while the
  player-facing text reads closer to heal/status application.
- `Rallying Cry` has shown shield-style role leakage while the visible effects
  read closer to damage/status application.
- `Anti Cavalry` reads like a conditional damage modifier and should be reviewed
  against the Damage role rule.

## Combat Role Cleanup Requirements

The exporter should revise role assignment rules so each exported role is
supported by public, player-facing ability content.

General rules:

- Use explicit source data only.
- Do not infer role from ability key, display name, prose, hero ownership,
  equipment ownership, or old context/footer strings.
- Prefer visible/public effect semantics over raw low-level implementation tags.
- Treat role absence as "no proven public role", not as a frontend issue.
- Keep comma-separated `Combat role` values only when each role is independently
  proven by public source data.

Recommended role taxonomy:

- `Damage`
- `Shield`
- `Heal`
- `Movement`
- `Teleport`
- `Push`
- `Summon`
- `Status apply`
- `Status remove`
- `Reactivate skill`

Review before keeping as browse/filter roles:

- `True damage`
- `Action token`

These may be useful detail-page mechanics, but they often read as implementation
or formula details rather than first-class player browse roles. If retained,
they need stricter player-facing assignment rules.

Specific rule guidance:

- `Damage`: emit when public text/effect lines show direct damage, conditional
  damage bonus, or percent/scaling damage.
- `Shield`: emit only when public text/effect lines clearly grant or interact
  with shields.
- `Heal`: emit when public text/effect lines clearly restore health or healing.
- `Movement`: emit only when public text/effect lines clearly move a unit, alter
  movement in player-facing terms, or grant movement as the ability's public
  effect. Do not emit merely because the implementation uses a movement-ratio
  effect internally for targeting or formula support.
- `Teleport`: emit only for public teleport/reposition behavior.
- `Push`: emit only for public push/knockback behavior.
- `Summon`: emit only for public summon/spawn behavior.
- `Status apply`: emit when public text/effect lines apply a status.
- `Status remove`: emit when public text/effect lines remove, cleanse, or dispel
  a status.
- `Reactivate skill`: emit when public text/effect lines clearly reactivate,
  refresh, or grant another skill/action use.
- `True damage`: if retained, emit only when public wording makes true damage or
  defense-ignoring damage explicit enough for a player-facing role.

Exporter validation should include a role audit report with:

- role count before/after;
- representative examples per role;
- examples removed from noisy roles;
- false-positive review for Movement, True damage, Shield, Status remove, and
  Reactivate skill;
- false-negative review for Damage, Heal, Status apply, and Status remove.

## Problem 2: Ability Source Is Provenance, Not Role

`Ability source` is useful metadata, but it should remain provenance/classification
metadata rather than player-facing gameplay taxonomy.

Keep source values only when source data proves them. Current values such as
`Battle skill`, `Battle ability`, `Unit ability event`, `Battle reward`, and
`Mixed` are acceptable as exported facts, but EWShop should not need to use
source as a replacement for cleaned gameplay role metadata.

## Problem 3: Explicit Ability Ownership Metadata Is Missing

Some abilities appear faction-specific or faction-originated, but most abilities
are not faction-specific. EWShop should not infer ownership from:

- ability key fragments;
- old footer/context strings such as `Last Lords / Combat / Ability`;
- hero/equipment pages;
- display names;
- prose;
- SVG icon paths.

Frontend needs explicit ownership only when source data proves it. Absence of
ownership must mean "unknown/not explicitly owned", not "neutral/common".

## Faction Ownership Metadata Requirement

Follow the existing exporter/Codex fact and reference style unless there is a
strong reason not to.

Preferred minimal shape:

- emit a normal fact/metadata line for explicit ownership;
- include a stable faction key/reference in the same style already used by
  current Codex metadata, where facts and section items can carry
  `referenceKey`;
- keep the exact exported shape compact and consistent with current contracts.

The exporter team should decide the final field name and shape. It must satisfy:

1. EWShop can reliably detect explicit ability ownership.
2. EWShop can resolve the faction display/icon target without parsing prose,
   ability keys, or old context strings.
3. Missing ownership metadata means unknown/not explicitly owned.
4. Ownership is emitted only when source data proves it.

Compact acceptable patterns include:

- a normal Codex fact such as `Origin faction: Kin of Sheredyn` with
  `referenceKey: Faction_KinOfSheredyn`;
- `factionKey: "Faction_KinOfSheredyn"` if an existing DTO path already uses
  this style;
- `originFactionKey: "Faction_KinOfSheredyn"` if that better expresses source
  semantics;
- `factionSvgKey: "kinOfSheredyn"` only if this is already a stable exporter to
  frontend icon contract.

Do not introduce a large new nested JSON object unless the current exporter/Codex
contract already has a strong matching pattern. Do not require EWShop to resolve
faction icons by parsing keys or display text.

## Non-Goals

- No frontend key/name/prose inference.
- No faction icon inference from ability icon keys or SVG filenames.
- No rewrite of the Codex importer/API contracts unless the exporter team
  decides the current fact/reference style is insufficient.
- No new generic metadata framework.
- No changes to hidden Modifiers or hidden top-level Extractors.
- No request to make every ability faction-owned.
- No request to invent ownership where source data is ambiguous.

## Expected Exporter Validation

Before returning the next ability metadata snapshot, provide:

- `Combat role` count changes before/after cleanup.
- A sampled role audit for each retained role.
- Explicit examples for Choral Onslaught, Accusation, Power Slash variants,
  Second Wind, Rallying Cry, and Anti Cavalry.
- A list of abilities with explicit faction ownership emitted.
- A list of abilities reviewed but left without ownership because source data did
  not prove ownership.
- Confirmation that `Origin faction` or equivalent ownership metadata includes a
  stable faction reference key when emitted.
- Confirmation that absent ownership is intentionally absent, not defaulted to
  common/neutral.

## EWShop Follow-Up After Exporter Return

After a new exporter snapshot is available, EWShop should:

1. Import the snapshot and confirm facts/reference keys are preserved by the
   existing Codex importer/API/store path.
2. Re-run the Ability role audit against the returned data.
3. Update Ability Archive role filters only from cleaned exported facts.
4. Render optional faction identity markers only from explicit exported
   ownership metadata.
5. Keep current no-inference rules for keys, display names, prose, and SVG paths.
