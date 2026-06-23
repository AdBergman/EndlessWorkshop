package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.DistrictImportSnapshot;
import ewshop.domain.model.ConstructibleNeighbourPlacement;
import ewshop.domain.model.ConstructiblePlacementPrerequisites;
import ewshop.domain.model.District;
import ewshop.domain.model.DistrictLevelUp;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.DistrictRepository;
import ewshop.infrastructure.persistence.entities.DistrictEntity;
import ewshop.infrastructure.persistence.repositories.DistrictJpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class DistrictRepositoryAdapter implements DistrictRepository {

    private final DistrictJpaRepository districtJpaRepository;

    public DistrictRepositoryAdapter(DistrictJpaRepository districtJpaRepository) {
        this.districtJpaRepository = districtJpaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<District> findAll() {
        return districtJpaRepository.findAll().stream()
                .map(DistrictRepositoryAdapter::toDomain)
                .toList();
    }

    private enum UpsertOutcome { INSERTED, UPDATED, UNCHANGED }

    @Override
    @Transactional
    public ImportResult importDistrictSnapshot(List<DistrictImportSnapshot> snapshots) {

        ImportResult result = new ImportResult();
        if (snapshots == null || snapshots.isEmpty()) return result;

        List<String> keepKeys = snapshots.stream()
                .map(DistrictImportSnapshot::districtKey)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .toList();

        if (keepKeys.isEmpty()) {
            throw new IllegalStateException("Refusing to delete all districts: keepKeys empty.");
        }

        Map<String, DistrictEntity> existingByKey =
                districtJpaRepository.findAllByDistrictKeyIn(keepKeys).stream()
                        .collect(Collectors.toMap(DistrictEntity::getDistrictKey, Function.identity()));

        List<DistrictEntity> toSave = new ArrayList<>();

        for (DistrictImportSnapshot snapshot : snapshots) {
            if (snapshot == null) continue;

            String key = snapshot.districtKey();
            if (key == null || key.isBlank()) continue;

            DistrictEntity entity = existingByKey.get(key);
            boolean isInsert = (entity == null);

            if (isInsert) {
                entity = new DistrictEntity();
                entity.setDistrictKey(key);
            }

            UpsertOutcome outcome = applySnapshot(entity, snapshot, isInsert);

            switch (outcome) {
                case INSERTED -> { toSave.add(entity); result.incrementInserted(); }
                case UPDATED  -> { toSave.add(entity); result.incrementUpdated(); }
                case UNCHANGED -> result.incrementUnchanged();
            }
        }

        if (!toSave.isEmpty()) {
            districtJpaRepository.saveAll(toSave);
        }

        List<DistrictEntity> obsolete = districtJpaRepository.findAllByDistrictKeyNotIn(keepKeys);
        if (!obsolete.isEmpty()) {
            districtJpaRepository.deleteAll(obsolete);
            result.setDeleted(obsolete.size());
        }

        return result;
    }

    private static UpsertOutcome applySnapshot(DistrictEntity entity, DistrictImportSnapshot update, boolean isInsert) {
        boolean changed = isInsert;

        if (!Objects.equals(entity.getDisplayName(), update.displayName())) {
            entity.setDisplayName(update.displayName());
            changed = true;
        }

        if (!Objects.equals(entity.getCategory(), update.category())) {
            entity.setCategory(update.category());
            changed = true;
        }

        if (!Objects.equals(entity.getDescriptionLines(), update.descriptionLines())) {
            entity.setDescriptionLines(update.descriptionLines() == null
                    ? List.of()
                    : new ArrayList<>(update.descriptionLines()));
            changed = true;
        }

        if (!Objects.equals(entity.getUnlockTechnologyKeys(), update.unlockTechnologyKeys())) {
            entity.setUnlockTechnologyKeys(update.unlockTechnologyKeys());
            changed = true;
        }

        changed |= setLevelUpIfChanged(entity, update.levelUp());
        changed |= setPlacementIfChanged(entity, update.placementPrerequisites());

        if (isInsert) return UpsertOutcome.INSERTED;
        return changed ? UpsertOutcome.UPDATED : UpsertOutcome.UNCHANGED;
    }

    private static District toDomain(DistrictEntity e) {
        return District.builder()
                .districtKey(e.getDistrictKey())
                .displayName(e.getDisplayName())
                .category(e.getCategory())
                .descriptionLines(e.getDescriptionLines())
                .unlockTechnologyKeys(e.getUnlockTechnologyKeys())
                .levelUp(toLevelUp(e))
                .placementPrerequisites(toPlacement(e))
                .build();
    }

    private static boolean setLevelUpIfChanged(DistrictEntity entity, DistrictLevelUp levelUp) {
        String targetDistrictKey = levelUp == null ? null : levelUp.targetDistrictKey();
        Integer adjacentCount = levelUp == null ? null : levelUp.requiredAdjacentDistrictCount();
        boolean changed = false;

        if (!Objects.equals(entity.getLevelUpTargetDistrictKey(), targetDistrictKey)) {
            entity.setLevelUpTargetDistrictKey(targetDistrictKey);
            changed = true;
        }

        if (!Objects.equals(entity.getLevelUpRequiredAdjacentDistrictCount(), adjacentCount)) {
            entity.setLevelUpRequiredAdjacentDistrictCount(adjacentCount);
            changed = true;
        }

        return changed;
    }

    private static boolean setPlacementIfChanged(
            DistrictEntity entity,
            ConstructiblePlacementPrerequisites placement
    ) {
        ConstructibleNeighbourPlacement neighbour = placement == null ? null : placement.neighbourTiles();
        String operator = neighbour == null ? null : neighbour.operator();
        String territoryConstraint = neighbour == null ? null : neighbour.territoryConstraint();
        Boolean ignoreCliff = neighbour == null ? null : neighbour.ignoreCliff();
        boolean changed = false;

        if (!Objects.equals(entity.getPlacementNeighbourOperator(), operator)) {
            entity.setPlacementNeighbourOperator(operator);
            changed = true;
        }

        if (!Objects.equals(entity.getPlacementNeighbourTerritoryConstraint(), territoryConstraint)) {
            entity.setPlacementNeighbourTerritoryConstraint(territoryConstraint);
            changed = true;
        }

        if (!Objects.equals(entity.getPlacementNeighbourIgnoreCliff(), ignoreCliff)) {
            entity.setPlacementNeighbourIgnoreCliff(ignoreCliff);
            changed = true;
        }

        return changed;
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
}
