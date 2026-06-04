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
        return resolveUnderOutputRoot("encyclopedia", page, entryKey, "index.html");
    }

    public Path getFeaturedEntityFile(String page, String slug, String entryKeySlug) {
        String keySlug = entryKeySlug == null ? "" : entryKeySlug.trim();
        if (keySlug.isBlank()) {
            return getFeaturedEntityFile(page, slug);
        }
        return resolveUnderOutputRoot("encyclopedia", page, slug, keySlug, "index.html");
    }

    public Path getEncyclopediaCategoryFile(String page) {
        return resolveUnderOutputRoot("encyclopedia", page, "index.html");
    }

    public Path getGeneratedIndexFile(String page) {
        return resolveUnderOutputRoot(page, "index.html");
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
        return resolveUnderOutputRoot("sitemap.xml");
    }

    public Path getGeneratedSitemapPath() {
        return resolveUnderOutputRoot("sitemap.xml");
    }

    public Path getMissingReferenceAuditJsonFile() {
        return resolveUnderOutputRoot("codex-missing-references-audit.json");
    }

    public Path getMissingReferenceAuditMarkdownFile() {
        return resolveUnderOutputRoot("codex-missing-references-audit.md");
    }

    private Path resolveUnderOutputRoot(String... segments) {
        Path current = outputRoot;
        for (String segment : segments) {
            validatePathSegment(segment);
            current = current.resolve(segment);
        }

        Path normalized = current.normalize();
        if (!normalized.startsWith(outputRoot)) {
            throw new IllegalArgumentException("Generated SEO path escapes output root");
        }
        return normalized;
    }

    private static void validatePathSegment(String segment) {
        if (segment == null || segment.isBlank()) {
            throw new IllegalArgumentException("Generated SEO path segment must not be blank");
        }
        if (segment.equals(".") || segment.equals("..") || segment.contains("/") || segment.contains("\\")) {
            throw new IllegalArgumentException("Generated SEO path segment is not safe");
        }
    }
}
