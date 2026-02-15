package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.DistrictImportSnapshot;
import ewshop.domain.model.District;
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

        if (isInsert) return UpsertOutcome.INSERTED;
        return changed ? UpsertOutcome.UPDATED : UpsertOutcome.UNCHANGED;
    }

    private static District toDomain(DistrictEntity e) {
        return District.builder()
                .districtKey(e.getDistrictKey())
                .displayName(e.getDisplayName())
                .category(e.getCategory())
                .descriptionLines(e.getDescriptionLines())
                .build();
    }
}