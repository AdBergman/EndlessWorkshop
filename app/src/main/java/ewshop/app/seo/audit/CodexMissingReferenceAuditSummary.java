package ewshop.app.seo.audit;

import java.util.List;

public record CodexMissingReferenceAuditSummary(
        String artifact,
        int unresolvedReferences,
        double resolutionPercentage,
        List<String> topUnresolvedCategories,
        List<CodexMissingReferenceOwnershipSummary> ownershipBuckets,
        CodexDuplicateAliasImpactSummary duplicateAliasImpact,
        List<CodexPresentButFilteredReasonSummary> presentButFilteredReasons
) {
    public CodexMissingReferenceAuditSummary(
            String artifact,
            int unresolvedReferences,
            double resolutionPercentage,
            List<String> topUnresolvedCategories
    ) {
        this(
                artifact,
                unresolvedReferences,
                resolutionPercentage,
                topUnresolvedCategories,
                List.of(),
                new CodexDuplicateAliasImpactSummary(0, 0, List.of()),
                List.of()
        );
    }

    public record CodexMissingReferenceOwnershipSummary(
            String classification,
            int unresolvedCount,
            int uniqueReferenceKeys,
            double percentageOfTotalUnresolved,
            String owner
    ) {
    }

    public record CodexDuplicateAliasImpactSummary(
            int resolvedReferences,
            int uniqueReferenceKeys,
            List<String> examples
    ) {
    }

    public record CodexPresentButFilteredReasonSummary(
            String reason,
            int unresolvedCount
    ) {
    }
}
