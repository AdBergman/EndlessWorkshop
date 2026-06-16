# Codex DB Exporter Implementation Packets

Status: active exporter/backend/editorial handoff
Created: 2026-06-13
Source backlog:
`docs/archive/codex/superseded-2026-06-13-exporter-packet-inputs/codex-category-jira-backlog.md`

## Purpose

This document turns the Codex category backlog into DB-exporter-ready work only
where the work is justified now. It is intentionally not an EWShop frontend
implementation plan.

DB exporter teams do not need EWShop internals for these packets. They need:

- current exported JSON shape;
- desired JSON shape;
- exact examples;
- validation expectations;
- guardrails.

Global guardrail: EWShop must not infer links from display names, prose, fuzzy
matching, or "looks like this should match." If a relationship is player-facing
and linkable, export exact metadata.

## Full Backlog Triage

| Ticket | Title | Owner | Priority | Triage status | Reason | DB exporter packet? | If not, what happens instead |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CDEX-CAT-001 | Export Exact Tech Unlock Refs | DB exporter/editorial | P0 | exporter packet now | High player value, exact metadata missing, clear JSON target shape. | Yes, packet `CDEX-EXP-001`. | - |
| CDEX-CAT-002 | Render Tech Unlock Summaries After Exact Refs | EWShop frontend | P1 blocked | frontend-only | Frontend work is blocked until Tech unlock refs exist. | No. | Wait for `CDEX-EXP-001`, then prototype EWShop summaries. |
| CDEX-CAT-003 | Export Exact Major Faction Population Threshold Reward Refs | DB exporter/editorial | P0 | exporter packet now | Confirmed current major faction thresholds are text-only; working minor/special shape already exists. | Yes, packet `CDEX-EXP-002`. | - |
| CDEX-CAT-004 | Establish Resource Codex Entities And Extractor Refs | Backend/product/exporter mixed | P0 | exporter packet now | EWShop confirmed generic Codex `resources` import is acceptable; exporter implementation is F8-validated. | Yes, packet `CDEX-EXP-003`, implemented and F8-validated. | Resource deposit/POI pages remain deferred. |
| CDEX-CAT-005 | Add Gameplay Summaries And Affected Targets For Thin Actions | DB exporter/editorial | P0 | exporter packet now | Current Actions have many facts-only entries; exporter/editorial can improve without EWShop code. | Yes, packet `CDEX-EXP-004`. | - |
| CDEX-CAT-006 | Clean Diplomatic Treaty Effects And Public Text | DB exporter/editorial | P0 | exporter packet now | Clear public text defects and missing Effects on a small category. | Yes, packet `CDEX-EXP-005`. | - |
| CDEX-CAT-007 | Export Status Sub-Kind And Scope Metadata | DB exporter/editorial | P1 | exporter packet now | Needed before safe Status grouping; exporter owns taxonomy. | Yes, packet `CDEX-EXP-006`. | - |
| CDEX-CAT-008 | Add Status Grouping After Scope Metadata Lands | EWShop frontend | P2 blocked | frontend-only | EWShop can only act after exact status scope metadata exists. | No. | Wait for `CDEX-EXP-006`. |
| CDEX-CAT-009 | Resolve Trait Unlock And Granted Ability References | DB exporter/editorial | P1 | exporter packet now | Trait refs are known weak point; existing section shapes already support exact refs. | Yes, packet `CDEX-EXP-007`. | - |
| CDEX-CAT-010 | Review Trait Preview Surfaces After Refs Improve | EWShop frontend | P2 blocked | frontend-only | Product/frontend review after trait refs improve. | No. | Wait for `CDEX-EXP-007`. |
| CDEX-CAT-011 | Clean Quest Reward And Requirement Public Refs | DB exporter/editorial | P1 | exporter packet now | Quest requirements/rewards need exact public refs and labels; frontend already preserves exact metadata. | Yes, packet `CDEX-EXP-008`. | - |
| CDEX-CAT-012 | Decide Thin Category Demotion/Searchable-Only Treatment | Product/navigation mixed | P1 | product decision needed | This is a navigation/product choice, not exporter implementation. | No. | Human product review decides treatment for thin browse surfaces. |
| CDEX-CAT-013 | Faction Package Browser QA And Restrained Polish | EWShop frontend | P1 | frontend-only | Faction package is EWShop UI QA/polish; exporter packet only if new exact faction refs are requested later. | No. | Browser QA in EWShop. |
| CDEX-CAT-014 | Codex Related Entries And Preview-Surface Consistency Pass | EWShop frontend | P2 | frontend-only | Existing preview-surface consistency is an EWShop concern. | No. | EWShop review after new exact refs land. |
| CDEX-CAT-015 | Clean Modifier Public Labels Where They Appear As Targets | DB exporter/editorial | P1 | exporter packet now | Modifiers remain hidden but related chips can expose raw/generated labels. | Yes, packet `CDEX-EXP-009`. | - |
| CDEX-CAT-016 | Fill Thin District, Improvement, Ability, And Status Entries | DB exporter/editorial | P1 | exporter packet now | Shared root cause: public entities with no player-facing mechanics. | Yes, packet `CDEX-EXP-010`. | - |
| CDEX-CAT-017 | Verify Frontend Quick Wins After New Export Batches | EWShop frontend | P2 | defer / not worth doing now | This is a future repeat workflow, not current exporter work. | No. | Re-run after new exporter batch. |

