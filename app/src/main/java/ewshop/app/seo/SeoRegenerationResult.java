package ewshop.app.seo;

import java.util.List;

public record SeoRegenerationResult(
        int generatedCount,
        List<String> generatedRoutes,
        int skippedCount,
        List<String> warnings,
        List<String> errors,
        boolean sitemapUpdated
) {
}
