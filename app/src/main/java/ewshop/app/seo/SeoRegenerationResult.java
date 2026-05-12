package ewshop.app.seo;

import ewshop.app.seo.audit.CodexMissingReferenceAuditSummary;

import java.util.List;
import java.util.Map;

public record SeoRegenerationResult(
        int generatedCount,
        List<String> generatedRoutes,
        int skippedCount,
        int duplicateCount,
        Map<String, Integer> skippedByReason,
        Map<String, SeoRegenerationKindResult> exportKindCounts,
        CodexMissingReferenceAuditSummary missingReferenceAudit,
        List<String> warnings,
        List<String> errors,
        boolean sitemapUpdated
) {
}
