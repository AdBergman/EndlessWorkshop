package ewshop.domain.command;

public record QuestExplorerRequirementImportSnapshot(
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