Triage counts:

| Status | Count |
| --- | ---: |
| exporter packet now | 10 |
| frontend-only | 5 |
| product decision needed | 1 |
| defer / not worth doing now | 1 |
| blocked by missing evidence | 0 |
| already covered | 0 |

## Packet CDEX-EXP-001 - Tech Unlock Exact Refs

- Source ticket: `CDEX-CAT-001`
- Readiness: ready
- Owner: DB exporter/editorial
- Triage status: exporter packet now

### Why Now

4X player problem: "If I research this, what new unit, district, improvement,
action, upgrade, or mechanic becomes available?" Current Tech pages often show
effects and broad related entries, but Related Entries cannot safely distinguish
unlocks from context.

### Current Exported Shape

Example text-only unlock:

```json
{
  "entryKey": "Mukag_Technology_03",
  "displayName": "Deciphering Stone",
  "exportKind": "tech",
  "sections": [
    {
      "title": "Unlocks",
      "lines": [
        "Unlocks an evolution of the Observatory."
      ]
    }
  ],
  "referenceKeys": [
    "Faction_Mukag"
  ]
}
```

Example broad related targets that are not explicitly unlocks:

```json
{
  "entryKey": "Aspect_Technology_Unit_Specialization_00",
  "displayName": "Choral Amplifier",
  "referenceKeys": [
    "Faction_Aspect",
    "Unit_Aspect_Ranged_SpecializationA",
    "Unit_Aspect_Ranged_SpecializationB"
  ]
}
```

Current missing fields:

- exact `sections[].items[].referenceKey` for unlock targets;
- unlock target category/type;
- safe public unlock labels where text currently mentions a mechanic.

### Desired Exported Shape

Use `Unlocks` section items with exact refs when canonical targets exist.

```json
{
  "title": "Unlocks",
  "items": [
    {
      "label": "Observer upgrade",
      "referenceKey": "Unit_Aspect_Scout_SpecializationA",
      "facts": [
        {
          "label": "Unlock type",
          "value": "Unit specialization"
        }
      ]
    }
  ]
}
```

Fields:

- `sections[].title = "Unlocks"`: required when unlocks are public.
- `sections[].items[].label`: required public label.
- `sections[].items[].referenceKey`: required when a target Codex entry exists.
- `sections[].items[].facts[].label = "Unlock type"`: optional but useful.
- `referenceKeys` and `publicContextKeys`: include exact target keys when public.
- Omit `referenceKey` when the unlock is text-only or has no public target.

### Mapping / Source Guidance

Canonical source should be the technology's actual unlock grant list, not
description prose. Count as canonical only if the exporter can prove the target
asset/entity from tech data. Keep flavor/mechanic text as `lines` when no
target exists.

### EWShop Rendering Expectation

EWShop can render one-line Tech unlock summaries once exact refs exist. EWShop
must continue not inferring unlocks from related entries, prose, or display
names.

### Validation

Run from `frontend/` after export/import:

```bash
npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md
npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md
```

Expected improvement:

- Tech unlock row in relationship gap audit drops from text-only/missing refs.
- Tech Unlock section items show resolved refs.

Browser review targets: Deciphering Stone, Keystones, Choral Amplifier, Common
Rights.

### Guardrails

- Do not export inferred display-name matches.
- Do not mark broad context refs as unlocks.
- Do not expose hidden/unreleased targets.
- Do not put raw internal keys in public labels.

### Open Questions

- What public unlock types should be emitted: Unit, Unit specialization,
  District, Improvement, Action, Trait, Status, Resource, mechanic?

