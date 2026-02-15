package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.ImprovementImportSnapshot;
import ewshop.domain.model.Improvement;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.ImprovementRepository;
import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import ewshop.infrastructure.persistence.repositories.ImprovementJpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class ImprovementRepositoryAdapter implements ImprovementRepository {

    private final ImprovementJpaRepository improvementJpaRepository;

    public ImprovementRepositoryAdapter(ImprovementJpaRepository improvementJpaRepository) {
        this.improvementJpaRepository = improvementJpaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Improvement> findAll() {
        return improvementJpaRepository.findAll().stream()
                .map(ImprovementRepositoryAdapter::toDomain)
                .toList();
    }

    private enum UpsertOutcome { INSERTED, UPDATED, UNCHANGED }

    @Override
    @Transactional
    public ImportResult importImprovementSnapshot(List<ImprovementImportSnapshot> snapshots) {

        ImportResult result = new ImportResult();
        if (snapshots == null || snapshots.isEmpty()) return result;

        List<String> keepKeys = snapshots.stream()
                .map(ImprovementImportSnapshot::constructibleKey)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .toList();

        if (keepKeys.isEmpty()) {
            throw new IllegalStateException("Refusing to delete all improvements: keepKeys empty.");
        }

        Map<String, ImprovementEntity> existingByKey =
                improvementJpaRepository.findAllByConstructibleKeyIn(keepKeys).stream()
                        .collect(Collectors.toMap(ImprovementEntity::getConstructibleKey, Function.identity()));

        List<ImprovementEntity> toSave = new ArrayList<>();

        for (ImprovementImportSnapshot snapshot : snapshots) {
            if (snapshot == null) continue;

            String key = snapshot.constructibleKey();
            if (key == null || key.isBlank()) continue;

            ImprovementEntity entity = existingByKey.get(key);
            boolean isInsert = (entity == null);

            if (isInsert) {
                entity = new ImprovementEntity();
                entity.setConstructibleKey(key);
            }

            UpsertOutcome outcome = applySnapshot(entity, snapshot, isInsert);

            switch (outcome) {
                case INSERTED -> { toSave.add(entity); result.incrementInserted(); }
                case UPDATED  -> { toSave.add(entity); result.incrementUpdated(); }
                case UNCHANGED -> result.incrementUnchanged();
            }
        }

        if (!toSave.isEmpty()) {
            improvementJpaRepository.saveAll(toSave);
        }

        List<ImprovementEntity> obsolete = improvementJpaRepository.findAllByConstructibleKeyNotIn(keepKeys);
        if (!obsolete.isEmpty()) {
            improvementJpaRepository.deleteAll(obsolete);
            result.setDeleted(obsolete.size());
        }

        return result;
    }

    private static UpsertOutcome applySnapshot(ImprovementEntity entity, ImprovementImportSnapshot update, boolean isInsert) {
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

    private static Improvement toDomain(ImprovementEntity e) {
        return Improvement.builder()
                .constructibleKey(e.getConstructibleKey())
                .displayName(e.getDisplayName())
                .category(e.getCategory())
                .descriptionLines(e.getDescriptionLines())
                .build();
    }
}