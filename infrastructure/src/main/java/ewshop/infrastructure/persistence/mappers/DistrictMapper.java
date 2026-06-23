package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.District;
import ewshop.domain.model.ConstructibleNeighbourPlacement;
import ewshop.domain.model.ConstructiblePlacementPrerequisites;
import ewshop.domain.model.DistrictLevelUp;
import ewshop.infrastructure.persistence.entities.DistrictEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DistrictMapper {

    public District toDomain(DistrictEntity entity) {
        if (entity == null) return null;

        return District.builder()
                .districtKey(entity.getDistrictKey())
                .displayName(entity.getDisplayName())
                .category(entity.getCategory())
                .descriptionLines(entity.getDescriptionLines() == null
                        ? List.of()
                        : List.copyOf(entity.getDescriptionLines()))
                .unlockTechnologyKeys(entity.getUnlockTechnologyKeys())
                .levelUp(toLevelUp(entity))
                .placementPrerequisites(toPlacement(entity))
                .build();
    }

    public DistrictEntity toEntity(District domain) {
        if (domain == null) return null;

        DistrictEntity entity = new DistrictEntity();
        entity.setDistrictKey(domain.getDistrictKey());
        entity.setDisplayName(domain.getDisplayName());
        entity.setCategory(domain.getCategory());
        entity.setDescriptionLines(domain.getDescriptionLines() == null
                ? List.of()
                : new ArrayList<>(domain.getDescriptionLines()));
        entity.setUnlockTechnologyKeys(domain.getUnlockTechnologyKeys());
        applyLevelUp(entity, domain.getLevelUp());
        applyPlacement(entity, domain.getPlacementPrerequisites());
        return entity;
    }

    private static DistrictLevelUp toLevelUp(DistrictEntity entity) {
        DistrictLevelUp levelUp = new DistrictLevelUp(
                entity.getLevelUpTargetDistrictKey(),
                entity.getLevelUpRequiredAdjacentDistrictCount()
        );
        return levelUp.isEmpty() ? null : levelUp;
    }

    private static ConstructiblePlacementPrerequisites toPlacement(DistrictEntity entity) {
        ConstructiblePlacementPrerequisites placement = new ConstructiblePlacementPrerequisites(
                new ConstructibleNeighbourPlacement(
                        entity.getPlacementNeighbourOperator(),
                        entity.getPlacementNeighbourTerritoryConstraint(),
                        entity.getPlacementNeighbourIgnoreCliff()
                )
        );
        return placement.isEmpty() ? null : placement;
    }

    private static void applyLevelUp(DistrictEntity entity, DistrictLevelUp levelUp) {
        entity.setLevelUpTargetDistrictKey(levelUp == null ? null : levelUp.targetDistrictKey());
        entity.setLevelUpRequiredAdjacentDistrictCount(levelUp == null
                ? null
                : levelUp.requiredAdjacentDistrictCount());
    }

    private static void applyPlacement(DistrictEntity entity, ConstructiblePlacementPrerequisites placement) {
        ConstructibleNeighbourPlacement neighbour = placement == null ? null : placement.neighbourTiles();
        entity.setPlacementNeighbourOperator(neighbour == null ? null : neighbour.operator());
        entity.setPlacementNeighbourTerritoryConstraint(neighbour == null ? null : neighbour.territoryConstraint());
        entity.setPlacementNeighbourIgnoreCliff(neighbour == null ? null : neighbour.ignoreCliff());
    }
}
