package ewshop.facade.dto.response;

public record ConstructiblePlacementPrerequisitesDto(
        ConstructibleNeighbourPlacementDto neighbourTiles,
        ConstructibleTerrainPlacementDto terrain,
        ConstructibleRiverPlacementDto river,
        ConstructiblePointOfInterestPlacementDto pointOfInterest
) {
    public ConstructiblePlacementPrerequisitesDto(ConstructibleNeighbourPlacementDto neighbourTiles) {
        this(neighbourTiles, null, null, null);
    }
}
