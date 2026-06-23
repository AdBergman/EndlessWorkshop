package ewshop.facade.dto.response;

public record ConstructibleNeighbourPlacementDto(
        String operator,
        String territoryConstraint,
        Boolean ignoreCliff
) {}
