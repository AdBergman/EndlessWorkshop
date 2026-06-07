# SEO Backend Review

Date: 2026-06-07

Status: active SEO backend improvement backlog

## Summary

This is a separate review of the SEO backend code. It intentionally does not
judge the rest of the backend by SEO's current shape.

Panel model:

- Java/Spring Boot Tech Lead A: architecture and layering
- Java/Spring Boot Tech Lead B: maintainability and code-review usefulness
- Java/Spring Boot Tech Lead C: AI-agent usability
- Senior Backend Engineer: ownership, duplication, and stale-risk
- Spring Boot Advocate: framework correctness and modern project hygiene
- SEO Expert: crawlability, canonicalization, structured data, indexability, and content quality

Consensus: SEO has useful parts, but it is not yet aligned with the rest of the
backend style. It contains large AI-generated classes, mixed responsibilities,
and tests that assert large generated HTML strings. The code should be improved
in guarded phases. Do not start by deleting it or broadly rewriting it.

Largest classes observed:

- `CodexMissingReferenceAuditService`: about 972 lines
- `SeoPageRenderer`: about 809 lines
- `SeoRegenerationService`: about 534 lines

## Current SEO Flow

`SeoAdminController`
-> `SeoRegenerationService`
-> codex read/filter
-> page candidate generation
-> reference target building
-> missing reference audit
-> HTML rendering
-> generated file writing
-> sitemap writing
-> `SitemapController` serves generated sitemap when present
-> frontend routing forwards generated encyclopedia pages.

## Panel Findings

- Controller is thin and fine.
- `SeoRegenerationService` orchestrates too much: candidate building,
  canonicalization, deletion scope, page writing, sitemap, audit writing, and
  result aggregation.
- `SeoPageRenderer` mixes content parsing, metadata policy, HTML shell,
  structured data, related links, and escaping.
- `CodexMissingReferenceAuditService` mixes classification policy, scoring,
  ownership analysis, summary generation, JSON rendering, and markdown rendering.
- Storage classes are comparatively good and already have path-safety tests.
- SEO tests are valuable but too monolithic; they verify broad generated output
  rather than smaller semantic policies.

## SEO Expert Notes

- Canonical and noindex behavior is important and should be protected by focused tests.
- Generated pages need stable title, meta description, canonical URL, robots,
  Open Graph, Twitter metadata, and JSON-LD behavior.
- Thin-content and duplicate-content policy should be explicit product policy,
  not buried inside renderer/regeneration logic.
- Sitemap generation should include only indexable canonical routes.
- Generated output should never be able to escape the configured output root.

## Jira Tickets

### SEO-001: Create SEO Architecture Note

- Document the intended SEO pipeline and ownership boundaries.
- State that SEO is an app-level generation subsystem, not domain logic.
- Acceptance: doc explains controller, orchestration, candidate policy, rendering, audit, storage, and sitemap responsibilities.

### SEO-002: Add SEO Contract Test Matrix

- Split current broad regeneration test into focused tests.
- Cover metadata, canonical URL, noindex variants, sitemap inclusion, related links, and audit artifact creation.
- Acceptance: tests remain readable and failures point to one policy.

### SEO-003: Extract Page Candidate Builder From SeoRegenerationService

- Move candidate grouping, variant canonicalization, route choice, and indexability choice into a dedicated collaborator.
- Keep public regeneration result unchanged.
- Acceptance: regeneration service orchestration gets smaller and tests pin candidate decisions.

### SEO-004: Extract SEO Rebuild Orchestrator Steps

- Separate candidate creation, reference target creation, audit generation, page writing, sitemap writing, and result aggregation.
- Do not create a generic pipeline framework.
- Acceptance: `SeoRegenerationService` reads as use-case orchestration.

### SEO-005: Extract SEO Metadata Builder

- Move title, meta description, robots, canonical URL, Open Graph, Twitter, and JSON-LD creation out of HTML rendering.
- Acceptance: metadata can be unit tested without asserting full HTML.

### SEO-006: Extract Description Parser

- Move parsing of intro lines, detail lines, metadata highlights, prototype-line filtering, and content normalization out of `SeoPageRenderer`.
- Acceptance: parser tests cover representative codex descriptions.

### SEO-007: Extract HTML Shell Renderer

- Keep page shell/nav/footer/header rendering separate from entity content sections.
- Acceptance: renderer pieces are smaller and generated HTML remains byte-for-byte equivalent where tests require it.

### SEO-008: Extract Related Link Renderer

- Move reference chip rendering and unresolved-reference omission to a dedicated renderer/helper.
- Acceptance: related link tests verify labels, hrefs, data-entry keys, and omission of unresolved references.

### SEO-009: Extract Sitemap Route Policy

