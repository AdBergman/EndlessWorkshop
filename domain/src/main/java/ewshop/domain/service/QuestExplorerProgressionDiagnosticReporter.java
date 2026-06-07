package ewshop.domain.service;

import ewshop.domain.model.quest.QuestExplorer;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

public final class QuestExplorerProgressionDiagnosticReporter {

    private static final String STEP_KIND_REAL_ENTRY_BACKED = "real_entry_backed";
    private static final String STEP_KIND_VIRTUAL_ALIAS_EXPANDED = "virtual_alias_expanded";
    private static final String STEP_KIND_BRANCH_VARIANT_ONLY = "branch_variant_only";
    private static final String VARIANT_KIND_BRANCH_VARIANT = "branch_variant";

    private QuestExplorerProgressionDiagnosticReporter() {}

    public static String createReport(QuestExplorer explorer) {
        List<QuestExplorer.Entry> entries = safeList(explorer == null ? null : explorer.entries());
        QuestExplorer.Progression progression = explorer == null ? QuestExplorerProgressionProjector.project(null) :
                explorer.progression() == null ? QuestExplorerProgressionProjector.project(explorer) : explorer.progression();
        QuestExplorer.ProgressionDebugSummary debug = progression.debugSummary();
        List<QuestExplorer.Questline> questlines = sortedQuestlines(progression.questlines());
        List<String> invalidLinks = invalidNextAndConvergenceLinks(entries, progression);
        List<String> unassignedEntries = unassignedProgressionEntries(entries, progression);

        int totalChapters = questlines.stream().mapToInt(questline -> questline.chapters().size()).sum();
        int totalSteps = questlines.stream()
                .flatMap(questline -> questline.chapters().stream())
                .mapToInt(chapter -> chapter.steps().size())
                .sum();
        int totalVariants = questlines.stream()
                .flatMap(questline -> questline.chapters().stream())
                .flatMap(chapter -> chapter.steps().stream())
                .mapToInt(step -> step.variants().size())
                .sum();
        int realEntryBackedSteps = countStepsByKind(questlines, STEP_KIND_REAL_ENTRY_BACKED);
        int virtualAliasExpandedSteps = countStepsByKind(questlines, STEP_KIND_VIRTUAL_ALIAS_EXPANDED);
        int branchVariantOnlySteps = countStepsByKind(questlines, STEP_KIND_BRANCH_VARIANT_ONLY);
        int branchVariants = questlines.stream()
                .flatMap(questline -> questline.chapters().stream())
                .flatMap(chapter -> chapter.steps().stream())
                .flatMap(step -> step.variants().stream())
                .mapToInt(variant -> VARIANT_KIND_BRANCH_VARIANT.equals(variant.variantKind()) ? 1 : 0)
                .sum();
        int warningCount = debug.entriesWithMissingChapterOrStepOrder().size() +
                debug.chaptersWithOnlyOneStep().size() +
                debug.numericQuestlineVariantsCollapsed().size() +
                debug.suspiciousBranchVariantsWithoutParentStep().size() +
                invalidLinks.size() +
                unassignedEntries.size() +
                debug.tutorialEntriesPlaced().size() +
                debug.missingMajorFactionChapters().size();

        StringBuilder report = new StringBuilder();
        appendLine(report, "Quest Explorer Progression Diagnostic");
        appendLine(report, "Generated: deterministic");
        appendLine(report, "");
        appendLine(report, "Global:");
        appendLine(report, "  totalEntries: " + debug.totalEntries());
        appendLine(report, "  questlineFamilies: " + debug.questlineFamiliesFound().size());
        appendLine(report, "  projectedMajorQuestlines: " + projectedMajorQuestlineCount(questlines));
        appendLine(report, "  totalChapters: " + totalChapters);
        appendLine(report, "  totalSteps: " + totalSteps);
        appendLine(report, "  totalVariants: " + totalVariants);
        appendLine(report, "  realEntryBackedSteps: " + realEntryBackedSteps);
        appendLine(report, "  virtualAliasExpandedSteps: " + virtualAliasExpandedSteps);
        appendLine(report, "  branchVariantOnlySteps: " + branchVariantOnlySteps);
        appendLine(report, "  branchVariants: " + branchVariants);
        appendLine(report, "  orphanUnassignedEntries: " + unassignedEntries.size());
        appendLine(report, "  warningCount: " + warningCount);
        appendLine(report, "");
        appendLine(report, "Questlines:");
        for (QuestExplorer.Questline questline : questlines) {
            appendQuestline(report, questline);
        }
        appendLine(report, "Warnings:");
        appendWarnings(report, debug, invalidLinks, unassignedEntries);
        return report.toString();
    }

