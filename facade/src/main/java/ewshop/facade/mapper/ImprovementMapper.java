package ewshop.facade.mapper;

import ewshop.domain.model.Improvement;
import ewshop.domain.model.ConstructibleNeighbourPlacement;
import ewshop.domain.model.ConstructiblePlacementPrerequisites;
import ewshop.facade.dto.response.ConstructibleNeighbourPlacementDto;
import ewshop.facade.dto.response.ConstructiblePlacementPrerequisitesDto;
import ewshop.facade.dto.response.ImprovementDto;

import java.util.List;

public class ImprovementMapper {

    public static ImprovementDto toDto(Improvement domain) {
        if (domain == null) return null;

        List<String> lines = (domain.getDescriptionLines() == null)
                ? List.of()
                : List.copyOf(domain.getDescriptionLines());

        return new ImprovementDto(
                domain.getConstructibleKey(),
                domain.getDisplayName(),
                domain.getCategory(),
                lines,
                domain.getUnlockTechnologyKeys() == null ? List.of() : List.copyOf(domain.getUnlockTechnologyKeys()),
                toPlacementDto(domain.getPlacementPrerequisites())
        );
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
