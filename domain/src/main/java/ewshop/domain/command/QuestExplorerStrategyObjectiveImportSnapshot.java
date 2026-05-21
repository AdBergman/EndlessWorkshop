package ewshop.domain.command;

import java.util.List;

public record QuestExplorerStrategyObjectiveImportSnapshot(
        String objectiveKey,
        String text,
        String phase,
        List<QuestExplorerRequirementImportSnapshot> requirements,
        List<QuestExplorerRewardImportSnapshot> rewards
) {
    public QuestExplorerStrategyObjectiveImportSnapshot {
        requirements = requirements == null ? List.of() : List.copyOf(requirements);
        rewards = rewards == null ? List.of() : List.copyOf(rewards);
    }
}
