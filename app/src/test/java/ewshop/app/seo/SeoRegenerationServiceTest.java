package ewshop.app.seo;

import ewshop.domain.model.Codex;
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
    void regeneratesTechPagesFromCanonicalBackendCodexData() throws Exception {
        CodexService codexService = mock(CodexService.class);
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString(), true);
        SeoRegenerationService service = new SeoRegenerationService(codexService, outputLocator);

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexTech("Technology_District_Tier1_Industry", "Workshop",
                        List.of("+2 Industry per District Level", "Unlocks district planning."),
                        List.of("District_Workshop", "Industry")),
                codexTech("Technology_District_Tier1_Defense", "Stonework",
                        List.of("Unlocks fortified district construction."),
                        List.of("District_Rampart")),
                codexTech("Technology_City_Tier3_Defense", "Stonework",
                        List.of("Improves masonry logistics for defended cities."),
                        List.of("City_Defense")),
                codexTech("Technology_Debug_Hidden", "% Debug Tech",
                        List.of("Hidden debug row."),
                        List.of("Debug")),
                codexTech("Technology_Todo", "Future Tech",
                        List.of("TBD"),
                        List.of("Placeholder")),
                codexTech("Technology_Empty", "Silent Archive",
                        List.of(" ", "  "),
                        List.of("Archive")),
                Codex.builder()
                        .exportKind("units")
                        .entryKey("Unit_Sentinel")
                        .displayName("Sentinel")
                        .descriptionLines(List.of("A frontline unit."))
                        .referenceKeys(List.of("Unit_Sentinel"))
                        .build()
        ));

        Files.writeString(tempDir.resolve("tech.html"), "spa tech entry");
        Files.createDirectories(tempDir.resolve("tech/legacy-page"));
        Files.writeString(tempDir.resolve("tech/legacy-page/index.html"), "stale tech seo");
        Files.createDirectories(tempDir.resolve("units/legacy-unit"));
        Files.writeString(tempDir.resolve("units/legacy-unit/index.html"), "leave me alone");

        SeoRegenerationResult result = service.regeneratePrototypePages();

        Path workshopFile = tempDir.resolve("tech/workshop/index.html");
        Path stoneworkFile = tempDir.resolve("tech/stonework/index.html");
        Path disambiguatedStoneworkFile = tempDir.resolve("tech/stonework-technology-district-tier1-defense/index.html");
        Path sitemapFile = tempDir.resolve("sitemap.xml");

        assertThat(result.generatedCount()).isEqualTo(3);
        assertThat(result.generatedRoutes()).containsExactly(
                "/tech/stonework",
                "/tech/stonework-technology-district-tier1-defense",
                "/tech/workshop"
        );
        assertThat(result.skippedCount()).isEqualTo(3);
        assertThat(result.skippedByReason()).isEqualTo(Map.of(
                "invalid-display-name", 1,
                "weak-description-lines", 2
        ));
        assertThat(result.warnings()).anySatisfy(warning ->
                assertThat(warning).contains("Duplicate tech slug base 'stonework'"));
        assertThat(result.errors()).isEmpty();
        assertThat(result.sitemapUpdated()).isTrue();

        assertThat(workshopFile).exists();
        String workshopHtml = Files.readString(workshopFile);
        assertThat(workshopHtml).contains("Workshop Tech Guide | Endless Workshop");
        assertThat(workshopHtml).contains("Technology • Codex entry");
        assertThat(workshopHtml).contains("Entry key: Technology_District_Tier1_Industry");
        assertThat(workshopHtml).contains("+2 Industry per District Level");
        assertThat(workshopHtml).contains("Unlocks district planning.");
        assertThat(workshopHtml).contains("District_Workshop");
        assertThat(workshopHtml).contains("<a class=\"seo-button\" href=\"/tech\">Back to Tech</a>");
        assertThat(workshopHtml).contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/tech/workshop\" />");
        assertThat(workshopHtml).contains("\"@type\":\"WebPage\"");
        assertThat(workshopHtml).contains("\"@type\":\"BreadcrumbList\"");
        assertThat(workshopHtml).doesNotContain("src/index.tsx");
        assertThat(workshopHtml).doesNotContain("fetch(");
        assertThat(workshopHtml).doesNotContain("/api/");
        assertThat(workshopHtml).doesNotContain("type=\"module\"");
        assertThat(workshopHtml).doesNotContain("<style");

        assertThat(stoneworkFile).exists();
        assertThat(Files.readString(stoneworkFile)).contains("https://endlessworkshop.dev/tech/stonework");

        assertThat(disambiguatedStoneworkFile).exists();
        assertThat(Files.readString(disambiguatedStoneworkFile))
                .contains("Unlocks fortified district construction.")
                .contains("https://endlessworkshop.dev/tech/stonework-technology-district-tier1-defense");

        assertThat(tempDir.resolve("tech/legacy-page/index.html")).doesNotExist();
        assertThat(tempDir.resolve("units/legacy-unit/index.html")).hasContent("leave me alone");
        assertThat(tempDir.resolve("tech.html")).hasContent("spa tech entry");

        assertThat(sitemapFile).exists();
        String sitemap = Files.readString(sitemapFile);
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/tech</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/units</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/codex</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/summary</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/mods</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/info</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/tech/workshop</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/tech/stonework</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/tech/stonework-technology-district-tier1-defense</loc>");
        assertThat(sitemap).doesNotContain("legacy-page");
    }

    @Test
    void skipsTechWhenDuplicateSlugCannotBeDisambiguatedSafely() {
        CodexService codexService = mock(CodexService.class);
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString(), true);
        SeoRegenerationService service = new SeoRegenerationService(codexService, outputLocator);

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexTech("A A", "Stonework", List.of("First description line."), List.of()),
                codexTech("A-B", "Stonework", List.of("Second description line."), List.of()),
                codexTech("A B", "Stonework", List.of("Third description line."), List.of())
        ));

        SeoRegenerationResult result = service.regeneratePrototypePages();

        assertThat(result.generatedRoutes()).containsExactly("/tech/stonework", "/tech/stonework-a-b");
        assertThat(result.skippedCount()).isEqualTo(1);
        assertThat(result.skippedByReason()).containsEntry("duplicate-slug", 1);
        assertThat(result.warnings()).anySatisfy(warning ->
                assertThat(warning).contains("could not be disambiguated safely"));
    }

    private static Codex codexTech(String entryKey, String displayName, List<String> descriptionLines, List<String> referenceKeys) {
        return Codex.builder()
                .exportKind("tech")
                .entryKey(entryKey)
                .displayName(displayName)
                .descriptionLines(descriptionLines)
                .referenceKeys(referenceKeys)
                .build();
    }
}
