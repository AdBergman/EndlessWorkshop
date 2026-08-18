package ewshop.facade.dto.response;

import java.util.List;

public record DistrictDto(
        String districtKey,
        String displayName,
        String category,
        Integer tier,
        Integer constructibleLevel,
        List<String> descriptionLines,
        List<String> constructionCost,
        List<String> descriptorKeys,
        List<String> referenceKeys,
        List<String> unlockTechnologyKeys,
        Boolean isFactionSpecific,
        String factionKey,
        Boolean isVariant,
        Boolean isPlayerFacing,
        DistrictLevelUpDto levelUp,
        ConstructiblePlacementPrerequisitesDto placementPrerequisites
) {
    public DistrictDto(
            String districtKey,
            String displayName,
            String category,
            List<String> descriptionLines,
            List<String> unlockTechnologyKeys,
            DistrictLevelUpDto levelUp,
            ConstructiblePlacementPrerequisitesDto placementPrerequisites
    ) {
        this(
                districtKey,
                displayName,
                category,
                null,
                null,
                descriptionLines,
                List.of(),
                List.of(),
                List.of(),
                unlockTechnologyKeys,
                null,
                null,
                null,
                null,
                levelUp,
                placementPrerequisites
        );
    }

    public DistrictDto(
            String districtKey,
            String displayName,
            String category,
            List<String> descriptionLines
    ) {
        this(
                districtKey,
                displayName,
                category,
                null,
                null,
                descriptionLines,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                null,
                null,
                null,
                null,
                null,
                null
        );
    }
}