- Move sitemap route selection out of `SeoRegenerationService`.
- Include only public generated category/root routes and indexable candidate routes.
- Acceptance: sitemap tests verify no non-indexable variant routes unless intentionally allowed.

### SEO-010: Split Missing Reference Classification Policy

- Extract category profile, key classification, internal-noise filtering, and ownership classification from `CodexMissingReferenceAuditService`.
- Acceptance: classification policy can be tested without rendering reports.

### SEO-011: Split Missing Reference Scoring Policy

- Extract priority score, rationale, hidden pillbox estimate, and thin-content risk estimate.
- Acceptance: score tests document the SEO expert intent.

### SEO-012: Split Missing Reference Report Rendering

- Move JSON and markdown rendering to report renderer classes.
- Acceptance: service computes audit data; renderers render artifacts.

### SEO-013: Add SEO Generated File Deletion Safety Tests

- Verify only generated SEO kind directories are removed.
- Verify SPA/source assets are not deleted.
- Acceptance: writer cleanup cannot delete outside output root or unrelated files.

### SEO-014: Add SEO Output Atomicity Decision

- Decide whether regeneration should write into a temp directory then swap, or keep current direct write behavior.
- Recommendation: temp/swap if production SEO generation is user-visible.
- Acceptance: written decision and implementation ticket if chosen.

### SEO-015: Add SEO Regeneration Failure Behavior Test

- Simulate renderer/write failure.
- Decide whether partial output is acceptable.
- Acceptance: behavior is documented and tested.

### SEO-016: Add SEO Admin Security Test

- Verify `/api/admin/seo/regenerate` is covered by `AdminTokenFilter`.
- Acceptance: missing/invalid/valid token behavior is pinned.

### SEO-017: Add SEO Result DTO Contract Test

- Pin `SeoRegenerationResult` JSON shape.
- Acceptance: admin UI/tooling can rely on generated count, routes, skipped counts, warnings, errors, and audit summary.

### SEO-018: Review SEO Content Quality Rules

- Make thin-content, placeholder, duplicate, canonicalized duplicate, and internal-noise policies explicit.
- Acceptance: policy is documented and tested.

### SEO-019: Review SEO Structured Data Type Choices

- SEO expert reviews `WebPage`, `CollectionPage`, and `BreadcrumbList` JSON-LD.
- Acceptance: keep/change recommendation with tests.

### SEO-020: Review SEO Canonical Variant Strategy

- Decide whether variant pages should be indexable, canonicalized, or noindexed by kind.
- Acceptance: canonical/noindex tests reflect the decision.

### SEO-021: Add SEO Snapshot Tests With Normalized HTML

- Instead of asserting many raw substrings, normalize generated HTML and assert semantic regions.
- Acceptance: tests are less brittle but still protect title/meta/canonical/content/links.

### SEO-022: Add SEO Route Collision Tests

- Cover duplicate display names, duplicate slugs across kinds, and duplicate slugs within kind.
- Acceptance: no generated route overwrites another candidate unexpectedly.

### SEO-023: Add SEO Frontend Fallback Integration Test

- Verify generated encyclopedia routes forward to generated files and missing routes remain 404.
- Acceptance: no accidental SPA fallback for missing generated SEO pages.

### SEO-024: Review SEO Package Placement

- Decide whether SEO should remain in `app` or get a clearer package boundary/module later.
- Recommendation: keep in `app` for now; improve internal package boundaries first.
- Acceptance: written decision.

### SEO-025: Add SEO AI Style Review Pass

- Review SEO classes against `docs/backend/java-code-style.md`.
- Remove vague names, excessive comments, broad generated code patterns, and mixed responsibilities behind tests.
- Acceptance: no behavior drift and smaller reviewable classes.

## Recommended SEO Wave Order

1. Add focused tests around current behavior.
2. Extract candidate/metadata/description policies.
3. Split renderer and audit service.
4. Review SEO expert policy decisions: canonical variants, sitemap, structured data, thin content.
5. Improve write atomicity and production failure behavior.

## Implementation Status

Updated: 2026-06-07

