# Backend Deploy Smoke Checklist

Status: active backend deploy/runtime smoke guidance.
Date: 2026-08-17

## Purpose

Use this checklist when changing backend runtime configuration, Docker images,
production/staging profiles, route forwarding, generated SEO behavior, saved
build endpoints, public API availability, admin/docs exposure, compression, or
deploy workflow smoke checks.

This document reflects the behavior currently protected by
`.github/workflows/deploy.yml`. Keep the workflow and this checklist aligned.

## Current Deploy Smoke

The production deploy workflow starts the new container, waits for health, runs
smoke checks against `http://127.0.0.1:8080`, and rolls back if any required
check fails.

Required checks:

| Area | Expected behavior |
| --- | --- |
| Health | `GET /actuator/health` returns HTTP 200. |
| Core read API | `GET /api/techs` returns HTTP 200. |
| Core read API | `GET /api/units` returns HTTP 200. |
| Core read API | `GET /api/districts` returns HTTP 200. |
| Core read API | `GET /api/improvements` returns HTTP 200. |
| Saved builds | `POST /api/builds` returns HTTP 200 and a `uuid`; `GET /api/builds/{uuid}` returns HTTP 200. |
| SPA shell | `GET /tech`, `/units`, `/codex`, `/quests`, `/summary`, and `/info` return HTTP 200. |
| Quest deep links | Direct and nested copied Quest URLs return the SPA shell with HTTP 200. |
| Shell cache policy | `GET /tech` and nested Quest shell routes include `Cache-Control` containing `no-cache`. |
| Stale public paths | `GET /codex/Ability_Blossom` returns HTTP 404. |
| Generated SEO miss | `GET /encyclopedia/tech/not-a-real-smoke-page` returns HTTP 404. |
| Stale saved-build path | `POST /api/saved-tech-builds` returns HTTP 404. |
| API docs exposure | `/v3/api-docs` is not public in production. |
| Swagger exposure | `/swagger-ui.html` is not public in production. |

## Additional Runtime Checks To Consider Locally

Production and staging config enable response compression for JSON, HTML, CSS,
JavaScript, SVG, and XML. When changing compression or heavy read endpoints,
verify compression with an `Accept-Encoding: gzip` request against a heavy JSON
endpoint such as `/api/codex`.

When changing import history or data-freshness behavior, verify
`GET /api/data-freshness` returns successfully in the target environment.

When changing generated SEO persistence, verify:

- `SEO_OUTPUT_DIR` points at the mounted container path.
- The host mount exists.
- Regenerated pages and `sitemap.xml` survive container restart or redeploy.

## Change Discipline

- Do not weaken deploy smoke to make a deployment pass without recording the
  product/runtime reason.
- Add smoke checks only for stable, production-critical behavior.
- Keep smoke checks fast and deterministic.
- Prefer focused unit/integration tests for detailed behavior. Smoke checks
  should prove the deployed container is alive, correctly routed, and exposing
  the right public surface.
