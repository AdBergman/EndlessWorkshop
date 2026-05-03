package ewshop.app.seo;

import ewshop.domain.service.CodexFilterResult;
import ewshop.domain.service.CodexFilterService;
import ewshop.domain.service.CodexService;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Service
public class SeoRegenerationService {

    static final String TECH_KIND = "tech";
    static final String UNITS_KIND = "units";
    static final String WORKSHOP_ENTRY_KEY = "workshop";

    private static final String DUPLICATE_SLUG_REASON = "duplicate-slug";
    private static final String SITE_NAME = "Endless Workshop";
    private static final String SITE_URL = "https://endlessworkshop.dev";
    private static final String DEFAULT_IMAGE_URL = SITE_URL + "/logo512.png";
    private static final Pattern DETAIL_PATTERN = Pattern.compile("^([A-Za-z][A-Za-z /-]{1,40}):\\s*(.+)$");
    private static final List<String> INDEXABLE_PUBLIC_ROUTE_PATHS = List.of(
            "/tech",
            "/units",
            "/codex",
            "/summary",
            "/mods",
            "/info"
    );

    private final CodexService codexService;
    private final CodexFilterService codexFilterService;
    private final SeoOutputLocator seoOutputLocator;

    public SeoRegenerationService(
            CodexService codexService,
            CodexFilterService codexFilterService,
            SeoOutputLocator seoOutputLocator
    ) {
        this.codexService = codexService;
        this.codexFilterService = codexFilterService;
        this.seoOutputLocator = seoOutputLocator;
    }

    public SeoRegenerationResult regeneratePrototypePages() {
        List<String> warnings = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        CodexFilterResult filterResult = codexFilterService.filter(codexService.getAllCodexEntries());
        addDuplicateSlugWarnings(filterResult, warnings);

        List<PageCandidate> candidates = filterResult.entries().stream()
                .sorted(Comparator
                        .comparing(CodexFilterResult.FilteredCodexEntry::normalizedExportKind, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(CodexFilterResult.FilteredCodexEntry::normalizedDisplayName, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(entry -> trimToEmpty(entry.entry().getEntryKey()), String.CASE_INSENSITIVE_ORDER))
                .map(this::toPageCandidate)
                .toList();

        LinkedHashSet<String> kindsToRebuild = new LinkedHashSet<>(listExistingGeneratedKinds());
        candidates.stream()
                .map(PageCandidate::kind)
                .forEach(kindsToRebuild::add);
        deleteGeneratedOutput(kindsToRebuild);

        for (PageCandidate candidate : candidates) {
            writeUtf8(
                    seoOutputLocator.getFeaturedEntityFile(candidate.kind(), candidate.slug()),
                    renderEntityHtml(candidate, routeFor(candidate.kind(), candidate.slug()))
            );
        }

        List<String> generatedRoutes = listGeneratedRoutes();
        writeSitemap(generatedRoutes);

        Map<String, SeoRegenerationKindResult> exportKindCounts =
                buildExportKindCounts(generatedRoutes, filterResult.skippedEntries());

        return new SeoRegenerationResult(
                generatedRoutes.size(),
                List.copyOf(generatedRoutes),
                filterResult.filteredOutCount(),
                filterResult.skippedByReason().getOrDefault(DUPLICATE_SLUG_REASON, 0),
                Map.copyOf(filterResult.skippedByReason()),
                Map.copyOf(exportKindCounts),
                List.copyOf(warnings),
                List.copyOf(errors),
                true
        );
    }

    private PageCandidate toPageCandidate(CodexFilterResult.FilteredCodexEntry entry) {
        return new PageCandidate(
                entry.normalizedExportKind(),
                trimToEmpty(entry.entry().getEntryKey()),
                entry.normalizedDisplayName(),
                entry.meaningfulDescriptionLines(),
                entry.cleanedReferenceKeys(),
                entry.slug()
        );
    }

    private void addDuplicateSlugWarnings(CodexFilterResult filterResult, List<String> warnings) {
        filterResult.skippedEntries().stream()
                .filter(skip -> DUPLICATE_SLUG_REASON.equals(skip.reason()))
                .map(skip -> "Skipped codex entry '" + skip.entryKey() + "' in kind '" + skip.exportKind()
                        + "' because its normalized display-name slug duplicates an earlier entry.")
                .forEach(warnings::add);
    }

    private LinkedHashSet<String> listExistingGeneratedKinds() {
        Path outputRoot = seoOutputLocator.getOutputRoot();
        if (!Files.isDirectory(outputRoot)) {
            return new LinkedHashSet<>();
        }

        try (Stream<Path> pathStream = Files.list(outputRoot)) {
            return pathStream
                    .filter(Files::isDirectory)
                    .map(path -> path.getFileName().toString())
                    .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll);
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to inspect generated SEO output root: " + outputRoot, exception);
        }
    }

    private void deleteGeneratedOutput(LinkedHashSet<String> kindsToRebuild) {
        for (String kind : kindsToRebuild) {
            deleteGeneratedKindOutput(kind);
        }
    }

    private void deleteGeneratedKindOutput(String kind) {
        Path kindOutputDirectory = seoOutputLocator.getFeaturedEntityDirectory(kind);
        if (!Files.exists(kindOutputDirectory)) {
            return;
        }

        try (Stream<Path> pathStream = Files.walk(kindOutputDirectory)) {
            pathStream.sorted(Comparator.reverseOrder()).forEach(this::deletePath);
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to clear generated SEO output for kind '" + kind + "'", exception);
        }
    }

    private void deletePath(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to delete generated SEO output: " + path, exception);
        }
    }

