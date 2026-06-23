package ewshop.facade.dto.importing.districts;

import ewshop.facade.dto.importing.constructibles.ConstructiblePlacementPrerequisitesDto;

import java.util.List;

public record DistrictImportDistrictDto(
        String districtKey,
        String displayName,
        String category,
        List<String> descriptionLines,
        List<String> unlockTechnologyKeys,
        DistrictLevelUpDto levelUp,
        ConstructiblePlacementPrerequisitesDto placementPrerequisites
) {
    public DistrictImportDistrictDto(
            String districtKey,
            String displayName,
            String category,
            List<String> descriptionLines
    ) {
        this(districtKey, displayName, category, descriptionLines, List.of(), null, null);
    }
}
