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
    static final String ENCYCLOPEDIA_PAGE = "encyclopedia";

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
        Map<String, ReferenceTarget> referenceTargetsByEntryKey = buildReferenceTargets(candidates);

        LinkedHashSet<String> kindsToRebuild = new LinkedHashSet<>(listExistingGeneratedKinds());
        candidates.stream()
                .map(PageCandidate::kind)
                .forEach(kindsToRebuild::add);
        kindsToRebuild.add(ENCYCLOPEDIA_PAGE);
        deleteGeneratedOutput(kindsToRebuild);

        for (PageCandidate candidate : candidates) {
            writeUtf8(
                    seoOutputLocator.getFeaturedEntityFile(candidate.kind(), candidate.slug()),
                    renderEntityHtml(
                            candidate,
                            routeFor(candidate.kind(), candidate.slug()),
                            referenceTargetsByEntryKey
                    )
            );
        }
        writeUtf8(
                seoOutputLocator.getGeneratedIndexFile(ENCYCLOPEDIA_PAGE),
                renderEncyclopediaRootHtml(candidates)
        );
        for (Map.Entry<String, List<PageCandidate>> entry : candidatesByKind(candidates).entrySet()) {
            writeUtf8(
                    seoOutputLocator.getFeaturedEntityFile(ENCYCLOPEDIA_PAGE, entry.getKey()),
                    renderEncyclopediaKindHtml(entry.getKey(), entry.getValue())
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

    private Map<String, ReferenceTarget> buildReferenceTargets(List<PageCandidate> candidates) {
        LinkedHashMap<String, ReferenceTarget> targetsByEntryKey = new LinkedHashMap<>();
        for (PageCandidate candidate : candidates) {
            String entryKey = trimToEmpty(candidate.entryKey());
            if (entryKey.isBlank()) {
                continue;
            }

            targetsByEntryKey.putIfAbsent(
                    entryKey,
                    new ReferenceTarget(
                            candidate.displayName(),
                            routeFor(candidate.kind(), candidate.slug())
                    )
            );
        }
        return Map.copyOf(targetsByEntryKey);
    }

    private static Map<String, List<PageCandidate>> candidatesByKind(List<PageCandidate> candidates) {
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
                    .map(SeoRegenerationService::routeForGeneratedIndex)
                    .filter(route -> !route.isBlank())
                    .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll);

            return routes.stream()
                    .sorted()
                    .toList();
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to read generated SEO routes from: " + outputRoot, exception);
        }
    }

    private static String routeForGeneratedIndex(Path relativePath) {
        if (relativePath.getNameCount() == 2 && "index.html".equals(relativePath.getName(1).toString())) {
            return "/" + relativePath.getName(0);
        }

        if (relativePath.getNameCount() == 3 && "index.html".equals(relativePath.getName(2).toString())) {
            return routeFor(relativePath.getName(0).toString(), relativePath.getName(1).toString());
        }

        return "";
    }

    private Map<String, SeoRegenerationKindResult> buildExportKindCounts(
            List<String> generatedRoutes,
            List<CodexFilterResult.CodexFilterSkip> skippedEntries
    ) {
        Map<String, MutableKindCounts> countsByKind = new LinkedHashMap<>();

        for (String route : generatedRoutes) {
            if (route.equals("/" + ENCYCLOPEDIA_PAGE) || route.startsWith("/" + ENCYCLOPEDIA_PAGE + "/")) {
                continue;
            }
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

    private static String routeFor(String kind, String slug) {
        return "/" + kind + "/" + slug;
    }

    private static String encyclopediaRouteFor(String kind) {
        return routeFor(ENCYCLOPEDIA_PAGE, kind);
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
        return renderEntityHtml(candidate, route, Map.of());
    }

    static String renderEntityHtml(
            PageCandidate candidate,
            String route,
            Map<String, ReferenceTarget> referenceTargetsByEntryKey
    ) {
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
                {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"%s","item":"%s"},{"@type":"ListItem","position":2,"name":"Encyclopedia","item":"%s/%s"},{"@type":"ListItem","position":3,"name":"%s","item":"%s%s"},{"@type":"ListItem","position":4,"name":"%s","item":"%s"}],"@id":"%s#breadcrumb"}
                """.formatted(
                escapeJson(SITE_NAME),
                escapeJson(SITE_URL),
                escapeJson(SITE_URL),
                escapeJson(ENCYCLOPEDIA_PAGE),
                escapeJson(pluralKindLabelFor(candidate.kind())),
                escapeJson(SITE_URL),
                escapeJson(encyclopediaRouteFor(candidate.kind())),
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
                escapeHtml(encyclopediaRouteFor(candidate.kind())),
                escapeHtml(pluralKindLabelFor(candidate.kind())),
                escapeHtml(candidate.displayName()),
                escapeHtml(buildMetadataLine(kindLabel, description.metadataHighlights())),
                escapeHtml(candidate.displayName()),
                renderIntro(description.introLine()),
                renderDescriptionSection(description),
                renderRelatedSection(candidate.referenceKeys(), referenceTargetsByEntryKey),
                renderActionRow(candidate.kind())
        );
    }

    static String renderEncyclopediaRootHtml(List<PageCandidate> candidates) {
        Map<String, List<PageCandidate>> groupedCandidates = candidatesByKind(candidates);
        String pageTitle = "Endless Workshop Encyclopedia | " + SITE_NAME;
        String seoDescription = "Browse the Endless Workshop encyclopedia by category, including abilities, units, technologies, improvements, equipment, heroes, districts, populations, factions, and councilors.";
        String canonicalUrl = SITE_URL + "/" + ENCYCLOPEDIA_PAGE;

        StringBuilder categories = new StringBuilder();
        categories.append("<div class=\"encyclopedia-page__index\" aria-label=\"Codex categories\">");
        groupedCandidates.forEach((kind, kindCandidates) -> categories
                .append("<a class=\"encyclopedia-page__categoryRow\" href=\"")
                .append(escapeHtml(encyclopediaRouteFor(kind)))
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

    static String renderEncyclopediaKindHtml(String kind, List<PageCandidate> candidates) {
        String kindLabel = pluralKindLabelFor(kind);
        String pageTitle = kindLabel + " Encyclopedia | " + SITE_NAME;
        String seoDescription = "Browse " + kindLabel.toLowerCase(Locale.ROOT)
                + " in the Endless Workshop encyclopedia, with generated reference pages and descriptions.";
        String canonicalUrl = SITE_URL + encyclopediaRouteFor(kind);

        StringBuilder entries = new StringBuilder();
        entries.append("<div class=\"encyclopedia-page__entryList\" aria-label=\"")
                .append(escapeHtml(kindLabel))
                .append("\">");
        for (PageCandidate candidate : candidates) {
            entries.append("<a class=\"encyclopedia-page__entryRow\" href=\"")
                    .append(escapeHtml(routeFor(candidate.kind(), candidate.slug())))
                    .append("\" data-entry-key=\"")
                    .append(escapeHtml(candidate.entryKey()))
                    .append("\">")
                    .append("<span class=\"encyclopedia-page__entryTitle\">")
                    .append(escapeHtml(candidate.displayName()))
                    .append("</span>")
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
                escapeJson(SITE_NAME),
                escapeJson(SITE_URL)
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
                escapeHtml(SITE_NAME),
                escapeHtml(pageTitle),
                escapeHtml(seoDescription),
                canonicalUrl,
                DEFAULT_IMAGE_URL,
                escapeHtml(pageTitle),
                escapeHtml(seoDescription),
                DEFAULT_IMAGE_URL,
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
        actions.add(renderActionLink("/" + ENCYCLOPEDIA_PAGE, "Encyclopedia"));
        actions.add(renderActionLink(encyclopediaRouteFor(kind), "Browse " + pluralKindLabelFor(kind)));

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

    record ReferenceTarget(
            String displayName,
            String route
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
