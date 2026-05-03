package ewshop.app.seo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class SeoOutputLocator {

    private final Path outputRoot;

    public SeoOutputLocator(@Value("${seo.output-dir:generated-seo}") String outputDir) {
        // Local development keeps using the relative generated-seo directory.
        // Production can override this with SEO_OUTPUT_DIR via application-prod.yml.
        this.outputRoot = Paths.get(outputDir).toAbsolutePath().normalize();
    }

    public Path getOutputRoot() {
        return outputRoot;
    }

    public Path getFeaturedEntityFile(String page, String entryKey) {
        return outputRoot.resolve(page).resolve(entryKey).resolve("index.html");
    }

    public boolean hasGeneratedFeaturedEntity(String page, String entryKey) {
        return Files.isRegularFile(getFeaturedEntityFile(page, entryKey));
    }

    public String getGeneratedForwardPath(String page, String entryKey) {
        return "/__generated-seo/" + page + "/" + entryKey + "/index.html";
    }

    public Path getSitemapFile() {
        return outputRoot.resolve("sitemap.xml");
    }
}
