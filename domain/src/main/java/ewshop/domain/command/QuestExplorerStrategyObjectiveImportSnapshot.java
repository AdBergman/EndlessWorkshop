package ewshop.domain.command;

import java.util.List;

public record QuestExplorerStrategyObjectiveImportSnapshot(
        String objectiveKey,
        String text,
        String phase,
        List<String> revealedByBranchKeys,
        List<String> revealedByChoiceKeys,
        List<List<String>> revealedByBranchPathAlternatives,
        List<QuestExplorerRequirementImportSnapshot> requirements,
        List<QuestExplorerRewardImportSnapshot> rewards
) {
    public QuestExplorerStrategyObjectiveImportSnapshot(
            String objectiveKey,
            String text,
            String phase,
            List<QuestExplorerRequirementImportSnapshot> requirements,
            List<QuestExplorerRewardImportSnapshot> rewards
    ) {
        this(objectiveKey, text, phase, List.of(), List.of(), List.of(), requirements, rewards);
    }

    public QuestExplorerStrategyObjectiveImportSnapshot {
        revealedByBranchKeys = revealedByBranchKeys == null ? List.of() : List.copyOf(revealedByBranchKeys);
        revealedByChoiceKeys = revealedByChoiceKeys == null ? List.of() : List.copyOf(revealedByChoiceKeys);
        revealedByBranchPathAlternatives = revealedByBranchPathAlternatives == null
                ? List.of()
                : revealedByBranchPathAlternatives.stream()
                        .map(path -> path == null ? List.<String>of() : List.copyOf(path))
                        .toList();
        requirements = requirements == null ? List.of() : List.copyOf(requirements);
        rewards = rewards == null ? List.of() : List.copyOf(rewards);
    }
}
