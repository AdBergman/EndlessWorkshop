# Codex Relation Quality Post-Alias Review

Date: 2026-05-14

## Summary

The duplicate-slug relation-target rewrite is doing the narrow job it was meant to do: it improves in-app `/api/codex` related-link resolution without broadening public codex filtering and without changing SEO page generation.

The improvement is real but bounded. On the local codex fixtures, the public candidate graph before aliasing had 2,426 reference keys, 1,306 resolved, and 1,120 unresolved: 53.8% resolution. After applying duplicate-slug aliases on the `/api/codex` facade path, the same 2,426 reference keys have 1,369 resolved and 1,057 unresolved: 56.4% resolution. That is 63 newly resolved in-app relation references.

SEO diagnostics remain intentionally stricter than in-app relation quality because SEO generation still uses filtered page candidates, not the facade alias rewrite. The audit schema can now explain present-but-filtered duplicate entries with their kept relation target, but duplicate entries still do not become indexable pages.

## Current Coupling

Before the rewrite, `CodexFilterService` decided both:

- which codex entries were eligible to become public SEO page candidates
- which codex entries were returned by `/api/codex` and therefore eligible as in-app related-link targets

That coupling meant references to imported-but-filtered entries such as `UnitAbility_Fly` stayed unresolved in-app even when the filter had kept a same-kind/same-slug canonical entry.

The current partial decoupling keeps public entry eligibility unchanged, but rewrites `/api/codex` `referenceKeys` for duplicate-slug skips to the kept relation target. It does not return filtered duplicate rows and does not alias invalid-display-name or weak-description rows.

## Before And After

| Metric | Before duplicate aliasing | After duplicate aliasing |
| --- | ---: | ---: |
| Included public/API entries | 1,218 | 1,218 |
| Filtered entries | 208 | 208 |
| Duplicate-slug aliases available | 0 | 124 |
| Reference keys scanned | 2,426 | 2,426 |
| Resolved references | 1,306 | 1,369 |
| Unresolved references | 1,120 | 1,057 |
| Resolution percentage | 53.8% | 56.4% |

Top newly resolved aliases:

| Filtered reference | Resolved count | Kept target |
| --- | ---: | --- |
| `UnitAbility_Fly` | 43 | `UnitAbility_Class_FlyingTag` |
| `UnitAbility_SeismicSlash` | 3 | `UnitAbility_Hero_ActiveSkill_Equipment_04` |
| `DistrictImprovement_TradingPost_03` | 2 | `DistrictImprovement_Industry_08` |
| District tier refs such as `District_Tier1_Food` | 9 total | Aspect district tier entries |
| Tech refs such as `Technology_District_Tier1_Money` | 4 total | kept same-slug tech entries |
| `DistrictImprovement_City_Center_08` | 1 | kept same-slug improvement |
| `UnitAbility_Infection` | 1 | kept same-slug ability |

## Remaining Ownership Buckets

After duplicate aliasing, remaining unresolved in-app relation references are:

| Ownership class | References | Unique keys | Notes |
| --- | ---: | ---: | --- |
| `internal/noise` | 995 | 14 | Mechanical `UnitAbility_*` refs: movement, class bonus, hero tradition, break-damage refs. |
| `near-match / present-under-other-key` | 50 | 17 | `MinorFaction_*` refs have related `Population_Minor_*`, `Hero_MinorFaction_*`, and `Elder_MinorFaction_*` entries, but no canonical minor-faction entries. |
| `absent-from-import` | 9 | 9 | Faction/event ability refs not present as entries. |
| `present-but-filtered` | 3 | 2 | Invalid-display-name targets only: `Unit_MinorFaction_MangroveOfHarmony_Final` and `District_Base_CityCenter_Tier4`. |

The remaining `present-but-filtered` entries should not be force-linked. They were filtered for invalid display names, not duplicate slugs. Keeping them unresolved is safer than exposing weak labels or placeholder-like targets.

## Safe EWShop Fixes Remaining

There are no obvious high-impact backend/facade fixes left that meet the current constraints.

Safe but low-priority EWShop work:

- Add a diagnostics metric for “duplicate aliases applied to `/api/codex` references” so future exports can show whether aliasing is still carrying weight.
- Surface ownership classification summaries in admin UI instead of only generated audit artifacts.
- Add frontend copy/diagnostic affordances that distinguish unresolved references from intentionally hidden/internal refs.
- Keep frontend/backend codex type contracts tidy as DTOs evolve.

Unsafe or premature EWShop work:

- Do not alias invalid-display-name or weak-description entries.
- Do not import raw heroes/populations/abilities/battle data just to reduce unresolved counts.
- Do not create minor-faction pages from suffix matching.
- Do not broaden public codex filtering until exporter/mapping provides stable canonical identities.

## Multiwave Plan

### Wave 1: Stabilize Current Diagnostics

Owner: EWShop backend/facade/diagnostics

- Keep duplicate-slug aliasing limited to `/api/codex` relation keys.
- Add a small regression test around alias impact if the metric is promoted into diagnostics.
- Ensure SEO tests continue asserting unchanged generated routes and rendered pages.

Recommended implementation status: no further code required right now.

### Wave 2: Admin Diagnostics Presentation

Owner: EWShop backend plus small frontend admin UI

- Expose ownership bucket counts from the generated audit summary or a diagnostics endpoint.
- Show `present-but-filtered` filter reasons and duplicate relation targets in admin diagnostics.
- Keep this admin-only; do not change public codex pages or SEO routing.

Recommended implementation status: safe next EWShop wave if admin visibility is desired.

### Wave 3: Frontend In-App Presentation

Owner: EWShop frontend presentation

- Consider showing non-blocking diagnostics for missing related links in development/admin views.
- Avoid showing invalid/weak filtered entries to normal users.
- If needed, label aliased duplicate related links by the kept target only, not by the filtered source key.

Recommended implementation status: wait until backend/admin diagnostics have settled.

### Wave 4: Exporter/Mapping Canonicalization

Owner: exporter/mapping project

- Emit canonical minor-faction entries for `MinorFaction_*`.
- Decide whether mechanical `UnitAbility_*` refs are public, internal, or should be omitted from public `referenceKeys`.
- Emit typed references or relationship objects so EWShop no longer infers identity from prefixes and slugs.
- Provide disambiguated labels/slugs for same-name entries where the duplicate is semantically distinct.

Recommended implementation status: highest remaining impact.

## Recommendation

Do not implement another EWShop data/import wave yet. The duplicate-slug aliasing picked off the safe present-but-filtered class. The remaining large unresolved buckets require either exporter/mapping decisions or admin-only presentation improvements, not broader importers.

The next EWShop-safe implementation slice, if one is desired, is admin diagnostics presentation: expose ownership bucket counts and duplicate-alias impact clearly to the admin/import UI without touching SEO, public codex filtering, or route generation.
