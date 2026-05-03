package ewshop.app.seo;

import ewshop.domain.model.Codex;
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
import java.util.Map;
import java.util.stream.Stream;

@Service
public class SeoRegenerationService {

    static final String TECH_KIND = "tech";
    static final String WORKSHOP_ENTRY_KEY = "workshop";

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
        Map<String, Integer> skippedByReason = new LinkedHashMap<>();

        deleteGeneratedTechOutput();

        CodexFilterResult filterResult = codexFilterService.filter(codexService.getAllCodexEntries());
        skippedByReason.putAll(filterResult.skippedByReason());
        addDuplicateSlugWarnings(filterResult, warnings);

        List<TechPageCandidate> candidates = filterResult.entries().stream()
                .filter(entry -> isTechEntry(entry.entry()))
                .sorted(Comparator
                        .comparing(CodexFilterResult.FilteredCodexEntry::normalizedDisplayName, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(entry -> trimToEmpty(entry.entry().getEntryKey()), String.CASE_INSENSITIVE_ORDER))
                .map(this::toTechCandidate)
                .toList();

        for (ResolvedTechPage resolved : resolveRoutes(candidates)) {
            writeUtf8(
                    seoOutputLocator.getFeaturedEntityFile("tech", resolved.slug()),
                    renderTechHtml(resolved.candidate(), resolved.route())
            );
        }

        List<String> generatedRoutes = listGeneratedRoutes("tech");
        writeSitemap(generatedRoutes);

        return new SeoRegenerationResult(
                generatedRoutes.size(),
                List.copyOf(generatedRoutes),
                filterResult.filteredOutCount(),
                Map.copyOf(skippedByReason),
                List.copyOf(warnings),
                List.copyOf(errors),
                true
        );
    }

    private boolean isTechEntry(Codex entry) {
        return TECH_KIND.equalsIgnoreCase(trimToEmpty(entry.getExportKind()));
    }

    private TechPageCandidate toTechCandidate(CodexFilterResult.FilteredCodexEntry entry) {
        return new TechPageCandidate(
                trimToEmpty(entry.entry().getEntryKey()),
                entry.normalizedDisplayName(),
                entry.meaningfulDescriptionLines(),
                entry.cleanedReferenceKeys(),
                entry.slug()
        );
    }

    private List<ResolvedTechPage> resolveRoutes(List<TechPageCandidate> candidates) {
        List<ResolvedTechPage> resolvedPages = new ArrayList<>();
        for (TechPageCandidate candidate : candidates) {
            resolvedPages.add(new ResolvedTechPage(candidate, candidate.baseSlug(), routeForSlug(candidate.baseSlug())));
        }
        return resolvedPages;
    }

    private void addDuplicateSlugWarnings(CodexFilterResult filterResult, List<String> warnings) {
        filterResult.skippedEntries().stream()
                .filter(skip -> "duplicate-slug".equals(skip.reason()))
                .map(skip -> "Skipped codex entry '" + skip.entryKey() + "' in kind '" + skip.exportKind()
                        + "' because its normalized display-name slug duplicates an earlier entry.")
                .forEach(warnings::add);
    }

    private void deleteGeneratedTechOutput() {
        Path techOutputDirectory = seoOutputLocator.getFeaturedEntityDirectory("tech");
        if (!Files.exists(techOutputDirectory)) {
            return;
        }

        try (Stream<Path> pathStream = Files.walk(techOutputDirectory)) {
            pathStream.sorted(Comparator.reverseOrder()).forEach(this::deletePath);
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to clear generated tech SEO output: " + techOutputDirectory, exception);
        }
    }

    private void deletePath(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to delete generated SEO output: " + path, exception);
        }
    }

    private List<String> listGeneratedRoutes(String page) {
        Path pageDirectory = seoOutputLocator.getFeaturedEntityDirectory(page);
        if (!Files.isDirectory(pageDirectory)) {
            return List.of();
        }

        try (Stream<Path> pathStream = Files.walk(pageDirectory, 2)) {
            return pathStream
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().equals("index.html"))
                    .map(pageDirectory::relativize)
                    .filter(relativePath -> relativePath.getNameCount() == 2)
                    .map(relativePath -> relativePath.getName(0).toString())
                    .sorted()
                    .map(this::routeForSlug)
                    .toList();
        } catch (IOException exception) {
            throw new UncheckedIOException("Failed to read generated SEO routes from: " + pageDirectory, exception);
        }
    }

    private String routeForSlug(String slug) {
        return "/tech/" + slug;
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

    static String renderTechHtml(TechPageCandidate candidate, String route) {
        String pageTitle = candidate.displayName() + " Tech Guide | " + SITE_NAME;
        String seoDescription = buildSeoDescription(candidate);
        String canonicalUrl = SITE_URL + route;
        String summary = candidate.descriptionLines().getFirst();
        String detailsList = renderList(List.of(
                "Kind: " + TECH_KIND,
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
                {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"%s","item":"%s"},{"@type":"ListItem","position":2,"name":"Tech","item":"%s/tech"},{"@type":"ListItem","position":3,"name":"%s","item":"%s"}],"@id":"%s#breadcrumb"}
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
                            <a href="/tech" aria-current="page">Tech</a><a href="/units">Units</a><a href="/codex">Codex</a><a href="/summary">Summary</a><a href="/mods">Mods</a><a href="/info">Info</a>
                        </nav>

                    </div>
                </header>

                <main class="seo-shell entity-page">
                    <div class="seo-hidden">%s</div>
                    <div class="entity-page__breadcrumbs" aria-label="Breadcrumb">
                        <a href="/">Home</a>
                        <span>/</span>
                        <a href="/tech">Tech</a>
                        <span>/</span>
                        <span>%s</span>
                    </div>

                    <div class="entity-page__layout">

                        <header class="entity-page__header">
                            <p class="seo-label entity-page__kind">Technology • Codex entry</p>
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
                                <a class="seo-button" href="/tech">Back to Tech</a>
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
                                <li><a href="/tech">Tech tree</a></li>
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
                escapeHtml(candidate.displayName()),
                escapeHtml(candidate.displayName()),
                escapeHtml(summary),
                detailsList,
                descriptionList,
                referenceChips
        );
    }

    private static String buildSeoDescription(TechPageCandidate candidate) {
        String firstDescriptionLine = candidate.descriptionLines().getFirst();
        return candidate.displayName() + " is a technology entry in the Endless Workshop codex. " + firstDescriptionLine;
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

    record TechPageCandidate(
            String entryKey,
            String displayName,
            List<String> descriptionLines,
            List<String> referenceKeys,
            String baseSlug
    ) {
    }

    record ResolvedTechPage(TechPageCandidate candidate, String slug, String route) {
    }
}
