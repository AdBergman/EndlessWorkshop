package ewshop.app.seo;

import ewshop.domain.model.Tech;
import ewshop.domain.model.TechUnlockRef;
import ewshop.domain.model.enums.MajorFaction;
import ewshop.domain.model.enums.TechType;
import ewshop.domain.service.TechService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SeoRegenerationServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void regeneratesOnlyWorkshopFromCanonicalBackendTechData() throws Exception {
        TechService techService = mock(TechService.class);
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString());
        SeoRegenerationService service = new SeoRegenerationService(techService, outputLocator);

        Tech workshop = Tech.builder()
                .name("Workshop")
                .techKey(SeoRegenerationService.WORKSHOP_TECH_KEY)
                .type(TechType.ECONOMY)
                .era(1)
                .descriptionLines(List.of("+2 Industry per District Level"))
                .unlocks(List.of(
                        new TechUnlockRef("District", "Works"),
                        new TechUnlockRef("Action", "Remove Forest")
                ))
                .factions(Set.of(
                        MajorFaction.ASPECTS,
                        MajorFaction.KIN,
                        MajorFaction.LORDS,
                        MajorFaction.NECROPHAGES,
                        MajorFaction.TAHUK
                ))
                .build();

        Tech other = Tech.builder()
                .name("Stonework")
                .techKey("Technology_District_Tier1_Defense")
                .type(TechType.DEFENSE)
                .era(1)
                .unlocks(List.of(new TechUnlockRef("District", "Rampart")))
                .factions(Set.of(MajorFaction.KIN))
                .build();

        when(techService.getAllTechs()).thenReturn(List.of(other, workshop));

        Files.writeString(tempDir.resolve("tech.html"), "spa tech entry");
        Files.writeString(tempDir.resolve("units.html"), "spa units entry");
        Files.writeString(tempDir.resolve("codex.html"), "spa codex entry");

        SeoRegenerationResult result = service.regeneratePrototypePages();

        Path workshopFile = tempDir.resolve("tech/workshop/index.html");
        Path sitemapFile = tempDir.resolve("sitemap.xml");

        assertThat(result.generatedCount()).isEqualTo(1);
        assertThat(result.generatedRoutes()).containsExactly("/tech/workshop");
        assertThat(result.skippedCount()).isZero();
        assertThat(result.warnings()).isEmpty();
        assertThat(result.errors()).isEmpty();
        assertThat(result.sitemapUpdated()).isTrue();

        assertThat(workshopFile).exists();
        String html = Files.readString(workshopFile);
        assertThat(html).contains("Workshop Tech Guide | Endless Workshop");
        assertThat(html).contains("Technology • Era 1 • Economy");
        assertThat(html).contains("District: Works");
        assertThat(html).contains("Action: Remove Forest");
        assertThat(html).contains("Factions: Aspects, Kin, Lords, Necrophages, Tahuk");
        assertThat(html).contains("<link rel=\"stylesheet\" href=\"/seo/seo-shell.css\" />");
        assertThat(html).contains("<link rel=\"stylesheet\" href=\"/seo/entity-page.css\" />");
        assertThat(html).contains("\"@type\":\"WebPage\"");
        assertThat(html).contains("\"@type\":\"BreadcrumbList\"");
        assertThat(html).doesNotContain("src/index.tsx");
        assertThat(html).doesNotContain("fetch(");
        assertThat(html).doesNotContain("/api/");
        assertThat(html).doesNotContain("type=\"module\"");

        assertThat(sitemapFile).exists();
        String sitemap = Files.readString(sitemapFile);
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/tech</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/units</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/codex</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/summary</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/mods</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/info</loc>");
        assertThat(sitemap).contains("<loc>https://endlessworkshop.dev/tech/workshop</loc>");

        assertThat(tempDir.resolve("tech.html")).hasContent("spa tech entry");
        assertThat(tempDir.resolve("units.html")).hasContent("spa units entry");
        assertThat(tempDir.resolve("codex.html")).hasContent("spa codex entry");
    }
}
