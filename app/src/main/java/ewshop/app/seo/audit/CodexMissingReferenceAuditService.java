package ewshop.app.seo.audit;

import ewshop.app.seo.generation.PageCandidate;
import ewshop.app.seo.generation.ReferenceTarget;
import ewshop.app.seo.generation.SeoRoutes;
import ewshop.domain.service.CodexFilterResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class CodexMissingReferenceAuditService {

    private static final int EXAMPLE_LIMIT = 8;
    private static final List<Pattern> INTERNAL_NOISE_PATTERNS = List.of(
            Pattern.compile("^UnitAbility_LandMovement$", Pattern.CASE_INSENSITIVE),
            Pattern.compile("^UnitAbility_Class_.*$", Pattern.CASE_INSENSITIVE),
            Pattern.compile("^UnitAbility_Hero_.*Trad$", Pattern.CASE_INSENSITIVE),
            Pattern.compile("^UnitAbility_Hero_BattleAbility_Equipment_.*$", Pattern.CASE_INSENSITIVE),
            Pattern.compile("^UnitAbility_Prototype_.*$", Pattern.CASE_INSENSITIVE),
            Pattern.compile("^UnitAbility_Break.*UnitDamage$", Pattern.CASE_INSENSITIVE)
    );
    private static final List<CategoryProfile> CATEGORY_PROFILES = List.of(
            new CategoryProfile("DistrictImprovement", "public SEO/indexable pages", "High", "Medium",
                    "District improvements can support standalone discovery pages and dense district-to-improvement links.", 92),
            new CategoryProfile("Technology", "public SEO/indexable pages", "High", "Low",
                    "Technologies already fit the generated encyclopedia model and create strong crawl paths from unlock relationships.", 90),
            new CategoryProfile("District", "public SEO/indexable pages", "High", "Low",
                    "District references are high-intent game concepts with clear standalone page value.", 88),
            new CategoryProfile("Resource", "public SEO/indexable pages", "High", "Medium",
                    "Resources connect economy, district, improvement, and population concepts across the graph.", 84),
            new CategoryProfile("UnitClass", "related-link-only semantic entities", "Medium", "Low",
                    "Unit classes are useful hubs for relationship labels, but may not need full pages until richer copy exists.", 72),
            new CategoryProfile("PopulationCategory", "public SEO/indexable pages", "Medium", "Medium",
                    "Population categories can reduce thin-content risk by explaining city and faction systems.", 70),
            new CategoryProfile("UnitAbility", "related-link-only semantic entities", "High", "Medium",
                    "Unit abilities unlock many visible related links from unit pages, but often need aggregation before indexing.", 82),
            new CategoryProfile("BattleAbility", "related-link-only semantic entities", "High", "Medium",
                    "Battle abilities are link-dense combat concepts best introduced as semantic entities first.", 80),
            new CategoryProfile("ActiveSkill", "related-link-only semantic entities", "High", "Medium",
                    "Active skills can expose hidden combat and hero relationships without requiring public pages immediately.", 78),
            new CategoryProfile("Effect", "metadata-only/non-public entities", "Medium", "Low",
                    "Effects are usually implementation-level mechanics that can enrich metadata without standalone pages.", 56),
            new CategoryProfile("Descriptor", "metadata-only/non-public entities", "Low", "Low",
                    "Descriptors are better treated as tags or facets than crawlable pages.", 34),
            new CategoryProfile("Tag", "metadata-only/non-public entities", "Low", "Low",
                    "Tags improve classification and filtering, but rarely carry enough standalone SEO intent.", 32),
            new CategoryProfile("Shape", "metadata-only/non-public entities", "Low", "Low",
                    "Shapes are tactical metadata and should primarily support structured relationships.", 30),
            new CategoryProfile("FactionTrait", "related-link-only semantic entities", "Medium", "Medium",
                    "Faction traits are strong semantic connectors, but should become indexable only when descriptive content exists.", 68),
            new CategoryProfile("FactionAffinity", "related-link-only semantic entities", "Medium", "Medium",
                    "Faction affinities can connect factions, traits, and abilities while staying internal at first.", 64)
    );
    private static final Map<String, CategoryProfile> PROFILES_BY_PREFIX = buildProfilesByPrefix();

    public CodexMissingReferenceAudit generate(
            List<PageCandidate> candidates,
            Map<String, ReferenceTarget> referenceTargetsByEntryKey
    ) {
        return generate(candidates, referenceTargetsByEntryKey, null);
    }

    public CodexMissingReferenceAudit generate(
            List<PageCandidate> candidates,
            Map<String, ReferenceTarget> referenceTargetsByEntryKey,
            CodexFilterResult filterResult
    ) {
        ReferenceAvailabilityCatalog availabilityCatalog = ReferenceAvailabilityCatalog.from(filterResult);
        List<PageCandidate> orderedCandidates = candidates.stream()
                .sorted(Comparator
                        .comparing(PageCandidate::kind, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(PageCandidate::displayName, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(PageCandidate::entryKey, String.CASE_INSENSITIVE_ORDER))
                .toList();

        LinkedHashMap<String, MutableCategoryStats> categories = new LinkedHashMap<>();
        LinkedHashMap<String, MutableOwnershipStats> ownership = new LinkedHashMap<>();
        LinkedHashMap<String, MutableKindStats> sourceKinds = new LinkedHashMap<>();
        int totalReferences = 0;
        int resolvedReferences = 0;

        for (PageCandidate candidate : orderedCandidates) {
            MutableKindStats kindStats = sourceKinds.computeIfAbsent(
                    candidate.kind(),
                    ignored -> new MutableKindStats(candidate.kind())
            );
            kindStats.entriesScanned++;

            for (String referenceKey : candidate.referenceKeys()) {
                String key = trimToEmpty(referenceKey);
                if (key.isBlank()) {
                    continue;
                }

                totalReferences++;
                kindStats.totalReferences++;
                if (referenceTargetsByEntryKey.containsKey(key)) {
                    resolvedReferences++;
                    kindStats.resolvedReferences++;
                    continue;
                }

                String category = classifyCategory(key);
                MutableCategoryStats categoryStats = categories.computeIfAbsent(
                        category,
                        ignored -> new MutableCategoryStats(category, profileFor(category))
                );
                categoryStats.unresolvedCount++;
                categoryStats.exampleKeys.add(key);
                categoryStats.exampleSourcePages.add(routeFor(candidate));
                categoryStats.sourceKinds.merge(candidate.kind(), 1, Integer::sum);
                kindStats.unresolvedReferences++;

                ReferenceOwnership ownershipClassification = availabilityCatalog.classify(key);
                MutableOwnershipStats ownershipStats = ownership.computeIfAbsent(
                        ownershipClassification.classification(),
                        ignored -> new MutableOwnershipStats(ownershipClassification.classification())
                );
                ownershipStats.record(key, category, ownershipClassification, routeFor(candidate));
            }
        }

        int unresolvedReferences = totalReferences - resolvedReferences;
        List<CodexMissingReferenceCategory> categoryReports = categories.values().stream()
                .map(stats -> stats.toReport(unresolvedReferences))
                .sorted(Comparator
                        .comparingInt(CodexMissingReferenceCategory::unresolvedCount).reversed()
                        .thenComparing(CodexMissingReferenceCategory::categoryPrefix, String.CASE_INSENSITIVE_ORDER))
                .toList();

        List<CodexMissingReferenceKindImpact> sourceKindReports = sourceKinds.values().stream()
                .map(MutableKindStats::toReport)
                .sorted(Comparator
                        .comparingInt(CodexMissingReferenceKindImpact::unresolvedReferences).reversed()
                        .thenComparing(CodexMissingReferenceKindImpact::kind, String.CASE_INSENSITIVE_ORDER))
                .toList();

        List<CodexMissingReferenceKindImpact> isolatedKinds = sourceKindReports.stream()
                .filter(kind -> kind.totalReferences() > 0)
                .sorted(Comparator
                        .comparingInt(CodexMissingReferenceKindImpact::resolvedReferences)
                        .thenComparing(Comparator.comparingInt(CodexMissingReferenceKindImpact::unresolvedReferences).reversed())
                        .thenComparing(CodexMissingReferenceKindImpact::kind, String.CASE_INSENSITIVE_ORDER))
                .toList();

        List<CodexMissingReferencePriority> priorities = categoryReports.stream()
                .sorted(Comparator
                        .comparingInt((CodexMissingReferenceCategory category) -> priorityScore(category)).reversed()
                        .thenComparing(CodexMissingReferenceCategory::categoryPrefix, String.CASE_INSENSITIVE_ORDER))
                .limit(5)
                .map(category -> new CodexMissingReferencePriority(
                        category.categoryPrefix(),
                        priorityScore(category),
                        category.unresolvedCount(),
                        category.hiddenPillboxesUnlockedEstimate(),
                        category.recommendation(),
                        priorityRationale(category)
                ))
                .toList();

        return new CodexMissingReferenceAudit(
                2,
                new CodexMissingReferenceGlobalStatistics(
                        orderedCandidates.size(),
                        totalReferences,
                        resolvedReferences,
                        unresolvedReferences,
                        percentage(resolvedReferences, totalReferences)
                ),
                categoryReports,
                priorities,
                sourceKindReports,
                isolatedKinds,
                ownership.values().stream()
                        .map(stats -> stats.toReport(unresolvedReferences))
                        .sorted(Comparator
                                .comparingInt(CodexMissingReferenceOwnershipClassification::unresolvedCount).reversed()
                                .thenComparing(CodexMissingReferenceOwnershipClassification::classification, String.CASE_INSENSITIVE_ORDER))
                        .toList(),
                categoryReports.stream()
                        .map(category -> new CodexMissingReferenceUnlock(
                                category.categoryPrefix(),
                                category.hiddenPillboxesUnlockedEstimate(),
                                category.thinContentRiskReductionEstimate(),
                                category.exampleSourcePages()
                        ))
                        .toList()
        );
    }

    public CodexMissingReferenceAuditSummary summarize(CodexMissingReferenceAudit audit) {
        return new CodexMissingReferenceAuditSummary(
                "codex-missing-references-audit.json",
                audit.globalStatistics().totalUnresolvedReferences(),
                audit.globalStatistics().resolutionPercentage(),
                audit.unresolvedReferencesByCategory().stream()
                        .limit(5)
                        .map(category -> category.categoryPrefix() + ": " + category.unresolvedCount())
                        .toList()
        );
    }

    public String renderJson(CodexMissingReferenceAudit audit) {
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

    public String renderMarkdown(CodexMissingReferenceAudit audit) {
        StringBuilder markdown = new StringBuilder();
        CodexMissingReferenceGlobalStatistics stats = audit.globalStatistics();
        markdown.append("# Codex Missing References Audit\n\n");
        markdown.append("## Global statistics\n\n");
        markdown.append("- Total entries scanned: ").append(stats.totalEntriesScanned()).append('\n');
        markdown.append("- Total referenceKeys scanned: ").append(stats.totalReferenceKeysScanned()).append('\n');
        markdown.append("- Total resolved references: ").append(stats.totalResolvedReferences()).append('\n');
        markdown.append("- Total unresolved references: ").append(stats.totalUnresolvedReferences()).append('\n');
        markdown.append("- Resolution percentage: ").append(stats.resolutionPercentage()).append("%\n\n");

        markdown.append("## Priority recommendations\n\n");
        for (CodexMissingReferencePriority priority : audit.priorityRecommendations()) {
            markdown.append("- ").append(priority.categoryPrefix())
                    .append(": ").append(priority.rationale())
                    .append(" Hidden pillboxes unlocked: ").append(priority.hiddenPillboxesUnlockedEstimate())
                    .append(".\n");
        }

        markdown.append("\n## Unresolved categories\n\n");
        for (CodexMissingReferenceCategory category : audit.unresolvedReferencesByCategory()) {
            markdown.append("### ").append(category.categoryPrefix()).append("\n\n");
            markdown.append("- Unresolved count: ").append(category.unresolvedCount()).append('\n');
            markdown.append("- Share of unresolved: ").append(category.percentageOfTotalUnresolved()).append("%\n");
            markdown.append("- Recommendation: ").append(category.recommendation()).append('\n');
            markdown.append("- Estimated SEO/internal-linking impact: ").append(category.estimatedSeoInternalLinkingImpact()).append('\n');
            markdown.append("- Example keys: ").append(String.join(", ", category.exampleKeys())).append('\n');
            markdown.append("- Example source pages: ").append(String.join(", ", category.exampleSourcePages())).append("\n\n");
        }

        markdown.append("## Source kind analysis\n\n");
        for (CodexMissingReferenceKindImpact kind : audit.sourceKindAnalysis()) {
            markdown.append("- ").append(kind.kind())
                    .append(": ").append(kind.unresolvedReferences()).append(" unresolved of ")
                    .append(kind.totalReferences()).append(" references; resolution ")
                    .append(kind.resolutionPercentage()).append("%.\n");
        }

        markdown.append("\n## Ownership classification\n\n");
        for (CodexMissingReferenceOwnershipClassification ownership : audit.ownershipClassification()) {
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

    public static String classifyCategory(String referenceKey) {
        String key = trimToEmpty(referenceKey);
        for (CategoryProfile profile : CATEGORY_PROFILES) {
            if (key.equals(profile.prefix()) || key.startsWith(profile.prefix() + "_")) {
                return profile.prefix();
            }
        }

        int underscoreIndex = key.indexOf('_');
        if (underscoreIndex > 0) {
            return key.substring(0, underscoreIndex);
        }
        return "Unclassified";
    }

    private static Map<String, CategoryProfile> buildProfilesByPrefix() {
        LinkedHashMap<String, CategoryProfile> profiles = new LinkedHashMap<>();
        for (CategoryProfile profile : CATEGORY_PROFILES) {
            profiles.put(profile.prefix(), profile);
        }
        return Map.copyOf(profiles);
    }

    private static CategoryProfile profileFor(String category) {
        return PROFILES_BY_PREFIX.getOrDefault(
                category,
                new CategoryProfile(
                        category,
                        "related-link-only semantic entities",
                        "Medium",
                        "Unknown",
                        "Unclassified references should be inspected before deciding whether they deserve public pages.",
                        48
                )
        );
    }

    private static int priorityScore(CodexMissingReferenceCategory category) {
        CategoryProfile profile = profileFor(category.categoryPrefix());
        int volumeScore = Math.min(40, category.unresolvedCount() * 4);
        int complexityPenalty = switch (profile.implementationComplexity()) {
            case "Low" -> 0;
            case "Medium" -> 8;
            default -> 14;
        };
        return Math.max(0, profile.basePriorityScore() + volumeScore - complexityPenalty);
    }

    private static String priorityRationale(CodexMissingReferenceCategory category) {
        return category.categoryPrefix() + " would restore about "
                + category.hiddenPillboxesUnlockedEstimate()
                + " hidden related-link pillbox(es), has "
                + category.estimatedSeoInternalLinkingImpact().toLowerCase(Locale.ROOT)
                + ", and is recommended as "
                + category.recommendation()
                + ".";
    }

    private static String routeFor(PageCandidate candidate) {
        return SeoRoutes.routeFor(candidate.kind(), candidate.slug());
    }

    private static double percentage(int numerator, int denominator) {
        if (denominator <= 0) {
            return 100.0;
        }
        return Math.round(((double) numerator * 1000.0) / denominator) / 10.0;
    }

    private static String globalStatisticsJson(CodexMissingReferenceGlobalStatistics statistics) {
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

    private String categoryJson(CodexMissingReferenceCategory category) {
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

    private String priorityJson(CodexMissingReferencePriority priority) {
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

    private String kindImpactJson(CodexMissingReferenceKindImpact kind) {
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

    private String unlockJson(CodexMissingReferenceUnlock unlock) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        appendStringField(json, 3, "categoryPrefix", unlock.categoryPrefix(), true);
        appendNumberField(json, 3, "hiddenPillboxesUnlockedEstimate", unlock.hiddenPillboxesUnlockedEstimate(), true);
        appendStringField(json, 3, "thinContentRiskReductionEstimate", unlock.thinContentRiskReductionEstimate(), true);
        appendArrayField(json, 3, "examplePagesUnlocked", stringsJson(unlock.examplePagesUnlocked()), false);
        json.append(indent(2)).append("}");
        return json.toString();
    }

    private String ownershipJson(CodexMissingReferenceOwnershipClassification ownership) {
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

    private String ownershipExampleJson(CodexMissingReferenceOwnershipExample example) {
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

    private static boolean isInternalNoiseReference(String referenceKey) {
        String key = trimToEmpty(referenceKey);
        return INTERNAL_NOISE_PATTERNS.stream().anyMatch(pattern -> pattern.matcher(key).matches());
    }

    private static String nearMatchIdentity(String key) {
        String normalized = trimToEmpty(key).toLowerCase(Locale.ROOT);
        String[] prefixes = {
                "minorfaction_",
                "population_minor_",
                "hero_minorfaction_",
                "elder_minorfaction_",
                "unitability_",
                "unitdescriptor_",
                "herodescriptor_",
                "effect_",
                "tag_"
        };
        for (String prefix : prefixes) {
            if (normalized.startsWith(prefix)) {
                return normalized.substring(prefix.length());
            }
        }
        return normalized;
    }

    private record CategoryProfile(
            String prefix,
            String recommendation,
            String seoImpact,
            String implementationComplexity,
            String impactDescription,
            int basePriorityScore
    ) {
    }

    private static final class MutableCategoryStats {
        private final String categoryPrefix;
        private final CategoryProfile profile;
        private final LinkedHashSet<String> exampleKeys = new LinkedHashSet<>();
        private final LinkedHashSet<String> exampleSourcePages = new LinkedHashSet<>();
        private final LinkedHashMap<String, Integer> sourceKinds = new LinkedHashMap<>();
        private int unresolvedCount;

        private MutableCategoryStats(String categoryPrefix, CategoryProfile profile) {
            this.categoryPrefix = categoryPrefix;
            this.profile = profile;
        }

        private CodexMissingReferenceCategory toReport(int totalUnresolved) {
            return new CodexMissingReferenceCategory(
                    categoryPrefix,
                    unresolvedCount,
                    percentage(unresolvedCount, totalUnresolved),
                    exampleKeys.stream().sorted(String.CASE_INSENSITIVE_ORDER).limit(EXAMPLE_LIMIT).toList(),
                    exampleSourcePages.stream().sorted(String.CASE_INSENSITIVE_ORDER).limit(EXAMPLE_LIMIT).toList(),
                    profile.seoImpact() + " impact. " + profile.impactDescription(),
                    profile.recommendation(),
                    unresolvedCount,
                    thinContentRiskReductionEstimate(),
                    Map.copyOf(sourceKinds)
            );
        }

        private String thinContentRiskReductionEstimate() {
            return switch (profile.recommendation()) {
                case "public SEO/indexable pages" -> profile.seoImpact() + " reduction if pages have unique descriptions.";
                case "related-link-only semantic entities" -> "Medium reduction through richer related sections and graph density.";
                default -> "Low direct reduction; useful mostly for metadata completeness.";
            };
        }
    }

    private record ReferenceOwnership(
            String classification,
            String filterReason,
            List<String> nearMatches
    ) {
    }

    private static final class ReferenceAvailabilityCatalog {
        private static final String ABSENT_FROM_IMPORT = "absent-from-import";
        private static final String PRESENT_BUT_FILTERED = "present-but-filtered";
        private static final String NEAR_MATCH = "near-match / present-under-other-key";
        private static final String INTERNAL_NOISE = "internal/noise";

        private final Map<String, CodexFilterResult.CodexFilterSkip> filteredByEntryKey;
        private final List<String> importedEntryKeys;

        private ReferenceAvailabilityCatalog(
                Map<String, CodexFilterResult.CodexFilterSkip> filteredByEntryKey,
                List<String> importedEntryKeys
        ) {
            this.filteredByEntryKey = filteredByEntryKey;
            this.importedEntryKeys = importedEntryKeys;
        }

        private static ReferenceAvailabilityCatalog from(CodexFilterResult filterResult) {
            if (filterResult == null) {
                return new ReferenceAvailabilityCatalog(Map.of(), List.of());
            }

            LinkedHashMap<String, CodexFilterResult.CodexFilterSkip> filteredByEntryKey = new LinkedHashMap<>();
            LinkedHashSet<String> importedEntryKeys = new LinkedHashSet<>();

            filterResult.entries().forEach(entry -> {
                String key = trimToEmpty(entry.entry().getEntryKey());
                if (!key.isBlank()) {
                    importedEntryKeys.add(key);
                }
            });

            filterResult.skippedEntries().forEach(skip -> {
                String key = trimToEmpty(skip.entryKey());
                if (!key.isBlank()) {
                    importedEntryKeys.add(key);
                    filteredByEntryKey.put(key, skip);
                }
            });

            return new ReferenceAvailabilityCatalog(
                    Map.copyOf(filteredByEntryKey),
                    importedEntryKeys.stream().sorted(String.CASE_INSENSITIVE_ORDER).toList()
            );
        }

        private ReferenceOwnership classify(String referenceKey) {
            String key = trimToEmpty(referenceKey);
            CodexFilterResult.CodexFilterSkip filteredEntry = filteredByEntryKey.get(key);
            if (filteredEntry != null) {
                String relationTargetEntryKey = trimToEmpty(filteredEntry.relationTargetEntryKey());
                return new ReferenceOwnership(
                        PRESENT_BUT_FILTERED,
                        filteredEntry.reason(),
                        relationTargetEntryKey.isBlank() ? List.of() : List.of(relationTargetEntryKey)
                );
            }

            if (isInternalNoiseReference(key)) {
                return new ReferenceOwnership(INTERNAL_NOISE, "", List.of());
            }

            List<String> nearMatches = nearMatchesFor(key);
            if (!nearMatches.isEmpty()) {
                return new ReferenceOwnership(NEAR_MATCH, "", nearMatches);
            }

            return new ReferenceOwnership(ABSENT_FROM_IMPORT, "", List.of());
        }

        private List<String> nearMatchesFor(String referenceKey) {
            String key = trimToEmpty(referenceKey);
            String identity = nearMatchIdentity(key);
            if (identity.isBlank() || identity.equalsIgnoreCase(key)) {
                return List.of();
            }

            return importedEntryKeys.stream()
                    .filter(candidate -> !candidate.equals(key))
                    .filter(candidate -> nearMatchIdentity(candidate).equals(identity))
                    .limit(EXAMPLE_LIMIT)
                    .toList();
        }
    }

    private static final class MutableOwnershipStats {
        private final String classification;
        private final LinkedHashMap<String, MutableOwnershipExample> examplesByKey = new LinkedHashMap<>();
        private final LinkedHashMap<String, Integer> filterReasons = new LinkedHashMap<>();
        private int unresolvedCount;

        private MutableOwnershipStats(String classification) {
            this.classification = classification;
        }

        private void record(
                String referenceKey,
                String categoryPrefix,
                ReferenceOwnership ownership,
                String sourcePage
        ) {
            unresolvedCount++;
            if (!ownership.filterReason().isBlank()) {
                filterReasons.merge(ownership.filterReason(), 1, Integer::sum);
            }
            examplesByKey.computeIfAbsent(
                    referenceKey,
                    key -> new MutableOwnershipExample(referenceKey, categoryPrefix, ownership)
            ).record(sourcePage);
        }

        private CodexMissingReferenceOwnershipClassification toReport(int totalUnresolved) {
            return new CodexMissingReferenceOwnershipClassification(
                    classification,
                    unresolvedCount,
                    examplesByKey.size(),
                    percentage(unresolvedCount, totalUnresolved),
                    Map.copyOf(filterReasons),
                    examplesByKey.values().stream()
                            .sorted(Comparator
                                    .comparingInt(MutableOwnershipExample::unresolvedCount).reversed()
                                    .thenComparing(MutableOwnershipExample::referenceKey, String.CASE_INSENSITIVE_ORDER))
                            .limit(EXAMPLE_LIMIT)
                            .map(MutableOwnershipExample::toReport)
                            .toList()
            );
        }
    }

    private static final class MutableOwnershipExample {
        private final String referenceKey;
        private final String categoryPrefix;
        private final String filterReason;
        private final List<String> nearMatches;
        private final LinkedHashSet<String> exampleSourcePages = new LinkedHashSet<>();
        private int unresolvedCount;

        private MutableOwnershipExample(
                String referenceKey,
                String categoryPrefix,
                ReferenceOwnership ownership
        ) {
            this.referenceKey = referenceKey;
            this.categoryPrefix = categoryPrefix;
            this.filterReason = ownership.filterReason();
            this.nearMatches = ownership.nearMatches();
        }

        private void record(String sourcePage) {
            unresolvedCount++;
            exampleSourcePages.add(sourcePage);
        }

        private int unresolvedCount() {
            return unresolvedCount;
        }

        private String referenceKey() {
            return referenceKey;
        }

        private CodexMissingReferenceOwnershipExample toReport() {
            return new CodexMissingReferenceOwnershipExample(
                    referenceKey,
                    unresolvedCount,
                    categoryPrefix,
                    filterReason,
                    nearMatches,
                    exampleSourcePages.stream()
                            .sorted(String.CASE_INSENSITIVE_ORDER)
                            .limit(EXAMPLE_LIMIT)
                            .toList()
            );
        }
    }

    private static final class MutableKindStats {
        private final String kind;
        private int entriesScanned;
        private int totalReferences;
        private int resolvedReferences;
        private int unresolvedReferences;

        private MutableKindStats(String kind) {
            this.kind = kind;
        }

        private CodexMissingReferenceKindImpact toReport() {
            return new CodexMissingReferenceKindImpact(
                    kind,
                    entriesScanned,
                    totalReferences,
                    resolvedReferences,
                    unresolvedReferences,
                    percentage(resolvedReferences, totalReferences),
                    isolationRisk()
            );
        }

        private String isolationRisk() {
            if (totalReferences == 0) {
                return "No outbound referenceKeys found.";
            }
            if (resolvedReferences == 0) {
                return "High: all outbound related-link opportunities are currently hidden.";
            }
            if (unresolvedReferences > resolvedReferences) {
                return "Medium: most outbound related-link opportunities are hidden.";
            }
            return "Low: this kind has more resolved than unresolved relationships.";
        }
    }

    public record CodexMissingReferenceAudit(
            int schemaVersion,
            CodexMissingReferenceGlobalStatistics globalStatistics,
            List<CodexMissingReferenceCategory> unresolvedReferencesByCategory,
            List<CodexMissingReferencePriority> priorityRecommendations,
            List<CodexMissingReferenceKindImpact> sourceKindAnalysis,
            List<CodexMissingReferenceKindImpact> isolatedKindAnalysis,
            List<CodexMissingReferenceOwnershipClassification> ownershipClassification,
            List<CodexMissingReferenceUnlock> highValueMissingRelationshipAnalysis
    ) {
    }

    public record CodexMissingReferenceGlobalStatistics(
            int totalEntriesScanned,
            int totalReferenceKeysScanned,
            int totalResolvedReferences,
            int totalUnresolvedReferences,
            double resolutionPercentage
    ) {
    }

    public record CodexMissingReferenceCategory(
            String categoryPrefix,
            int unresolvedCount,
            double percentageOfTotalUnresolved,
            List<String> exampleKeys,
            List<String> exampleSourcePages,
            String estimatedSeoInternalLinkingImpact,
            String recommendation,
            int hiddenPillboxesUnlockedEstimate,
            String thinContentRiskReductionEstimate,
            Map<String, Integer> sourceKinds
    ) {
    }

    public record CodexMissingReferencePriority(
            String categoryPrefix,
            int priorityScore,
            int unresolvedCount,
            int hiddenPillboxesUnlockedEstimate,
            String recommendation,
            String rationale
    ) {
    }

    public record CodexMissingReferenceKindImpact(
            String kind,
            int entriesScanned,
            int totalReferences,
            int resolvedReferences,
            int unresolvedReferences,
            double resolutionPercentage,
            String isolationRisk
    ) {
    }

    public record CodexMissingReferenceUnlock(
            String categoryPrefix,
            int hiddenPillboxesUnlockedEstimate,
            String thinContentRiskReductionEstimate,
            List<String> examplePagesUnlocked
    ) {
    }

    public record CodexMissingReferenceOwnershipClassification(
            String classification,
            int unresolvedCount,
            int uniqueReferenceKeys,
            double percentageOfTotalUnresolved,
            Map<String, Integer> filterReasons,
            List<CodexMissingReferenceOwnershipExample> examples
    ) {
    }

    public record CodexMissingReferenceOwnershipExample(
            String referenceKey,
            int unresolvedCount,
            String categoryPrefix,
            String filterReason,
            List<String> nearMatches,
            List<String> exampleSourcePages
    ) {
    }
}
