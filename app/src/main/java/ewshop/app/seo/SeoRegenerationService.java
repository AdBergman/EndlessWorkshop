package ewshop.app.seo;

import ewshop.domain.model.Tech;
import ewshop.domain.model.TechUnlockRef;
import ewshop.domain.model.enums.MajorFaction;
import ewshop.domain.service.TechService;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;

@Service
public class SeoRegenerationService {

    static final String WORKSHOP_TECH_KEY = "Technology_District_Tier1_Industry";
    static final String WORKSHOP_ENTRY_KEY = "workshop";
    static final String WORKSHOP_ROUTE = "/tech/workshop";

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

    private final TechService techService;
    private final SeoOutputLocator seoOutputLocator;

    public SeoRegenerationService(TechService techService, SeoOutputLocator seoOutputLocator) {
        this.techService = techService;
        this.seoOutputLocator = seoOutputLocator;
    }

    public SeoRegenerationResult regeneratePrototypePages() {
        List<String> warnings = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        List<String> generatedRoutes = new ArrayList<>();
        List<Tech> techs = techService.getAllTechs();

        Optional<Tech> workshop = techs.stream()
                .filter(tech -> WORKSHOP_TECH_KEY.equals(tech.getTechKey()))
                .findFirst()
                .or(() -> techs.stream()
                        .filter(tech -> "Workshop".equalsIgnoreCase(tech.getName()))
                        .findFirst());

        if (workshop.isPresent()) {
            writeWorkshopPage(workshop.get());
            generatedRoutes.add(WORKSHOP_ROUTE);
        } else {
            warnings.add("Workshop tech was not found in canonical backend data; no SEO entity page was regenerated.");
        }

        writeSitemap(generatedRoutes);

        return new SeoRegenerationResult(
                generatedRoutes.size(),
                List.copyOf(generatedRoutes),
                workshop.isPresent() ? 0 : 1,
                List.copyOf(warnings),
                List.copyOf(errors),
                true
        );
    }

    private void writeWorkshopPage(Tech tech) {
        Path targetFile = seoOutputLocator.getFeaturedEntityFile("tech", WORKSHOP_ENTRY_KEY);
        writeUtf8(targetFile, renderWorkshopHtml(tech));
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

    static String renderWorkshopHtml(Tech tech) {
        List<String> unlockLabels = tech.getUnlocks().stream()
                .map(SeoRegenerationService::formatUnlockLabel)
                .filter(label -> !label.isBlank())
                .toList();
        List<String> effectLabels = tech.getDescriptionLines().stream()
                .map(SeoRegenerationService::trimToEmpty)
                .filter(line -> !line.isBlank())
                .toList();
        List<String> factionLabels = tech.getFactions().stream()
                .filter(Objects::nonNull)
                .map(MajorFaction::getDisplayName)
                .sorted(Comparator.naturalOrder())
                .toList();

        String pageTitle = tech.getName() + " Tech Guide | " + SITE_NAME;
        String seoDescription = tech.getName() + " is an Endless Legend 2 era " + tech.getEra() + " "
                + tech.getType().name().toLowerCase(Locale.ROOT)
                + " technology that unlocks " + firstUnlockLabel(unlockLabels) + ".";
        String canonicalUrl = SITE_URL + WORKSHOP_ROUTE;
        String kindLabel = "Technology \u2022 Era " + tech.getEra() + " \u2022 " + formatTitleCase(tech.getType().name());
        String summary = firstEffectLabel(effectLabels);
        String detailsList = renderList(List.of(
                "Era " + tech.getEra(),
                formatTitleCase(tech.getType().name()) + " technology",
                "Factions: " + String.join(", ", factionLabels)
        ));
        String unlockList = renderList(unlockLabels);
        String effectList = renderList(effectLabels);
        String referenceChips = renderReferenceChips(concatDistinct(unlockLabels, effectLabels));

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
                escapeJson(tech.getName()),
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
                    <link rel="icon" href="/favicon.ico" />
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
                            <p class="seo-label entity-page__kind">%s</p>
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

                        <section class="seo-section entity-page__section entity-page__outcomes">
                            <p class="seo-label">Unlocks And Effects</p>
                            <h2 class="seo-heading">Unlocks and effects</h2>
                            <div class="entity-page__columns">
                                <div class="entity-page__column">
                                    <h3 class="entity-page__subheading">Unlocks</h3>
                                    %s
                                </div>
                                <div class="entity-page__column">
                                    <h3 class="entity-page__subheading">Effects</h3>
                                    %s
                                </div>
                            </div>
                        </section>

                        <section class="seo-section entity-page__section entity-page__actions" aria-label="Actions">
                            <div class="seo-buttonRow">
                                <a class="seo-button" href="/tech?faction=aspects&tech=workshop">Open in tech tree</a>
                                <a class="seo-linkButton" href="/tech">Back to Tech</a>
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
                                <li><a href="/units">Units</a></li>
                                <li><a href="/codex">Codex</a></li>
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
                escapeHtml(tech.getName()),
                escapeHtml(kindLabel),
                escapeHtml(tech.getName()),
                escapeHtml(summary),
                detailsList,
                renderListOrEmptyParagraph(unlockList, "No unlocks recorded in this prototype snapshot."),
                renderListOrEmptyParagraph(effectList, "No direct effects recorded in this prototype snapshot."),
                referenceChips
        );
    }

