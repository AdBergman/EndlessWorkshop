package ewshop.app.config;

import ewshop.app.seo.SeoOutputLocator;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
        classes = FrontendControllerProductionFallbackTest.TestApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.MOCK
)
@AutoConfigureMockMvc
class FrontendControllerProductionFallbackTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void returns404ForRuntimeOwnedWorkshopWhenExternalOutputIsMissing() throws Exception {
        mockMvc.perform(get("/tech/workshop"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/tech/workshop/"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/tech/stonework"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/tech/stonework/"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/units/sentinel"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/districts/works"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/encyclopedia/tech/workshop"))
                .andExpect(status().isNotFound());
    }

    @Test
    void stillServesExternalWorkshopWhenPresent() throws Exception {
        Path externalWorkshop = Path.of("build/test-generated-seo-prod/encyclopedia/tech/workshop/index.html");
        Files.createDirectories(externalWorkshop.getParent());
        Files.writeString(externalWorkshop, "<!doctype html><title>external workshop</title>");

        try {
            mockMvc.perform(get("/encyclopedia/tech/workshop"))
                    .andExpect(status().isOk())
                    .andExpect(forwardedUrl("/__generated-seo/encyclopedia/tech/workshop/index.html"));

            mockMvc.perform(get("/tech/workshop"))
                    .andExpect(status().isNotFound());
        } finally {
            Files.deleteIfExists(externalWorkshop);
        }
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
            return new SeoOutputLocator("build/test-generated-seo-prod");
        }
    }
}
