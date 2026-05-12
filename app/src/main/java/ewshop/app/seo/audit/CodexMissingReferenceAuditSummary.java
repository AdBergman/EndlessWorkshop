package ewshop.app.seo.audit;

import java.util.List;

public record CodexMissingReferenceAuditSummary(
        String artifact,
        int unresolvedReferences,
        double resolutionPercentage,
        List<String> topUnresolvedCategories
) {
}
