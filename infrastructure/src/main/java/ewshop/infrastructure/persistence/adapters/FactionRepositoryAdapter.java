package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.FactionImportSnapshot;
import ewshop.domain.model.Faction;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.FactionRepository;
import ewshop.infrastructure.persistence.entities.FactionEntity;
import ewshop.infrastructure.persistence.mappers.FactionMapper;
import ewshop.infrastructure.persistence.repositories.FactionJpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class FactionRepositoryAdapter implements FactionRepository {

    private final FactionJpaRepository factionJpaRepository;
    private final FactionMapper mapper;

    public FactionRepositoryAdapter(FactionJpaRepository factionJpaRepository, FactionMapper mapper) {
        this.factionJpaRepository = factionJpaRepository;
        this.mapper = mapper;
    }

    private enum UpsertOutcome { INSERTED, UPDATED, UNCHANGED }

    @Override
    @Transactional(readOnly = true)
    public List<Faction> findAll() {
        return factionJpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public ImportResult importFactionSnapshot(List<FactionImportSnapshot> snapshots) {
        ImportResult result = new ImportResult();
        if (snapshots == null || snapshots.isEmpty()) return result;

        List<String> keepKeys = snapshots.stream()
                .filter(Objects::nonNull)
                .map(FactionImportSnapshot::factionKey)
                .filter(key -> key != null && !key.isBlank())
                .distinct()
                .toList();

        if (keepKeys.isEmpty()) {
            throw new IllegalStateException("Refusing to delete all factions: keepKeys empty.");
        }

        Map<String, FactionEntity> existingByKey = factionJpaRepository.findAllByFactionKeyIn(keepKeys).stream()
                .collect(Collectors.toMap(FactionEntity::getFactionKey, Function.identity()));

        List<FactionEntity> toSave = new ArrayList<>();

        for (FactionImportSnapshot snapshot : snapshots) {
            if (snapshot == null) continue;

            FactionEntity entity = existingByKey.get(snapshot.factionKey());
            boolean isInsert = entity == null;

            if (isInsert) {
                entity = new FactionEntity();
                entity.setFactionKey(snapshot.factionKey());
            }

            UpsertOutcome outcome = applySnapshot(entity, snapshot, isInsert);
            switch (outcome) {
                case INSERTED -> { toSave.add(entity); result.incrementInserted(); }
                case UPDATED -> { toSave.add(entity); result.incrementUpdated(); }
                case UNCHANGED -> result.incrementUnchanged();
            }
        }

        if (!toSave.isEmpty()) {
            factionJpaRepository.saveAll(toSave);
        }

        List<FactionEntity> obsolete = factionJpaRepository.findAllByFactionKeyNotIn(keepKeys);
        if (!obsolete.isEmpty()) {
            factionJpaRepository.deleteAll(obsolete);
            result.setDeleted(obsolete.size());
        }

        return result;
    }

    private static UpsertOutcome applySnapshot(
            FactionEntity entity,
            FactionImportSnapshot update,
            boolean isInsert
    ) {
        boolean changed = isInsert;

        changed |= setIfChanged(entity.getPublicDisplayName(), update.publicDisplayName(), entity::setPublicDisplayName);
        changed |= setIfChanged(entity.getLore(), update.lore(), entity::setLore);
        changed |= setIfChanged(entity.getFactionKind(), update.factionKind(), entity::setFactionKind);
        changed |= setIfChanged(entity.getAffinityKey(), update.affinityKey(), entity::setAffinityKey);
        changed |= setIfChanged(entity.getAffinityType(), update.affinityType(), entity::setAffinityType);
        changed |= setListIfChanged(entity.getTraitKeys(), update.traitKeys(), entity::setTraitKeys);
        changed |= setListIfChanged(entity.getPopulationKeys(), update.populationKeys(), entity::setPopulationKeys);
        changed |= setListIfChanged(entity.getUnitKeys(), update.unitKeys(), entity::setUnitKeys);
        changed |= setListIfChanged(entity.getBaseUnitKeys(), update.baseUnitKeys(), entity::setBaseUnitKeys);
        changed |= setListIfChanged(entity.getHeroKeys(), update.heroKeys(), entity::setHeroKeys);
        changed |= setListIfChanged(entity.getGatedTechnologyKeys(), update.gatedTechnologyKeys(), entity::setGatedTechnologyKeys);
        changed |= setIfChanged(
                entity.getStartingFactionQuestKey(),
                update.startingFactionQuestKey(),
                entity::setStartingFactionQuestKey
        );
        changed |= setListIfChanged(entity.getSpecificQuestKeys(), update.specificQuestKeys(), entity::setSpecificQuestKeys);
        changed |= setListIfChanged(
                entity.getProtectorateTraitKeys(),
                update.protectorateTraitKeys(),
                entity::setProtectorateTraitKeys
        );

        if (isInsert) return UpsertOutcome.INSERTED;
        return changed ? UpsertOutcome.UPDATED : UpsertOutcome.UNCHANGED;
    }

    private static <T> boolean setIfChanged(T current, T next, java.util.function.Consumer<T> setter) {
        if (Objects.equals(current, next)) return false;
        setter.accept(next);
        return true;
    }

    private static <T> boolean setListIfChanged(List<T> current, List<T> next, java.util.function.Consumer<List<T>> setter) {
        List<T> safeNext = next == null ? List.of() : next;
        if (Objects.equals(current, safeNext)) return false;
        setter.accept(new ArrayList<>(safeNext));
        return true;
    }
}
