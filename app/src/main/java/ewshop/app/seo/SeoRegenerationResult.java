package ewshop.app.seo;

import java.util.List;
import java.util.Map;

public record SeoRegenerationResult(
        int generatedCount,
        List<String> generatedRoutes,
        int skippedCount,
        Map<String, Integer> skippedByReason,
        List<String> warnings,
        List<String> errors,
        boolean sitemapUpdated
) {
}
