package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Improvement;
import ewshop.domain.model.ConstructibleNeighbourPlacement;
import ewshop.domain.model.ConstructiblePointOfInterestPlacement;
import ewshop.domain.model.ConstructiblePlacementPrerequisites;
import ewshop.domain.model.ConstructibleRiverPlacement;
import ewshop.domain.model.ConstructibleTerrainPlacement;
import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ImprovementMapper {

    public Improvement toDomain(ImprovementEntity entity) {
        if (entity == null) return null;

        return Improvement.builder()
                .constructibleKey(entity.getConstructibleKey())
                .displayName(entity.getDisplayName())
                .category(entity.getCategory())
                .descriptionLines(entity.getDescriptionLines())
                .unlockTechnologyKeys(entity.getUnlockTechnologyKeys())
                .placementPrerequisites(toPlacement(entity))
                .build();
    }

    public ImprovementEntity toEntity(Improvement domain) {
        if (domain == null) return null;

        ImprovementEntity entity = new ImprovementEntity();
        entity.setConstructibleKey(domain.getConstructibleKey());
        entity.setDisplayName(domain.getDisplayName());
        entity.setCategory(domain.getCategory());
        entity.setDescriptionLines(domain.getDescriptionLines());
        entity.setUnlockTechnologyKeys(domain.getUnlockTechnologyKeys());
        applyPlacement(entity, domain.getPlacementPrerequisites());
        return entity;
    }

    private static ConstructiblePlacementPrerequisites toPlacement(ImprovementEntity entity) {
        ConstructiblePlacementPrerequisites placement = new ConstructiblePlacementPrerequisites(
                new ConstructibleNeighbourPlacement(
                        entity.getPlacementNeighbourOperator(),
                        entity.getPlacementNeighbourTerritoryConstraint(),
                        entity.getPlacementNeighbourIgnoreCliff()
                ),
                new ConstructibleTerrainPlacement(
                        entity.getPlacementTerrainConstraint(),
                        entity.getPlacementTerrainTypeKeys(),
                        entity.getPlacementTerrainCanBuildOnWasteland(),
                        entity.getPlacementTerrainCanBuildOnMud()
                ),
                new ConstructibleRiverPlacement(entity.getPlacementRiverConstraint()),
                new ConstructiblePointOfInterestPlacement(
                        entity.getPlacementPointOfInterestConstraint(),
                        entity.getPlacementPointOfInterestKeys()
                )
        );
        return placement.isEmpty() ? null : placement;
    }

    private static void applyPlacement(ImprovementEntity entity, ConstructiblePlacementPrerequisites placement) {
        ConstructibleNeighbourPlacement neighbour = placement == null ? null : placement.neighbourTiles();
        ConstructibleTerrainPlacement terrain = placement == null ? null : placement.terrain();
        ConstructibleRiverPlacement river = placement == null ? null : placement.river();
        ConstructiblePointOfInterestPlacement pointOfInterest = placement == null ? null : placement.pointOfInterest();
        entity.setPlacementNeighbourOperator(neighbour == null ? null : neighbour.operator());
        entity.setPlacementNeighbourTerritoryConstraint(neighbour == null ? null : neighbour.territoryConstraint());
        entity.setPlacementNeighbourIgnoreCliff(neighbour == null ? null : neighbour.ignoreCliff());
        entity.setPlacementTerrainConstraint(terrain == null ? null : terrain.constraint());
        entity.setPlacementTerrainTypeKeys(terrain == null ? List.of() : terrain.terrainTypeKeys());
        entity.setPlacementTerrainCanBuildOnWasteland(terrain == null ? null : terrain.canBuildOnWasteland());
        entity.setPlacementTerrainCanBuildOnMud(terrain == null ? null : terrain.canBuildOnMud());
        entity.setPlacementRiverConstraint(river == null ? null : river.constraint());
        entity.setPlacementPointOfInterestConstraint(pointOfInterest == null ? null : pointOfInterest.constraint());
        entity.setPlacementPointOfInterestKeys(pointOfInterest == null ? List.of() : pointOfInterest.pointOfInterestKeys());
    }
}