    private static void appendQuestline(StringBuilder report, QuestExplorer.Questline questline) {
        appendLine(report, "- questLineFamilyKey: " + value(questline.questLineFamilyKey()));
        appendLine(report, "  factionKey: " + value(questline.factionKey()));
        appendLine(report, "  rawQuestLineKeysCollapsed: " + csv(questline.sourceQuestLineKeys()));
        appendLine(report, "  majorFactionQuestline: " + isMajorFactionQuestline(questline));
        appendLine(report, "  chaptersFound: " + questline.chapters().stream()
                .map(QuestExplorer.Chapter::chapterOrder)
                .map(String::valueOf)
                .collect(Collectors.joining(",")));
        for (QuestExplorer.Chapter chapter : questline.chapters()) {
            appendLine(report, "  Chapter:");
            appendLine(report, "    chapterOrder: " + value(chapter.chapterOrder()));
            appendLine(report, "    chapterLabel: " + value(chapter.title()));
            appendLine(report, "    title: " + value(chapter.title()));
            appendLine(report, "    stepCount: " + chapter.steps().size());
            for (QuestExplorer.Step step : chapter.steps()) {
                appendLine(report, "    Step:");
                appendLine(report, "      stepKey: " + value(step.stepKey()));
                appendLine(report, "      stepOrder: " + value(step.stepOrder()));
                appendLine(report, "      displayStepNumber: " + value(step.stepNumber()));
                appendLine(report, "      projectionKind: " + value(step.projectionKind()));
                appendLine(report, "      detailEntryKey: " + value(step.detailEntryKey()));
                appendLine(report, "      sourceEntryKeys: " + csv(step.sourceEntryKeys()));
                appendLine(report, "      aliasEntryKeys: " + csv(step.aliasEntryKeys()));
                appendLine(report, "      variantCount: " + step.variants().size());
                appendLine(report, "      variantEntryKeys: " + csv(step.variants().stream()
                        .map(QuestExplorer.Variant::entryKey)
                        .toList()));
                for (QuestExplorer.Variant variant : step.variants()) {
                    appendLine(report, "      Variant:");
                    appendLine(report, "        entryKey: " + value(variant.entryKey()));
                    appendLine(report, "        variantKind: " + value(variant.variantKind()));
                    appendLine(report, "        branchLabel: " + value(variant.branchLabel()));
                    appendLine(report, "        branchOrder: " + value(variant.branchOrder()));
                    appendLine(report, "        nextEntryKeys: " + csv(variant.nextEntryKeys()));
                    appendLine(report, "        convergesIntoEntryKeys: " + csv(variant.convergesIntoEntryKeys()));
                }
            }
        }
    }

    private static void appendWarnings(
            StringBuilder report,
            QuestExplorer.ProgressionDebugSummary debug,
            List<String> invalidLinks,
            List<String> unassignedEntries
    ) {
        appendWarningList(report, "entriesMissingChapterOrStepOrder", debug.entriesWithMissingChapterOrStepOrder());
        appendWarningList(report, "suspiciousOneStepChapters", debug.chaptersWithOnlyOneStep().stream()
                .map(chapter -> chapter.questLineFamilyKey() + "/" + chapter.factionFamilyKey() +
                        " chapterOrder=" + chapter.chapterOrder() + " title=" + value(chapter.title()))
                .toList());
        appendWarningList(report, "numericQuestlineCollapseDecisions", debug.numericQuestlineVariantsCollapsed().stream()
                .map(collapse -> collapse.sourceQuestLineKey() + "/" + collapse.sourceFactionKey() +
                        " -> " + collapse.targetQuestLineFamilyKey() + "/" + collapse.targetFactionFamilyKey() +
                        " entries=" + collapse.entryCount() + " reason=" + collapse.reason())
                .toList());
        appendWarningList(report, "branchVariantWithoutParentStep", debug.suspiciousBranchVariantsWithoutParentStep());
        appendWarningList(report, "invalidNextOrConvergenceLinks", invalidLinks);
        appendWarningList(report, "orphanUnassignedEntries", unassignedEntries);
        appendWarningList(report, "kinTutorialPlacement", debug.tutorialEntriesPlaced());
        appendWarningList(report, "unexpectedMissingChaptersForMajorFactionQuestlines", debug.missingMajorFactionChapters().stream()
                .map(missing -> missing.questLineFamilyKey() + "/" + missing.factionFamilyKey() +
                        " missing=" + missing.missingChapterNumbers())
                .toList());
    }