    private static String firstUnlockLabel(List<String> unlockLabels) {
        return unlockLabels.isEmpty() ? "no indexed references" : unlockLabels.getFirst();
    }

    private static String firstEffectLabel(List<String> effectLabels) {
        return effectLabels.isEmpty()
                ? "Reference snapshot for the Workshop technology in the EWShop tech tree."
                : effectLabels.getFirst();
    }

    private static String renderReferenceChips(List<String> referenceKeys) {
        if (referenceKeys.isEmpty()) {
            return "<p class=\"entity-page__referencesEmpty\">No linked reference keys are exposed in this prototype snapshot.</p>";
        }

        StringBuilder chips = new StringBuilder();
        chips.append("<ul class=\"seo-chipList\">");
        for (String referenceKey : referenceKeys) {
            chips.append("<li class=\"seo-chip\">").append(escapeHtml(referenceKey)).append("</li>");
        }
        chips.append("</ul>");
        return chips.toString();
    }

    private static String renderListOrEmptyParagraph(String listHtml, String emptyMessage) {
        if (listHtml.isBlank()) {
            return "<p class=\"seo-text entity-page__empty\">" + escapeHtml(emptyMessage) + "</p>";
        }
        return "<ul class=\"seo-list\">" + listHtml + "</ul>";
    }

    private static List<String> concatDistinct(List<String> first, List<String> second) {
        LinkedHashSet<String> combined = new LinkedHashSet<>();
        combined.addAll(first);
        combined.addAll(second);
        return List.copyOf(combined);
    }

    private static String renderList(List<String> items) {
        StringBuilder html = new StringBuilder();
        for (String item : items) {
            html.append("<li>").append(escapeHtml(item)).append("</li>");
        }
        return html.toString();
    }

    private static String formatUnlockLabel(TechUnlockRef unlockRef) {
        String unlockType = trimToEmpty(unlockRef.unlockType());
        String unlockKey = trimToEmpty(unlockRef.unlockKey());

        if (unlockType.isEmpty()) return unlockKey;
        if (unlockKey.isEmpty()) return unlockType;
        return unlockType + ": " + unlockKey;
    }

    private static String formatTitleCase(String value) {
        String normalized = value.toLowerCase(Locale.ROOT);
        return normalized.substring(0, 1).toUpperCase(Locale.ROOT) + normalized.substring(1);
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
}
