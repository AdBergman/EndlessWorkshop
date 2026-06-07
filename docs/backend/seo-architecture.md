# SEO Backend Architecture

Status: active guidance, not enforced tooling.

SEO is an app-level generation subsystem. It should not become domain logic and
should not be used as a style model for the rest of the backend until the large
renderer and audit classes are cleaned up.

## Pipeline

`SeoAdminController` accepts the admin-triggered rebuild request and delegates.
`SeoRegenerationService` owns the rebuild use case: read codex entries, apply
codex filtering, build page candidates, build reference targets, generate the
missing-reference audit, write pages, write the sitemap, and return a summary.

`PageCandidateBuilder` decides which codex rows become generated pages, which
routes are canonical, and which duplicate variants are `noindex`.
`SeoMetadataBuilder`, `SeoDescriptionParser`, and `RelatedLinkRenderer` own
focused rendering policy. `SeoPageRenderer` still assembles the final HTML
documents. Storage policy owns output-root safety, generated file writes, and
cleanup of generated directories.

## Current Policy

- Generated SEO output lives under the configured `seo.output-dir`.
- `/encyclopedia`, category pages, and indexable candidate pages are sitemap
  candidates.
- Canonicalized duplicate variants are generated for direct access but are
  `noindex` and excluded from the sitemap.
- Thin content, placeholder display names, duplicate slugs, and internal/noise
  references are filtered or classified by explicit codex/SEO policy.
- Structured data currently uses `WebPage` for entity pages plus
  `BreadcrumbList`; keep this unless an SEO review approves a different type.
- Regeneration currently writes directly into the output directory. Partial
  output is acceptable for now because the admin rebuild is explicit and guarded
  by tests; move to temp-directory swap only if production generation becomes
  user-visible during rebuilds.

## Ownership

- Controllers stay thin and enforce admin access through the existing admin
  token filter.
- `SeoRegenerationService` orchestrates the use case; page-candidate, sitemap,
  rendering, storage, and audit policies live in focused collaborators.
- `SeoPageRenderer` assembles HTML documents; metadata, description parsing,
  and related-link rendering live in smaller policy helpers.
- `GeneratedSeoWriter` and `SeoOutputLocator` own filesystem mechanics.
- `CodexMissingReferenceAuditService` computes audit data; classification,
  scoring, and report rendering live in focused helpers.
- `SitemapController`, `FrontendController`, and `WebConfig` own serving and
  forwarding generated files; missing generated encyclopedia routes should stay
  real `404`s.

## Cleanup Direction

Start with guardrails, then extract behavior-based units. Avoid broad generic
pipelines. The remaining useful extraction is HTML shell rendering, but only if
future page-shape changes make that split valuable enough to justify the output
churn risk.
