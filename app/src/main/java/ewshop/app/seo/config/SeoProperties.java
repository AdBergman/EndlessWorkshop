package ewshop.app.seo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "seo")
public record SeoProperties(
        @DefaultValue("generated-seo") String outputDir
) {
}
