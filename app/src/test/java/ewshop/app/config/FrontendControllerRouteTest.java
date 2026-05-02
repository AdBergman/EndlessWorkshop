package ewshop.app.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

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
    void servesGeneratedFeaturedEntityRoutes() throws Exception {
        mockMvc.perform(get("/tech/stonework"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/tech/stonework/index.html"));

        mockMvc.perform(get("/units/sentinel"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/units/sentinel/index.html"));
    }

    @Test
    void returnsReal404ForUnknownOrNestedEntityRoutes() throws Exception {
        mockMvc.perform(get("/tech/missing-entry"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/units/missing-entry"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/tech/stonework/extra"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/units/sentinel/extra"))
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
    }
}
