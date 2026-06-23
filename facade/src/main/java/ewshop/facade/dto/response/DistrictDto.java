package ewshop.facade.dto.response;

import java.util.List;

public record DistrictDto(
        String districtKey,
        String displayName,
        String category,
        List<String> descriptionLines,
        List<String> unlockTechnologyKeys,
        DistrictLevelUpDto levelUp,
        ConstructiblePlacementPrerequisitesDto placementPrerequisites
) {
    public DistrictDto(
            String districtKey,
            String displayName,
            String category,
            List<String> descriptionLines
    ) {
        this(districtKey, displayName, category, descriptionLines, List.of(), null, null);
    }
}
