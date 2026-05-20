package ewshop.facade.dto.response.quests;

import java.util.List;

public record QuestChronicleDto(
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        String schemaVersion,
        String contractSurface,
        List<EntryDto> entries
) {
    public record EntryDto(
            String entryKey,
            String primaryQuestKey,
            List<String> sourceQuestKeys,
            String groupingKey,
            String groupingReason,
            String title,
            List<String> summaryLines,
            String questType,
            boolean mandatory,
            boolean keyNarrativeBeat,
            String factionKey,
            String questLineKey,
            Integer chapter,
            String chapterLabel,
            Integer step,
            String stepLabel,
            String branchKey,
            String branchLabel,
            List<String> nextEntryKeys,
            List<String> failureEntryKeys,
            List<String> convergesIntoEntryKeys,
            List<ObjectiveDto> objectives,
            List<PathDto> paths,
            List<TranscriptBlockDto> transcriptBlocks
    ) {}

    public record ObjectiveDto(
            String objectiveText,
            String sourceQuestKey,
            String choiceKey,
            Integer stepIndex,
            List<String> descriptionLines,
            List<String> completionLines,
            List<String> failureLines,
            List<String> forbiddenLines,
            List<String> selectionLines,
            List<String> rewardLines,
            List<RequirementDto> completionRequirements,
            List<RequirementDto> failureRequirements,
            List<RequirementDto> forbiddenRequirements,
            List<RequirementDto> selectionRequirements,
            List<RewardDto> rewards
    ) {}

    public record PathDto(
            String pathKey,
            String label,
            String labelSource,
            Integer choiceOrdinal,
            String sourceQuestKey,
            String choiceKey,
            List<String> conditionLines,
            List<String> rewardLines,
            List<String> nextEntryKeys,
            List<String> failureEntryKeys,
            List<RequirementDto> requirements,
            List<RewardDto> rewards
    ) {}

    public record RequirementDto(
            String requirementKey,
            String kind,
            String phase,
            String polarity,
            String displayText,
            String referenceKey,
            String referenceKind,
            String referenceDisplayName,
            String targetRole,
            String targetLabel,
            String state,
            Integer requiredCount,
            Integer durationTurns
    ) {}

    public record RewardDto(
            String rewardKey,
            List<String> sourceRewardKeys,
            String kind,
            String displayText,
            String formulaText,
            Integer amount,
            String assetKind,
            String assetKey,
            String assetDisplayName,
            String targetScopeLabel
    ) {}

    public record TranscriptBlockDto(
            String dialogKey,
            String phase,
            String sourceQuestKey,
            String choiceKey,
            Integer stepIndex,
            List<TranscriptLineDto> lines
    ) {}

    public record TranscriptLineDto(
            Integer lineIndex,
            String role,
            String speakerLabel,
            String text
    ) {}
}
