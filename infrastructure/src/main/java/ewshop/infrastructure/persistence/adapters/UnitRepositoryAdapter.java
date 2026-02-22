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
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class UnitRepositoryAdapter implements UnitRepository {

    private final UnitJpaRepository unitJpaRepository;
    private final UnitMapper mapper;

    public UnitRepositoryAdapter(UnitJpaRepository unitJpaRepository, UnitMapper mapper) {
        this.unitJpaRepository = unitJpaRepository;
        this.mapper = mapper;
    }

    private enum UpsertOutcome { INSERTED, UPDATED, UNCHANGED }

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

        Map<String, UnitEntity> existingByKey = unitJpaRepository.findAllByUnitKeyIn(keepKeys).stream()
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

            if (outcome != UpsertOutcome.UNCHANGED) {
                toSave.add(entity);
            }

            switch (outcome) {
                case INSERTED -> result.incrementInserted();
                case UPDATED -> result.incrementUpdated();
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

    private static UpsertOutcome applySnapshot(UnitEntity entity, UnitImportSnapshot update, boolean isInsert) {
        boolean changed = isInsert;

        changed |= setIfChanged(entity.getDisplayName(), update.displayName(), entity::setDisplayName);

        changed |= setIfChanged(entity.getFaction(), update.faction(), entity::setFaction);
        changed |= setIfChanged(entity.isMajorFaction(), update.isMajorFaction(), entity::setMajorFaction);

        // artId is intentionally NOT touched by import snapshots (manual/backfill survives re-imports)

        changed |= setIfChanged(entity.isHero(), update.isHero(), entity::setHero);
        changed |= setIfChanged(entity.isChosen(), update.isChosen(), entity::setChosen);

        changed |= setIfChanged(entity.getSpawnType(), update.spawnType(), entity::setSpawnType);
        changed |= setIfChanged(entity.getPreviousUnitKey(), update.previousUnitKey(), entity::setPreviousUnitKey);
        changed |= setIfChanged(entity.getEvolutionTierIndex(), update.evolutionTierIndex(), entity::setEvolutionTierIndex);

        changed |= setIfChanged(entity.getUnitClassKey(), update.unitClassKey(), entity::setUnitClassKey);
        changed |= setIfChanged(entity.getAttackSkillKey(), update.attackSkillKey(), entity::setAttackSkillKey);

        List<String> nextEvos = safeList(update.nextEvolutionUnitKeys());
        if (!Objects.equals(entity.getNextEvolutionUnitKeys(), nextEvos)) {
            entity.setNextEvolutionUnitKeys(new ArrayList<>(nextEvos));
            changed = true;
        }

        List<String> nextAbilities = safeList(update.abilityKeys());
        if (!Objects.equals(entity.getAbilityKeys(), nextAbilities)) {
            entity.setAbilityKeys(new ArrayList<>(nextAbilities));
            changed = true;
        }

        List<String> nextLines = safeList(update.descriptionLines());
        if (!Objects.equals(entity.getDescriptionLines(), nextLines)) {
            entity.setDescriptionLines(new ArrayList<>(nextLines));
            changed = true;
        }

        if (isInsert) return UpsertOutcome.INSERTED;
        return changed ? UpsertOutcome.UPDATED : UpsertOutcome.UNCHANGED;
    }

    private static <T> boolean setIfChanged(T current, T next, java.util.function.Consumer<T> setter) {
        if (Objects.equals(current, next)) return false;
        setter.accept(next);
        return true;
    }

    private static <T> List<T> safeList(List<T> v) {
        return v == null ? List.of() : v;
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
        UnitEntity entity = unitJpaRepository.findByUnitKey(unit.getUnitKey())
                .orElseGet(() -> {
                    UnitEntity e = new UnitEntity();
                    e.setUnitKey(unit.getUnitKey());
                    return e;
                });

        entity.setDisplayName(unit.getDisplayName());
        entity.setArtId(unit.getArtId());

        entity.setFaction(unit.getFaction());
        entity.setMajorFaction(unit.isMajorFaction());

        entity.setHero(unit.isHero());
        entity.setChosen(unit.isChosen());
        entity.setSpawnType(unit.getSpawnType());
        entity.setPreviousUnitKey(unit.getPreviousUnitKey());
        entity.setEvolutionTierIndex(unit.getEvolutionTierIndex());
        entity.setUnitClassKey(unit.getUnitClassKey());
        entity.setAttackSkillKey(unit.getAttackSkillKey());

        entity.setNextEvolutionUnitKeys(new ArrayList<>(safeList(unit.getNextEvolutionUnitKeys())));
        entity.setAbilityKeys(new ArrayList<>(safeList(unit.getAbilityKeys())));
        entity.setDescriptionLines(new ArrayList<>(safeList(unit.getDescriptionLines())));

        return mapper.toDomain(unitJpaRepository.save(entity));
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