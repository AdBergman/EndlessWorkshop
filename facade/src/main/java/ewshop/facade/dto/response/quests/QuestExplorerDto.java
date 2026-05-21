package ewshop.facade.dto.response.quests;

import java.math.BigDecimal;
import java.util.List;

public record QuestExplorerDto(
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        String schemaVersion,
        List<EntryDto> entries,
        ProgressionDto progression
) {
    public QuestExplorerDto(
            String gameVersion,
            String exporterVersion,
            String exportedAtUtc,
            String exportKind,
            String schemaVersion,
            List<EntryDto> entries
    ) {
        this(gameVersion, exporterVersion, exportedAtUtc, exportKind, schemaVersion, entries, null);
    }

    public record ProgressionDto(
            List<QuestlineDto> questlines,
            ProgressionDebugSummaryDto debugSummary
    ) {}

    public record QuestlineDto(
            String questLineKey,
            String questLineFamilyKey,
            String questLineName,
            String factionKey,
            String factionFamilyKey,
            String factionName,
            List<String> sourceQuestLineKeys,
            List<String> sourceFactionKeys,
            List<ChapterDto> chapters
    ) {}

    public record ChapterDto(
            Integer chapterNumber,
            Integer chapterOrder,
            String title,
            List<StepDto> steps
    ) {}

    public record StepDto(
            String stepKey,
            Integer stepNumber,
            Integer stepOrder,
            String title,
            String projectionKind,
            String detailEntryKey,
            List<String> sourceEntryKeys,
            List<String> aliasEntryKeys,
            List<VariantDto> variants
    ) {}

    public record VariantDto(
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
    ) {}

    public record ProgressionDebugSummaryDto(
            int totalEntries,
            List<String> questlineFamiliesFound,
            List<QuestlineDebugSummaryDto> questlines,
            List<MissingMajorFactionChaptersDto> missingMajorFactionChapters,
            List<ChapterWithOneStepDto> chaptersWithOnlyOneStep,
            List<NumericQuestlineVariantCollapseDto> numericQuestlineVariantsCollapsed,
            List<String> entriesWithMissingChapterOrStepOrder,
            List<String> suspiciousBranchVariantsWithoutParentStep,
            List<String> tutorialEntriesPlaced
    ) {}

    public record QuestlineDebugSummaryDto(
            String questLineFamilyKey,
            String factionFamilyKey,
            List<String> sourceQuestLineKeys,
            List<ChapterDebugSummaryDto> chapters
    ) {}

    public record ChapterDebugSummaryDto(
            Integer chapterOrder,
            Integer chapterNumber,
            String title,
            int stepCount,
            List<StepDebugSummaryDto> steps
    ) {}

    public record StepDebugSummaryDto(
            String stepKey,
            Integer stepOrder,
            Integer stepNumber,
            String projectionKind,
            String detailEntryKey,
            List<String> sourceEntryKeys,
            List<String> aliasEntryKeys,
            int variantCount,
            int branchVariantCount
    ) {}

    public record MissingMajorFactionChaptersDto(
            String questLineFamilyKey,
            String factionFamilyKey,
            List<Integer> missingChapterNumbers
    ) {}

    public record ChapterWithOneStepDto(
            String questLineFamilyKey,
            String factionFamilyKey,
            Integer chapterOrder,
            String title
    ) {}

    public record NumericQuestlineVariantCollapseDto(
            String sourceQuestLineKey,
            String sourceFactionKey,
            String targetQuestLineFamilyKey,
            String targetFactionFamilyKey,
            int entryCount,
            String reason
    ) {}

    public record EntryDto(
            String entryKey,
            String title,
            List<String> summaryLines,
            String questType,
            Boolean isMandatory,
            Boolean isKeyNarrativeBeat,
            List<String> aliases,
            NavigationDto navigation,
            LoreViewDto loreView,
            StrategyViewDto strategyView,
            List<BranchDto> branches,
            QualityDto quality
    ) {}

    public record NavigationDto(
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
    ) {}

    public record LoreViewDto(List<LoreSectionDto> sections) {}

    public record LoreSectionDto(
            String sectionKey,
            String phase,
            String choiceKey,
            Integer stepIndex,
            String objectiveKey,
            List<LoreLineDto> lines
    ) {}

    public record LoreLineDto(
            String speakerLabel,
            String role,
            String text
    ) {}

    public record StrategyViewDto(List<ObjectiveDto> objectives) {}

    public record ObjectiveDto(
            String objectiveKey,
            String text,
            String phase,
            List<RequirementDto> requirements,
            List<RewardDto> rewards
    ) {}

    public record BranchDto(
            String branchKey,
            String choiceKey,
            String label,
            Integer orderIndex,
            String groupKey,
            String groupLabel,
            List<String> nextEntryKeys,
            List<String> failureEntryKeys,
            List<String> convergesIntoEntryKeys,
            BranchLoreDto lore,
            BranchStrategyDto strategy
    ) {}

    public record BranchLoreDto(List<String> outcomePreviewLines) {}

    public record BranchStrategyDto(
            List<String> conditions,
            List<RequirementDto> requirements,
            List<RewardDto> rewards
    ) {}

    public record RequirementDto(
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

    public record RewardDto(
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

    public record QualityDto(List<String> warnings) {}
}
