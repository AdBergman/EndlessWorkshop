# Public Route Contract

Status: active routing and SEO contract.

This matrix keeps SPA routes, generated SEO routes, legacy redirects, admin
routes, and hard `404`s from drifting into each other.

| Route | Owner | Behavior |
| --- | --- | --- |
| `/` | SPA shell | Forwards to `index.html`. |
| `/tech` | SPA shell | Forwards to `tech.html`; query params such as `share`, `faction`, and `tech` stay frontend-owned. |
| `/units` | SPA shell | Forwards to `units.html`; query params such as `faction` and `unitKey` stay frontend-owned. |
| `/summary` | SPA shell | Forwards to `summary.html`. |
| `/codex` | SPA shell | Interactive codex route. `/codex?entry={entryKey}` is the codex deep-link contract. |
| `/codex/{entryKey}` | hard `404` | Not a public route; crawlable codex/entity pages live under `/encyclopedia/...`. |
| `/quests` | SPA shell | Interactive Quest Explorer route. |
| `/quests/{entryKey}` | SPA shell | Canonical shareable quest deep-link route; query params such as `mode` remain frontend-owned. |
| `/quests/{entryKey}/...` | SPA shell | Quest Explorer owns nested Quest paths for copied branch/step URLs; the React app resolves the first segment as the selected quest. |
| `/quests?quest={entryKey}` | SPA shell | Backwards-compatible quest deep-link input. |
| `/mods` | SPA shell | Forwards to `mods.html`. |
| `/info` | SPA shell | Forwards to `info.html`. |
| `/admin/import` | SPA shell | Forwards to `index.html`; API access is protected separately. |
| `/encyclopedia` | generated SEO | Forwards to generated encyclopedia root when present, otherwise `404`. |
| `/encyclopedia/{kind}` | generated SEO | Forwards to generated category page when present, otherwise `404`. |
| `/encyclopedia/{kind}/{slug}` | generated SEO | Forwards to generated canonical entity page when present, otherwise `404`. |
| `/encyclopedia/{kind}/{slug}/{entryKeySlug}` | generated SEO | Forwards to generated variant entity page when present, otherwise `404`. |
| `/tech/{slug}` | legacy redirect | Permanent redirect to `/encyclopedia/tech/{slug}`. |
| `/units/{slug}` | legacy redirect | Permanent redirect to `/encyclopedia/units/{slug}`. |
| `/heroes/{slug}` | legacy redirect | Permanent redirect to `/encyclopedia/heroes/{slug}`. |
| `/abilities/{slug}` | legacy redirect | Permanent redirect to `/encyclopedia/abilities/{slug}`. |
| `/api/**` | backend API | Never captured by SPA or generated SEO forwarding. |
| `/__generated-seo/encyclopedia/**` | static generated resource | Serves generated encyclopedia files only. |
| `/__generated-seo/codex-missing-references-audit.*` | hard `404` | Audit artifacts are generated for admins/tooling, not public SEO resources. |

Current tests:

- Backend route forwarding and `404` behavior: `FrontendControllerRouteTest` and `FrontendControllerProductionFallbackTest`.
- Frontend lazy route tree: `App.lazyRoutes.test.tsx`.
- Quest URL hydration: `QuestExplorerPage.test.tsx` and `QuestExplorerPage.strategyPlanner.test.tsx`.
- SPA route metadata scope: `routeSeo.test.ts`.

Related docs:

- `docs/backend/seo-architecture.md` is the active SEO backend architecture.
- `docs/frontend/routing-diagnosis.md` is historical incident context, not the
  active route backlog.
- `docs/backend/seo-backend-review.md` is historical SEO cleanup context, not
  the active SEO backlog.
