package ewshop.domain.model.quest;

import java.math.BigDecimal;
import java.util.List;

public record QuestExplorer(
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        String schemaVersion,
        List<Entry> entries
) {
    public QuestExplorer {
        entries = safeList(entries);
    }

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
            List<LoreLine> lines
    ) {
        public LoreSection {
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

    public record Objective(
            String objectiveKey,
            String text,
            String phase,
            List<Requirement> requirements,
            List<Reward> rewards
    ) {
        public Objective {
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
            List<String> nextEntryKeys,
            List<String> failureEntryKeys,
            List<String> convergesIntoEntryKeys,
            BranchLore lore,
            BranchStrategy strategy
    ) {
        public Branch {
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
}
