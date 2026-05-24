package ewshop.domain.command;

import java.util.List;

public record QuestExplorerLoreSectionImportSnapshot(
        String sectionKey,
        String phase,
        String choiceKey,
        Integer stepIndex,
        String objectiveKey,
        List<String> revealedByBranchKeys,
        List<String> revealedByChoiceKeys,
        List<List<String>> revealedByBranchPathAlternatives,
        List<QuestExplorerLoreLineImportSnapshot> lines
) {
    public QuestExplorerLoreSectionImportSnapshot(
            String sectionKey,
            String phase,
            String choiceKey,
            Integer stepIndex,
            String objectiveKey,
            List<QuestExplorerLoreLineImportSnapshot> lines
    ) {
        this(sectionKey, phase, choiceKey, stepIndex, objectiveKey, List.of(), List.of(), List.of(), lines);
    }

    public QuestExplorerLoreSectionImportSnapshot {
        revealedByBranchKeys = revealedByBranchKeys == null ? List.of() : List.copyOf(revealedByBranchKeys);
        revealedByChoiceKeys = revealedByChoiceKeys == null ? List.of() : List.copyOf(revealedByChoiceKeys);
        revealedByBranchPathAlternatives = revealedByBranchPathAlternatives == null
                ? List.of()
                : revealedByBranchPathAlternatives.stream()
                        .map(path -> path == null ? List.<String>of() : List.copyOf(path))
                        .toList();
        lines = lines == null ? List.of() : List.copyOf(lines);
    }
}
