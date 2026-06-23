package ewshop.facade.dto.response;

import java.util.List;

public record ImprovementDto(
        String improvementKey,
        String displayName,
        String category,
        List<String> descriptionLines,
        List<String> unlockTechnologyKeys,
        ConstructiblePlacementPrerequisitesDto placementPrerequisites
) {
    public ImprovementDto(
            String improvementKey,
            String displayName,
            String category,
            List<String> descriptionLines
    ) {
        this(improvementKey, displayName, category, descriptionLines, List.of(), null);
    }
}
