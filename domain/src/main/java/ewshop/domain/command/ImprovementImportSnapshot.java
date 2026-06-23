package ewshop.domain.command;

import ewshop.domain.model.ConstructiblePlacementPrerequisites;

import java.util.List;

public record ImprovementImportSnapshot(
        String constructibleKey,
        String displayName,
        String category,
        List<String> descriptionLines,
        List<String> unlockTechnologyKeys,
        ConstructiblePlacementPrerequisites placementPrerequisites
) {
    public ImprovementImportSnapshot(
            String constructibleKey,
            String displayName,
            String category,
            List<String> descriptionLines
    ) {
        this(constructibleKey, displayName, category, descriptionLines, List.of(), null);
    }

    public ImprovementImportSnapshot {
        descriptionLines = descriptionLines == null ? List.of() : List.copyOf(descriptionLines);
        unlockTechnologyKeys = unlockTechnologyKeys == null ? List.of() : List.copyOf(unlockTechnologyKeys);
        if (placementPrerequisites != null && placementPrerequisites.isEmpty()) {
            placementPrerequisites = null;
        }
    }
}
