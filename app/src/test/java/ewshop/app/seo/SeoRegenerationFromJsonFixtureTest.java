package ewshop.app.seo;

import ewshop.app.config.FrontendController;
import ewshop.app.seo.audit.CodexMissingReferenceAuditService;
import ewshop.app.seo.generation.PageCandidateBuilder;
import ewshop.app.seo.generation.ReferenceTargetBuilder;
import ewshop.app.seo.generation.SitemapGenerator;
import ewshop.app.seo.generation.SitemapRoutePolicy;
import ewshop.app.seo.rendering.SeoPageRenderer;
import ewshop.app.seo.storage.GeneratedSeoWriter;
import ewshop.app.seo.storage.SeoOutputLocator;
import ewshop.domain.model.Codex;
import ewshop.domain.service.CodexFilterService;
import ewshop.domain.service.CodexService;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.codex.CodexImportEntryDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SeoRegenerationFromJsonFixtureTest {

    private static final String FIXTURE_ROOT = "/seo-routing-local-imports/codex/";

    @TempDir
    Path tempDir;

    @Test
    void regeneratesSeoPagesFromCommittedLocalImportJsonFixtures() throws Exception {
        CodexService codexService = mock(CodexService.class);
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString());
        SeoRegenerationService regenerationService = seoRegenerationService(codexService, outputLocator);

        when(codexService.getAllCodexEntries()).thenReturn(loadCodexFixtures());

        SeoRegenerationResult result = regenerationService.regeneratePrototypePages();
        FrontendController frontendController = new FrontendController(outputLocator);

        Path workshopPage = tempDir.resolve("encyclopedia/tech/workshop/index.html");
        Path sentinelPage = tempDir.resolve("encyclopedia/units/sentinel/index.html");
        Path sitemap = tempDir.resolve("sitemap.xml");

        assertThat(result.generatedRoutes()).containsExactly(
                "/encyclopedia",
                "/encyclopedia/tech",
                "/encyclopedia/tech/workshop",
                "/encyclopedia/units",
                "/encyclopedia/units/sentinel"
        );
        assertThat(workshopPage).exists();
        assertThat(sentinelPage).exists();
        assertThat(Files.readString(workshopPage))
                .contains("Workshop Technology Reference | Endless Workshop")
                .contains("Workshop improves early city industry.")
                .contains("<a class=\"seo-chip\" href=\"/encyclopedia/units/sentinel\" data-entry-key=\"Unit_Sentinel\">Sentinel</a>");
        assertThat(Files.readString(sentinelPage))
                .contains("Sentinel Unit Reference | Endless Workshop")
                .contains("A frontline unit that anchors army formations.");
        assertThat(Files.readString(sitemap))
                .contains("<loc>https://endlessworkshop.dev/encyclopedia/tech/workshop</loc>")
                .contains("<loc>https://endlessworkshop.dev/encyclopedia/units/sentinel</loc>");
        assertThat(frontendController.forwardFeaturedEntityDocument("tech", "workshop"))
                .isEqualTo("forward:/__generated-seo/encyclopedia/tech/workshop/index.html");
        assertThat(frontendController.forwardFeaturedEntityDocument("units", "sentinel"))
                .isEqualTo("forward:/__generated-seo/encyclopedia/units/sentinel/index.html");
    }

    private static List<Codex> loadCodexFixtures() throws Exception {
        ObjectMapper objectMapper = JsonMapper.builder()
                .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .build();
        List<Codex> entries = new ArrayList<>();

        entries.addAll(readCodexFixture(objectMapper, "ewshop_tech_codex_export_0.80.json"));
        entries.addAll(readCodexFixture(objectMapper, "ewshop_units_codex_export_0.80.json"));

        return entries;
    }

    private static List<Codex> readCodexFixture(ObjectMapper objectMapper, String fileName) throws Exception {
        try (InputStream inputStream = Objects.requireNonNull(
                SeoRegenerationFromJsonFixtureTest.class.getResourceAsStream(FIXTURE_ROOT + fileName),
                "Missing SEO routing fixture " + fileName
        )) {
            CodexImportBatchDto batch = objectMapper.readValue(inputStream, CodexImportBatchDto.class);

            return batch.entries().stream()
                    .map(entry -> toCodex(batch, entry))
                    .toList();
        }
    }

    private static Codex toCodex(CodexImportBatchDto batch, CodexImportEntryDto entry) {
        return Codex.builder()
                .exportKind(batch.exportKind())
                .entryKey(entry.entryKey())
                .displayName(entry.displayName())
                .category(entry.category())
                .kind(entry.kind())
                .descriptionLines(entry.descriptionLines())
                .referenceKeys(entry.referenceKeys())
                .build();
    }

    private static SeoRegenerationService seoRegenerationService(
            CodexService codexService,
            SeoOutputLocator outputLocator
    ) {
        return new SeoRegenerationService(
                codexService,
                new CodexFilterService(),
                outputLocator,
                new CodexMissingReferenceAuditService(),
                new PageCandidateBuilder(),
                new ReferenceTargetBuilder(),
                new SeoPageRenderer(),
                new SitemapGenerator(),
                new SitemapRoutePolicy(),
                new GeneratedSeoWriter(outputLocator)
        );
    }
}
