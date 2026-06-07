package ewshop.app.seo.audit;

import java.util.List;
import java.util.Map;

final class CodexMissingReferenceReportRenderer {

    String renderJson(CodexMissingReferenceAuditService.CodexMissingReferenceAudit audit) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        appendNumberField(json, 1, "schemaVersion", audit.schemaVersion(), true);
        appendObjectField(json, 1, "globalStatistics", globalStatisticsJson(audit.globalStatistics()), true);
        appendArrayField(json, 1, "unresolvedReferencesByCategory",
                audit.unresolvedReferencesByCategory().stream().map(this::categoryJson).toList(), true);
        appendArrayField(json, 1, "priorityRecommendations",
                audit.priorityRecommendations().stream().map(this::priorityJson).toList(), true);
        appendArrayField(json, 1, "sourceKindAnalysis",
                audit.sourceKindAnalysis().stream().map(this::kindImpactJson).toList(), true);
        appendArrayField(json, 1, "isolatedKindAnalysis",
                audit.isolatedKindAnalysis().stream().map(this::kindImpactJson).toList(), true);
        appendArrayField(json, 1, "ownershipClassification",
                audit.ownershipClassification().stream().map(this::ownershipJson).toList(), true);
        appendArrayField(json, 1, "highValueMissingRelationshipAnalysis",
                audit.highValueMissingRelationshipAnalysis().stream().map(this::unlockJson).toList(), false);
        json.append("}\n");
        return json.toString();
    }

    String renderMarkdown(CodexMissingReferenceAuditService.CodexMissingReferenceAudit audit) {
        StringBuilder markdown = new StringBuilder();
        CodexMissingReferenceAuditService.CodexMissingReferenceGlobalStatistics stats = audit.globalStatistics();
        markdown.append("# Codex Missing References Audit\n\n");
        markdown.append("## Global statistics\n\n");
        markdown.append("- Total entries scanned: ").append(stats.totalEntriesScanned()).append('\n');
        markdown.append("- Total referenceKeys scanned: ").append(stats.totalReferenceKeysScanned()).append('\n');
        markdown.append("- Total resolved references: ").append(stats.totalResolvedReferences()).append('\n');
        markdown.append("- Total unresolved references: ").append(stats.totalUnresolvedReferences()).append('\n');
        markdown.append("- Resolution percentage: ").append(stats.resolutionPercentage()).append("%\n\n");

        markdown.append("## Priority recommendations\n\n");
        for (CodexMissingReferenceAuditService.CodexMissingReferencePriority priority : audit.priorityRecommendations()) {
            markdown.append("- ").append(priority.categoryPrefix())
                    .append(": ").append(priority.rationale())
                    .append(" Hidden pillboxes unlocked: ").append(priority.hiddenPillboxesUnlockedEstimate())
                    .append(".\n");
        }

        markdown.append("\n## Unresolved categories\n\n");
        for (CodexMissingReferenceAuditService.CodexMissingReferenceCategory category : audit.unresolvedReferencesByCategory()) {
            markdown.append("### ").append(category.categoryPrefix()).append("\n\n");
            markdown.append("- Unresolved count: ").append(category.unresolvedCount()).append('\n');
            markdown.append("- Share of unresolved: ").append(category.percentageOfTotalUnresolved()).append("%\n");
            markdown.append("- Recommendation: ").append(category.recommendation()).append('\n');
            markdown.append("- Estimated SEO/internal-linking impact: ").append(category.estimatedSeoInternalLinkingImpact()).append('\n');
            markdown.append("- Example keys: ").append(String.join(", ", category.exampleKeys())).append('\n');
            markdown.append("- Example source pages: ").append(String.join(", ", category.exampleSourcePages())).append("\n\n");
        }

        markdown.append("## Source kind analysis\n\n");
        for (CodexMissingReferenceAuditService.CodexMissingReferenceKindImpact kind : audit.sourceKindAnalysis()) {
            markdown.append("- ").append(kind.kind())
                    .append(": ").append(kind.unresolvedReferences()).append(" unresolved of ")
                    .append(kind.totalReferences()).append(" references; resolution ")
                    .append(kind.resolutionPercentage()).append("%.\n");
        }

        markdown.append("\n## Ownership classification\n\n");
        for (CodexMissingReferenceAuditService.CodexMissingReferenceOwnershipClassification ownership : audit.ownershipClassification()) {
            markdown.append("- ").append(ownership.classification())
                    .append(": ").append(ownership.unresolvedCount()).append(" unresolved reference(s) across ")
                    .append(ownership.uniqueReferenceKeys()).append(" unique key(s).");
            if (!ownership.filterReasons().isEmpty()) {
                markdown.append(" Filter reasons: ").append(ownership.filterReasons()).append('.');
            }
            markdown.append('\n');
        }

        return markdown.toString();
    }

    private static String globalStatisticsJson(CodexMissingReferenceAuditService.CodexMissingReferenceGlobalStatistics statistics) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        appendNumberField(json, 2, "totalEntriesScanned", statistics.totalEntriesScanned(), true);
        appendNumberField(json, 2, "totalReferenceKeysScanned", statistics.totalReferenceKeysScanned(), true);
        appendNumberField(json, 2, "totalResolvedReferences", statistics.totalResolvedReferences(), true);
        appendNumberField(json, 2, "totalUnresolvedReferences", statistics.totalUnresolvedReferences(), true);
        appendNumberField(json, 2, "resolutionPercentage", statistics.resolutionPercentage(), false);
        json.append(indent(1)).append("}");
        return json.toString();
    }

    private String categoryJson(CodexMissingReferenceAuditService.CodexMissingReferenceCategory category) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        appendStringField(json, 3, "categoryPrefix", category.categoryPrefix(), true);
        appendNumberField(json, 3, "unresolvedCount", category.unresolvedCount(), true);
        appendNumberField(json, 3, "percentageOfTotalUnresolved", category.percentageOfTotalUnresolved(), true);
        appendArrayField(json, 3, "exampleKeys", stringsJson(category.exampleKeys()), true);
        appendArrayField(json, 3, "exampleSourcePages", stringsJson(category.exampleSourcePages()), true);
        appendStringField(json, 3, "estimatedSeoInternalLinkingImpact", category.estimatedSeoInternalLinkingImpact(), true);
        appendStringField(json, 3, "recommendation", category.recommendation(), true);
        appendNumberField(json, 3, "hiddenPillboxesUnlockedEstimate", category.hiddenPillboxesUnlockedEstimate(), true);
        appendStringField(json, 3, "thinContentRiskReductionEstimate", category.thinContentRiskReductionEstimate(), true);
        appendObjectField(json, 3, "sourceKinds", countsJson(category.sourceKinds()), false);
        json.append(indent(2)).append("}");
        return json.toString();
    }

    private String priorityJson(CodexMissingReferenceAuditService.CodexMissingReferencePriority priority) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        appendStringField(json, 3, "categoryPrefix", priority.categoryPrefix(), true);
        appendNumberField(json, 3, "priorityScore", priority.priorityScore(), true);
        appendNumberField(json, 3, "unresolvedCount", priority.unresolvedCount(), true);
        appendNumberField(json, 3, "hiddenPillboxesUnlockedEstimate", priority.hiddenPillboxesUnlockedEstimate(), true);
        appendStringField(json, 3, "recommendation", priority.recommendation(), true);
        appendStringField(json, 3, "rationale", priority.rationale(), false);
        json.append(indent(2)).append("}");
        return json.toString();
    }

    private String kindImpactJson(CodexMissingReferenceAuditService.CodexMissingReferenceKindImpact kind) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        appendStringField(json, 3, "kind", kind.kind(), true);
        appendNumberField(json, 3, "entriesScanned", kind.entriesScanned(), true);
        appendNumberField(json, 3, "totalReferences", kind.totalReferences(), true);
        appendNumberField(json, 3, "resolvedReferences", kind.resolvedReferences(), true);
        appendNumberField(json, 3, "unresolvedReferences", kind.unresolvedReferences(), true);
        appendNumberField(json, 3, "resolutionPercentage", kind.resolutionPercentage(), true);
        appendStringField(json, 3, "isolationRisk", kind.isolationRisk(), false);
        json.append(indent(2)).append("}");
        return json.toString();
    }

    private String unlockJson(CodexMissingReferenceAuditService.CodexMissingReferenceUnlock unlock) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        appendStringField(json, 3, "categoryPrefix", unlock.categoryPrefix(), true);
        appendNumberField(json, 3, "hiddenPillboxesUnlockedEstimate", unlock.hiddenPillboxesUnlockedEstimate(), true);
        appendStringField(json, 3, "thinContentRiskReductionEstimate", unlock.thinContentRiskReductionEstimate(), true);
        appendArrayField(json, 3, "examplePagesUnlocked", stringsJson(unlock.examplePagesUnlocked()), false);
        json.append(indent(2)).append("}");
        return json.toString();
    }

    private String ownershipJson(CodexMissingReferenceAuditService.CodexMissingReferenceOwnershipClassification ownership) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        appendStringField(json, 3, "classification", ownership.classification(), true);
        appendNumberField(json, 3, "unresolvedCount", ownership.unresolvedCount(), true);
        appendNumberField(json, 3, "uniqueReferenceKeys", ownership.uniqueReferenceKeys(), true);
        appendNumberField(json, 3, "percentageOfTotalUnresolved", ownership.percentageOfTotalUnresolved(), true);
        appendObjectField(json, 3, "filterReasons", countsJson(ownership.filterReasons()), true);
        appendArrayField(json, 3, "examples",
                ownership.examples().stream().map(this::ownershipExampleJson).toList(), false);
        json.append(indent(2)).append("}");
        return json.toString();
    }

    private String ownershipExampleJson(CodexMissingReferenceAuditService.CodexMissingReferenceOwnershipExample example) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        appendStringField(json, 4, "referenceKey", example.referenceKey(), true);
        appendNumberField(json, 4, "unresolvedCount", example.unresolvedCount(), true);
        appendStringField(json, 4, "categoryPrefix", example.categoryPrefix(), true);
        appendStringField(json, 4, "filterReason", example.filterReason(), true);
        appendArrayField(json, 4, "nearMatches", stringsJson(example.nearMatches()), true);
        appendArrayField(json, 4, "exampleSourcePages", stringsJson(example.exampleSourcePages()), false);
        json.append(indent(3)).append("}");
        return json.toString();
    }

    private static List<String> stringsJson(List<String> values) {
        return values.stream()
                .map(value -> "\"" + escapeJson(value) + "\"")
                .toList();
    }

    private static String countsJson(Map<String, Integer> counts) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        List<Map.Entry<String, Integer>> entries = counts.entrySet().stream()
                .sorted(Map.Entry.comparingByKey(String.CASE_INSENSITIVE_ORDER))
                .toList();
        for (int index = 0; index < entries.size(); index++) {
            Map.Entry<String, Integer> entry = entries.get(index);
            appendNumberField(json, 4, entry.getKey(), entry.getValue(), index < entries.size() - 1);
        }
        json.append(indent(3)).append("}");
        return json.toString();
    }

    private static void appendStringField(StringBuilder json, int level, String field, String value, boolean comma) {
        json.append(indent(level))
                .append('"').append(escapeJson(field)).append("\": \"")
                .append(escapeJson(value))
                .append('"');
        appendLineEnding(json, comma);
    }

    private static void appendNumberField(StringBuilder json, int level, String field, Number value, boolean comma) {
        json.append(indent(level))
                .append('"').append(escapeJson(field)).append("\": ")
                .append(value);
        appendLineEnding(json, comma);
    }

    private static void appendObjectField(StringBuilder json, int level, String field, String objectJson, boolean comma) {
        json.append(indent(level))
                .append('"').append(escapeJson(field)).append("\": ")
                .append(objectJson);
        appendLineEnding(json, comma);
    }

    private static void appendArrayField(StringBuilder json, int level, String field, List<String> entries, boolean comma) {
        json.append(indent(level)).append('"').append(escapeJson(field)).append("\": ");
        if (entries.isEmpty()) {
            json.append("[]");
            appendLineEnding(json, comma);
            return;
        }

        json.append("[\n");
        for (int index = 0; index < entries.size(); index++) {
            json.append(indent(level + 1)).append(entries.get(index));
            appendLineEnding(json, index < entries.size() - 1);
        }
        json.append(indent(level)).append("]");
        appendLineEnding(json, comma);
    }

    private static void appendLineEnding(StringBuilder json, boolean comma) {
        if (comma) {
            json.append(',');
        }
        json.append('\n');
    }

    private static String indent(int level) {
        return "    ".repeat(level);
    }

    private static String escapeJson(String value) {
        return trimToEmpty(value)
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