## Packet CDEX-EXP-002 - Major Faction Population Threshold Reward Refs

- Source ticket: `CDEX-CAT-003`
- Readiness: ready
- Owner: DB exporter/editorial
- Triage status: exporter packet now

### Why Now

4X player problem: "What does this population breakpoint unlock?" Major faction
threshold rewards currently name rewards as text only, so EWShop must leave them
plain even when likely target entries exist.

### Current Exported Shape

Major faction current shape:

```json
{
  "entryKey": "Population_KinOfSheredyn",
  "sections": [
    {
      "title": "Threshold rewards",
      "items": [
        {
          "label": "At 5 population",
          "facts": [
            {
              "label": "Reward",
              "value": "Military Press"
            }
          ]
        }
      ]
    }
  ],
  "referenceKeys": [
    "Faction_KinOfSheredyn"
  ]
}
```

Working minor/special shape:

```json
{
  "label": "At 5 population",
  "referenceKey": "DistrictImprovement_MinorFaction_06",
  "facts": [
    {
      "label": "Reward",
      "value": "Bor's Sparring Ring",
      "referenceKey": "DistrictImprovement_MinorFaction_06"
    }
  ]
}
```

Current missing fields:

- major faction threshold item `referenceKey`;
- Reward fact `referenceKey`;
- target key in `referenceKeys` / `publicContextKeys` when public.

### Desired Exported Shape

```json
{
  "title": "Threshold rewards",
  "items": [
    {
      "label": "At 5 population",
      "referenceKey": "KinOfSheredyn_DistrictImprovement_01",
      "facts": [
        {
          "label": "Reward",
          "value": "Military Press",
          "referenceKey": "KinOfSheredyn_DistrictImprovement_01"
        }
      ]
    }
  ]
}
```

Fields:

- `items[].referenceKey`: required when a threshold reward target exists.
- Reward fact `referenceKey`: required when the fact names the same target.
- `referenceKeys` / `publicContextKeys`: include the target key when public.
- Omit refs when unknown, text-only, or not player-safe.

### Mapping / Source Guidance

Use the population threshold reward source data, not reward display text. Count
as canonical only if the threshold reward directly grants/unlocks a public Codex
entry.

Current public-safe examples:

- Military Press -> `KinOfSheredyn_DistrictImprovement_01`
- Altar of Channeling -> `LastLord_DistrictImprovement_03`
- Larval Pulp -> `Necrophage_DistrictImprovement_01`
- Astronomy Club -> `Mukag_DistrictImprovement_06`
- Nutrient Extractor currently has no matching Codex entry in local imports.

### EWShop Rendering Expectation

EWShop can render exact one-line threshold reward summaries and hide duplicate
Related Entry cards only for targets actually shown. Text-only rewards remain
plain.

### Validation

Run:

```bash
npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md
```

Expected improvement:

- Major faction threshold reward refs appear as exact resolved refs.
- Relationship gap audit no longer lists the fixed examples as display-name-only.

Browser targets: Population_Aspect, Population_KinOfSheredyn,
Population_LastLord, Population_Necrophage, Population_Mukag.

### Guardrails

- Do not export display-name guesses.
- Do not create fake Resource/Improvement entries just to satisfy text.
- Do not expose hidden/unreleased targets.

### Open Questions

- Is Nutrient Extractor a missing public Codex entry, a renamed target, or text
  that should remain plain?

## Packet CDEX-EXP-003 - Resource Entities And Extractor Refs

- Source ticket: `CDEX-CAT-004`
- Readiness: implemented and F8-validated
- Owner: backend/product/exporter mixed
- Triage status: exporter packet now

### Why Now

4X player problem: "Which resource does this extractor produce, and what is that
resource for?" Current extractor pages mention resource output, but resource
tokens/icons are not Codex entries.

### Current Exported Shape

Current extractors are District entries:

```json
{
  "exportKind": "districts",
  "entryKey": "Extractor_Luxury01",
  "displayName": "[Luxury01] Klax Extractor",
  "category": "Resource",
  "kind": "District"
}
```

Current missing fields:

- Resource Codex entries/category;
- exact Extractor -> Resource `referenceKey`;
- optional Resource -> Extractor reverse refs.

### Desired Exported Shape Option A - New Resource Export

```json
{
  "exportKind": "resources",
  "entries": [
    {
      "entryKey": "Resource_Luxury01",
      "displayName": "Klax",
      "facts": [
        {
          "label": "Type",
          "value": "Luxury resource"
        }
      ],
      "sections": [
        {
          "title": "Effects",
          "lines": [
            "Public player-facing resource effect text."
          ]
        }
      ],
      "publicContextKeys": [
        "Resource_Luxury01"
      ]
    }
  ]
}
```

