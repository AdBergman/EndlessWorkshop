package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.UnitImportSnapshot;
import ewshop.domain.model.Unit;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.UnitRepository;
import ewshop.infrastructure.persistence.entities.UnitEntity;
import ewshop.infrastructure.persistence.mappers.UnitMapper;
import ewshop.infrastructure.persistence.repositories.UnitJpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class UnitRepositoryAdapter implements UnitRepository {

    private final UnitJpaRepository unitJpaRepository;
    private final UnitMapper mapper;

    public UnitRepositoryAdapter(UnitJpaRepository unitJpaRepository,
                                 UnitMapper mapper) {
        this.unitJpaRepository = unitJpaRepository;
        this.mapper = mapper;
    }

    private enum UpsertOutcome {INSERTED, UPDATED, UNCHANGED}

    @Override
    @Transactional
    public ImportResult importUnitSnapshot(List<UnitImportSnapshot> snapshots) {
        ImportResult result = new ImportResult();

        if (snapshots == null || snapshots.isEmpty()) {
            return result;
        }

        List<String> keepKeys = snapshots.stream()
                .map(UnitImportSnapshot::unitKey)
                .distinct()
                .toList();

        if (keepKeys.isEmpty()) {
            throw new IllegalStateException("Refusing to delete all units: keepKeys empty.");
        }

        Map<String, UnitEntity> existingByKey =
                unitJpaRepository.findAllByUnitKeyIn(keepKeys).stream()
                        .collect(Collectors.toMap(UnitEntity::getUnitKey, Function.identity()));

        List<UnitEntity> toSave = new ArrayList<>();

        for (UnitImportSnapshot snapshot : snapshots) {
            UnitEntity entity = existingByKey.get(snapshot.unitKey());
            boolean isInsert = (entity == null);

            if (isInsert) {
                entity = new UnitEntity();
                entity.setUnitKey(snapshot.unitKey());
            }

            UpsertOutcome outcome = applySnapshot(entity, snapshot, isInsert);

            switch (outcome) {
                case INSERTED -> {
                    toSave.add(entity);
                    result.incrementInserted();
                }
                case UPDATED -> {
                    toSave.add(entity);
                    result.incrementUpdated();
                }
                case UNCHANGED -> result.incrementUnchanged();
            }
        }

        if (!toSave.isEmpty()) {
            unitJpaRepository.saveAll(toSave);
        }

        List<UnitEntity> obsolete = unitJpaRepository.findAllByUnitKeyNotIn(keepKeys);
        if (!obsolete.isEmpty()) {
            unitJpaRepository.deleteAll(obsolete);
            result.setDeleted(obsolete.size());
        }

        return result;
    }

    private static UpsertOutcome applySnapshot(UnitEntity entity,
                                               UnitImportSnapshot update,
                                               boolean isInsert) {

        boolean changed = isInsert;

        if (!java.util.Objects.equals(entity.getDisplayName(), update.displayName())) {
            entity.setDisplayName(update.displayName());
            changed = true;
        }

        if (entity.isHero() != update.isHero()) {
            entity.setHero(update.isHero());
            changed = true;
        }

        if (entity.isChosen() != update.isChosen()) {
            entity.setChosen(update.isChosen());
            changed = true;
        }

        if (!java.util.Objects.equals(entity.getSpawnType(), update.spawnType())) {
            entity.setSpawnType(update.spawnType());
            changed = true;
        }

        if (!java.util.Objects.equals(entity.getPreviousUnitKey(), update.previousUnitKey())) {
            entity.setPreviousUnitKey(update.previousUnitKey());
            changed = true;
        }

        if (!java.util.Objects.equals(entity.getEvolutionTierIndex(), update.evolutionTierIndex())) {
            entity.setEvolutionTierIndex(update.evolutionTierIndex());
            changed = true;
        }

        if (!java.util.Objects.equals(entity.getUnitClassKey(), update.unitClassKey())) {
            entity.setUnitClassKey(update.unitClassKey());
            changed = true;
        }

        if (!java.util.Objects.equals(entity.getAttackSkillKey(), update.attackSkillKey())) {
            entity.setAttackSkillKey(update.attackSkillKey());
            changed = true;
        }

        List<String> nextEvos = update.nextEvolutionUnitKeys() == null
                ? List.of()
                : update.nextEvolutionUnitKeys();

        List<String> curEvos = entity.getNextEvolutionUnitKeys() == null
                ? List.of()
                : entity.getNextEvolutionUnitKeys();

        if (!curEvos.equals(nextEvos)) {
            entity.setNextEvolutionUnitKeys(new ArrayList<>(nextEvos));
            changed = true;
        }

        List<String> nextAbilities = update.abilityKeys() == null
                ? List.of()
                : update.abilityKeys();

        List<String> curAbilities = entity.getAbilityKeys() == null
                ? List.of()
                : entity.getAbilityKeys();

        if (!curAbilities.equals(nextAbilities)) {
            entity.setAbilityKeys(new ArrayList<>(nextAbilities));
            changed = true;
        }

        List<String> nextLines = update.descriptionLines() == null
                ? List.of()
                : update.descriptionLines();

        List<String> curLines = entity.getDescriptionLines() == null
                ? List.of()
                : entity.getDescriptionLines();

        if (!curLines.equals(nextLines)) {
            entity.setDescriptionLines(new ArrayList<>(nextLines));
            changed = true;
        }

        if (isInsert) return UpsertOutcome.INSERTED;
        return changed ? UpsertOutcome.UPDATED : UpsertOutcome.UNCHANGED;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Unit> findAll() {
        return unitJpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public Unit save(Unit unit) {
        UnitEntity entity = mapper.toEntity(unit);
        UnitEntity saved = unitJpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    @Transactional
    public void saveAll(List<Unit> units) {
        List<UnitEntity> entities = units.stream()
                .map(mapper::toEntity)
                .toList();
        unitJpaRepository.saveAll(entities);
    }
}