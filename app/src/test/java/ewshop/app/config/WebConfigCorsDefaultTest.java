package ewshop.app.config;

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
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
        classes = WebConfigCorsDefaultTest.TestApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.MOCK
)
@AutoConfigureMockMvc
class WebConfigCorsDefaultTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void apiCorsRejectsCrossOriginRequestsWhenNoOriginIsConfigured() throws Exception {
        mockMvc.perform(options("/api/cors-check")
                        .header(HttpHeaders.ORIGIN, "https://endlessworkshop.dev")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "X-Admin-Token, Content-Type"))
                .andExpect(status().isForbidden());
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            FlywayAutoConfiguration.class
    })
    @Import({WebConfig.class, CorsCheckController.class})
    static class TestApplication {

        @Bean
        SeoOutputLocator seoOutputLocator() {
            return new SeoOutputLocator("build/test-generated-seo-cors-default");
        }
    }

    @RestController
    static class CorsCheckController {

        @GetMapping("/api/cors-check")
        String check() {
            return "ok";
        }
    }
}
