package ewshop.facade.mapper;

import ewshop.domain.model.District;
import ewshop.domain.model.ConstructibleNeighbourPlacement;
import ewshop.domain.model.ConstructiblePlacementPrerequisites;
import ewshop.domain.model.DistrictLevelUp;
import ewshop.facade.dto.response.ConstructibleNeighbourPlacementDto;
import ewshop.facade.dto.response.ConstructiblePlacementPrerequisitesDto;
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
                lines,
                domain.getUnlockTechnologyKeys() == null ? List.of() : List.copyOf(domain.getUnlockTechnologyKeys()),
                toLevelUpDto(domain.getLevelUp()),
                toPlacementDto(domain.getPlacementPrerequisites())
        );
    }

    private static DistrictLevelUpDto toLevelUpDto(DistrictLevelUp levelUp) {
        return levelUp == null
                ? null
                : new DistrictLevelUpDto(levelUp.targetDistrictKey(), levelUp.requiredAdjacentDistrictCount());
    }

    private static ConstructiblePlacementPrerequisitesDto toPlacementDto(
            ConstructiblePlacementPrerequisites placement
    ) {
        return placement == null
                ? null
                : new ConstructiblePlacementPrerequisitesDto(toNeighbourPlacementDto(placement.neighbourTiles()));
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
}
