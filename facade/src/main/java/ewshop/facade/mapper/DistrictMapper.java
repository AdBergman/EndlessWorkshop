package ewshop.facade.mapper;

import ewshop.domain.model.District;
import ewshop.domain.model.ConstructibleNeighbourPlacement;
import ewshop.domain.model.ConstructiblePointOfInterestPlacement;
import ewshop.domain.model.ConstructiblePlacementPrerequisites;
import ewshop.domain.model.ConstructibleRiverPlacement;
import ewshop.domain.model.ConstructibleTerrainPlacement;
import ewshop.domain.model.DistrictLevelUp;
import ewshop.facade.dto.response.ConstructibleNeighbourPlacementDto;
import ewshop.facade.dto.response.ConstructiblePointOfInterestPlacementDto;
import ewshop.facade.dto.response.ConstructiblePlacementPrerequisitesDto;
import ewshop.facade.dto.response.ConstructibleRiverPlacementDto;
import ewshop.facade.dto.response.ConstructibleTerrainPlacementDto;
import ewshop.facade.dto.response.DistrictDto;
import ewshop.facade.dto.response.DistrictLevelUpDto;

import java.util.List;

public class DistrictMapper {

    public static DistrictDto toDto(District domain) {
        if (domain == null) return null;

        List<String> lines = (domain.getDescriptionLines() == null)
                ? List.of()
                : List.copyOf(domain.getDescriptionLines());

        return new DistrictDto(
                domain.getDistrictKey(),
                domain.getDisplayName(),
                domain.getCategory(),
                domain.getTier(),
                domain.getConstructibleLevel(),
                lines,
                domain.getConstructionCost() == null ? List.of() : List.copyOf(domain.getConstructionCost()),
                domain.getDescriptorKeys() == null ? List.of() : List.copyOf(domain.getDescriptorKeys()),
                domain.getReferenceKeys() == null ? List.of() : List.copyOf(domain.getReferenceKeys()),
                domain.getUnlockTechnologyKeys() == null ? List.of() : List.copyOf(domain.getUnlockTechnologyKeys()),
                domain.getFactionSpecific(),
                domain.getVariant(),
                domain.getPlayerFacing(),
                toLevelUpDto(domain.getLevelUp()),
                toPlacementDto(domain.getPlacementPrerequisites())
        );
    }

    private static DistrictLevelUpDto toLevelUpDto(DistrictLevelUp levelUp) {
        return levelUp == null
                ? null
                : new DistrictLevelUpDto(
                        levelUp.targetDistrictKey(),
                        levelUp.requiredAdjacentDistrictCount(),
                        levelUp.validNeighbourDescriptorKeys(),
                        levelUp.validNeighbourUiMapperKey(),
                        levelUp.requiredFactionTraitKeys()
                );
    }

    private static ConstructiblePlacementPrerequisitesDto toPlacementDto(
            ConstructiblePlacementPrerequisites placement
    ) {
        return placement == null
                ? null
                : new ConstructiblePlacementPrerequisitesDto(
                        toNeighbourPlacementDto(placement.neighbourTiles()),
                        toTerrainPlacementDto(placement.terrain()),
                        toRiverPlacementDto(placement.river()),
                        toPointOfInterestPlacementDto(placement.pointOfInterest())
                );
    }

    private static ConstructibleNeighbourPlacementDto toNeighbourPlacementDto(
            ConstructibleNeighbourPlacement placement
    ) {
        return placement == null
                ? null
                : new ConstructibleNeighbourPlacementDto(
                        placement.operator(),
                        placement.territoryConstraint(),
                        placement.ignoreCliff()
                );
    }

    private static ConstructibleTerrainPlacementDto toTerrainPlacementDto(ConstructibleTerrainPlacement placement) {
        return placement == null
                ? null
                : new ConstructibleTerrainPlacementDto(
                        placement.constraint(),
                        placement.terrainTypeKeys(),
                        placement.canBuildOnWasteland(),
                        placement.canBuildOnMud()
                );
    }

    private static ConstructibleRiverPlacementDto toRiverPlacementDto(ConstructibleRiverPlacement placement) {
        return placement == null ? null : new ConstructibleRiverPlacementDto(placement.constraint());
    }

    private static ConstructiblePointOfInterestPlacementDto toPointOfInterestPlacementDto(
            ConstructiblePointOfInterestPlacement placement
    ) {
        return placement == null
                ? null
                : new ConstructiblePointOfInterestPlacementDto(
                        placement.constraint(),
                        placement.pointOfInterestKeys()
                );
    }
}
