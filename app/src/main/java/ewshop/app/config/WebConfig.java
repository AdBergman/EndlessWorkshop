package ewshop.app.config;

import ewshop.app.seo.storage.SeoOutputLocator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class WebConfig {

    private static final String NO_ORIGINS_ALLOWED = "https://cors-disabled.invalid";

    private final SeoOutputLocator seoOutputLocator;
    private final List<String> apiAllowedOrigins;

    public WebConfig(
            SeoOutputLocator seoOutputLocator,
            @Value("${ewshop.cors.allowed-origins:}") String apiAllowedOrigins
    ) {
        this.seoOutputLocator = seoOutputLocator;
        this.apiAllowedOrigins = parseAllowedOrigins(apiAllowedOrigins);
    }

    @Bean
    public WebMvcConfigurer webConfigurer() {
        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                var registration = registry.addMapping("/api/**")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("Content-Type", "X-Admin-Token");

                if (apiAllowedOrigins.contains("*")) {
                    registration.allowedOriginPatterns("*");
                } else if (apiAllowedOrigins.isEmpty()) {
                    registration.allowedOrigins(NO_ORIGINS_ALLOWED);
                } else {
                    registration.allowedOrigins(apiAllowedOrigins.toArray(String[]::new));
                }
            }

            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                String encyclopediaOutputLocation = seoOutputLocator.getOutputRoot().resolve("encyclopedia").toUri().toString();
                if (!encyclopediaOutputLocation.endsWith("/")) {
                    encyclopediaOutputLocation = encyclopediaOutputLocation + "/";
                }

                String outputLocation = seoOutputLocator.getOutputRoot().toUri().toString();
                if (!outputLocation.endsWith("/")) {
                    outputLocation = outputLocation + "/";
                }

                registry.addResourceHandler("/__generated-seo/encyclopedia/**")
                        .addResourceLocations(encyclopediaOutputLocation);

                registry.addResourceHandler("/sitemap.xml")
                        .addResourceLocations(outputLocation, "classpath:/static/");
            }
        };
    }

    private static List<String> parseAllowedOrigins(String rawOrigins) {
        if (rawOrigins == null || rawOrigins.isBlank()) {
            return List.of();
        }

        return Arrays.stream(rawOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .distinct()
                .toList();
    }
}