Extractor entry after Resource export:

```json
{
  "entryKey": "Extractor_Luxury01",
  "referenceKeys": [
    "Resource_Luxury01"
  ],
  "publicContextKeys": [
    "Extractor_Luxury01",
    "Resource_Luxury01"
  ],
  "sections": [
    {
      "title": "Extracted resource",
      "items": [
        {
          "label": "Klax",
          "referenceKey": "Resource_Luxury01"
        }
      ]
    }
  ]
}
```

Fields:

- `resources` exportKind: EWShop confirmed generic Codex import support.
- `Extractor -> Resource` refs: required if Resource entries exist.
- Resource Effects: optional when canonical; omit unknown mechanics.

### Mapping / Source Guidance

Canonical source should be extractor/resource definition data, not icon token
text. Resource tokens such as `[DustColored]` or resource icons are not
sufficient as Codex entities by themselves.

### EWShop Rendering Expectation

After Resource entries and refs exist, EWShop can review Resource category
visibility and exact Extractor -> Resource summaries. EWShop must not create
Resource pages from tokens alone.

### Validation

Run:

```bash
npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md
npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md
```

Expected improvement:

- Extractor -> Resource gap is resolved or reduced.
- Resource entries appear as a deliberate export/category.

Browser targets: Klax Extractor and tiered extractor pages.

### Guardrails

- Export Resource category only through the generic Codex contract.
- Do not treat icons/tokens as entities.
- Do not expose hidden/unreleased resources.

### Open Questions

- Whether Resource entries should be top-level browseable, nested under
  Extractors, or searchable/linkable only remains an EWShop product/navigation
  decision.
- Which resource types are public-safe: strategic, luxury, currency, narrative?

## Packet CDEX-EXP-004 - Thin Actions Gameplay Summaries

- Source ticket: `CDEX-CAT-005`
- Readiness: partial
- Owner: DB exporter/editorial
- Triage status: exporter packet now
- Exporter status: safe subset implemented and F8-validated on 2026-06-14. See
  `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-actions-return-handoff-2026-06-14.md`.

### Why Now

4X player problem: "What does this action do and when should I use it?" Many
Actions are public exact targets but render like classification rows.

### Current Exported Shape

Facts-only action:

```json
{
  "entryKey": "ActionTypeBuildObservatory",
  "displayName": "Build Observatory",
  "exportKind": "actions",
  "facts": [
    {
      "label": "Kind",
      "value": "Action"
    },
    {
      "label": "Category",
      "value": "Action"
    }
  ],
  "referenceKeys": [
    "ActionTypeBuildObservatory"
  ]
}
```

Partially useful action:

```json
{
  "entryKey": "ActionTypeAbsorbCity",
  "sections": [
    {
      "title": "Cost modifiers",
      "items": [
        {
          "label": "Influence cost multiplier",
          "facts": [
            {
              "label": "Affected cost",
              "value": "Influence"
            },
            {
              "label": "Modifier",
              "value": "-10%"
            }
          ]
        }
      ]
    }
  ]
}
```

Current missing fields:

- public purpose/effect summary;
- availability/source;
- exact affected target refs;
- cost/duration/requirement context where canonical.

### Desired Exported Shape

```json
{
  "entryKey": "ActionTypeBuildObservatory",
  "sections": [
    {
      "title": "Action mechanics",
      "lines": [
        "Public player-facing summary of what the action does."
      ],
      "items": [
        {
          "label": "Target",
          "referenceKey": "DistrictImprovement_Science_01",
          "facts": [
            {
              "label": "Target type",
              "value": "Improvement"
            }
          ]
        }
      ]
    }
  ],
  "referenceKeys": [
    "ActionTypeBuildObservatory",
    "DistrictImprovement_Science_01"
  ]
}
```

Fields:

- `Action mechanics` lines: optional but strongly recommended for public
  actions.
- `items[].referenceKey`: required when target/source/requirement target exists.
- facts such as Cost, Duration, Cooldown, Source, Target type: optional when
  canonical.
- Omit summaries when no player-safe source exists; do not fabricate.

### Mapping / Source Guidance

Use action definitions, costs, requirements, and target selectors. Descriptor or
tag-backed targets should be exported only when resolved to public target labels
or exact public entries. Keep unresolved descriptor diagnostics out of product
Codex.

