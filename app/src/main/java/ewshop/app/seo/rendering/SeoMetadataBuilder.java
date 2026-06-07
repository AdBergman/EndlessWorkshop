package ewshop.app.seo.rendering;

import ewshop.app.seo.generation.PageCandidate;
import ewshop.app.seo.generation.SeoRoutes;

import java.util.Locale;

final class SeoMetadataBuilder {

    SeoMetadata buildEntityMetadata(
            PageCandidate candidate,
            String route,
            String displayTitle,
            String kindLabel,
            String pluralKindLabel,
            ParsedDescription description
    ) {
        String pageTitle = displayTitle + " " + kindLabel + " Reference | " + SeoRoutes.SITE_NAME;
        String seoDescription = buildSeoDescription(displayTitle, kindLabel, description);
        String canonicalUrl = SeoRoutes.SITE_URL + candidate.canonicalRoute();
        String pageUrl = SeoRoutes.SITE_URL + route;
        String robots = candidate.indexable() ? "index, follow" : "noindex, follow";

        String webPageJsonLd = """
                {"@context":"https://schema.org","@type":"WebPage","name":"%s","description":"%s","url":"%s","isPartOf":{"@type":"WebSite","name":"%s","url":"%s"},"breadcrumb":{"@id":"%s#breadcrumb"}}
                """.formatted(
                HtmlEscaper.escapeJson(pageTitle),
                HtmlEscaper.escapeJson(seoDescription),
                HtmlEscaper.escapeJson(pageUrl),
                HtmlEscaper.escapeJson(SeoRoutes.SITE_NAME),
                HtmlEscaper.escapeJson(SeoRoutes.SITE_URL),
                HtmlEscaper.escapeJson(pageUrl)
        ).trim();
        String breadcrumbJsonLd = """
                {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"%s","item":"%s"},{"@type":"ListItem","position":2,"name":"Encyclopedia","item":"%s/%s"},{"@type":"ListItem","position":3,"name":"%s","item":"%s%s"},{"@type":"ListItem","position":4,"name":"%s","item":"%s"}],"@id":"%s#breadcrumb"}
                """.formatted(
                HtmlEscaper.escapeJson(SeoRoutes.SITE_NAME),
                HtmlEscaper.escapeJson(SeoRoutes.SITE_URL),
                HtmlEscaper.escapeJson(SeoRoutes.SITE_URL),
                HtmlEscaper.escapeJson(SeoRoutes.ENCYCLOPEDIA_PAGE),
                HtmlEscaper.escapeJson(pluralKindLabel),
                HtmlEscaper.escapeJson(SeoRoutes.SITE_URL),
                HtmlEscaper.escapeJson(SeoRoutes.encyclopediaRouteFor(candidate.kind())),
                HtmlEscaper.escapeJson(displayTitle),
                HtmlEscaper.escapeJson(pageUrl),
                HtmlEscaper.escapeJson(pageUrl)
        ).trim();

        return new SeoMetadata(pageTitle, seoDescription, canonicalUrl, pageUrl, robots, webPageJsonLd, breadcrumbJsonLd);
    }

    private static String buildSeoDescription(String displayName, String kindLabel, ParsedDescription description) {
        String supportingLine = !description.introLine().isBlank()
                ? description.introLine()
                : firstOrBlank(description.descriptionLines());
        if (supportingLine.isBlank()) {
            return displayName + " is a " + kindLabel.toLowerCase(Locale.ROOT)
                    + " entry in the Endless Workshop codex.";
        }

        return displayName + " is a " + kindLabel.toLowerCase(Locale.ROOT)
                + " entry in the Endless Workshop codex. " + supportingLine;
    }

    private static String firstOrBlank(java.util.List<String> values) {
        return values.isEmpty() ? "" : values.getFirst();
    }
}
