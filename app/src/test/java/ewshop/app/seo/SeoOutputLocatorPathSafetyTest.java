package ewshop.app.seo;

import ewshop.app.seo.storage.SeoOutputLocator;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SeoOutputLocatorPathSafetyTest {

    @Test
    void generatedEntityPathsStayUnderConfiguredOutputRoot() {
        SeoOutputLocator locator = new SeoOutputLocator("build/test-generated-seo-path-safety");

        Path outputRoot = locator.getOutputRoot();
        Path entityFile = locator.getFeaturedEntityFile("tech", "workshop");
        Path variantFile = locator.getFeaturedEntityFile("tech", "stonework", "tech-stonework-a");

        assertThat(entityFile.startsWith(outputRoot)).isTrue();
        assertThat(entityFile.toString()).endsWith(Path.of("encyclopedia", "tech", "workshop", "index.html").toString());
        assertThat(variantFile.startsWith(outputRoot)).isTrue();
        assertThat(variantFile.toString()).endsWith(Path.of("encyclopedia", "tech", "stonework", "tech-stonework-a", "index.html").toString());
    }

    @Test
    void generatedEntityPathsRejectTraversalAndNestedSegments() {
        SeoOutputLocator locator = new SeoOutputLocator("build/test-generated-seo-path-safety");

        assertThatThrownBy(() -> locator.getFeaturedEntityFile("tech", "../secret"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> locator.getFeaturedEntityFile("tech", "workshop/extra"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> locator.getFeaturedEntityFile("tech", "workshop", ".."))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