### EWShop Rendering Expectation

EWShop can render richer Action sections and search summaries. EWShop must not
write placeholder purpose text.

### Validation

Run:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md
```

Expected improvement:

- Thin Actions count drops.
- Action pages have player-facing mechanics or remain intentionally link-only.

Browser targets: Build Observatory, Aspect Build Coral Spore, Close Rift,
Absorb City, Raze District.

### Guardrails

- Do not export raw descriptor/tag names as public targets.
- Do not include diagnostics JSON in product fields.
- Do not expose hidden/unreleased faction actions.

### Open Questions

- Should some generic facts-only Actions be suppressed from top-level browse
  even if they remain linkable?

## Packet CDEX-EXP-005 - Diplomatic Treaty Effects And Public Text

- Source ticket: `CDEX-CAT-006`
- Readiness: ready
- Owner: DB exporter/editorial
- Triage status: exporter packet now

### Why Now

4X player problem: "What changes when I sign or declare this?" Diplomatic
Treaties are small enough for targeted cleanup and have obvious public text
defects.

### Current Exported Shape

Good treaty:

```json
{
  "entryKey": "Treaty_SharedResearch",
  "displayName": "Shared Research",
  "sections": [
    {
      "title": "Effects",
      "lines": [
        "Signing this Treaty will provide [ScienceColored] Science bonuses to Cities in both Empires and make Technologies discovered by one Empire cost 20% less for the other Empire."
      ]
    }
  ]
}
```

Bad/incomplete treaty:

```json
{
  "entryKey": "Treaty_AskToSurrender",
  "displayName": "Surrender Demand",
  "descriptionLines": [
    "Demand that the Empire surrender and pay you a tribute of ."
  ]
}
```

Current missing fields:

- direct Effects on many treaties;
- complete tribute/cost/status public text;
- exact Status refs where status explains impact.

### Desired Exported Shape

```json
{
  "entryKey": "Treaty_AskToSurrender",
  "sections": [
    {
      "title": "Effects",
      "lines": [
        "Public player-facing surrender effect and tribute/cost text."
      ]
    }
  ],
  "facts": [
    {
      "label": "Category",
      "value": "War"
    }
  ],
  "referenceKeys": [
    "Treaty_AskToSurrender"
  ]
}
```

If a treaty applies a public Status:

```json
{
  "label": "Applied status",
  "referenceKey": "Status_Public_Status_Key",
  "facts": [
    {
      "label": "Target",
      "value": "Empire"
    }
  ]
}
```

Fields:

- `Effects` lines: required for treaties intended as browse content.
- Status `referenceKey`: required only when canonical and public.
- Cost/Duration facts: optional when canonical.

### Mapping / Source Guidance

Use treaty definitions and public localized text after variable substitution.
Fix missing variable interpolation before export. Keep treaty category/tag/cost
descriptor refs out of public product fields unless resolved.

### EWShop Rendering Expectation

EWShop can show treaty impact directly and may later review narrow Status
previews. EWShop must not invent treaty effects or fill missing tribute values.

### Validation

Run content diagnostic and browser review:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
```

Expected improvement:

- Treaty missing-player-context and incomplete public text findings drop.

Browser targets: Shared Research, Deeper Collaboration, Close Borders,
Surrender Demand, Surrender Offer, Shared Victory.

### Guardrails

- Do not export unresolved tribute placeholders.
- Do not expose private diplomatic diagnostics.
- Do not duplicate long status descriptions inside treaty text.

### Open Questions

- Which treaty variables can be public and stable in Codex: tribute amount,
  duration, cancel cost, relationship requirement?

## Packet CDEX-EXP-006 - Status Scope Metadata

- Source ticket: `CDEX-CAT-007`
- Readiness: partial
- Owner: DB exporter/editorial
- Triage status: exporter packet now

### Why Now

4X player problem: "Is this status about combat, a city, an army, diplomacy,
public opinion, or something else?" Current Status category is useful but too
flat.

### Current Exported Shape

Thin status:

```json
{
  "entryKey": "Status_AdministrativeCenter_Subjugation",
  "displayName": "Status Administrative Center Subjugation",
  "exportKind": "bonuses",
  "category": "Status",
  "kind": "Status",
  "facts": [
    {
      "label": "Category",
      "value": "Status"
    },
    {
      "label": "Kind",
      "value": "Status"
    }
  ]
}
```

Current missing fields:

- stable public scope/sub-kind;
- effect/source context for thin statuses.

