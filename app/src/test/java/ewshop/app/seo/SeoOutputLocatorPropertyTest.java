package ewshop.app.seo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
        classes = SeoOutputLocatorPropertyTest.TestApplication.class,
        properties = "seo.output-dir=build/property-configured-generated-seo"
)
class SeoOutputLocatorPropertyTest {

    @Autowired
    private SeoOutputLocator seoOutputLocator;

    @Test
    void resolvesConfiguredSeoOutputDirectory() {
        assertThat(seoOutputLocator.getOutputRoot())
                .isEqualTo(Path.of("build/property-configured-generated-seo").toAbsolutePath().normalize());
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            FlywayAutoConfiguration.class
    })
    @Import(SeoOutputLocator.class)
    static class TestApplication {
    }
}
