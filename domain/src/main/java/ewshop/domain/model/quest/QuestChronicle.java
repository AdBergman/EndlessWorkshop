package ewshop.domain.model.quest;

import java.util.List;

public record QuestChronicle(
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        String schemaVersion,
        String contractSurface,
        List<Entry> entries
) {
    public QuestChronicle {
        entries = safeList(entries);
    }

    public record Entry(
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
            List<Objective> objectives,
            List<Path> paths,
            List<TranscriptBlock> transcriptBlocks
    ) {
        public Entry {
            sourceQuestKeys = safeList(sourceQuestKeys);
            summaryLines = safeList(summaryLines);
            nextEntryKeys = safeList(nextEntryKeys);
            failureEntryKeys = safeList(failureEntryKeys);
            convergesIntoEntryKeys = safeList(convergesIntoEntryKeys);
            objectives = safeList(objectives);
            paths = safeList(paths);
            transcriptBlocks = safeList(transcriptBlocks);
        }
    }

    public record Objective(
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
            List<Requirement> completionRequirements,
            List<Requirement> failureRequirements,
            List<Requirement> forbiddenRequirements,
            List<Requirement> selectionRequirements,
            List<Reward> rewards
    ) {
        public Objective {
            descriptionLines = safeList(descriptionLines);
            completionLines = safeList(completionLines);
            failureLines = safeList(failureLines);
            forbiddenLines = safeList(forbiddenLines);
            selectionLines = safeList(selectionLines);
            rewardLines = safeList(rewardLines);
            completionRequirements = safeList(completionRequirements);
            failureRequirements = safeList(failureRequirements);
            forbiddenRequirements = safeList(forbiddenRequirements);
            selectionRequirements = safeList(selectionRequirements);
            rewards = safeList(rewards);
        }
    }

    public record Path(
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
            List<Requirement> requirements,
            List<Reward> rewards
    ) {
        public Path {
            conditionLines = safeList(conditionLines);
            rewardLines = safeList(rewardLines);
            nextEntryKeys = safeList(nextEntryKeys);
            failureEntryKeys = safeList(failureEntryKeys);
            requirements = safeList(requirements);
            rewards = safeList(rewards);
        }
    }

    public record Requirement(
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

    public record Reward(
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
    ) {
        public Reward {
            sourceRewardKeys = safeList(sourceRewardKeys);
        }
    }

    public record TranscriptBlock(
            String dialogKey,
            String phase,
            String sourceQuestKey,
            String choiceKey,
            Integer stepIndex,
            List<TranscriptLine> lines
    ) {
        public TranscriptBlock {
            lines = safeList(lines);
        }
    }

    public record TranscriptLine(
            Integer lineIndex,
            String role,
            String speakerLabel,
            String text
    ) {}

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : List.copyOf(values);
    }
}