### Desired Exported Shape

```json
{
  "entryKey": "Status_City_Approval_High",
  "facts": [
    {
      "label": "Category",
      "value": "Status"
    },
    {
      "label": "Scope",
      "value": "City"
    },
    {
      "label": "Status type",
      "value": "Approval"
    }
  ],
  "sections": [
    {
      "title": "Status mechanics",
      "lines": [
        "Public player-facing effect text."
      ]
    }
  ]
}
```

Fields:

- `Scope`: recommended public fact; optional only if truly unknown.
- `Status type`: optional more specific public classification.
- `Status mechanics`: required when status is a browse destination.

### Mapping / Source Guidance

Use canonical target/owner/effect domain, not key-name parsing. Candidate scopes
for product review: City, Army, Empire, Combat, Hero, Public Opinion, Map,
Treaty.

### EWShop Rendering Expectation

EWShop can later group/filter Statuses by exported scope. EWShop must not derive
scope from entry keys or display names.

### Validation

Run:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md
```

Expected improvement:

- Status thin findings drop.
- Status entries expose stable scope facts.

Browser targets: Ahead in the Polls, Immobile, Hero Status Loss, Despises Kin.

### Guardrails

- Do not infer scope from key strings.
- Do not promote Modifiers while improving Statuses.
- Do not expose hidden/unreleased statuses.

### Open Questions

- Final public scope taxonomy.
- Whether "Status type" should be separate from "Scope".

## Packet CDEX-EXP-007 - Trait Unlock And Ability Refs

- Source ticket: `CDEX-CAT-009`
- Readiness: partial
- Owner: DB exporter/editorial
- Triage status: exporter packet now

### Why Now

4X player problem: "What does this trait grant, unlock, exclude, or replace?"
Traits have good sections in places, but exact unlock and granted Ability ref
coverage is inconsistent.

### Current Exported Shape

Good granted Ability shape:

```json
{
  "entryKey": "FactionTrait_Aspects_BattleAffinity",
  "sections": [
    {
      "title": "Granted abilities",
      "items": [
        {
          "label": "Harmonious Tactics I",
          "referenceKey": "UnitAbility_Aspects_CoordinatedTactics"
        }
      ]
    }
  ],
  "referenceKeys": [
    "UnitAbility_Aspects_CoordinatedTactics"
  ]
}
```

Weak unlock shape:

```json
{
  "title": "Unlocks",
  "lines": [
    "Harmonious Tactics I"
  ]
}
```

Current missing fields:

- exact refs in `Unlocks` items;
- consistent resolved Ability refs in Granted abilities;
- public labels or typed refs for raw quest/action lines.

### Desired Exported Shape

```json
{
  "title": "Unlocks",
  "items": [
    {
      "label": "Harmonious Tactics I",
      "referenceKey": "UnitAbility_Aspects_CoordinatedTactics",
      "facts": [
        {
          "label": "Unlock type",
          "value": "Ability"
        }
      ]
    }
  ]
}
```

For ability replacement/removal:

```json
{
  "label": "Replaces ability",
  "referenceKey": "UnitAbility_Aspects_CoordinatedTactics",
  "facts": [
    {
      "label": "Replacement",
      "value": "Harmonious Tactics II",
      "referenceKey": "UnitAbility_Aspects_CoordinatedTactics_Upgraded"
    }
  ]
}
```

Fields:

- Unlock item `referenceKey`: required when public target exists.
- Granted ability item `referenceKey`: required when ability exists.
- `Unlock type`: optional but useful.
- Omit refs when unresolved.

### Mapping / Source Guidance

Use trait grant/unlock/remove source definitions and quest reward metadata.
Do not derive from the rendered line text.

### EWShop Rendering Expectation

EWShop can later review Trait preview surfaces. EWShop must not infer trait
unlocks or ability replacement from prose.

### Validation

Run:

```bash
npm run diagnostics:codex-preview-surfaces -- --input ../local-imports/codex --output ../docs/active/codex-preview-surface-audit.md
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
```

Expected improvement:

- Trait granted Ability unresolved refs drop.
- Trait Unlock relationships resolve as exact items.

Browser targets: Harmonious Tactics, Deadly Corals, Radiance, Chant of the
Rocks.

### Guardrails

- Do not export guessed ability links from trait names.
- Do not put raw quest/action keys in public fields.
- Do not expose unreleased faction quest rewards.

### Open Questions

- How should ability removal/replacement be modeled: separate section, item
  facts, or both?

## Packet CDEX-EXP-008 - Quest Reward And Requirement Public Refs

- Source ticket: `CDEX-CAT-011`
- Readiness: partial
- Owner: DB exporter/editorial
- Triage status: exporter packet now
- Exporter status: implemented and F8-validated on 2026-06-14. See
  `docs/active/codex-db-exporter-implementation-packets/ewshop-db-exporter-quest-refs-return-handoff-2026-06-14.md`.

### Why Now

4X player problem: "What do I need, what do I choose, and what do I get?" Quest
pages are navigable, but requirements/rewards can still be text-only or
unresolved.

### Current Exported Shape

```json
{
  "entryKey": "FactionQuest_Aspect_Chapter01_Step01",
  "sections": [
    {
      "title": "Requirements",
      "lines": [
        "Build in a settlement"
      ]
    },
    {
      "title": "Choices",
      "lines": [
        "The Great Dieback | Next: The Great Dieback"
      ]
    }
  ],
  "referenceKeys": [
    "FactionQuest_Aspect_Chapter01_Step02",
    "Faction_Aspect",
    "FactionQuest_Aspect"
  ]
}
```

Current missing fields:

- exact refs on requirement and reward items where targets exist;
- public labels for raw/generated reward rows;
- typed target information for requirement/reward rows.

### Desired Exported Shape

```json
{
  "title": "Rewards",
  "items": [
    {
      "label": "Reward public label",
      "referenceKey": "Public_Target_EntryKey",
      "facts": [
        {
          "label": "Reward type",
          "value": "Trait"
        }
      ]
    }
  ]
}
```

```json
{
  "title": "Requirements",
  "items": [
    {
      "label": "Build in a settlement",
      "facts": [
        {
          "label": "Requirement type",
          "value": "Construction"
        }
      ]
    }
  ]
}
```

Fields:

- `items[].referenceKey`: required when requirement/reward target is a public
  Codex entry.
- `Reward type` / `Requirement type`: optional but useful.
- Keep plain lines when no exact public target exists.

### Mapping / Source Guidance

Use quest requirement/reward structured source data, not objective prose. Choice
next-step refs should remain exact quest refs as they are now.

### EWShop Rendering Expectation

EWShop can show compact Codex preview links in Quest Strategy/Codex where exact
refs exist. EWShop must not invent reward mechanics from labels.

### Validation

Run current Quest and Codex diagnostics:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
npm run diagnostics:codex-relationship-gaps -- --input ../local-imports/codex --output ../docs/active/codex-relationship-value-gap-audit.md
```