    private List<String> listGeneratedRoutes() {
        Path outputRoot = seoOutputLocator.getOutputRoot();
        if (!Files.isDirectory(outputRoot)) {
            return List.of();
        }

        try (Stream<Path> pathStream = Files.walk(outputRoot, 3)) {
            LinkedHashSet<String> routes = pathStream
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().equals("index.html"))
                    .map(outputRoot::relativize)
                    .filter(relativePath -> relativePath.getNameCount() == 3)
                    .map(relativePath -> routeFor(
                            relativePath.getName(0).toString(),
                            relativePath.getName(1).toString()
                    ))
                    .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll);

            return routes.stream()
                    .sorted()
                    .toList();
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to read generated SEO routes from: " + outputRoot, exception);
        }
    }

    private Map<String, SeoRegenerationKindResult> buildExportKindCounts(
            List<String> generatedRoutes,
            List<CodexFilterResult.CodexFilterSkip> skippedEntries
    ) {
        Map<String, MutableKindCounts> countsByKind = new LinkedHashMap<>();

        for (String route : generatedRoutes) {
            String kind = route.substring(1, route.indexOf('/', 1));
            countsByKind.computeIfAbsent(kind, ignored -> new MutableKindCounts()).generatedCount++;
        }

        for (CodexFilterResult.CodexFilterSkip skip : skippedEntries) {
            String kind = trimToEmpty(skip.exportKind());
            countsByKind.computeIfAbsent(kind, ignored -> new MutableKindCounts()).skippedCount++;
            if (DUPLICATE_SLUG_REASON.equals(skip.reason())) {
                countsByKind.get(kind).duplicateCount++;
            }
        }

        Map<String, SeoRegenerationKindResult> exportKindCounts = new LinkedHashMap<>();
        countsByKind.forEach((kind, counts) -> exportKindCounts.put(
                kind,
                new SeoRegenerationKindResult(counts.generatedCount, counts.skippedCount, counts.duplicateCount)
        ));
        return exportKindCounts;
    }

    private String routeFor(String kind, String slug) {
        return "/" + kind + "/" + slug;
    }

    private void writeSitemap(List<String> generatedRoutes) {
        LinkedHashSet<String> allPaths = new LinkedHashSet<>(INDEXABLE_PUBLIC_ROUTE_PATHS);
        allPaths.addAll(generatedRoutes);

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        for (String path : allPaths) {
            xml.append("    <url>\n");
            xml.append("        <loc>").append(SITE_URL).append(path).append("</loc>\n");
            xml.append("    </url>\n");
        }
        xml.append("</urlset>\n");

        writeUtf8(seoOutputLocator.getSitemapFile(), xml.toString());
    }

    private void writeUtf8(Path targetFile, String content) {
        try {
            Files.createDirectories(targetFile.getParent());
            Files.writeString(targetFile, content, StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to write SEO output: " + targetFile, exception);
        }
    }

    static String renderEntityHtml(PageCandidate candidate, String route) {
        String kindLabel = kindLabelFor(candidate.kind());
        ParsedDescription description = parseDescription(candidate.descriptionLines());
        String pageTitle = candidate.displayName() + " " + kindLabel + " Reference | " + SITE_NAME;
        String seoDescription = buildSeoDescription(candidate.displayName(), kindLabel, description);
        String canonicalUrl = SITE_URL + route;

        String webPageJsonLd = """
                {"@context":"https://schema.org","@type":"WebPage","name":"%s","description":"%s","url":"%s","isPartOf":{"@type":"WebSite","name":"%s","url":"%s"},"breadcrumb":{"@id":"%s#breadcrumb"}}
                """.formatted(
                escapeJson(pageTitle),
                escapeJson(seoDescription),
                escapeJson(canonicalUrl),
                escapeJson(SITE_NAME),
                escapeJson(SITE_URL),
                escapeJson(canonicalUrl)
        ).trim();
        String breadcrumbJsonLd = """
                {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"%s","item":"%s"},{"@type":"ListItem","position":2,"name":"Codex","item":"%s/codex"},{"@type":"ListItem","position":3,"name":"%s","item":"%s"}],"@id":"%s#breadcrumb"}
                """.formatted(
                escapeJson(SITE_NAME),
                escapeJson(SITE_URL),
                escapeJson(SITE_URL),
                escapeJson(candidate.displayName()),
                escapeJson(canonicalUrl),
                escapeJson(canonicalUrl)
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
                        <a href="/codex">Codex</a>
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
                canonicalUrl,
                escapeHtml(SITE_NAME),
                escapeHtml(pageTitle),
                escapeHtml(seoDescription),
                canonicalUrl,
                DEFAULT_IMAGE_URL,
                escapeHtml(pageTitle),
                escapeHtml(seoDescription),
                DEFAULT_IMAGE_URL,
                webPageJsonLd,
                breadcrumbJsonLd,
                escapeHtml(pageTitle),
                escapeHtml(candidate.displayName()),
                escapeHtml(buildMetadataLine(kindLabel, description.metadataHighlights())),
                escapeHtml(candidate.displayName()),
                renderIntro(description.introLine()),
                renderDescriptionSection(description),
                renderRelatedSection(candidate.referenceKeys()),
                renderActionRow(candidate.kind())
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

    private static String renderIntro(String introLine) {
        if (introLine.isBlank()) {
            return "";
        }
        return "<p class=\"seo-text entity-page__summary\">" + escapeHtml(introLine) + "</p>";
    }

    private static String renderRelatedSection(List<String> referenceKeys) {
        if (referenceKeys == null || referenceKeys.isEmpty()) {
            return "";
        }

        return """
                        <section class="seo-section entity-page__section entity-page__references">
                            <h2 class="seo-heading">Related</h2>
                            %s
                        </section>
                """.formatted(renderReferenceChips(referenceKeys));
    }

    private static String renderActionRow(String kind) {
        List<String> actions = new ArrayList<>();
        actions.add(renderActionLink("/codex", "Back to Codex"));

        if (TECH_KIND.equals(kind)) {
            actions.add(renderActionLink("/tech", "Browse Tech"));
        } else if (UNITS_KIND.equals(kind)) {
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
                .map(SeoRegenerationService::normalizeContentLine)
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

    private static String buildMetadataLine(String kindLabel, List<String> metadataHighlights) {
        List<String> parts = new ArrayList<>();
        parts.add(kindLabel);
        parts.addAll(metadataHighlights);
        return String.join(" \u2022 ", parts);
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

    private static String renderReferenceChips(List<String> referenceKeys) {
        StringBuilder chips = new StringBuilder();
        chips.append("<ul class=\"seo-chipList\">");
        for (String referenceKey : referenceKeys) {
            chips.append("<li class=\"seo-chip\">")
                    .append(escapeHtml(normalizeContentLine(referenceKey)))
                    .append("</li>");
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
                .replaceAll("\\[[^\\]]+]", " ")
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
        long wordCount = List.of(line.split("\\s+")).stream()
                .map(SeoRegenerationService::normalizedToken)
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

    record PageCandidate(
            String kind,
            String entryKey,
            String displayName,
            List<String> descriptionLines,
            List<String> referenceKeys,
            String slug
    ) {
    }

    record ParsedDescription(
            String introLine,
            List<String> descriptionLines,
            List<String> metadataHighlights
    ) {
    }

    record DetailLine(String label, String value) {
    }

    private static final class MutableKindCounts {
        private int generatedCount;
        private int skippedCount;
        private int duplicateCount;
    }
}
