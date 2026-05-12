package ewshop.app.config;

import ewshop.app.seo.storage.SeoOutputLocator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
        classes = FrontendControllerRouteTest.TestApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.MOCK
)
@AutoConfigureMockMvc
class FrontendControllerRouteTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void preservesExistingSpaEntryRoutes() throws Exception {
        mockMvc.perform(get("/tech").queryParam("share", "demo-build"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/tech.html"));

        mockMvc.perform(get("/tech").queryParam("faction", "kin").queryParam("tech", "stonework"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/tech.html"));

        mockMvc.perform(get("/units").queryParam("faction", "kin").queryParam("unitKey", "Unit_Sentinel"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/units.html"));

        mockMvc.perform(get("/codex").queryParam("entry", "Ability_Blossom"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/codex.html"));

        mockMvc.perform(get("/mods"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/mods.html"));

        mockMvc.perform(get("/summary"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/summary.html"));

        mockMvc.perform(get("/info"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/info.html"));

        mockMvc.perform(get("/admin/import"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));
    }

    @Test
    void redirectsLegacyGeneratedEntityRoutesWhenExternalOutputIsMissing() throws Exception {
        mockMvc.perform(get("/tech/workshop"))
                .andExpect(status().isMovedPermanently())
                .andExpect(header().string("Location", "/encyclopedia/tech/workshop"));

        mockMvc.perform(get("/tech/workshop/"))
                .andExpect(status().isMovedPermanently())
                .andExpect(header().string("Location", "/encyclopedia/tech/workshop"));

        mockMvc.perform(get("/units/sentinel"))
                .andExpect(status().isMovedPermanently())
                .andExpect(header().string("Location", "/encyclopedia/units/sentinel"));

        mockMvc.perform(get("/heroes/hero-name"))
                .andExpect(status().isMovedPermanently())
                .andExpect(header().string("Location", "/encyclopedia/heroes/hero-name"));

        mockMvc.perform(get("/abilities/ability-name"))
                .andExpect(status().isMovedPermanently())
                .andExpect(header().string("Location", "/encyclopedia/abilities/ability-name"));

        mockMvc.perform(get("/encyclopedia/tech/workshop"))
                .andExpect(status().isNotFound());
    }

    @Test
    void prefersExternalGeneratedSeoOutputWhenPresent() throws Exception {
        Path externalWorkshop = Path.of("build/test-generated-seo/encyclopedia/tech/workshop/index.html");
        Files.createDirectories(externalWorkshop.getParent());
        Files.writeString(externalWorkshop, "<!doctype html><title>external workshop</title>");

        try {
            mockMvc.perform(get("/encyclopedia/tech/workshop"))
                    .andExpect(status().isOk())
                    .andExpect(forwardedUrl("/__generated-seo/encyclopedia/tech/workshop/index.html"));

            mockMvc.perform(get("/tech/workshop"))
                    .andExpect(status().isMovedPermanently())
                    .andExpect(header().string("Location", "/encyclopedia/tech/workshop"));
        } finally {
            Files.deleteIfExists(externalWorkshop);
        }
    }

    @Test
    void servesGeneratedTechPageForAnyGeneratedSlug() throws Exception {
        Path externalStonework = Path.of("build/test-generated-seo/encyclopedia/tech/stonework/index.html");
        Files.createDirectories(externalStonework.getParent());
        Files.writeString(externalStonework, "<!doctype html><title>external stonework</title>");

        try {
            mockMvc.perform(get("/encyclopedia/tech/stonework"))
                    .andExpect(status().isOk())
                    .andExpect(forwardedUrl("/__generated-seo/encyclopedia/tech/stonework/index.html"));

            mockMvc.perform(get("/encyclopedia/tech/stonework/"))
                    .andExpect(status().isMovedPermanently())
                    .andExpect(header().string("Location", "/encyclopedia/tech/stonework"));
        } finally {
            Files.deleteIfExists(externalStonework);
        }
    }

    @Test
    void servesGeneratedPagesForNonTechKindsWhenPresent() throws Exception {
        Path externalSentinel = Path.of("build/test-generated-seo/encyclopedia/units/sentinel/index.html");
        Path externalWorks = Path.of("build/test-generated-seo/encyclopedia/districts/works/index.html");
        Files.createDirectories(externalSentinel.getParent());
        Files.createDirectories(externalWorks.getParent());
        Files.writeString(externalSentinel, "<!doctype html><title>external sentinel</title>");
        Files.writeString(externalWorks, "<!doctype html><title>external works</title>");

        try {
            mockMvc.perform(get("/encyclopedia/units/sentinel"))
                    .andExpect(status().isOk())
                    .andExpect(forwardedUrl("/__generated-seo/encyclopedia/units/sentinel/index.html"));

            mockMvc.perform(get("/encyclopedia/districts/works"))
                    .andExpect(status().isOk())
                    .andExpect(forwardedUrl("/__generated-seo/encyclopedia/districts/works/index.html"));
        } finally {
            Files.deleteIfExists(externalSentinel);
            Files.deleteIfExists(externalWorks);
        }
    }

    @Test
    void servesGeneratedEncyclopediaRootAndCategoryPagesWhenPresent() throws Exception {
        Path externalEncyclopedia = Path.of("build/test-generated-seo/encyclopedia/index.html");
        Path externalAbilities = Path.of("build/test-generated-seo/encyclopedia/abilities/index.html");
        Files.createDirectories(externalEncyclopedia.getParent());
        Files.createDirectories(externalAbilities.getParent());
        Files.writeString(externalEncyclopedia, "<!doctype html><title>encyclopedia root</title>");
        Files.writeString(externalAbilities, "<!doctype html><title>abilities index</title>");

        try {
            mockMvc.perform(get("/encyclopedia"))
                    .andExpect(status().isOk())
                    .andExpect(forwardedUrl("/__generated-seo/encyclopedia/index.html"));

            mockMvc.perform(get("/encyclopedia/"))
                    .andExpect(status().isMovedPermanently())
                    .andExpect(header().string("Location", "/encyclopedia"));

            mockMvc.perform(get("/encyclopedia/abilities"))
                    .andExpect(status().isOk())
                    .andExpect(forwardedUrl("/__generated-seo/encyclopedia/abilities/index.html"));

            mockMvc.perform(get("/encyclopedia/abilities/"))
                    .andExpect(status().isMovedPermanently())
                    .andExpect(header().string("Location", "/encyclopedia/abilities"));
        } finally {
            Files.deleteIfExists(externalEncyclopedia);
            Files.deleteIfExists(externalAbilities);
        }
    }

    @Test
    void doesNotServeGeneratedAuditArtifactsAsPublicResources() throws Exception {
        Path auditJson = Path.of("build/test-generated-seo/codex-missing-references-audit.json");
        Files.createDirectories(auditJson.getParent());
        Files.writeString(auditJson, "{\"internal\":true}");

        try {
            mockMvc.perform(get("/__generated-seo/codex-missing-references-audit.json"))
                    .andExpect(status().isNotFound());

            mockMvc.perform(get("/codex-missing-references-audit.json"))
                    .andExpect(status().isNotFound());
        } finally {
            Files.deleteIfExists(auditJson);
        }
    }

    @Test
    void servesGeneratedEncyclopediaResourcesButNotOutputRootFiles() throws Exception {
        Path generatedPage = Path.of("build/test-generated-seo/encyclopedia/tech/workshop/index.html");
        Path rootFile = Path.of("build/test-generated-seo/root-check.txt");
        Files.createDirectories(generatedPage.getParent());
        Files.writeString(generatedPage, "<!doctype html><title>resource workshop</title>");
        Files.writeString(rootFile, "root file");

        try {
            mockMvc.perform(get("/__generated-seo/encyclopedia/tech/workshop/index.html"))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("resource workshop")));

            mockMvc.perform(get("/__generated-seo/root-check.txt"))
                    .andExpect(status().isNotFound());
        } finally {
            Files.deleteIfExists(generatedPage);
            Files.deleteIfExists(rootFile);
        }
    }

    @Test
    void returnsReal404ForUnknownOrNestedEntityRoutes() throws Exception {
        mockMvc.perform(get("/districts/missing-entry"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/tech/stonework/extra"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/units/sentinel/extra"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/districts/works/extra"))
                .andExpect(status().isNotFound());
    }

    @Test
    void legacyAndTrailingSlashRedirectsDoNotCreateChainsWhenCanonicalOutputExists() throws Exception {
        Path externalWorkshop = Path.of("build/test-generated-seo/encyclopedia/tech/workshop/index.html");
        Files.createDirectories(externalWorkshop.getParent());
        Files.writeString(externalWorkshop, "<!doctype html><title>external workshop</title>");

        try {
            mockMvc.perform(get("/tech/workshop/"))
                    .andExpect(status().isMovedPermanently())
                    .andExpect(header().string("Location", "/encyclopedia/tech/workshop"));

            mockMvc.perform(get("/encyclopedia/tech/workshop"))
                    .andExpect(status().isOk())
                    .andExpect(forwardedUrl("/__generated-seo/encyclopedia/tech/workshop/index.html"));
        } finally {
            Files.deleteIfExists(externalWorkshop);
        }
    }

    @Test
    void doesNotCaptureApiRoutes() throws Exception {
        mockMvc.perform(get("/api/tech"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/units/sentinel"))
                .andExpect(status().isNotFound());
    }

    @Test
    void servesSeoStaticAssetsFromSpringResources() throws Exception {
        mockMvc.perform(get("/seo/seo-shell.css"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("--seo-bg")));

        mockMvc.perform(get("/seo/entity-page.css"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString(".entity-page__header")));

        mockMvc.perform(get("/graphics/cog.svg"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<svg")));

        mockMvc.perform(get("/favicon.ico"))
                .andExpect(status().isOk());
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            FlywayAutoConfiguration.class
    })
    @Import({FrontendController.class, LegacySeoRedirectController.class, WebConfig.class})
    static class TestApplication {

        @Bean
        SeoOutputLocator seoOutputLocator() {
            return new SeoOutputLocator("build/test-generated-seo");
        }
    }
}
