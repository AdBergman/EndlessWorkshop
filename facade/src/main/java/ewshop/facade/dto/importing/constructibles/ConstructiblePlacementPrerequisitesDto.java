package ewshop.facade.dto.importing.constructibles;

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
