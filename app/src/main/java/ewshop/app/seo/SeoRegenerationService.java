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
        String landingRoute = landingRouteForKind(candidate.kind());
        String landingLabel = landingLabelForKind(candidate.kind());
        String pageTitle = candidate.displayName() + " " + kindLabel + " Guide | " + SITE_NAME;
        String seoDescription = buildSeoDescription(candidate, kindLabel);
        String canonicalUrl = SITE_URL + route;
        String summary = candidate.descriptionLines().getFirst();
        String detailsList = renderList(List.of(
                "Kind: " + kindLabel,
                "Entry key: " + candidate.entryKey(),
                "Canonical route: " + route
        ));
        String descriptionList = renderList(candidate.descriptionLines());
        String referenceChips = renderReferenceChips(candidate.referenceKeys());

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
                {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"%s","item":"%s"},{"@type":"ListItem","position":2,"name":"%s","item":"%s%s"},{"@type":"ListItem","position":3,"name":"%s","item":"%s"}],"@id":"%s#breadcrumb"}
                """.formatted(
                escapeJson(SITE_NAME),
                escapeJson(SITE_URL),
                escapeJson(landingLabel),
                escapeJson(SITE_URL),
                escapeJson(landingRoute),
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
                        <a href="%s">%s</a>
                        <span>/</span>
                        <span>%s</span>
                    </div>

                    <div class="entity-page__layout">

                        <header class="entity-page__header">
                            <p class="seo-label entity-page__kind">%s • Codex entry</p>
                            <h1 class="seo-heading entity-page__title">%s</h1>
                            <p class="seo-text entity-page__summary">%s</p>
                        </header>

                        <section class="seo-section entity-page__section entity-page__details">
                            <p class="seo-label">Details</p>
                            <h2 class="seo-heading">Details</h2>
                            <ul class="seo-list">
                                %s
                            </ul>
                        </section>

                        <section class="seo-section entity-page__section entity-page__overview">
                            <p class="seo-label">Description</p>
                            <h2 class="seo-heading">Description</h2>
                            <ul class="seo-list">
                                %s
                            </ul>
                        </section>

                        <section class="seo-section entity-page__section entity-page__actions" aria-label="Actions">
                            <div class="seo-buttonRow">
                                <a class="seo-button" href="%s">Back to %s</a>
                            </div>
                        </section>

                        <section class="seo-section entity-page__section entity-page__references">
                            <p class="seo-label">Reference Keys</p>
                            <h2 class="seo-heading">Reference keys</h2>

                            %s

                        </section>

                        <section class="seo-section entity-page__section entity-page__explore">
                            <p class="seo-label">Explore</p>
                            <h2 class="seo-heading">Explore</h2>
                            <ul class="seo-list">
                                <li><a href="%s">%s</a></li>
                                <li><a href="/codex">Codex</a></li>
                                <li><a href="/units">Units</a></li>
                                <li><a href="/mods">Mods</a></li>
                            </ul>
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
                landingRoute,
                escapeHtml(landingLabel),
                escapeHtml(candidate.displayName()),
                escapeHtml(kindLabel),
                escapeHtml(candidate.displayName()),
                escapeHtml(summary),
                detailsList,
                descriptionList,
                landingRoute,
                escapeHtml(landingLabel),
                referenceChips,
                landingRoute,
                escapeHtml(landingLabel)
        );
    }

    private static String buildSeoDescription(PageCandidate candidate, String kindLabel) {
        String firstDescriptionLine = candidate.descriptionLines().getFirst();
        return candidate.displayName() + " is a " + kindLabel.toLowerCase(Locale.ROOT)
                + " entry in the Endless Workshop codex. " + firstDescriptionLine;
    }

    private static String landingRouteForKind(String kind) {
        if (TECH_KIND.equals(kind)) {
            return "/tech";
        }
        if (UNITS_KIND.equals(kind)) {
            return "/units";
        }
        return "/codex";
    }

    private static String landingLabelForKind(String kind) {
        if (TECH_KIND.equals(kind)) {
            return "Tech";
        }
        if (UNITS_KIND.equals(kind)) {
            return "Units";
        }
        return "Codex";
    }

    private static String kindLabelFor(String kind) {
        if (TECH_KIND.equals(kind)) {
            return "Technology";
        }

        String[] parts = trimToEmpty(kind).split("[-_\\s]+");
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
        if (referenceKeys.isEmpty()) {
            return "<p class=\"entity-page__referencesEmpty\">No linked reference keys are exposed in this Codex snapshot.</p>";
        }

        StringBuilder chips = new StringBuilder();
        chips.append("<ul class=\"seo-chipList\">");
        for (String referenceKey : referenceKeys) {
            chips.append("<li class=\"seo-chip\">").append(escapeHtml(referenceKey)).append("</li>");
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

    record PageCandidate(
            String kind,
            String entryKey,
            String displayName,
            List<String> descriptionLines,
            List<String> referenceKeys,
            String slug
    ) {
    }

    private static final class MutableKindCounts {
        private int generatedCount;
        private int skippedCount;
        private int duplicateCount;
    }
}