Expected improvement:

- Quest unresolved refs and raw generated reward/requirement labels drop.

Browser targets: The Great Dieback, The Missing Youth, A Bloody Trail, The Day
of Reckoning.

### Guardrails

- Do not flatten branching.
- Do not expose hidden choices or unreleased quest content.
- Do not render diagnostics-only reward data as public text.

### Open Questions

- Which reward/requirement types should be standardized across Codex and Quest
  Strategy exports?

## Packet CDEX-EXP-009 - Modifier Public Labels

- Source ticket: `CDEX-CAT-015`
- Readiness: partial
- Owner: DB exporter/editorial
- Triage status: exporter packet now

### Why Now

4X player problem: "This exact related modifier target is visible; what does it
mean?" Modifiers remain hidden from top-level navigation, but exact links and
related chips can expose generated names.

### Current Exported Shape

```json
{
  "entryKey": "ActionCostModifer_CloseRift_Decree_Discovery_02_00",
  "displayName": "Worldmending",
  "category": "Cost Modifier",
  "kind": "Cost Modifier",
  "facts": [
    {
      "label": "Affected cost",
      "value": "Turn"
    },
    {
      "label": "Modifier",
      "value": "-50%"
    }
  ],
  "sections": [
    {
      "title": "Bonus mechanics",
      "items": [
        {
          "label": "Turn -50%",
          "facts": [
            {
              "label": "Targets",
              "value": "Close Rift"
            }
          ]
        }
      ]
    }
  ]
}
```

Current missing fields:

- consistent public display labels for all public Modifier targets;
- exact target refs in mechanics item facts where target exists;
- suppression policy for diagnostics-only modifiers.

### Desired Exported Shape

