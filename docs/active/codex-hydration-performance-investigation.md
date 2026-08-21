# Codex Hydration Architecture

Updated: 2026-08-21

## Status

Codex uses route-scoped hydration:

- plain `/codex` loads `GET /api/codex/summary` only;
- category and category-entry routes load `GET /api/codex?category=<kind>`;
- the first global search loads the existing full `GET /api/codex` dataset;
- successfully loaded categories are cached and merged into the in-session Codex
  indexes;
- after the requested category renders, at most the next two public categories
  in preferred navigation order may warm in the background.
- Codex and Quest Explorer load a three-field global identity directory so cold
  cross-category references retain names and routes without hydrating target
  presentation data.

The full endpoint remains the global-search fallback. No pagination, generic
query cache, search-document endpoint, or exact-entry endpoint is part of this
slice.

## Root Cause Of The Direct-Link Regression

The summary slice made the landing route lightweight, but category and direct
entry routes still called the full endpoint. `CodexPage` started that request in
a passive effect. A later URL-repair effect from the same committed render still
observed the pre-request snapshot: the global `loading` flag was false and the
entry/index arrays were empty. It therefore treated the requested entry as
invalid and removed `entry` before the request completed.

The state model could express only a global loading condition. It could not
distinguish:

1. this category has never been requested;
2. this category is loading or retrying;
3. this category loaded successfully and the entry is absent.

This was more visible on a cold production navigation because there was no
pre-existing Codex cache. Local navigation and older tests commonly seeded the
full store, while development effect timing and StrictMode changed when the
race was observable. StrictMode was not the fix; an explicit per-category state
machine is.

## Current Request And State Contract

Backend endpoints:

| Route | Purpose |
| --- | --- |
| `GET /api/codex/summary` | Category counts for landing and navigation |
| `GET /api/codex/identities` | Public `{entryKey, displayName, routeKind}` identity directory |
| `GET /api/codex?category=<kind>` | Complete public DTOs for one normalized category |
| `GET /api/codex` | Full public dataset, loaded only for global search or legacy entry-only URLs |

The category controller path uses a repository query by `export_kind`; it does
not call `findAll()` and filter the complete table. `statuses` and `modifiers`
are derived from the stored `bonuses` export kind, then filtered by the same
normalization used by summary counts. Every response passes through the existing
public Codex filter; complete-entry responses also use the relation-alias mapper.
Category results share the existing `codex` cache with category-specific keys,
and existing import eviction clears the whole cache. The identity response uses
that cache under its own key, so the same import eviction invalidates it. Identity
`routeKind` uses the same derived `statuses`/`modifiers` normalization as summary
and category routing.

Frontend state keeps summary and full-load state separately from:

- `categoryLoadStates[kind]`: `idle`, `loading`, `loaded`, or `error`;
- category-specific errors and load timestamps;
- per-category in-flight request deduplication;
- merged `entriesByKey`, `entriesByKind`, and `entriesByKindKey` indexes;
- `fullLoaded`, which means the global dataset is genuinely complete.

Identity records have separate arrays, kind-scoped indexes, unique-key indexes,
and load/error state. A key present in multiple route kinds is excluded from the
untyped index; callers must use `routeKind + entryKey`. Loading identity never
inserts partial objects into full-entry indexes and never changes category or
full completeness. Its request has independent in-flight deduplication, retry,
generation, and reset guards.

An empty successful category response is `loaded`, not `idle`. Only that state
proves that a requested entry is absent. The current URL always selects which
cache slice the UI reads; late responses may populate their own cache but do not
change route intent.

## Route Behavior

Landing:

- renders category navigation from summary counts;
- does not hydrate full entries;
- starts full hydration only after a non-empty global search query.

Category and direct entry:

- request the active category immediately;
- preserve `category` and `entry` while the category is idle, loading, retrying,
  or failed;
- render a category-specific loading/error/retry state;
- validate the entry only after the category is `loaded`;
- reuse a successfully loaded category without another request.

Cross-category links include the target category when it is visible or directly
routable. Navigation therefore loads the target category on demand. Hidden
modifier links retain the legacy entry-only fallback where needed. Related
entries render their name and route from identity even when the target category
is cold. Hover or keyboard focus starts the existing category loader immediately;
a warm category supplies the detailed preview synchronously, while loading or
failure keeps the identity label and destination usable. Concurrent previews
into one category share the existing in-flight request.

Identity is loaded only by the two routes that currently consume cross-Codex
references: Codex and Quest Explorer. It is not mounted in the global provider,
so unrelated routes do not acquire the directory. Admin Codex import refresh
forces both complete-entry and identity snapshots to refresh.

The background warmer starts only after the requested category and summary are
ready. It receives at most two candidates: the next available public categories
after the active category in `PREFERRED_CODEX_KIND_ORDER`. It does not wrap to
the start of the order or automatically warm hidden/local-only kinds. The two
existing workers can complete that single bounded wave without repeatedly
rebuilding indexes for the rest of the Codex. Direct navigation does not enter
that queue and therefore retains priority. Starting a global load stops workers
from dequeuing further speculative requests.

