package ewshop.app.seo;

import ewshop.domain.model.Codex;
import ewshop.domain.service.CodexFilterService;
import ewshop.domain.service.CodexService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SeoRegenerationServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void regeneratesSeoPagesAcrossExportKindsFromFilteredCodexData() throws Exception {
        CodexService codexService = mock(CodexService.class);
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString());
        SeoRegenerationService service = new SeoRegenerationService(codexService, new CodexFilterService(), outputLocator);

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexEntry("tech", "Technology_District_Tier1_Industry", "Workshop",
                        List.of(
                                "Unlocks district planning through early industry planning.",
                                "Category: Economy",
                                "+2 Industry per District Level"
                        ),
                        List.of("District_Klax", "Improvement_Workshop", "District_Workshop", "Industry")),
                codexEntry("tech", "Technology_City_Tier3_Defense", "Stonework",
                        List.of("Improves masonry logistics for defended cities.", "Category: Defense"),
                        List.of("City_Defense")),
                codexEntry("tech", "Technology_District_Tier1_Defense", "Stonework",
                        List.of("Unlocks fortified district construction."),
                        List.of("District_Rampart")),
                codexEntry("units", "Unit_Sentinel", "Sentinel",
                        List.of("A frontline unit that anchors army formations.", "Faction: Kin", "Role: Vanguard", "[Health] Health +20", "+3 MovementPoints Movement Points"),
                        List.of("Unit_Sentinel")),
                codexEntry("units", "Unit_Sentinel_Mk2", "Sentinel",
                        List.of("A second sentinel row that should be skipped."),
                        List.of("Unit_Sentinel_Mk2")),
                codexEntry("districts", "District_Klax", "[Luxury01] Klax Extractor",
                        List.of("Industrial district used for city specialization.", "Type: Infrastructure", "Prototype: District_Prototype_Tier1"),
                        List.of("District_Works")),
                codexEntry("improvements", "Improvement_Workshop", "Workshop",
                        List.of("Town improvement that supports early industry.", "Slot: Town", "Tier: 1"),
                        List.of("Improvement_Workshop")),
                codexEntry("tech", "Technology_Debug_Hidden", "% Debug Tech",
                        List.of("Hidden debug row."),
                        List.of("Debug")),
                codexEntry("districts", "District_Silent_Archive", "Silent Archive",
                        List.of(" ", "  "),
                        List.of("Archive"))
        ));

        Files.writeString(tempDir.resolve("tech.html"), "spa tech entry");
        Files.createDirectories(tempDir.resolve("tech/legacy-page"));
        Files.writeString(tempDir.resolve("tech/legacy-page/index.html"), "stale tech seo");
        Files.createDirectories(tempDir.resolve("units/legacy-unit"));
        Files.writeString(tempDir.resolve("units/legacy-unit/index.html"), "stale units seo");
        Files.createDirectories(tempDir.resolve("districts/legacy-district"));
        Files.writeString(tempDir.resolve("districts/legacy-district/index.html"), "stale districts seo");

        SeoRegenerationResult result = service.regeneratePrototypePages();

        Path workshopTechFile = tempDir.resolve("encyclopedia/tech/workshop/index.html");
        Path stoneworkTechFile = tempDir.resolve("encyclopedia/tech/stonework/index.html");
        Path sentinelUnitFile = tempDir.resolve("encyclopedia/units/sentinel/index.html");
        Path klaxDistrictFile = tempDir.resolve("encyclopedia/districts/klax-extractor/index.html");
        Path workshopImprovementFile = tempDir.resolve("encyclopedia/improvements/workshop/index.html");
        Path encyclopediaFile = tempDir.resolve("encyclopedia/index.html");
        Path encyclopediaTechFile = tempDir.resolve("encyclopedia/tech/index.html");
        Path sitemapFile = tempDir.resolve("sitemap.xml");

        assertThat(result.generatedCount()).isEqualTo(10);
        assertThat(result.generatedRoutes()).containsExactly(
                "/encyclopedia",
                "/encyclopedia/districts",
                "/encyclopedia/districts/klax-extractor",
                "/encyclopedia/improvements",
                "/encyclopedia/improvements/workshop",
                "/encyclopedia/tech",
                "/encyclopedia/tech/stonework",
                "/encyclopedia/tech/workshop",
                "/encyclopedia/units",
                "/encyclopedia/units/sentinel"
        );
        assertThat(result.skippedCount()).isEqualTo(4);
        assertThat(result.duplicateCount()).isEqualTo(2);
        assertThat(result.skippedByReason()).isEqualTo(Map.of(
                "invalid-display-name", 1,
                "weak-description-lines", 1,
                "duplicate-slug", 2,
                "filtered-out", 4
        ));
        assertThat(result.exportKindCounts()).containsExactlyInAnyOrderEntriesOf(Map.of(
                "tech", new SeoRegenerationKindResult(2, 2, 1),
                "units", new SeoRegenerationKindResult(1, 1, 1),
                "districts", new SeoRegenerationKindResult(1, 1, 0),
                "improvements", new SeoRegenerationKindResult(1, 0, 0)
        ));
        assertThat(result.warnings()).anySatisfy(warning ->
                assertThat(warning).contains("Technology_District_Tier1_Defense"));
        assertThat(result.warnings()).anySatisfy(warning ->
                assertThat(warning).contains("Unit_Sentinel_Mk2"));
        assertThat(result.errors()).isEmpty();
        assertThat(result.sitemapUpdated()).isTrue();

        assertThat(workshopTechFile).exists();
        String workshopTechHtml = Files.readString(workshopTechFile);
        assertThat(workshopTechHtml).contains("Workshop Technology Reference | Endless Workshop");
        assertThat(workshopTechHtml).contains("Home");
        assertThat(workshopTechHtml).containsSubsequence(
                "<div class=\"entity-page__breadcrumbs\" aria-label=\"Breadcrumb\">",
                "<a href=\"/\">Home</a>",
                "<a href=\"/encyclopedia\">Encyclopedia</a>",
                "<a href=\"/encyclopedia/tech\">Technologies</a>",
                "<span>Workshop</span>"
        );
        assertThat(workshopTechHtml).contains("Technology • Category: Economy");
        assertThat(workshopTechHtml).contains("<p class=\"seo-text entity-page__summary\">Unlocks district planning through early industry planning.</p>");
        assertThat(workshopTechHtml).contains("<h2 class=\"seo-heading\">Description</h2>");
        assertThat(workshopTechHtml).doesNotContain(">Details<");
        assertThat(workshopTechHtml).doesNotContain("<p class=\"seo-label\">Description</p>");
        assertThat(workshopTechHtml).doesNotContain(">Explore<");
        assertThat(workshopTechHtml).doesNotContain("Entry key:");
        assertThat(workshopTechHtml).doesNotContain("Canonical route:");
        assertThat(workshopTechHtml).doesNotContain("<li>Unlocks district planning through early industry planning.</li>");
        assertThat(workshopTechHtml).contains("+2 Industry per District Level");
        assertThat(workshopTechHtml).contains(">Related<");
        assertThat(workshopTechHtml).contains("<a class=\"seo-chip\" href=\"/encyclopedia/districts/klax-extractor\" data-entry-key=\"District_Klax\">Klax Extractor</a>");
        assertThat(workshopTechHtml).contains("<a class=\"seo-chip\" href=\"/encyclopedia/improvements/workshop\" data-entry-key=\"Improvement_Workshop\">Workshop</a>");
        assertThat(workshopTechHtml).doesNotContain("data-entry-key=\"District_Workshop\"");
        assertThat(workshopTechHtml).doesNotContain("data-entry-key=\"Industry\"");
        assertThat(workshopTechHtml).doesNotContain(">District_Klax<");
        assertThat(workshopTechHtml).doesNotContain(">Improvement_Workshop<");
        assertThat(workshopTechHtml).contains("Back to Codex");
        assertThat(workshopTechHtml).doesNotContain("<a class=\"seo-linkButton entity-page__actionLink\" href=\"/encyclopedia\">Encyclopedia</a>");
        assertThat(workshopTechHtml).doesNotContain("<a class=\"seo-linkButton entity-page__actionLink\" href=\"/encyclopedia/tech\">Browse Technologies</a>");
        assertThat(workshopTechHtml).contains("Browse Tech");
        assertThat(workshopTechHtml).contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/encyclopedia/tech/workshop\" />");
        assertThat(workshopTechHtml).contains("\"@type\":\"WebPage\"");
        assertThat(workshopTechHtml).contains("\"@type\":\"BreadcrumbList\"");
        assertThat(workshopTechHtml).contains("\"name\":\"Encyclopedia\",\"item\":\"https://endlessworkshop.dev/encyclopedia\"");
        assertThat(workshopTechHtml).contains("\"name\":\"Technologies\",\"item\":\"https://endlessworkshop.dev/encyclopedia/tech\"");
        assertThat(workshopTechHtml).doesNotContain("src/index.tsx");
        assertThat(workshopTechHtml).doesNotContain("fetch(");
        assertThat(workshopTechHtml).doesNotContain("/api/");
        assertThat(workshopTechHtml).doesNotContain("type=\"module\"");
        assertThat(workshopTechHtml).doesNotContain("<style");

        assertThat(stoneworkTechFile).exists();
        assertThat(Files.readString(stoneworkTechFile))
                .contains("https://endlessworkshop.dev/encyclopedia/tech/stonework")
                .contains("Improves masonry logistics for defended cities.")
                .doesNotContain("Unlocks fortified district construction.");

        assertThat(sentinelUnitFile).exists();
        assertThat(Files.readString(sentinelUnitFile))
                .contains("Sentinel Unit Reference | Endless Workshop")
                .contains("Unit • Faction: Kin • Role: Vanguard")
                .contains("Health +20")
                .contains("Movement Points")
                .doesNotContain("MovementPoints Movement Points")
                .contains("Browse Units")
                .contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/encyclopedia/units/sentinel\" />")
                .doesNotContain("href=\"/encyclopedia/units\">Browse Units</a>");

        assertThat(klaxDistrictFile).exists();
        assertThat(Files.readString(klaxDistrictFile))
                .contains("Klax Extractor District Reference | Endless Workshop")
                .contains("District • Type: Infrastructure")
                .contains("Back to Codex")
                .doesNotContain("Luxury01")
                .doesNotContain("Prototype: District_Prototype_Tier1")
                .doesNotContain("Prototype •")
                .doesNotContain("Browse Tech")
                .doesNotContain("Browse Units")
                .contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/encyclopedia/districts/klax-extractor\" />");

        assertThat(workshopImprovementFile).exists();
        assertThat(Files.readString(workshopImprovementFile))
                .contains("Workshop Improvement Reference | Endless Workshop")
                .contains("https://endlessworkshop.dev/encyclopedia/improvements/workshop");

        assertThat(encyclopediaFile).exists();
        assertThat(Files.readString(encyclopediaFile))
                .contains("Codex Overview")
                .contains("<a class=\"encyclopedia-page__categoryRow\" href=\"/encyclopedia/tech\">")
                .contains("<span class=\"encyclopedia-page__categoryName\">Technologies</span>")
                .contains("<span class=\"encyclopedia-page__categoryCount\">2</span>");

        assertThat(encyclopediaTechFile).exists();
        assertThat(Files.readString(encyclopediaTechFile))
                .contains("Technologies Encyclopedia | Endless Workshop")
                .contains("<a class=\"encyclopedia-page__entryRow\" href=\"/encyclopedia/tech/workshop\" data-entry-key=\"Technology_District_Tier1_Industry\">")
                .contains("<span class=\"encyclopedia-page__entryTitle\">Workshop</span>")
                .contains("Unlocks district planning through early industry planning.")
                .contains("<a class=\"encyclopedia-page__entryRow\" href=\"/encyclopedia/tech/stonework\" data-entry-key=\"Technology_City_Tier3_Defense\">");

        assertThat(tempDir.resolve("tech/legacy-page/index.html")).doesNotExist();
        assertThat(tempDir.resolve("units/legacy-unit/index.html")).doesNotExist();
        assertThat(tempDir.resolve("districts/legacy-district/index.html")).doesNotExist();
        assertThat(tempDir.resolve("tech.html")).hasContent("spa tech entry");

        assertThat(sitemapFile).exists();
        assertThat(Files.readString(sitemapFile)).containsSubsequence(
                "<loc>https://endlessworkshop.dev/tech</loc>",
                "<loc>https://endlessworkshop.dev/units</loc>",
                "<loc>https://endlessworkshop.dev/codex</loc>",
                "<loc>https://endlessworkshop.dev/summary</loc>",
                "<loc>https://endlessworkshop.dev/mods</loc>",
                "<loc>https://endlessworkshop.dev/info</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/districts</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/districts/klax-extractor</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/improvements</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/improvements/workshop</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/tech</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/tech/stonework</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/tech/workshop</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/units</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/units/sentinel</loc>"
        );
        assertThat(Files.readString(sitemapFile)).doesNotContain("legacy-page");
    }

    @Test
    void tracksDuplicateSlugsPerExportKindInsteadOfGlobally() throws Exception {
        CodexService codexService = mock(CodexService.class);
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString());
        SeoRegenerationService service = new SeoRegenerationService(codexService, new CodexFilterService(), outputLocator);

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexEntry("tech", "Technology_A", "Workshop", List.of("Tech description."), List.of()),
                codexEntry("units", "Unit_A", "Workshop", List.of("Unit description."), List.of())
        ));

        SeoRegenerationResult result = service.regeneratePrototypePages();
        String workshopUnitHtml = Files.readString(tempDir.resolve("encyclopedia/units/workshop/index.html"));

        assertThat(result.generatedRoutes()).containsExactly(
                "/encyclopedia",
                "/encyclopedia/tech",
                "/encyclopedia/tech/workshop",
                "/encyclopedia/units",
                "/encyclopedia/units/workshop"
        );
        assertThat(result.skippedCount()).isZero();
        assertThat(result.duplicateCount()).isZero();
        assertThat(workshopUnitHtml).doesNotContain(">Related<");
        assertThat(workshopUnitHtml).doesNotContain(">Explore<");
        assertThat(workshopUnitHtml).contains("Back to Codex");
        assertThat(workshopUnitHtml).contains("Browse Units");
        assertThat(result.exportKindCounts()).containsExactlyInAnyOrderEntriesOf(Map.of(
                "tech", new SeoRegenerationKindResult(1, 0, 0),
                "units", new SeoRegenerationKindResult(1, 0, 0)
        ));
    }

    private static Codex codexEntry(
            String exportKind,
            String entryKey,
            String displayName,
            List<String> descriptionLines,
            List<String> referenceKeys
    ) {
        return Codex.builder()
                .exportKind(exportKind)
                .entryKey(entryKey)
                .displayName(displayName)
                .descriptionLines(descriptionLines)
                .referenceKeys(referenceKeys)
                .build();
    }
}