```json
{
  "entryKey": "ActionCostModifer_CloseRift_Decree_Discovery_02_00",
  "displayName": "Worldmending",
  "facts": [
    {
      "label": "Affected cost",
      "value": "Turn"
    },
    {
      "label": "Modifier",
      "value": "-50%"
    }
  ],
  "sections": [
    {
      "title": "Bonus mechanics",
      "items": [
        {
          "label": "Close Rift turn cost -50%",
          "referenceKey": "ActionTypeCloseRift",
          "facts": [
            {
              "label": "Target",
              "value": "Close Rift",
              "referenceKey": "ActionTypeCloseRift"
            }
          ]
        }
      ]
    }
  ]
}
```

Fields:

- `displayName`: required public-safe label if modifier is linkable.
- `items[].referenceKey`: recommended when the modifier target is a public Codex
  entry.
- Raw descriptor/tag values: omit from public product fields if unresolved.

### Mapping / Source Guidance

Use modifier target resolution that already powers bonus descriptor cleanup.
Export public labels only when target is resolved or display text is canonical.

### EWShop Rendering Expectation

EWShop keeps Modifiers hidden from top-level navigation but can show readable
related chips/tooltips for exact modifier links.

### Validation

Run:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
```

Expected improvement:

- Raw/internal modifier text findings drop.
- Related modifier targets read as public mechanics.

Browser targets: Actions, Tech, and Treaties that link to cost modifiers.

### Guardrails

- Do not promote Modifiers to top-level navigation.
- Do not export descriptor/tag internals in public fields.
- Do not expose hidden/unreleased modifier targets.

### Open Questions

- Which modifiers should remain exact-link targets versus diagnostics-only?

## Packet CDEX-EXP-010 - Thin Public Entity Context

- Source ticket: `CDEX-CAT-016`
- Readiness: partial
- Owner: DB exporter/editorial
- Triage status: exporter packet now
- Exporter status: Slice A ability residual context implemented and
  F8-validated on 2026-06-14. Districts, improvements, resources, browse
  suppression, and non-trivial status enrichment remain deferred.

### Why Now

4X player problem: "Why should I click this entry?" Multiple categories include
public entries that have classification facts but no mechanics, source, or
reason to care.

### Current Exported Shape

Examples:

```json
{
  "entryKey": "District_Bridge",
  "displayName": "Temporary Bridge",
  "exportKind": "districts",
  "facts": [
    {
      "label": "Kind",
      "value": "District"
    }
  ],
  "descriptionLines": []
}
```

```json
{
  "entryKey": "DistrictImprovement_Bridge_01",
  "displayName": "Pile House",
  "exportKind": "improvements",
  "facts": [
    {
      "label": "Kind",
      "value": "Improvement"
    },
    {
      "label": "Category",
      "value": "Bridge"
    }
  ],
  "descriptionLines": []
}
```

```json
{
  "entryKey": "UnitAbility_Blossom_1",
  "displayName": "Blossom I",
  "exportKind": "abilities",
  "facts": [
    {
      "label": "Kind",
      "value": "Ability"
    },
    {
      "label": "Category",
      "value": "Passive"
    }
  ]
}
```

Current missing fields:

- public effect/purpose/source text;
- source/unlock/requirement refs;
- suppression decision for entries that cannot be made player-facing.

### Desired Exported Shape

```json
{
  "entryKey": "District_Bridge",
  "sections": [
    {
      "title": "Effects",
      "lines": [
        "Public player-facing effect or usage summary."
      ]
    }
  ],
  "facts": [
    {
      "label": "Kind",
      "value": "District"
    },
    {
      "label": "Source",
      "value": "Public source label"
    }
  ]
}
```

Fields:

- `Effects` or category-specific mechanics section: required for entries meant
  as browse destinations.
- Source/unlock refs: optional when canonical.
- Omit from public export or leave searchable/link-only if no public-safe
  context exists.

### Mapping / Source Guidance

Use canonical constructible, ability, status, and improvement mechanics. Do not
generate placeholder copy from entity names.

### EWShop Rendering Expectation

EWShop will render exported facts/sections. EWShop must not write missing
mechanics text locally.

### Validation

Run:

```bash
npm run diagnostics:codex-content -- --input ../local-imports/codex --limit 300
```

Expected improvement:

- `missing-player-context` findings drop for abilities, districts,
  improvements, and statuses.

Browser targets: Temporary Bridge, Pile House, Blossom I, Hero Status Loss,
Immobile.

### Guardrails

- Do not force public entries for implementation-only data.
- Do not export raw internal keys in public descriptions.
- Do not expose hidden/unreleased content.

### Open Questions

- Which facts-only entries are intentionally public exact-link targets, and
  which should be diagnostics-only or hidden from browse surfaces?