## Race-Safety Review

- A loading while navigation changes to B: B gets its own request and UI state;
  A may finish into A's cache only.
- A resolving after B: stable sorting and category replacement rebuild merged
  indexes without changing the B URL.
- Entry A changing to entry B: selection is derived from current search params,
  not the request closure.
- Duplicate category callers: share one in-flight promise.
- Forced retry: a category request version prevents the older result from
  overwriting the retry.
- Full search hydration racing a category load: either completion order produces
  the same merged snapshot; full hydration remains authoritative and marks the
  dataset complete.
- Reset and StrictMode: cache generations and request versions ignore stale
  full, category, summary, and identity completions; StrictMode callers deduplicate.
- Unmount: a completed request may safely warm its keyed cache, but cannot change
  the URL owned by a later mount.
- Prefetch after navigation: speculative responses only populate keyed caches;
  direct route loads bypass the prefetch queue.

## Performance Baseline And Expected Change

The 2026-06-24 local snapshot contained approximately 2,588 entries. Its merged
API-shaped full payload was about 2.46 MB raw and 195 KB gzipped. Largest source
kinds included bonuses (587 entries), abilities (335), quests (300), districts
(167), equipment (160), units (156), actions (139), and tech (133).

Before this change, both category and category-entry cold loads blocked on the
full 2,588-entry response plus normalization and global-index construction.
After this change their blocking waterfall is summary plus one category response.
Plain landing remains summary-only. Background requests occur only after the
active category is renderable and therefore are not part of the blocking route.

Production response sizes and timings must be captured after deployment because
the production dataset and proxy are not available from local CI. Reproduce with
browser DevTools (Disable cache enabled) for:

1. `/codex` — expect summary/freshness, no `/api/codex` full request;
2. `/codex?category=populations` — expect summary and
   `/api/codex?category=populations` first;
3. `/codex?category=populations&entry=Population_Minor_Ametrine` — expect the
   same category-first waterfall and the URL to remain unchanged;
4. type into global search from `/codex` — expect one lazy `/api/codex` request.
5. activate a cold cross-category reference preview — expect one request for
   the referenced category, with repeated/same-category activations reusing it.

Transport checks:

```sh
curl -sS -D - -o /dev/null -H 'Accept-Encoding: gzip' \
  'https://endlessworkshop.dev/api/codex?category=populations'
curl -sS -o /dev/null -w 'bytes=%{size_download} total=%{time_total}s\n' \
  'https://endlessworkshop.dev/api/codex?category=populations'
curl -sS -o /dev/null -w 'bytes=%{size_download} total=%{time_total}s\n' \
  'https://endlessworkshop.dev/api/codex/identities'
```

Production/staging Spring configuration enables JSON compression above 2 KB;
the first command should show `Content-Encoding: gzip` after deployment.

Local validation against the imported 0.82 snapshot on 2026-08-21 measured:

| Response | Entries | Raw bytes | Local gzip bytes |
| --- | ---: | ---: | ---: |
| summary | category counts | 946 | 281 |
| identity directory | 2,505 | 269,976 | 33,550 |
| populations | 26 | 47,085 | 3,737 |
| full Codex | all public entries | 2,858,430 | 208,898 |

The blocking Populations payload was therefore about 98.4% smaller than the
full raw payload. A cold browser navigation to the exact Ametrine URL requested
Populations and summary first, rendered the `Ametrine` heading without changing
the URL, and did not request the full endpoint. Browser back returned to the
exact Ametrine URL and forward returned to the Heroes category used for the
history check.

Cold browser QA on 2026-08-21 loaded `Accurse I` from Abilities: identity made
the `Jinxed I` Status relationship visible before the Statuses category was
present, keyboard focus requested `statuses` once, and the complete preview then
rendered. Quest Explorer likewise rendered the canonical `Build Coral Spore`
action link from identity; focus requested `actions` and upgraded the tooltip to
the complete kind/category presentation. A cold global search for `approval`
requested the full Codex and returned 104 results, including `Dream Haze`, whose
title/key do not contain the query but whose detailed effect does. No browser
console errors were observed.

## Remaining Follow-Ups

- A lightweight search-document endpoint could reduce the one-time cost of
  global search, but is not required for route correctness.
- An exact-entry endpoint was intentionally omitted because loading one category
  is sufficient for the current direct-link contract and keeps related archive
  context available.
- Measure whether the two-category preferred-order warmup improves production
  navigation. Removing it later would not affect hydration correctness.
- No global provider eagerly hydrates Codex. Rich faction/hero/district stores
  remain detail-triggered as before.
- Local QA also surfaced a pre-existing React key warning in
  `CodexSummaryList` when a delegated archive-row component renders. It does not
  affect hydration correctness and remains a separate bounded cleanup.
