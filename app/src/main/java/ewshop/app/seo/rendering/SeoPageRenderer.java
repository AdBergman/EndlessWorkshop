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
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Service
public class SeoPageRenderer {

    private static final Pattern DETAIL_PATTERN = Pattern.compile("^([A-Za-z][A-Za-z /-]{1,40}):\\s*(.+)$");
    private static final List<String> PREFERRED_KIND_ORDER = List.of(
            "abilities",
            "councilors",
            "districts",
            "equipment",
            "factions",
            "heroes",
            "improvements",
            "populations",
            "tech",
            "units"
    );

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
        ParsedDescription description = parseDescription(candidate.descriptionLines());
        String displayTitle = displayTitle(candidate);
        String pageTitle = displayTitle + " " + kindLabel + " Reference | " + SeoRoutes.SITE_NAME;
        String seoDescription = buildSeoDescription(displayTitle, kindLabel, description);
        String canonicalUrl = SeoRoutes.SITE_URL + candidate.canonicalRoute();
        String pageUrl = SeoRoutes.SITE_URL + route;
        String robots = candidate.indexable() ? "index, follow" : "noindex, follow";

        String webPageJsonLd = """
                {"@context":"https://schema.org","@type":"WebPage","name":"%s","description":"%s","url":"%s","isPartOf":{"@type":"WebSite","name":"%s","url":"%s"},"breadcrumb":{"@id":"%s#breadcrumb"}}
                """.formatted(
                escapeJson(pageTitle),
                escapeJson(seoDescription),
                escapeJson(pageUrl),
                escapeJson(SeoRoutes.SITE_NAME),
                escapeJson(SeoRoutes.SITE_URL),
                escapeJson(pageUrl)
        ).trim();
        String breadcrumbJsonLd = """
                {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"%s","item":"%s"},{"@type":"ListItem","position":2,"name":"Encyclopedia","item":"%s/%s"},{"@type":"ListItem","position":3,"name":"%s","item":"%s%s"},{"@type":"ListItem","position":4,"name":"%s","item":"%s"}],"@id":"%s#breadcrumb"}
                """.formatted(
                escapeJson(SeoRoutes.SITE_NAME),
                escapeJson(SeoRoutes.SITE_URL),
                escapeJson(SeoRoutes.SITE_URL),
                escapeJson(SeoRoutes.ENCYCLOPEDIA_PAGE),
                escapeJson(pluralKindLabelFor(candidate.kind())),
                escapeJson(SeoRoutes.SITE_URL),
                escapeJson(SeoRoutes.encyclopediaRouteFor(candidate.kind())),
                escapeJson(displayTitle),
                escapeJson(pageUrl),
                escapeJson(pageUrl)
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
                    <meta name="robots" content="%s" />
                    <link rel="canonical" href="%s" />
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                    <link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
                    <link rel="stylesheet" href="/seo/seo-shell.css" />
                    <link rel="stylesheet" href="/seo/entity-page.css" />
                    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                    <link rel="shortcut icon" href="/favicon.ico" />
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
                escapeHtml(pageTitle),
                escapeHtml(seoDescription),
                escapeHtml(robots),
                canonicalUrl,
                escapeHtml(SeoRoutes.SITE_NAME),
                escapeHtml(pageTitle),
                escapeHtml(seoDescription),
                pageUrl,
                SeoRoutes.DEFAULT_IMAGE_URL,
                escapeHtml(pageTitle),
                escapeHtml(seoDescription),
                SeoRoutes.DEFAULT_IMAGE_URL,
                webPageJsonLd,
                breadcrumbJsonLd,
                escapeHtml(pageTitle),
                escapeHtml(SeoRoutes.encyclopediaRouteFor(candidate.kind())),
                escapeHtml(pluralKindLabelFor(candidate.kind())),
                escapeHtml(displayTitle),
                escapeHtml(buildMetadataLine(kindLabel, candidate, description.metadataHighlights())),
                escapeHtml(displayTitle),
                renderIntro(description.introLine()),
                renderDescriptionSection(description),
                renderCanonicalizedVariants(candidate),
                renderRelatedSection(candidate.referenceKeys(), referenceTargetsByEntryKey),
                renderActionRow(candidate.kind())
        );
    }

    public String renderEncyclopediaRootHtml(List<PageCandidate> candidates) {
        Map<String, List<PageCandidate>> groupedCandidates = candidatesByKind(candidates);
        String pageTitle = "Endless Workshop Encyclopedia | " + SeoRoutes.SITE_NAME;
        String seoDescription = "Browse the Endless Workshop encyclopedia by category, including abilities, units, technologies, improvements, equipment, heroes, districts, populations, factions, and councilors.";
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
                escapeJson(pageTitle),
                escapeJson(seoDescription),
                escapeJson(canonicalUrl),
                escapeJson(SeoRoutes.SITE_NAME),
                escapeJson(SeoRoutes.SITE_URL)
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

    private static String renderRelatedSection(
            List<String> referenceKeys,
            Map<String, ReferenceTarget> referenceTargetsByEntryKey
    ) {
        if (referenceKeys == null || referenceKeys.isEmpty()) {
            return "";
        }

        String referenceChips = renderReferenceChips(referenceKeys, referenceTargetsByEntryKey);
        if (referenceChips.isBlank()) {
            return "";
        }

        return """
                        <section class="seo-section entity-page__section entity-page__references">
                            <h2 class="seo-heading">Related</h2>
                            %s
                        </section>
                """.formatted(referenceChips);
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

    private static ParsedDescription parseDescription(List<String> rawDescriptionLines) {
        List<String> normalizedLines = rawDescriptionLines.stream()
                .map(SeoPageRenderer::normalizeContentLine)
                .filter(line -> !line.isBlank())
                .filter(line -> !isPrototypeLine(line))
                .toList();

        int introIndex = -1;
        for (int index = 0; index < normalizedLines.size(); index++) {
            if (isLikelyIntroLine(normalizedLines.get(index))) {
                introIndex = index;
                break;
            }
        }

        String introLine = introIndex >= 0 ? normalizedLines.get(introIndex) : "";
        List<String> contentLines = new ArrayList<>();
        for (int index = 0; index < normalizedLines.size(); index++) {
            if (index != introIndex) {
                contentLines.add(normalizedLines.get(index));
            }
        }

        return new ParsedDescription(
                introLine,
                List.copyOf(contentLines),
                List.copyOf(extractMetadataHighlights(normalizedLines))
        );
    }

    private static List<String> extractMetadataHighlights(List<String> lines) {
        LinkedHashMap<String, String> highlights = new LinkedHashMap<>();
        List<String> preferredKeys = List.of("Faction", "Category", "Type", "Role", "Slot", "Tier", "Rarity");

        for (String preferredKey : preferredKeys) {
            for (String line : lines) {
                DetailLine detailLine = parseDetailLine(line);
                if (detailLine != null && detailLine.label().equalsIgnoreCase(preferredKey)) {
                    highlights.putIfAbsent(preferredKey, detailLine.label() + ": " + detailLine.value());
                    break;
                }
            }
        }

        return highlights.values().stream().limit(3).toList();
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
            if (isLikelyIntroLine(line)) {
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
        ParsedDescription description = parseDescription(candidate.descriptionLines());
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

    private static String renderReferenceChips(
            List<String> referenceKeys,
            Map<String, ReferenceTarget> referenceTargetsByEntryKey
    ) {
        StringBuilder chips = new StringBuilder();
        chips.append("<ul class=\"seo-chipList\">");
        for (String referenceKey : referenceKeys) {
            String key = trimToEmpty(referenceKey);
            if (key.isBlank()) {
                continue;
            }

            ReferenceTarget target = referenceTargetsByEntryKey.get(key);
            if (target == null || trimToEmpty(target.route()).isBlank()) {
                continue;
            }

            String label = trimToEmpty(target.displayName()).isBlank()
                    ? key
                    : target.displayName();

            chips.append("<li>")
                    .append("<a class=\"seo-chip\" href=\"")
                    .append(escapeHtml(target.route()))
                    .append("\" data-entry-key=\"")
                    .append(escapeHtml(key))
                    .append("\">")
                    .append(escapeHtml(label))
                    .append("</a>")
                    .append("</li>");
        }
        if (chips.length() == "<ul class=\"seo-chipList\">".length()) {
            return "";
        }

        chips.append("</ul>");
        return chips.toString();
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
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private static String escapeJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }

    private static String normalizeContentLine(String value) {
        String normalized = trimToEmpty(value)
                .replaceAll("\\[[^]]+]", " ")
                .replaceAll("([a-z])([A-Z])", "$1 $2")
                .replaceAll("\\s+", " ")
                .trim();
        if (normalized.isBlank()) {
            return normalized;
        }

        String deduped = normalized;
        String previous;
        do {
            previous = deduped;
            deduped = deduped.replaceAll("\\b([A-Za-z]+(?:\\s+[A-Za-z]+){0,2})\\s+\\1\\b", "$1");
        } while (!deduped.equals(previous));

        List<String> tokens = new ArrayList<>(List.of(deduped.split(" ")));
        if (tokens.size() >= 2
                && normalizedToken(tokens.getFirst()).equalsIgnoreCase(normalizedToken(tokens.get(1)))) {
            tokens.removeFirst();
        }
        return String.join(" ", tokens).trim();
    }

    private static boolean isPrototypeLine(String line) {
        return line.regionMatches(true, 0, "Prototype:", 0, "Prototype:".length());
    }

    private static String normalizedToken(String value) {
        return value.replaceAll("^[^A-Za-z0-9]+|[^A-Za-z0-9]+$", "");
    }

    private static boolean isLikelyIntroLine(String line) {
        if (line.isBlank() || parseDetailLine(line) != null) {
            return false;
        }

        boolean hasSentencePunctuation = line.contains(".") || line.contains("!") || line.contains("?");
        long wordCount = Stream.of(line.split("\\s+"))
                .map(SeoPageRenderer::normalizedToken)
                .filter(token -> !token.isBlank())
                .count();
        boolean looksStatLike = line.matches(".*\\d.*")
                || line.contains("+")
                || line.contains("%")
                || line.contains("->");

        return hasSentencePunctuation || (wordCount >= 6 && !looksStatLike);
    }

    private static DetailLine parseDetailLine(String line) {
        Matcher matcher = DETAIL_PATTERN.matcher(line);
        if (!matcher.matches()) {
            return null;
        }

        String label = trimToEmpty(matcher.group(1));
        String value = trimToEmpty(matcher.group(2));
        if (label.isBlank() || value.isBlank()) {
            return null;
        }

        return new DetailLine(label, value);
    }

    private static String firstOrBlank(List<String> values) {
        return values.isEmpty() ? "" : values.getFirst();
    }

    record ParsedDescription(
            String introLine,
            List<String> descriptionLines,
            List<String> metadataHighlights
    ) {
    }

    record DetailLine(String label, String value) {
    }
}
