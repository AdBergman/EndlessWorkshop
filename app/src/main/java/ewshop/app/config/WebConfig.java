package ewshop.app.config;

import ewshop.app.seo.SeoOutputLocator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    private final SeoOutputLocator seoOutputLocator;

    public WebConfig(SeoOutputLocator seoOutputLocator) {
        this.seoOutputLocator = seoOutputLocator;
    }

    @Bean
    public WebMvcConfigurer webConfigurer() {
        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
            }

            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                String outputLocation = seoOutputLocator.getOutputRoot().toUri().toString();
                if (!outputLocation.endsWith("/")) {
                    outputLocation = outputLocation + "/";
                }

                registry.addResourceHandler("/__generated-seo/**")
                        .addResourceLocations(outputLocation);

                registry.addResourceHandler("/sitemap.xml")
                        .addResourceLocations(outputLocation, "classpath:/static/");
            }
        };
    }
}
