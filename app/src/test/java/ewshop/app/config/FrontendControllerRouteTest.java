package ewshop.app.config;

import ewshop.app.seo.SeoOutputLocator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
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

        mockMvc.perform(get("/admin/import"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));
    }

    @Test
    void servesGeneratedFeaturedEntityRoutesWithAndWithoutTrailingSlash() throws Exception {
        mockMvc.perform(get("/tech/workshop"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/tech/workshop/index.html"));

        mockMvc.perform(get("/tech/workshop/"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/tech/workshop/index.html"));
    }

    @Test
    void prefersExternalGeneratedSeoOutputWhenPresent() throws Exception {
        Path externalWorkshop = Path.of("build/test-generated-seo/tech/workshop/index.html");
        Files.createDirectories(externalWorkshop.getParent());
        Files.writeString(externalWorkshop, "<!doctype html><title>external workshop</title>");

        try {
            mockMvc.perform(get("/tech/workshop"))
                    .andExpect(status().isOk())
                    .andExpect(forwardedUrl("/__generated-seo/tech/workshop/index.html"));
        } finally {
            Files.deleteIfExists(externalWorkshop);
        }
    }

    @Test
    void returnsReal404ForUnknownOrNestedEntityRoutes() throws Exception {
        mockMvc.perform(get("/tech/stonework"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/tech/missing-entry"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/units/sentinel"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/units/missing-entry"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/tech/stonework/extra"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/units/sentinel/extra"))
                .andExpect(status().isNotFound());
    }

    @Test
    void doesNotCaptureApiRoutes() throws Exception {
        mockMvc.perform(get("/api/tech"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/units/sentinel"))
                .andExpect(status().isNotFound());
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            FlywayAutoConfiguration.class
    })
    @Import({FrontendController.class, WebConfig.class})
    static class TestApplication {

        @Bean
        SeoOutputLocator seoOutputLocator() {
            return new SeoOutputLocator("build/test-generated-seo");
        }
    }
}
