package ewshop.facade.dto.importing.improvements;

import ewshop.facade.dto.importing.constructibles.ConstructiblePlacementPrerequisitesDto;

import java.util.List;

public record ImprovementImportImprovementDto(
        String constructibleKey,
        String displayName,
        String category,
        List<String> descriptionLines,
        List<String> unlockTechnologyKeys,
        ConstructiblePlacementPrerequisitesDto placementPrerequisites
) {
    public ImprovementImportImprovementDto(
            String constructibleKey,
            String displayName,
            String category,
            List<String> descriptionLines
    ) {
        this(constructibleKey, displayName, category, descriptionLines, List.of(), null);
    }
}
