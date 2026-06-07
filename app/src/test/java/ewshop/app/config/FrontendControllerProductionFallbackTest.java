package ewshop.app.config;

import ewshop.api.exception.GlobalExceptionHandler;
import ewshop.app.seo.storage.SeoOutputLocator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
                .andExpect(status().isMovedPermanently())
                .andExpect(header().string("Location", "/encyclopedia/tech/workshop"));

        mockMvc.perform(get("/tech/workshop/"))
                .andExpect(status().isMovedPermanently())
                .andExpect(header().string("Location", "/encyclopedia/tech/workshop"));

        mockMvc.perform(get("/tech/stonework"))
                .andExpect(status().isMovedPermanently())
                .andExpect(header().string("Location", "/encyclopedia/tech/stonework"));

        mockMvc.perform(get("/tech/stonework/"))
                .andExpect(status().isMovedPermanently())
                .andExpect(header().string("Location", "/encyclopedia/tech/stonework"));

        mockMvc.perform(get("/units/sentinel"))
                .andExpect(status().isMovedPermanently())
                .andExpect(header().string("Location", "/encyclopedia/units/sentinel"));

        mockMvc.perform(get("/districts/works"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/encyclopedia/tech/workshop"))
                .andExpect(status().isNotFound());
    }

    @Test
    void forwardsQuestDeepLinksToQuestSpaShell() throws Exception {
        mockMvc.perform(get("/quests/FactionQuest_KinOfSheredyn_Chapter02_Step01").queryParam("mode", "strategy"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-cache, max-age=0, must-revalidate"))
                .andExpect(forwardedUrl("/quests.html"));

        mockMvc.perform(get("/quests/FactionQuest_KinOfSheredyn_Chapter02_Step01/Branch_Pious/step-2")
                        .queryParam("mode", "strategy"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-cache, max-age=0, must-revalidate"))
                .andExpect(forwardedUrl("/quests.html"));
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
                    .andExpect(status().isMovedPermanently())
                    .andExpect(header().string("Location", "/encyclopedia/tech/workshop"));
        } finally {
            Files.deleteIfExists(externalWorkshop);
        }
    }

    @Test
    void missingApiRoutesReturn404WhenGlobalExceptionHandlerIsPresent() throws Exception {
        mockMvc.perform(get("/api/saved-tech-builds"))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/saved-tech-builds"))
                .andExpect(status().isNotFound());
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            FlywayAutoConfiguration.class
    })
    @Import({
            FrontendController.class,
            FrontendCacheHeaderFilter.class,
            GlobalExceptionHandler.class,
            LegacySeoRedirectController.class,
            WebConfig.class
    })
    static class TestApplication {

        @Bean
        SeoOutputLocator seoOutputLocator() {
            return new SeoOutputLocator("build/test-generated-seo-prod");
        }
    }
}
