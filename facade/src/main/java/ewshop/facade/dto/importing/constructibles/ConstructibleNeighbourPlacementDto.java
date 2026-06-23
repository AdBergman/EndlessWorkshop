package ewshop.facade.dto.importing.constructibles;

public record ConstructibleNeighbourPlacementDto(
        String operator,
        String territoryConstraint,
        Boolean ignoreCliff
) {}
