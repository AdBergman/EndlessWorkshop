package ewshop.domain.model;

public record ConstructiblePlacementPrerequisites(
        ConstructibleNeighbourPlacement neighbourTiles
) {
    public ConstructiblePlacementPrerequisites {
        if (neighbourTiles != null && neighbourTiles.isEmpty()) {
            neighbourTiles = null;
        }
    }

    public boolean isEmpty() {
        return neighbourTiles == null;
    }
}