- `SEO-001`: done. `docs/backend/seo-architecture.md` documents the SEO pipeline, subsystem ownership, current policy, serving boundaries, and cleanup direction.
- `SEO-002`: done for the current risk profile. Existing regeneration tests plus focused route/writer tests cover metadata, canonical URLs, noindex variants, sitemap inclusion, related links, audit artifacts, route collisions, and generated route forwarding.
- `SEO-003`: done. `PageCandidateBuilder` now owns candidate grouping, route choice, variant canonicalization, context labels, and duplicate alias attachment, with focused tests.
- `SEO-004`: pragmatic skip/deferred. Rebuild orchestration is still large, but splitting all rebuild steps now would be high-churn and should follow candidate/renderer/audit extractions.
- `SEO-005`: pragmatic skip/deferred. Metadata builder extraction remains useful, but current tests already pin title, meta, canonical, robots, Open Graph/Twitter-adjacent shell behavior, and JSON-LD output.
- `SEO-006`: pragmatic skip/deferred. Description parsing remains inside `SeoPageRenderer`; representative description normalization is pinned by regeneration tests.
- `SEO-007`: pragmatic skip/deferred. HTML shell extraction is not done because it risks byte-level output churn without a product behavior change.
- `SEO-008`: pragmatic skip/deferred. Related-link rendering remains in the renderer; existing tests pin resolved labels, hrefs, `data-entry-key`, and omission of unresolved references.
- `SEO-009`: done. `SitemapRoutePolicy` now owns sitemap route selection and has a focused test for public generated routes, indexable candidates, and noindex/audit exclusions.
- `SEO-010`: pragmatic skip/deferred. Missing-reference classification is still in `CodexMissingReferenceAuditService`; ownership and category behavior are pinned by deterministic audit tests.
- `SEO-011`: pragmatic skip/deferred. Scoring remains in the audit service; current tests pin hidden pillbox estimate, recommendations, and source-kind analysis output.
- `SEO-012`: pragmatic skip/deferred. JSON/Markdown report rendering remains in the audit service; deterministic output is tested and extraction should wait until report formats change.
- `SEO-013`: done. `GeneratedSeoWriterTest` pins deletion of requested generated directories while preserving unrelated directories and root SPA assets; locator path safety tests also guard traversal.
- `SEO-014`: done as decision. The architecture note documents direct-write regeneration as acceptable for now and recommends temp-directory swap only if production rebuilds become user-visible.
- `SEO-015`: done. `SeoRegenerationServiceTest` now simulates sitemap write failure and pins the current direct-write behavior: exception propagates and already-written pages can remain.
- `SEO-016`: done by `SeoAdminControllerTest` and admin-token filter coverage for admin endpoint families.
- `SEO-017`: done by `SeoAdminControllerTest`, which pins `SeoRegenerationResult` JSON shape and nested audit summary fields.
- `SEO-018`: done as documented policy plus tests. The architecture note states thin-content, placeholder, duplicate, canonicalized duplicate, and internal/noise policy; codex filter/audit tests pin current behavior.
- `SEO-019`: done as review decision. The architecture note keeps current `WebPage` plus `BreadcrumbList` JSON-LD until a dedicated SEO review approves a different schema type.
- `SEO-020`: done. Canonical duplicate variant strategy is tested: duplicate variants are generated, canonicalized to the representative, marked `noindex`, and excluded from the sitemap.
- `SEO-021`: pragmatic skip/deferred. Tests still use substring assertions in places; normalized semantic HTML snapshots are a good future cleanup, but current focused tests reduce the worst ambiguity.
- `SEO-022`: done. Existing regeneration tests cover duplicate slugs across kinds and duplicate variant handling within a kind without route overwrites.
- `SEO-023`: done by `FrontendControllerRouteTest` and `FrontendControllerProductionFallbackTest`: generated routes forward when files exist, missing generated routes remain `404`, malformed segments are rejected, and root audit files are not publicly served.
- `SEO-024`: done as decision. The architecture note keeps SEO in `app` for now and directs future cleanup into internal package boundaries before any module split.
- `SEO-025`: pragmatic skip/deferred. SEO classes remain style outliers by design; this batch added guardrails and one focused extraction, while broad renderer/audit/style cleanup remains a dedicated future SEO cleanup branch.

SEO verification:

- `./mvnw -B -pl app -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest='SeoRegenerationServiceTest,SeoAdminControllerTest,SeoOutputLocatorPathSafetyTest,SeoOutputLocatorPropertyTest,GeneratedSeoWriterTest,SitemapRoutePolicyTest,FrontendControllerRouteTest,FrontendControllerProductionFallbackTest' test`
- `./mvnw -B -pl app -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest='SeoRegenerationServiceTest,GeneratedSeoWriterTest,SitemapRoutePolicyTest' test`
- `./mvnw -B -pl app -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest='PageCandidateBuilderTest,SeoRegenerationServiceTest,GeneratedSeoWriterTest,SitemapRoutePolicyTest,FrontendControllerRouteTest,FrontendControllerProductionFallbackTest' test`

## Panel Conclusion

SEO should be treated as a separate subsystem under active cleanup. The current
code is useful enough to preserve, but it should not be copied as a style model
for the rest of the backend. Work behind tests, extract behavior-based units,
and keep SEO policy explicit so humans and AI agents can safely maintain it.
