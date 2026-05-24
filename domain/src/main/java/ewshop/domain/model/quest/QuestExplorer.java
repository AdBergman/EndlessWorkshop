package ewshop.domain.model.quest;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.List;

public record QuestExplorer(
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        String schemaVersion,
        List<Entry> entries,
        Progression progression
) {
    public QuestExplorer(
            String gameVersion,
            String exporterVersion,
            String exportedAtUtc,
            String exportKind,
            String schemaVersion,
            List<Entry> entries
    ) {
        this(gameVersion, exporterVersion, exportedAtUtc, exportKind, schemaVersion, entries, null);
    }

    public QuestExplorer {
        entries = safeList(entries);
    }

    public record Progression(
            List<Questline> questlines,
            ProgressionDebugSummary debugSummary
    ) {
        public Progression {
            questlines = safeList(questlines);
        }
    }

    public record Questline(
            String questLineKey,
            String questLineFamilyKey,
            String questLineName,
            String factionKey,
            String factionFamilyKey,
            String factionName,
            List<String> sourceQuestLineKeys,
            List<String> sourceFactionKeys,
            List<Chapter> chapters
    ) {
        public Questline {
            sourceQuestLineKeys = safeList(sourceQuestLineKeys);
            sourceFactionKeys = safeList(sourceFactionKeys);
            chapters = safeList(chapters);
        }
    }

    public record Chapter(
            Integer chapterNumber,
            Integer chapterOrder,
            String title,
            List<Step> steps
    ) {
        public Chapter {
            steps = safeList(steps);
        }
    }

    public record Step(
            String stepKey,
            Integer stepNumber,
            Integer stepOrder,
            String title,
            String projectionKind,
            String detailEntryKey,
            List<String> sourceEntryKeys,
            List<String> aliasEntryKeys,
            List<Variant> variants
    ) {
        public Step {
            sourceEntryKeys = safeList(sourceEntryKeys);
            aliasEntryKeys = safeList(aliasEntryKeys);
            variants = safeList(variants);
        }
    }

    public record Variant(
            String entryKey,
            String title,
            String variantKind,
            String branchGroupKey,
            String branchLabel,
            Integer branchOrder,
            List<String> previousEntryKeys,
            List<String> nextEntryKeys,
            List<String> failureEntryKeys,
            List<String> convergesIntoEntryKeys
    ) {
        public Variant {
            previousEntryKeys = safeList(previousEntryKeys);
            nextEntryKeys = safeList(nextEntryKeys);
            failureEntryKeys = safeList(failureEntryKeys);
            convergesIntoEntryKeys = safeList(convergesIntoEntryKeys);
        }
    }

    public record ProgressionDebugSummary(
            int totalEntries,
            List<String> questlineFamiliesFound,
            List<QuestlineDebugSummary> questlines,
            List<MissingMajorFactionChapters> missingMajorFactionChapters,
            List<ChapterWithOneStep> chaptersWithOnlyOneStep,
            List<NumericQuestlineVariantCollapse> numericQuestlineVariantsCollapsed,
            List<String> entriesWithMissingChapterOrStepOrder,
            List<String> suspiciousBranchVariantsWithoutParentStep,
            List<String> tutorialEntriesPlaced
    ) {
        public ProgressionDebugSummary {
            questlineFamiliesFound = safeList(questlineFamiliesFound);
            questlines = safeList(questlines);
            missingMajorFactionChapters = safeList(missingMajorFactionChapters);
            chaptersWithOnlyOneStep = safeList(chaptersWithOnlyOneStep);
            numericQuestlineVariantsCollapsed = safeList(numericQuestlineVariantsCollapsed);
            entriesWithMissingChapterOrStepOrder = safeList(entriesWithMissingChapterOrStepOrder);
            suspiciousBranchVariantsWithoutParentStep = safeList(suspiciousBranchVariantsWithoutParentStep);
            tutorialEntriesPlaced = safeList(tutorialEntriesPlaced);
        }
    }

    public record QuestlineDebugSummary(
            String questLineFamilyKey,
            String factionFamilyKey,
            List<String> sourceQuestLineKeys,
            List<ChapterDebugSummary> chapters
    ) {
        public QuestlineDebugSummary {
            sourceQuestLineKeys = safeList(sourceQuestLineKeys);
            chapters = safeList(chapters);
        }
    }

    public record ChapterDebugSummary(
            Integer chapterOrder,
            Integer chapterNumber,
            String title,
            int stepCount,
            List<StepDebugSummary> steps
    ) {
        public ChapterDebugSummary {
            steps = safeList(steps);
        }
    }

    public record StepDebugSummary(
            String stepKey,
            Integer stepOrder,
            Integer stepNumber,
            String projectionKind,
            String detailEntryKey,
            List<String> sourceEntryKeys,
            List<String> aliasEntryKeys,
            int variantCount,
            int branchVariantCount
    ) {
        public StepDebugSummary {
            sourceEntryKeys = safeList(sourceEntryKeys);
            aliasEntryKeys = safeList(aliasEntryKeys);
        }
    }

    public record MissingMajorFactionChapters(
            String questLineFamilyKey,
            String factionFamilyKey,
            List<Integer> missingChapterNumbers
    ) {
        public MissingMajorFactionChapters {
            missingChapterNumbers = safeList(missingChapterNumbers);
        }
    }

    public record ChapterWithOneStep(
            String questLineFamilyKey,
            String factionFamilyKey,
            Integer chapterOrder,
            String title
    ) {}

    public record NumericQuestlineVariantCollapse(
            String sourceQuestLineKey,
            String sourceFactionKey,
            String targetQuestLineFamilyKey,
            String targetFactionFamilyKey,
            int entryCount,
            String reason
    ) {}

    public record Entry(
            String entryKey,
            String title,
            List<String> summaryLines,
            String questType,
            Boolean isMandatory,
            Boolean isKeyNarrativeBeat,
            List<String> aliases,
            Navigation navigation,
            LoreView loreView,
            StrategyView strategyView,
            List<Branch> branches,
            Quality quality
    ) {
        public Entry {
            summaryLines = safeList(summaryLines);
            aliases = safeList(aliases);
            branches = safeList(branches);
        }
    }

    public record Navigation(
            String factionKey,
            String factionName,
            String questLineKey,
            String questLineName,
            Integer chapter,
            String chapterLabel,
            Integer step,
            String stepLabel,
            int sequenceIndex,
            Integer chapterOrder,
            Integer stepOrder,
            String branchGroupKey,
            String branchLabel,
            Integer branchOrder,
            Boolean isBranchStart,
            Boolean isBranchEnd,
            List<String> previousEntryKeys,
            List<String> nextEntryKeys,
            List<String> failureEntryKeys,
            List<String> convergesIntoEntryKeys
    ) {
        public Navigation {
            previousEntryKeys = safeList(previousEntryKeys);
            nextEntryKeys = safeList(nextEntryKeys);
            failureEntryKeys = safeList(failureEntryKeys);
            convergesIntoEntryKeys = safeList(convergesIntoEntryKeys);
        }
    }

    public record LoreView(List<LoreSection> sections) {
        public LoreView {
            sections = safeList(sections);
        }
    }

    public record LoreSection(
            String sectionKey,
            String phase,
            String choiceKey,
            Integer stepIndex,
            String objectiveKey,
            List<String> revealedByBranchKeys,
            List<String> revealedByChoiceKeys,
            List<List<String>> revealedByBranchPathAlternatives,
            List<LoreLine> lines
    ) {
        public LoreSection(
                String sectionKey,
                String phase,
                String choiceKey,
                Integer stepIndex,
                String objectiveKey,
                List<LoreLine> lines
        ) {
            this(sectionKey, phase, choiceKey, stepIndex, objectiveKey, List.of(), List.of(), List.of(), lines);
        }

        public LoreSection {
            revealedByBranchKeys = safeList(revealedByBranchKeys);
            revealedByChoiceKeys = safeList(revealedByChoiceKeys);
            revealedByBranchPathAlternatives = safeNestedStringList(revealedByBranchPathAlternatives);
            lines = safeList(lines);
        }
    }

    public record LoreLine(
            String speakerLabel,
            String role,
            String text
    ) {}

    public record StrategyView(List<Objective> objectives) {
        public StrategyView {
            objectives = safeList(objectives);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Objective(
            String objectiveKey,
            String text,
            String phase,
            List<String> revealedByBranchKeys,
            List<String> revealedByChoiceKeys,
            List<List<String>> revealedByBranchPathAlternatives,
            List<Requirement> requirements,
            List<Reward> rewards
    ) {
        public Objective(
                String objectiveKey,
                String text,
                String phase,
                List<Requirement> requirements,
                List<Reward> rewards
        ) {
            this(objectiveKey, text, phase, List.of(), List.of(), List.of(), requirements, rewards);
        }

        public Objective {
            revealedByBranchKeys = safeList(revealedByBranchKeys);
            revealedByChoiceKeys = safeList(revealedByChoiceKeys);
            revealedByBranchPathAlternatives = safeNestedStringList(revealedByBranchPathAlternatives);
            requirements = safeList(requirements);
            rewards = safeList(rewards);
        }
    }

    public record Branch(
            String branchKey,
            String choiceKey,
            String label,
            Integer orderIndex,
            String groupKey,
            String groupLabel,
            Integer branchStepOrder,
            String parentBranchKey,
            String parentChoiceKey,
            List<String> prerequisiteBranchKeys,
            List<String> prerequisiteBranchPath,
            List<String> revealedByBranchKeys,
            List<String> revealedByChoiceKeys,
            List<List<String>> revealedByBranchPathAlternatives,
            String choiceGroupKey,
            String convergenceGroupKey,
            String sectionRole,
            List<String> nextEntryKeys,
            List<String> failureEntryKeys,
            List<String> convergesIntoEntryKeys,
            BranchLore lore,
            BranchStrategy strategy
    ) {
        public Branch(
                String branchKey,
                String choiceKey,
                String label,
                Integer orderIndex,
                String groupKey,
                String groupLabel,
                List<String> nextEntryKeys,
                List<String> failureEntryKeys,
                List<String> convergesIntoEntryKeys,
                BranchLore lore,
                BranchStrategy strategy
        ) {
            this(
                    branchKey,
                    choiceKey,
                    label,
                    orderIndex,
                    groupKey,
                    groupLabel,
                    null,
                    null,
                    null,
                    List.of(),
                    List.of(),
                    List.of(),
                    List.of(),
                    List.of(),
                    null,
                    null,
                    null,
                    nextEntryKeys,
                    failureEntryKeys,
                    convergesIntoEntryKeys,
                    lore,
                    strategy
            );
        }

        public Branch(
                String branchKey,
                String choiceKey,
                String label,
                Integer orderIndex,
                String groupKey,
                String groupLabel,
                Integer branchStepOrder,
                String parentBranchKey,
                String parentChoiceKey,
                List<String> prerequisiteBranchKeys,
                List<String> prerequisiteBranchPath,
                String choiceGroupKey,
                String convergenceGroupKey,
                String sectionRole,
                List<String> nextEntryKeys,
                List<String> failureEntryKeys,
                List<String> convergesIntoEntryKeys,
                BranchLore lore,
                BranchStrategy strategy
        ) {
            this(
                    branchKey,
                    choiceKey,
                    label,
                    orderIndex,
                    groupKey,
                    groupLabel,
                    branchStepOrder,
                    parentBranchKey,
                    parentChoiceKey,
                    prerequisiteBranchKeys,
                    prerequisiteBranchPath,
                    List.of(),
                    List.of(),
                    List.of(),
                    choiceGroupKey,
                    convergenceGroupKey,
                    sectionRole,
                    nextEntryKeys,
                    failureEntryKeys,
                    convergesIntoEntryKeys,
                    lore,
                    strategy
            );
        }

        public Branch {
            prerequisiteBranchKeys = safeList(prerequisiteBranchKeys);
            prerequisiteBranchPath = safeList(prerequisiteBranchPath);
            revealedByBranchKeys = safeList(revealedByBranchKeys);
            revealedByChoiceKeys = safeList(revealedByChoiceKeys);
            revealedByBranchPathAlternatives = safeNestedStringList(revealedByBranchPathAlternatives);
            nextEntryKeys = safeList(nextEntryKeys);
            failureEntryKeys = safeList(failureEntryKeys);
            convergesIntoEntryKeys = safeList(convergesIntoEntryKeys);
        }
    }

    public record BranchLore(List<String> outcomePreviewLines) {
        public BranchLore {
            outcomePreviewLines = safeList(outcomePreviewLines);
        }
    }

    public record BranchStrategy(
            List<String> conditions,
            List<Requirement> requirements,
            List<Reward> rewards
    ) {
        public BranchStrategy {
            conditions = safeList(conditions);
            requirements = safeList(requirements);
            rewards = safeList(rewards);
        }
    }

    public record Requirement(
            String requirementKey,
            String kind,
            String displayText,
            String polarity,
            String groupLabel,
            Integer groupOrder,
            String targetRole,
            String targetLabel,
            Integer requiredCount,
            Integer durationTurns,
            String state,
            String referenceKind,
            String referenceKey,
            String referenceDisplayName,
            String codexEntryKey
    ) {}

    public record Reward(
            String rewardKey,
            String kind,
            String displayText,
            BigDecimal amount,
            String groupLabel,
            Integer groupOrder,
            String formulaText,
            String assetKind,
            String assetKey,
            String assetDisplayName,
            String referenceKind,
            String referenceKey,
            String referenceDisplayName,
            String codexEntryKey,
            String targetScopeLabel
    ) {}

    public record Quality(
            List<String> warnings
    ) {
        public Quality {
            warnings = safeList(warnings);
        }
    }

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : List.copyOf(values);
    }

    private static List<List<String>> safeNestedStringList(List<List<String>> values) {
        return values == null ? List.of() : values.stream().map(QuestExplorer::safeList).toList();
    }
}
