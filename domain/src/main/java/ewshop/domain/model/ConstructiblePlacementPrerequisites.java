package ewshop.domain.model;

public record ConstructiblePlacementPrerequisites(
        ConstructibleNeighbourPlacement neighbourTiles,
        ConstructibleTerrainPlacement terrain,
        ConstructibleRiverPlacement river,
        ConstructiblePointOfInterestPlacement pointOfInterest
) {
    public ConstructiblePlacementPrerequisites(ConstructibleNeighbourPlacement neighbourTiles) {
        this(neighbourTiles, null, null, null);
    }

    public ConstructiblePlacementPrerequisites {
        if (neighbourTiles != null && neighbourTiles.isEmpty()) {
            neighbourTiles = null;
        }
        if (terrain != null && terrain.isEmpty()) {
            terrain = null;
        }
        if (river != null && river.isEmpty()) {
            river = null;
        }
        if (pointOfInterest != null && pointOfInterest.isEmpty()) {
            pointOfInterest = null;
        }
    }

    public boolean isEmpty() {
        return neighbourTiles == null && terrain == null && river == null && pointOfInterest == null;
    }
}
