# DB Exporter Open Requests

Status: canonical active exporter work queue  
Created: 2026-06-25  
Owner: EWShop technical lead

## Purpose

This is the canonical list of active requests for the DB Exporter team.
Historical discussion, evidence, and implementation details live in the
referenced documents. Start here to answer: "What work is currently requested
from DB Exporter?"

## Active Requests

### DBE-001

Status: Ready  
Priority: P1  
Title: Unresolved Imported-Domain Reference Classification

Problem:

Admin Codex diagnostics show references to imported domain targets that EWShop
cannot safely resolve to public Codex entries. These may be public Codex gaps,
rich-only/source-truth records, internal/prototype data, obsolete aliases, or
unavailable data. EWShop cannot classify them without exporter source context.

Requested exporter change:

Classify each high-signal unresolved imported-domain reference as public Codex,
rich-only, internal/prototype, obsolete, or unavailable. If the target is public,
emit the canonical public Codex target row or exact public Codex reference. If
it is not public, omit it from public relationship refs or mark it as non-public
so EWShop does not surface it as a public link.

Success criteria:

- Each `unresolved-imported-domain-ref` in the evidence packet is answered by
  classification or corrected exported refs.
- Public targets resolve through exact public Codex refs.
- Non-public/internal targets are explicitly classified or omitted from public
  relationship output.
- EWShop does not need raw-key fallback, key parsing, or name/prose inference to
  render public relationships.

Evidence:

- `docs/active/db-exporter-codex-diagnostics-evidence-handoff.md`
- `docs/active/db-exporter-current-handoff-package.md`
- `docs/active/db-exporter-ewshop-handoff-ledger.md`

Owner: DB Exporter  
Expected output: classification, exact public refs, corrected public Codex rows,
or explicit non-public/unavailable decisions.

### DBE-002

Status: Ready  
Priority: P1  
Title: Ability Role Cleanup And Ability Ownership Metadata

Problem:

Ability `Combat role` is intended to be player-facing browse metadata, but some
role assignments still appear to leak implementation mechanics or low-level
effect tags. EWShop also cannot safely determine explicit ability ownership or
origin without source-backed metadata.

Requested exporter change:

Clean `Combat role` so each role is supported by public player-facing ability
content. Use canonical labels `Apply Status` and `Remove Status`. Review noisy
roles such as `Movement`, `True damage`, `Shield`, `Remove Status`, and
`Reactivate skill`. Emit explicit ability ownership/origin metadata only when
source data proves it, with a stable faction/source reference when available.
Absence should mean unknown/not explicitly owned.

Success criteria:

- Role counts and sample audits are provided before/after cleanup.
- `Apply Status` and `Remove Status` replace legacy `Status apply` /
  `Status remove` labels in new exports.
- No role is emitted solely from hidden implementation mechanics.
- Abilities with source-proven ownership include exact ownership/origin metadata.
- Abilities without source-proven ownership remain absent, not defaulted to
  common/neutral.

Evidence:

- `docs/active/db-exporter-ability-metadata-handoff.md`
- `docs/active/db-exporter-codex-vs-rich-contract-summary.md`
- `docs/active/db-exporter-ewshop-handoff-ledger.md`

Owner: DB Exporter  
Expected output: cleaned public role facts, canonical role labels, explicit
source-proven ownership/origin metadata, validation report.

### DBE-003

Status: Ready  
Priority: P1  
Title: Public Vocabulary And Icon Token Clarification

Problem:

Current Codex diagnostics show a small set of unresolved token/icon vocabulary
gaps, especially in ability text and population category tokens. EWShop should
not guess whether these are renderable icons, formatting markers, public labels,
or internal tokens.

Requested exporter change:

Clarify whether `DoubleArrow` is a stable public style/rendering token, a
formatting marker that should be structured/stripped from public prose, or
diagnostics-only noise. Clarify whether `PopulationCategory_01`,
`PopulationCategory_02`, and `PopulationCategory_Homeless` should have public
token/icon mappings, public display labels, or exact public refs.

Success criteria:

- Each listed token has an explicit classification.
- If a token is public-renderable, exporter provides a stable vocabulary/icon
  mapping or public display contract.
- If a token is formatting/internal, exporter documents or suppresses it so
  EWShop does not treat it as a missing icon.
- EWShop does not infer icon meaning from filenames, raw keys, manifests, or
  prose.

Evidence:

- `docs/active/db-exporter-codex-diagnostics-evidence-handoff.md`
- `docs/archive/exporter-handoffs/ewshop-handoff-2026-06.md`
- `docs/archive/exporter-handoffs/description-token-icons-handoff-2026-06.md`

Owner: DB Exporter  
Expected output: vocabulary clarification, icon/token mapping, or explicit
non-renderable/internal classification.

### DBE-004

Status: Ready  
Priority: P1  
Title: Codex Versus Rich Export Boundary Confirmation

Problem:

EWShop needs future exporter changes to preserve a clean boundary: Codex exports
are public encyclopedia/search/archive projections, while rich exports are
source-truth domain models. Prior handoffs showed that broad data additions can
create noisy public rows if internal, diagnostic, or route-owned data is
projected into Codex.

Requested exporter change:

For new or changed data in this handoff, place fields in the correct export
surface: public Codex facts/sections/refs only when player-facing and
source-backed; rich/domain fields for route-owned source truth; diagnostics-only
output for internal/debug/investigation data. Explicitly note when requested
data is unavailable, unsafe, runtime-only, internal, or product-deferred.

Success criteria:

- DB Exporter response states whether each change is Codex projection,
  rich/domain source truth, diagnostics-only, unavailable, or product-deferred.
- Public Codex output does not gain raw implementation mechanics, mapper names,
  Unity paths, GUIDs, helper rows, or diagnostics-only data.