    private static void appendWarningList(StringBuilder report, String title, List<String> warnings) {
        List<String> stableWarnings = safeList(warnings).stream()
                .filter(Objects::nonNull)
                .sorted()
                .toList();
        appendLine(report, "  " + title + " (" + stableWarnings.size() + "):");
        if (stableWarnings.isEmpty()) {
            appendLine(report, "    - none");
            return;
        }
        stableWarnings.forEach(warning -> appendLine(report, "    - " + warning));
    }

    private static List<String> invalidNextAndConvergenceLinks(
            List<QuestExplorer.Entry> entries,
            QuestExplorer.Progression progression
    ) {
        Set<String> validIdentities = new TreeSet<>(entriesByIdentity(entries).keySet());
        Map<String, ProgressionGroup> progressionGroupsByIdentity = progressionGroupsByIdentity(entries, progression);
        List<String> warnings = new ArrayList<>();
        for (QuestExplorer.Entry entry : entries) {
            QuestExplorer.Navigation navigation = entry.navigation();
            if (navigation != null) {
                addInvalidLinks(warnings, validIdentities, progressionGroupsByIdentity, entry.entryKey(), "navigation.nextEntryKeys", navigation.nextEntryKeys());
                addInvalidLinks(warnings, validIdentities, progressionGroupsByIdentity, entry.entryKey(), "navigation.convergesIntoEntryKeys", navigation.convergesIntoEntryKeys());
            }
            for (QuestExplorer.Branch branch : entry.branches()) {
                String branchScope = "branch[" + value(branch.branchKey()) + "]";
                addInvalidLinks(warnings, validIdentities, progressionGroupsByIdentity, entry.entryKey(), branchScope + ".nextEntryKeys", branch.nextEntryKeys());
                addInvalidLinks(warnings, validIdentities, progressionGroupsByIdentity, entry.entryKey(), branchScope + ".convergesIntoEntryKeys", branch.convergesIntoEntryKeys());
            }
        }
        return warnings.stream().sorted().toList();
    }

    private static void addInvalidLinks(
            List<String> warnings,
            Set<String> validIdentities,
            Map<String, ProgressionGroup> progressionGroupsByIdentity,
            String entryKey,
            String field,
            List<String> links
    ) {
        ProgressionGroup sourceGroup = progressionGroupsByIdentity.get(entryKey);
        for (String link : safeList(links)) {
            String cleanLink = clean(link);
            if (cleanLink == null || !validIdentities.contains(cleanLink)) {
                warnings.add(entryKey + " " + field + " -> " + value(link));
                continue;
            }
            ProgressionGroup targetGroup = progressionGroupsByIdentity.get(cleanLink);
            if (sourceGroup != null && targetGroup != null && !sourceGroup.equals(targetGroup)) {
                warnings.add(entryKey + " " + field + " -> " + cleanLink +
                        " crosses progression group " + sourceGroup.label() + " -> " + targetGroup.label());
            }
        }
    }

    private static Map<String, QuestExplorer.Entry> entriesByIdentity(List<QuestExplorer.Entry> entries) {
        Map<String, QuestExplorer.Entry> byIdentity = new HashMap<>();
        for (QuestExplorer.Entry entry : entries) {
            putIdentity(byIdentity, entry.entryKey(), entry);
            safeList(entry.aliases()).forEach(alias -> putIdentity(byIdentity, alias, entry));
        }
        return byIdentity;
    }

    private static void putIdentity(Map<String, QuestExplorer.Entry> byIdentity, String key, QuestExplorer.Entry entry) {
        String cleanKey = clean(key);
        if (cleanKey != null) {
            byIdentity.putIfAbsent(cleanKey, entry);
        }
    }

