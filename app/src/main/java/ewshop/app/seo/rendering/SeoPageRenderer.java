package ewshop.app.seo.rendering;

import ewshop.app.seo.generation.PageCandidate;
import ewshop.app.seo.generation.ReferenceTarget;
import ewshop.app.seo.generation.SeoRoutes;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class SeoPageRenderer {

    private static final SeoDescriptionParser DESCRIPTION_PARSER = new SeoDescriptionParser();
    private static final List<String> PREFERRED_KIND_ORDER = List.of(
            "abilities",
            "councilors",
            "districts",
            "extractors",
            "equipment",
            "factions",
            "heroes",
            "improvements",
            "populations",
            "tech",
            "units"
    );

    private final SeoMetadataBuilder metadataBuilder = new SeoMetadataBuilder();
    private final RelatedLinkRenderer relatedLinkRenderer = new RelatedLinkRenderer();

    public Map<String, List<PageCandidate>> candidatesByKind(List<PageCandidate> candidates) {
        LinkedHashMap<String, List<PageCandidate>> candidatesByKind = new LinkedHashMap<>();
        candidates.stream()
                .sorted(Comparator
                        .comparingInt((PageCandidate candidate) -> preferredKindIndex(candidate.kind()))
                        .thenComparing(PageCandidate::kind, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(PageCandidate::displayName, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(PageCandidate::entryKey, String.CASE_INSENSITIVE_ORDER))
                .forEach(candidate -> candidatesByKind
                        .computeIfAbsent(candidate.kind(), ignored -> new ArrayList<>())
                        .add(candidate));

        candidatesByKind.replaceAll((ignored, kindCandidates) -> List.copyOf(kindCandidates));
        return candidatesByKind;
    }

    private static int preferredKindIndex(String kind) {
        int index = PREFERRED_KIND_ORDER.indexOf(trimToEmpty(kind).toLowerCase(Locale.ROOT));
        return index < 0 ? PREFERRED_KIND_ORDER.size() : index;
    }

    public String renderEntityHtml(
            PageCandidate candidate,
            String route,
            Map<String, ReferenceTarget> referenceTargetsByEntryKey
    ) {
        String kindLabel = kindLabelFor(candidate.kind());
        String pluralKindLabel = pluralKindLabelFor(candidate.kind());
        ParsedDescription description = DESCRIPTION_PARSER.parse(candidate.descriptionLines());
        String displayTitle = displayTitle(candidate);
        SeoMetadata metadata = metadataBuilder.buildEntityMetadata(
                candidate,
                route,
                displayTitle,
                kindLabel,
                pluralKindLabel,
                description
        );

        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta name="theme-color" content="#0b0e13" />
                    <title>%s</title>
                    <meta name="description" content="%s" />
                    <meta name="robots" content="%s" />
                    <link rel="canonical" href="%s" />
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                    <link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
                    <link rel="stylesheet" href="/seo/seo-shell.css" />
                    <link rel="stylesheet" href="/seo/entity-page.css" />
                    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                    <link rel="shortcut icon" href="/favicon.ico" />
                    <link rel="manifest" href="/manifest.json" />
                    <meta property="og:site_name" content="%s" />
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content="%s" />
                    <meta property="og:description" content="%s" />
                    <meta property="og:url" content="%s" />
                    <meta property="og:image" content="%s" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content="%s" />
                    <meta name="twitter:description" content="%s" />
                    <meta name="twitter:image" content="%s" />
                    <script type="application/ld+json">%s</script>
                    <script type="application/ld+json">%s</script>
                </head>
                <body class="seo-page">
                <header class="seo-topbar">
                    <div class="seo-topbar__inner">
                        <a class="seo-brand" href="/">
                            <img class="seo-brand__icon" src="/graphics/cog.svg" alt="Endless Workshop icon" />
                            <span class="seo-brand__copy">
                                <span class="seo-brand__title">Endless Workshop</span>
                            </span>
                        </a>

                        <nav class="seo-nav" aria-label="Primary">
                            <a href="/tech">Tech</a><a href="/units">Units</a><a href="/codex">Codex</a><a href="/summary">Summary</a><a href="/mods">Mods</a><a href="/info">Info</a>
                        </nav>

                    </div>
                </header>

                <main class="seo-shell entity-page">
                    <div class="seo-hidden">%s</div>
                    <div class="entity-page__breadcrumbs" aria-label="Breadcrumb">
                        <a href="/">Home</a>
                        <span>/</span>
                        <a href="/encyclopedia">Encyclopedia</a>
                        <span>/</span>
                        <a href="%s">%s</a>
                        <span>/</span>
                        <span>%s</span>
                    </div>

                    <div class="entity-page__layout">
                        <header class="entity-page__header">
                            <p class="entity-page__meta">%s</p>
                            <h1 class="seo-heading entity-page__title">%s</h1>
                            %s
                        </header>

                        %s
                        %s
                        %s

                        <section class="seo-section entity-page__section entity-page__actions" aria-label="Actions">
                            <div class="seo-buttonRow">
                                %s
                            </div>
                        </section>
                    </div>
                </main>
                </body>
                </html>
                """.formatted(
                escapeHtml(metadata.pageTitle()),
                escapeHtml(metadata.seoDescription()),
                escapeHtml(metadata.robots()),
                metadata.canonicalUrl(),
                escapeHtml(SeoRoutes.SITE_NAME),
                escapeHtml(metadata.pageTitle()),
                escapeHtml(metadata.seoDescription()),
                metadata.pageUrl(),
                SeoRoutes.DEFAULT_IMAGE_URL,
                escapeHtml(metadata.pageTitle()),
                escapeHtml(metadata.seoDescription()),
                SeoRoutes.DEFAULT_IMAGE_URL,
                metadata.webPageJsonLd(),
                metadata.breadcrumbJsonLd(),
                escapeHtml(metadata.pageTitle()),
                escapeHtml(SeoRoutes.encyclopediaRouteFor(candidate.kind())),
                escapeHtml(pluralKindLabel),
                escapeHtml(displayTitle),
                escapeHtml(buildMetadataLine(kindLabel, candidate, description.metadataHighlights())),
                escapeHtml(displayTitle),
                renderIntro(description.introLine()),
                renderDescriptionSection(description),
                renderCanonicalizedVariants(candidate),
                relatedLinkRenderer.renderRelatedSection(candidate.referenceKeys(), referenceTargetsByEntryKey),
                renderActionRow(candidate.kind())
        );
    }

    public String renderEncyclopediaRootHtml(List<PageCandidate> candidates) {
        Map<String, List<PageCandidate>> groupedCandidates = candidatesByKind(candidates);
        String pageTitle = "Endless Workshop Encyclopedia | " + SeoRoutes.SITE_NAME;
        String seoDescription = "Browse the Endless Workshop encyclopedia by category, including abilities, units, technologies, improvements, equipment, heroes, districts, extractors, populations, factions, and councilors.";
        String canonicalUrl = SeoRoutes.SITE_URL + "/" + SeoRoutes.ENCYCLOPEDIA_PAGE;

        StringBuilder categories = new StringBuilder();
        categories.append("<div class=\"encyclopedia-page__index\" aria-label=\"Codex categories\">");
        groupedCandidates.forEach((kind, kindCandidates) -> categories
                .append("<a class=\"encyclopedia-page__categoryRow\" href=\"")
                .append(escapeHtml(SeoRoutes.encyclopediaRouteFor(kind)))
                .append("\">")
                .append("<span class=\"encyclopedia-page__categoryName\">")
                .append(escapeHtml(pluralKindLabelFor(kind)))
                .append("</span>")
                .append("<span class=\"encyclopedia-page__categoryCount\">")
                .append(kindCandidates.size())
                .append("</span>")
                .append("</a>"));
        categories.append("</div>");

        return renderEncyclopediaShell(
                pageTitle,
                seoDescription,
                canonicalUrl,
                "Encyclopedia index",
                "Codex Overview",
                "Browse generated Endless Workshop SEO references by category.",
                categories.toString()
        );
    }

    public String renderEncyclopediaKindHtml(String kind, List<PageCandidate> candidates) {
        String kindLabel = pluralKindLabelFor(kind);
        String pageTitle = kindLabel + " Encyclopedia | " + SeoRoutes.SITE_NAME;
        String seoDescription = "Browse " + kindLabel.toLowerCase(Locale.ROOT)
                + " in the Endless Workshop encyclopedia, with generated reference pages and descriptions.";
        String canonicalUrl = SeoRoutes.SITE_URL + SeoRoutes.encyclopediaRouteFor(kind);

        StringBuilder entries = new StringBuilder();
        entries.append("<div class=\"encyclopedia-page__entryList\" aria-label=\"")
                .append(escapeHtml(kindLabel))
                .append("\">");
        for (PageCandidate candidate : candidates) {
            entries.append("<a class=\"encyclopedia-page__entryRow\" href=\"")
                    .append(escapeHtml(candidate.route()))
                    .append("\" data-entry-key=\"")
                    .append(escapeHtml(candidate.entryKey()))
                    .append("\">")
                    .append("<span class=\"encyclopedia-page__entryTitle\">")
                    .append(escapeHtml(displayTitle(candidate)))
                    .append("</span>")
                    .append(renderEntryContext(candidate))
                    .append("<span class=\"encyclopedia-page__entryDescription\">")
                    .append(escapeHtml(buildEntryPreview(candidate)))
                    .append("</span>")
                    .append("</a>");
        }
        entries.append("</div>");

        return renderEncyclopediaShell(
                pageTitle,
                seoDescription,
                canonicalUrl,
                "Encyclopedia category",
                kindLabel,
                candidates.size() + " generated " + kindLabel.toLowerCase(Locale.ROOT) + " reference pages.",
                entries.toString()
        );
    }

    private static String renderEncyclopediaShell(
            String pageTitle,
            String seoDescription,
            String canonicalUrl,
            String eyebrow,
            String heading,
            String summary,
            String content
    ) {
        String webPageJsonLd = """
                {"@context":"https://schema.org","@type":"CollectionPage","name":"%s","description":"%s","url":"%s","isPartOf":{"@type":"WebSite","name":"%s","url":"%s"}}
                """.formatted(
                HtmlEscaper.escapeJson(pageTitle),
                HtmlEscaper.escapeJson(seoDescription),
                HtmlEscaper.escapeJson(canonicalUrl),
                HtmlEscaper.escapeJson(SeoRoutes.SITE_NAME),
                HtmlEscaper.escapeJson(SeoRoutes.SITE_URL)
        ).trim();

        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta name="theme-color" content="#0b0e13" />
                    <title>%s</title>
                    <meta name="description" content="%s" />
                    <meta name="robots" content="index, follow" />
                    <link rel="canonical" href="%s" />
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                    <link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
                    <link rel="stylesheet" href="/seo/seo-shell.css" />
                    <link rel="stylesheet" href="/seo/entity-page.css" />
                    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                    <link rel="shortcut icon" href="/favicon.ico" />
                    <link rel="manifest" href="/manifest.json" />
                    <meta property="og:site_name" content="%s" />
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content="%s" />
                    <meta property="og:description" content="%s" />
                    <meta property="og:url" content="%s" />
                    <meta property="og:image" content="%s" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:title" content="%s" />
                    <meta name="twitter:description" content="%s" />
                    <meta name="twitter:image" content="%s" />
                    <script type="application/ld+json">%s</script>
                </head>
                <body class="seo-page">
                <header class="seo-topbar">
                    <div class="seo-topbar__inner">
                        <a class="seo-brand" href="/">
                            <img class="seo-brand__icon" src="/graphics/cog.svg" alt="Endless Workshop icon" />
                            <span class="seo-brand__copy">
                                <span class="seo-brand__title">Endless Workshop</span>
                            </span>
                        </a>

                        <nav class="seo-nav" aria-label="Primary">
                            <a href="/tech">Tech</a><a href="/units">Units</a><a href="/codex">Codex</a><a href="/summary">Summary</a><a href="/mods">Mods</a><a href="/info">Info</a>
                        </nav>
                    </div>
                </header>

                <main class="seo-shell entity-page encyclopedia-page">
                    <div class="entity-page__breadcrumbs" aria-label="Breadcrumb">
                        <a href="/">Home</a>
                        <span>/</span>
                        <a href="/encyclopedia">Encyclopedia</a>
                    </div>

                    <header class="entity-page__header">
                        <p class="entity-page__meta">%s</p>
                        <h1 class="seo-heading entity-page__title">%s</h1>
                        <p class="seo-text entity-page__summary">%s</p>
                    </header>

                    <section class="seo-section entity-page__section encyclopedia-page__section">
                        %s
                    </section>
                </main>
                </body>
                </html>
                """.formatted(
                escapeHtml(pageTitle),
                escapeHtml(seoDescription),
                canonicalUrl,
                escapeHtml(SeoRoutes.SITE_NAME),
                escapeHtml(pageTitle),
                escapeHtml(seoDescription),
                canonicalUrl,
                SeoRoutes.DEFAULT_IMAGE_URL,
                escapeHtml(pageTitle),
                escapeHtml(seoDescription),
                SeoRoutes.DEFAULT_IMAGE_URL,
                webPageJsonLd,
                escapeHtml(eyebrow),
                escapeHtml(heading),
                escapeHtml(summary),
                content
        );
    }

    private static String renderDescriptionSection(ParsedDescription description) {
        String content = renderDescriptionContent(description);
        if (content.isBlank()) {
            return "";
        }

        return """
                        <section class="seo-section entity-page__section entity-page__description">
                            <h2 class="seo-heading">Description</h2>
                            %s
                        </section>
                """.formatted(content);
    }

    private static String renderCanonicalizedVariants(PageCandidate candidate) {
        if (candidate.canonicalizedVariants() == null || candidate.canonicalizedVariants().isEmpty()) {
            return "";
        }

        StringBuilder variants = new StringBuilder();
        variants.append("<ul class=\"seo-list entity-page__detailList\">");
        for (var variant : candidate.canonicalizedVariants()) {
            variants.append("<li>")
                    .append(escapeHtml(displayTitle(variant.displayName(), variant.contextLabel())))
                    .append("</li>");
        }
        variants.append("</ul>");

        return """
                        <section class="seo-section entity-page__section entity-page__variants">
                            <h2 class="seo-heading">Also Covers</h2>
                            %s
                        </section>
                """.formatted(variants);
    }

    private static String renderIntro(String introLine) {
        if (introLine.isBlank()) {
            return "";
        }
        return "<p class=\"seo-text entity-page__summary\">" + escapeHtml(introLine) + "</p>";
    }

    private static String renderActionRow(String kind) {
        List<String> actions = new ArrayList<>();
        actions.add(renderActionLink("/codex", "Back to Codex"));

        if (SeoRoutes.TECH_KIND.equals(kind)) {
            actions.add(renderActionLink("/tech", "Browse Tech"));
        } else if (SeoRoutes.UNITS_KIND.equals(kind)) {
            actions.add(renderActionLink("/units", "Browse Units"));
        }

        return String.join("", actions);
    }

    private static String renderActionLink(String href, String label) {
        return "<a class=\"seo-linkButton entity-page__actionLink\" href=\""
                + href
                + "\">"
                + escapeHtml(label)
                + "</a>";
    }

    private static String buildMetadataLine(String kindLabel, PageCandidate candidate, List<String> metadataHighlights) {
        List<String> parts = new ArrayList<>();
        parts.add(kindLabel);
        if (!trimToEmpty(candidate.category()).isBlank()) {
            parts.add("Category: " + candidate.category());
        }
        if (!trimToEmpty(candidate.sourceKind()).isBlank()
                && !candidate.sourceKind().equalsIgnoreCase(kindLabel)
                && parts.stream().noneMatch(part -> part.equalsIgnoreCase(candidate.sourceKind()))) {
            parts.add("Type: " + candidate.sourceKind());
        }
        parts.addAll(metadataHighlights);
        return parts.stream().distinct().limit(4).reduce((left, right) -> left + " • " + right).orElse(kindLabel);
    }

    private static String renderDescriptionContent(ParsedDescription description) {
        List<String> proseLines = new ArrayList<>();
        List<String> detailLines = new ArrayList<>();

        for (String line : description.descriptionLines()) {
            if (DESCRIPTION_PARSER.isLikelyIntroLine(line)) {
                proseLines.add(line);
            } else {
                detailLines.add(line);
            }
        }

        StringBuilder html = new StringBuilder();
        if (!proseLines.isEmpty()) {
            html.append("<div class=\"entity-page__prose\">");
            for (String proseLine : proseLines) {
                html.append("<p class=\"seo-text entity-page__paragraph\">")
                        .append(escapeHtml(proseLine))
                        .append("</p>");
            }
            html.append("</div>");
        }

        if (!detailLines.isEmpty()) {
            html.append("<ul class=\"seo-list entity-page__detailList\">")
                    .append(renderList(detailLines))
                    .append("</ul>");
        }

        return html.toString();
    }

    private static String kindLabelFor(String kind) {
        Map<String, String> explicitLabels = Map.ofEntries(
                Map.entry("districts", "District"),
                Map.entry("extractors", "Extractor"),
                Map.entry("improvements", "Improvement"),
                Map.entry("equipment", "Equipment"),
                Map.entry("councilors", "Councilor"),
                Map.entry("heroes", "Hero"),
                Map.entry("units", "Unit"),
                Map.entry("abilities", "Ability"),
                Map.entry("tech", "Technology")
        );

        String normalizedKind = trimToEmpty(kind).toLowerCase(Locale.ROOT);
        if (explicitLabels.containsKey(normalizedKind)) {
            return explicitLabels.get(normalizedKind);
        }

        String singularKind = normalizedKind.endsWith("s") && normalizedKind.length() > 1
                ? normalizedKind.substring(0, normalizedKind.length() - 1)
                : normalizedKind;
        String[] parts = singularKind.split("[-_\\s]+");
        StringBuilder label = new StringBuilder();
        for (String part : parts) {
            if (part.isBlank()) {
                continue;
            }
            if (!label.isEmpty()) {
                label.append(' ');
            }
            label.append(part.substring(0, 1).toUpperCase(Locale.ROOT))
                    .append(part.substring(1).toLowerCase(Locale.ROOT));
        }
        return label.isEmpty() ? "Codex" : label.toString();
    }

    private static String pluralKindLabelFor(String kind) {
        String normalizedKind = trimToEmpty(kind).toLowerCase(Locale.ROOT);
        Map<String, String> explicitLabels = Map.ofEntries(
                Map.entry("abilities", "Abilities"),
                Map.entry("councilors", "Councilors"),
                Map.entry("districts", "Districts"),
                Map.entry("extractors", "Extractors"),
                Map.entry("equipment", "Equipment"),
                Map.entry("factions", "Factions"),
                Map.entry("heroes", "Heroes"),
                Map.entry("improvements", "Improvements"),
                Map.entry("populations", "Populations"),
                Map.entry("tech", "Technologies"),
                Map.entry("units", "Units")
        );

        if (explicitLabels.containsKey(normalizedKind)) {
            return explicitLabels.get(normalizedKind);
        }

        String label = kindLabelFor(kind);
        return label.endsWith("s") ? label : label + "s";
    }

    private static String buildEntryPreview(PageCandidate candidate) {
        ParsedDescription description = DESCRIPTION_PARSER.parse(candidate.descriptionLines());
        String preview = !description.introLine().isBlank()
                ? description.introLine()
                : firstOrBlank(description.descriptionLines());
        return preview.isBlank() ? candidate.displayName() + " reference entry." : preview;
    }

    private static String renderEntryContext(PageCandidate candidate) {
        String context = trimToEmpty(candidate.contextLabel());
        if (context.isBlank() || context.equals(candidate.entryKey())) {
            return "";
        }
        return "<span class=\"encyclopedia-page__entryContext\">" + escapeHtml(context) + "</span>";
    }

    private static String displayTitle(PageCandidate candidate) {
        boolean variantRoute = !trimToEmpty(candidate.entryKeySlug()).isBlank();
        if (!variantRoute) {
            return candidate.displayName();
        }
        return displayTitle(candidate.displayName(), candidate.contextLabel());
    }

    private static String displayTitle(String displayName, String contextLabel) {
        String context = trimToEmpty(contextLabel);
        if (context.isBlank()) {
            return displayName;
        }
        return displayName + " - " + context;
    }

    private static String renderList(List<String> items) {
        StringBuilder html = new StringBuilder();
        for (String item : items) {
            html.append("<li>").append(escapeHtml(item)).append("</li>");
        }
        return html.toString();
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private static String escapeHtml(String value) {
        return HtmlEscaper.escapeHtml(value);
    }

    private static String firstOrBlank(List<String> values) {
        return values.isEmpty() ? "" : values.getFirst();
    }

}
