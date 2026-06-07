package ewshop.app.seo.audit;

import ewshop.app.seo.generation.PageCandidate;
import ewshop.app.seo.generation.ReferenceTarget;
import ewshop.domain.service.CodexFilterResult;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
public class CodexMissingReferenceAuditService {

    private static final int EXAMPLE_LIMIT = 8;
    private final CodexMissingReferenceReportRenderer reportRenderer = new CodexMissingReferenceReportRenderer();

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

                String category = CodexMissingReferencePolicy.classifyCategory(key);
                MutableCategoryStats categoryStats = categories.computeIfAbsent(
                        category,
                        ignored -> new MutableCategoryStats(category, CodexMissingReferencePolicy.profileFor(category))
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
                        .comparingInt((CodexMissingReferenceCategory category) -> CodexMissingReferencePolicy.priorityScore(category)).reversed()
                        .thenComparing(CodexMissingReferenceCategory::categoryPrefix, String.CASE_INSENSITIVE_ORDER))
                .limit(5)
                .map(category -> new CodexMissingReferencePriority(
                        category.categoryPrefix(),
                        CodexMissingReferencePolicy.priorityScore(category),
                        category.unresolvedCount(),
                        category.hiddenPillboxesUnlockedEstimate(),
                        category.recommendation(),
                        CodexMissingReferencePolicy.priorityRationale(category)
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
                        .toList(),
                ownershipSummaries(audit),
                duplicateAliasImpact(audit),
                presentButFilteredReasons(audit)
        );
    }

    private List<CodexMissingReferenceAuditSummary.CodexMissingReferenceOwnershipSummary> ownershipSummaries(
            CodexMissingReferenceAudit audit
    ) {
        return audit.ownershipClassification().stream()
                .map(ownership -> new CodexMissingReferenceAuditSummary.CodexMissingReferenceOwnershipSummary(
                        ownership.classification(),
                        ownership.unresolvedCount(),
                        ownership.uniqueReferenceKeys(),
                        ownership.percentageOfTotalUnresolved(),
                        ownerFor(ownership.classification())
                ))
                .toList();
    }

    private CodexMissingReferenceAuditSummary.CodexDuplicateAliasImpactSummary duplicateAliasImpact(
            CodexMissingReferenceAudit audit
    ) {
        List<CodexMissingReferenceOwnershipExample> duplicateAliasExamples = audit.ownershipClassification().stream()
                .filter(ownership -> "present-but-filtered".equals(ownership.classification()))
                .flatMap(ownership -> ownership.examples().stream())
                .filter(example -> "duplicate-slug".equals(example.filterReason()))
                .filter(example -> !example.nearMatches().isEmpty())
                .sorted(Comparator
                        .comparingInt(CodexMissingReferenceOwnershipExample::unresolvedCount).reversed()
                        .thenComparing(CodexMissingReferenceOwnershipExample::referenceKey, String.CASE_INSENSITIVE_ORDER))
                .toList();

        int resolvedReferences = duplicateAliasExamples.stream()
                .mapToInt(CodexMissingReferenceOwnershipExample::unresolvedCount)
                .sum();

        return new CodexMissingReferenceAuditSummary.CodexDuplicateAliasImpactSummary(
                resolvedReferences,
                duplicateAliasExamples.size(),
                duplicateAliasExamples.stream()
                        .limit(5)
                        .map(example -> example.referenceKey() + " -> " + example.nearMatches().get(0)
                                + ": " + example.unresolvedCount())
                        .toList()
        );
    }

    private List<CodexMissingReferenceAuditSummary.CodexPresentButFilteredReasonSummary> presentButFilteredReasons(
            CodexMissingReferenceAudit audit
    ) {
        return audit.ownershipClassification().stream()
                .filter(ownership -> "present-but-filtered".equals(ownership.classification()))
                .flatMap(ownership -> ownership.filterReasons().entrySet().stream())
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed()
                        .thenComparing(Map.Entry.comparingByKey(String.CASE_INSENSITIVE_ORDER)))
                .map(entry -> new CodexMissingReferenceAuditSummary.CodexPresentButFilteredReasonSummary(
                        entry.getKey(),
                        entry.getValue()
                ))
                .toList();
    }

    private static String ownerFor(String classification) {
        return switch (classification) {
            case "absent-from-import", "near-match / present-under-other-key" -> "C# exporter / EL2 mapping";
            case "present-but-filtered" -> "EWShop codex diagnostics/filtering";
            case "internal/noise" -> "C# exporter / EL2 mapping policy";
            default -> "Needs triage";
        };
    }

    public String renderJson(CodexMissingReferenceAudit audit) {
        return reportRenderer.renderJson(audit);
    }

    public String renderMarkdown(CodexMissingReferenceAudit audit) {
        return reportRenderer.renderMarkdown(audit);
    }

    public static String classifyCategory(String referenceKey) {
        return CodexMissingReferencePolicy.classifyCategory(referenceKey);
    }

    private static String routeFor(PageCandidate candidate) {
        return candidate.canonicalRoute();
    }

    private static double percentage(int numerator, int denominator) {
        if (denominator <= 0) {
            return 100.0;
        }
        return Math.round(((double) numerator * 1000.0) / denominator) / 10.0;
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private static final class MutableCategoryStats {
        private final String categoryPrefix;
        private final CodexMissingReferencePolicy.CategoryProfile profile;
        private final LinkedHashSet<String> exampleKeys = new LinkedHashSet<>();
        private final LinkedHashSet<String> exampleSourcePages = new LinkedHashSet<>();
        private final LinkedHashMap<String, Integer> sourceKinds = new LinkedHashMap<>();
        private int unresolvedCount;

        private MutableCategoryStats(String categoryPrefix, CodexMissingReferencePolicy.CategoryProfile profile) {
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

            if (CodexMissingReferencePolicy.isInternalNoiseReference(key)) {
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
            String identity = CodexMissingReferencePolicy.nearMatchIdentity(key);
            if (identity.isBlank() || identity.equalsIgnoreCase(key)) {
                return List.of();
            }

            return importedEntryKeys.stream()
                    .filter(candidate -> !candidate.equals(key))
                    .filter(candidate -> CodexMissingReferencePolicy.nearMatchIdentity(candidate).equals(identity))
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