    private static Map<String, ProgressionGroup> progressionGroupsByIdentity(
            List<QuestExplorer.Entry> entries,
            QuestExplorer.Progression progression
    ) {
        Map<String, QuestExplorer.Entry> entriesByKey = new HashMap<>();
        for (QuestExplorer.Entry entry : entries) {
            String cleanEntryKey = clean(entry.entryKey());
            if (cleanEntryKey != null) {
                entriesByKey.putIfAbsent(cleanEntryKey, entry);
            }
        }

        Map<String, ProgressionGroup> groupsByIdentity = new HashMap<>();
        for (QuestExplorer.Questline questline : safeList(progression.questlines())) {
            ProgressionGroup group = new ProgressionGroup(questline.questLineFamilyKey(), questline.factionFamilyKey());
            for (QuestExplorer.Chapter chapter : questline.chapters()) {
                for (QuestExplorer.Step step : chapter.steps()) {
                    for (QuestExplorer.Variant variant : step.variants()) {
                        QuestExplorer.Entry entry = entriesByKey.get(variant.entryKey());
                        if (entry == null) {
                            putGroup(groupsByIdentity, variant.entryKey(), group);
                        } else {
                            putGroup(groupsByIdentity, entry.entryKey(), group);
                            safeList(entry.aliases()).forEach(alias -> putGroup(groupsByIdentity, alias, group));
                        }
                    }
                }
            }
        }
        return groupsByIdentity;
    }

    private static void putGroup(Map<String, ProgressionGroup> groupsByIdentity, String key, ProgressionGroup group) {
        String cleanKey = clean(key);
        if (cleanKey != null) {
            groupsByIdentity.putIfAbsent(cleanKey, group);
        }
    }

    private static List<String> unassignedProgressionEntries(
            List<QuestExplorer.Entry> entries,
            QuestExplorer.Progression progression
    ) {
        Set<String> assignedEntryKeys = progression.questlines().stream()
                .flatMap(questline -> questline.chapters().stream())
                .flatMap(chapter -> chapter.steps().stream())
                .flatMap(step -> step.variants().stream())
                .map(QuestExplorer.Variant::entryKey)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return entries.stream()
                .filter(QuestExplorerProgressionDiagnosticReporter::isProgressionCandidate)
                .map(QuestExplorer.Entry::entryKey)
                .filter(entryKey -> !assignedEntryKeys.contains(entryKey))
                .sorted()
                .toList();
    }

    private static boolean isProgressionCandidate(QuestExplorer.Entry entry) {
        QuestExplorer.Navigation navigation = entry.navigation();
        if (navigation == null) return false;
        return navigation.questLineKey() != null ||
                navigation.chapterOrder() != null ||
                navigation.stepOrder() != null ||
                value(entry.entryKey()).startsWith("TutorialScenario_Quest_");
    }

    private static int projectedMajorQuestlineCount(List<QuestExplorer.Questline> questlines) {
        return (int) questlines.stream().filter(QuestExplorerProgressionDiagnosticReporter::isMajorFactionQuestline).count();
    }

    private static boolean isMajorFactionQuestline(QuestExplorer.Questline questline) {
        return value(questline.questLineFamilyKey()).startsWith("FactionQuest_");
    }

    private static int countStepsByKind(List<QuestExplorer.Questline> questlines, String projectionKind) {
        return (int) questlines.stream()
                .flatMap(questline -> questline.chapters().stream())
                .flatMap(chapter -> chapter.steps().stream())
                .filter(step -> Objects.equals(step.projectionKind(), projectionKind))
                .count();
    }

    private static List<QuestExplorer.Questline> sortedQuestlines(List<QuestExplorer.Questline> questlines) {
        return safeList(questlines).stream()
                .sorted(Comparator.comparing(QuestExplorer.Questline::questLineFamilyKey, Comparator.nullsLast(String::compareTo))
                        .thenComparing(QuestExplorer.Questline::factionKey, Comparator.nullsLast(String::compareTo)))
                .toList();
    }

    private static String csv(List<?> values) {
        List<?> safeValues = safeList(values);
        if (safeValues.isEmpty()) return "none";
        return safeValues.stream().map(QuestExplorerProgressionDiagnosticReporter::value).collect(Collectors.joining(","));
    }

    private static void appendLine(StringBuilder report, String line) {
        report.append(line).append('\n');
    }

    private static String value(Object value) {
        return value == null ? "null" : String.valueOf(value);
    }

    private static String clean(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }

    private record ProgressionGroup(String questLineFamilyKey, String factionFamilyKey) {
        private String label() {
            if (factionFamilyKey == null) return value(questLineFamilyKey);
            return value(questLineFamilyKey) + "/" + value(factionFamilyKey);
        }
    }
}