- EWShop can fail closed when source truth is unavailable.

Evidence:

- `docs/active/db-exporter-codex-vs-rich-contract-summary.md`
- `docs/active/db-exporter-request-workflow.md`
- `docs/active/db-exporter-current-handoff-package.md`

Owner: Joint  
Expected output: richer contract/response classification, not necessarily new
fields.

### DBE-005

Status: Ready  
Priority: P2  
Title: Victory Path `Master` Clarification

Problem:

`Master` appears as a Victory path value for Supremacy and Insights, but
`victorypaths-codex` has no matching public `VictoryPath_*` row/reference.
EWShop imports the current data correctly, so this is not an EWShop
configuration issue. Victory Paths and Victory Conditions remain local/dev-only
until this is clarified.

Requested exporter change:

Clarify whether `Master` is a public Victory Path. If public, emit a public
Victory Path row and exact `referenceKey` values from affected Victory
Condition facts. If non-public, mark or document it as non-public.

Success criteria:

- `Master` has either a public Victory Path entry/exact refs or explicit
  non-public classification.
- Victory Condition facts do not point at an ambiguous missing public path.
- EWShop can decide whether Victory categories are safe for public top-level
  navigation.

Evidence:

- `docs/active/db-exporter-ewshop-handoff-ledger.md`
- `docs/active/db-exporter-ability-metadata-handoff.md`
- `docs/active/final-snapshot-release-readiness-review.md`

Owner: DB Exporter  
Expected output: new public row/ref, or explicit non-public classification.

### DBE-006

Status: Ready  
Priority: P2  
Title: Modifier Provenance Metadata

Problem:

EWShop can resolve exact Action -> Modifier and Modifier -> affected Action
relationships, but cannot safely show what grants, unlocks, or owns a Modifier.
That prevents useful player-facing provenance such as "Comes from Technology X"
without violating the no-inference rule.

Requested exporter change:

When source data proves modifier provenance, emit explicit source metadata such
as `sourceKind`, `sourceKey`, `sourceDisplayName`, and `sourceReferenceKey`.
Optional target metadata is useful only when source-proven.

Success criteria:

- Modifier provenance is emitted only when source-proven.
- Provenance can resolve to exact public Codex targets when public.
- Non-public or unavailable provenance remains absent/classified.
- EWShop does not need key parsing, naming heuristics, prose interpretation, or
  fuzzy matching.

Evidence:

- `docs/active/db-exporter-ewshop-handoff-ledger.md`
- `docs/active/db-exporter-ability-metadata-handoff.md`
- `docs/active/final-snapshot-release-readiness-review.md`

Owner: DB Exporter  
Expected output: new metadata, exact public source refs, or explicit absence.

### DBE-007

Status: Ready  
Priority: P2  
Title: Hero Skill Semantics And Defense Zero Clarification

Problem:

EWShop can render Hero starting skills, skill paths, and skill options from rich
Hero/Skill exports, but cannot safely label exported `tierIndex` as
player-facing `T1/T2/T3`. EWShop also presents missing Hero `Defense` as `0
Defense` for comparable stat grids and needs exporter confirmation that omitted
Defense is a stable zero convention.

Requested exporter change:

Clarify what rich Skill `tierIndex` means, what `levelPrerequisite` means, and
what source-backed projection should be used for canonical player-facing Hero
skill tiers if one exists. Confirm whether omitted Hero `Defense` means zero; if
preferred, emit explicit `0 [Defense] Defense` public stat lines.

Success criteria:

- Exporter response defines `tierIndex` and `levelPrerequisite` semantics.
- If canonical player-facing tiers exist, exporter states how to project them.
- Omitted Hero Defense is confirmed as zero or exporter emits explicit values.
- EWShop can avoid misleading Hero planner/progression labels.

Evidence:

- `docs/active/db-exporter-ewshop-handoff-ledger.md`
- `docs/active/final-snapshot-release-readiness-review.md`
- `docs/active/final-snapshot-codex-ticket-plan.md`

Owner: DB Exporter  
Expected output: semantics clarification, optional explicit public stat values.

### DBE-008

Status: Ready  
Priority: P3  
Title: Constructible Resource Prerequisite Public References

Problem:

Rich District/Improvement data contains planning-related fields, but raw
resource prerequisite IDs such as `Resource04` are not player-facing and cannot
be rendered safely in Codex detail pages. EWShop currently suppresses raw
resource prerequisite IDs and formula dumps.

Requested exporter change:

If public constructible resource prerequisites are intended for EWShop planning
surfaces, emit exact public resource refs or source-backed display metadata.
Otherwise leave raw prerequisite IDs out of public Codex projection.

Success criteria:

- Public constructible prerequisites resolve through exact public refs or safe
  display metadata.
- Raw resource IDs and RPN/formula internals remain out of public Codex.
- EWShop can render or suppress prerequisites without inference.

Evidence:

- `docs/active/db-exporter-ewshop-handoff-ledger.md`
- `docs/active/final-snapshot-release-readiness-review.md`
- `docs/active/final-snapshot-import-hygiene-audit.md`

Owner: DB Exporter  
Expected output: exact public refs/display metadata, or explicit non-public /
not-yet-supported decision.

## Recently Completed

- Final snapshot `20260622-055736` was delivered and adopted for the major
  public Codex compatibility cycle.
- Rich Factions, Heroes, and Skills imports were implemented in EWShop and are
  no longer exporter requests.
- Common Hero skill rows were found in exported Skills data and split by EWShop;
  no exporter request is open for Common skill presence.
- Diagnostics-only final snapshot files are skipped by EWShop import paths.
- Quest archive grouping in Codex was rejected; Quest Explorer remains the
  route-owned quest experience.

