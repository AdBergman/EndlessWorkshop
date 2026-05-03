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
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString(), true);
        SeoRegenerationService service = new SeoRegenerationService(codexService, new CodexFilterService(), outputLocator);

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexEntry("tech", "Technology_District_Tier1_Industry", "Workshop",
                        List.of("+2 Industry per District Level", "Unlocks district planning."),
                        List.of("District_Workshop", "Industry")),
                codexEntry("tech", "Technology_City_Tier3_Defense", "Stonework",
                        List.of("Improves masonry logistics for defended cities."),
                        List.of("City_Defense")),
                codexEntry("tech", "Technology_District_Tier1_Defense", "Stonework",
                        List.of("Unlocks fortified district construction."),
                        List.of("District_Rampart")),
                codexEntry("units", "Unit_Sentinel", "Sentinel",
                        List.of("A frontline unit that anchors army formations."),
                        List.of("Unit_Sentinel")),
                codexEntry("units", "Unit_Sentinel_Mk2", "Sentinel",
                        List.of("A second sentinel row that should be skipped."),
                        List.of("Unit_Sentinel_Mk2")),
                codexEntry("districts", "District_Works", "Works",
                        List.of("Industrial district used for city specialization."),
                        List.of("District_Works")),
                codexEntry("improvements", "Improvement_Workshop", "Workshop",
                        List.of("Town improvement that supports early industry."),
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

        Path workshopTechFile = tempDir.resolve("tech/workshop/index.html");
        Path stoneworkTechFile = tempDir.resolve("tech/stonework/index.html");
        Path sentinelUnitFile = tempDir.resolve("units/sentinel/index.html");
        Path worksDistrictFile = tempDir.resolve("districts/works/index.html");
        Path workshopImprovementFile = tempDir.resolve("improvements/workshop/index.html");
        Path sitemapFile = tempDir.resolve("sitemap.xml");

        assertThat(result.generatedCount()).isEqualTo(5);
        assertThat(result.generatedRoutes()).containsExactly(
                "/districts/works",
                "/improvements/workshop",
                "/tech/stonework",
                "/tech/workshop",
                "/units/sentinel"
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
        assertThat(workshopTechHtml).contains("Workshop Technology Guide | Endless Workshop");
        assertThat(workshopTechHtml).contains("Technology • Codex entry");
        assertThat(workshopTechHtml).contains("Entry key: Technology_District_Tier1_Industry");
        assertThat(workshopTechHtml).contains("+2 Industry per District Level");
        assertThat(workshopTechHtml).contains("Unlocks district planning.");
        assertThat(workshopTechHtml).contains("District_Workshop");
        assertThat(workshopTechHtml).contains("<a class=\"seo-button\" href=\"/tech\">Back to Tech</a>");
        assertThat(workshopTechHtml).contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/tech/workshop\" />");
        assertThat(workshopTechHtml).contains("\"@type\":\"WebPage\"");
        assertThat(workshopTechHtml).contains("\"@type\":\"BreadcrumbList\"");
        assertThat(workshopTechHtml).doesNotContain("src/index.tsx");
        assertThat(workshopTechHtml).doesNotContain("fetch(");
        assertThat(workshopTechHtml).doesNotContain("/api/");
        assertThat(workshopTechHtml).doesNotContain("type=\"module\"");
        assertThat(workshopTechHtml).doesNotContain("<style");

        assertThat(stoneworkTechFile).exists();
        assertThat(Files.readString(stoneworkTechFile))
                .contains("https://endlessworkshop.dev/tech/stonework")
                .contains("Improves masonry logistics for defended cities.")
                .doesNotContain("Unlocks fortified district construction.");

        assertThat(sentinelUnitFile).exists();
        assertThat(Files.readString(sentinelUnitFile))
                .contains("Sentinel Units Guide | Endless Workshop")
                .contains("<a class=\"seo-button\" href=\"/units\">Back to Units</a>")
                .contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/units/sentinel\" />");

        assertThat(worksDistrictFile).exists();
        assertThat(Files.readString(worksDistrictFile))
                .contains("Works Districts Guide | Endless Workshop")
                .contains("<a class=\"seo-button\" href=\"/codex\">Back to Codex</a>")
                .contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/districts/works\" />");

        assertThat(workshopImprovementFile).exists();
        assertThat(Files.readString(workshopImprovementFile))
                .contains("Workshop Improvements Guide | Endless Workshop")
                .contains("https://endlessworkshop.dev/improvements/workshop");

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
                "<loc>https://endlessworkshop.dev/districts/works</loc>",
                "<loc>https://endlessworkshop.dev/improvements/workshop</loc>",
                "<loc>https://endlessworkshop.dev/tech/stonework</loc>",
                "<loc>https://endlessworkshop.dev/tech/workshop</loc>",
                "<loc>https://endlessworkshop.dev/units/sentinel</loc>"
        );
        assertThat(Files.readString(sitemapFile)).doesNotContain("legacy-page");
    }

    @Test
    void tracksDuplicateSlugsPerExportKindInsteadOfGlobally() {
        CodexService codexService = mock(CodexService.class);
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString(), true);
        SeoRegenerationService service = new SeoRegenerationService(codexService, new CodexFilterService(), outputLocator);

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexEntry("tech", "Technology_A", "Workshop", List.of("Tech description."), List.of()),
                codexEntry("units", "Unit_A", "Workshop", List.of("Unit description."), List.of())
        ));

        SeoRegenerationResult result = service.regeneratePrototypePages();

        assertThat(result.generatedRoutes()).containsExactly(
                "/tech/workshop",
                "/units/workshop"
        );
        assertThat(result.skippedCount()).isZero();
        assertThat(result.duplicateCount()).isZero();
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
