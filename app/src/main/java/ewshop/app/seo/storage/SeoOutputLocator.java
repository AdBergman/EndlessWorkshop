package ewshop.app.seo.storage;

import ewshop.app.seo.config.SeoProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class SeoOutputLocator {

    private final Path outputRoot;

    @Autowired
    public SeoOutputLocator(SeoProperties seoProperties) {
        this(seoProperties.outputDir());
    }

    public SeoOutputLocator(String outputDir) {
        // Local development keeps using the relative generated-seo directory.
        // Production can override this with SEO_OUTPUT_DIR via application-prod.yml.
        this.outputRoot = Paths.get(outputDir).toAbsolutePath().normalize();
    }

    public Path getOutputRoot() {
        return outputRoot;
    }

    public Path getFeaturedEntityFile(String page, String entryKey) {
        return outputRoot.resolve("encyclopedia").resolve(page).resolve(entryKey).resolve("index.html");
    }

    public Path getFeaturedEntityFile(String page, String slug, String entryKeySlug) {
        String keySlug = entryKeySlug == null ? "" : entryKeySlug.trim();
        if (keySlug.isBlank()) {
            return getFeaturedEntityFile(page, slug);
        }
        return outputRoot.resolve("encyclopedia").resolve(page).resolve(slug).resolve(keySlug).resolve("index.html");
    }

    public Path getEncyclopediaCategoryFile(String page) {
        return outputRoot.resolve("encyclopedia").resolve(page).resolve("index.html");
    }

    public Path getGeneratedIndexFile(String page) {
        return outputRoot.resolve(page).resolve("index.html");
    }

    public boolean hasGeneratedIndex(String page) {
        return Files.isRegularFile(getGeneratedIndexFile(page));
    }

    public boolean hasGeneratedFeaturedEntity(String page, String entryKey) {
        return Files.isRegularFile(getFeaturedEntityFile(page, entryKey));
    }

    public boolean hasGeneratedFeaturedEntity(String page, String slug, String entryKeySlug) {
        return Files.isRegularFile(getFeaturedEntityFile(page, slug, entryKeySlug));
    }

    public boolean hasGeneratedEncyclopediaCategory(String page) {
        return Files.isRegularFile(getEncyclopediaCategoryFile(page));
    }

    public String getGeneratedForwardPath(String page) {
        return "/__generated-seo/" + page + "/index.html";
    }

    public String getGeneratedForwardPath(String page, String entryKey) {
        return "/__generated-seo/encyclopedia/" + page + "/" + entryKey + "/index.html";
    }

    public String getGeneratedForwardPath(String page, String slug, String entryKeySlug) {
        String keySlug = entryKeySlug == null ? "" : entryKeySlug.trim();
        if (keySlug.isBlank()) {
            return getGeneratedForwardPath(page, slug);
        }
        return "/__generated-seo/encyclopedia/" + page + "/" + slug + "/" + keySlug + "/index.html";
    }

    public String getGeneratedCategoryForwardPath(String page) {
        return "/__generated-seo/encyclopedia/" + page + "/index.html";
    }

    public Path getSitemapFile() {
        return outputRoot.resolve("sitemap.xml");
    }

    public Path getGeneratedSitemapPath() {
        return outputRoot.resolve("sitemap.xml");
    }

    public Path getMissingReferenceAuditJsonFile() {
        return outputRoot.resolve("codex-missing-references-audit.json");
    }

    public Path getMissingReferenceAuditMarkdownFile() {
        return outputRoot.resolve("codex-missing-references-audit.md");
    }
}
