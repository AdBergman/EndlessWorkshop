package ewshop.app.seo;

import java.util.List;
import java.util.Map;

public record SeoRegenerationResult(
        int generatedCount,
        List<String> generatedRoutes,
        int skippedCount,
        int duplicateCount,
        Map<String, Integer> skippedByReason,
        Map<String, SeoRegenerationKindResult> exportKindCounts,
        List<String> warnings,
        List<String> errors,
        boolean sitemapUpdated
) {
}
