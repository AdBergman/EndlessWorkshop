package ewshop.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig {

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
                // Disable cache for index.html
                registry.addResourceHandler("/index.html")
                        .addResourceLocations("classpath:/static/index.html")
                        .setCacheControl(CacheControl.noCache());

                // Keep 30 days cache for all other static assets
                registry.addResourceHandler("/**")
                        .addResourceLocations("classpath:/static/")
                        .setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS));
            }
        };
    }
}
