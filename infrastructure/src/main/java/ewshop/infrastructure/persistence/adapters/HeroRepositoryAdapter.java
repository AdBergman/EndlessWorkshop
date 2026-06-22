package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.HeroImportSnapshot;
import ewshop.domain.model.Hero;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.HeroRepository;
import ewshop.infrastructure.persistence.entities.HeroEntity;
import ewshop.infrastructure.persistence.mappers.HeroMapper;
import ewshop.infrastructure.persistence.repositories.HeroJpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class HeroRepositoryAdapter implements HeroRepository {

    private final HeroJpaRepository repository;
    private final HeroMapper mapper;

    public HeroRepositoryAdapter(HeroJpaRepository repository, HeroMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    private enum UpsertOutcome { INSERTED, UPDATED, UNCHANGED }

    @Override
    @Transactional(readOnly = true)
    public List<Hero> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public ImportResult importHeroSnapshot(List<HeroImportSnapshot> snapshots) {
        ImportResult result = new ImportResult();
        if (snapshots == null || snapshots.isEmpty()) return result;

        List<String> keepKeys = snapshots.stream()
                .filter(Objects::nonNull)
                .map(HeroImportSnapshot::unitKey)
                .filter(key -> key != null && !key.isBlank())
                .distinct()
                .toList();
        if (keepKeys.isEmpty()) {
            throw new IllegalStateException("Refusing to delete all rich heroes: keepKeys empty.");
        }

        Map<String, HeroEntity> existingByKey = repository.findAllByUnitKeyIn(keepKeys).stream()
                .collect(Collectors.toMap(HeroEntity::getUnitKey, Function.identity()));

        List<HeroEntity> toSave = new ArrayList<>();
        for (HeroImportSnapshot snapshot : snapshots) {
            if (snapshot == null) continue;
            HeroEntity entity = existingByKey.get(snapshot.unitKey());
            boolean isInsert = entity == null;
            if (isInsert) {
                entity = new HeroEntity();
                entity.setUnitKey(snapshot.unitKey());
            }

            UpsertOutcome outcome = applySnapshot(entity, snapshot, isInsert);
            switch (outcome) {
                case INSERTED -> { toSave.add(entity); result.incrementInserted(); }
                case UPDATED -> { toSave.add(entity); result.incrementUpdated(); }
                case UNCHANGED -> result.incrementUnchanged();
            }
        }

        if (!toSave.isEmpty()) repository.saveAll(toSave);

        List<HeroEntity> obsolete = repository.findAllByUnitKeyNotIn(keepKeys);
        if (!obsolete.isEmpty()) {
            repository.deleteAll(obsolete);
            result.setDeleted(obsolete.size());
        }

        return result;
    }

    private static UpsertOutcome applySnapshot(
            HeroEntity entity,
            HeroImportSnapshot update,
            boolean isInsert
    ) {
        boolean changed = isInsert;
        changed |= setIfChanged(entity.getDisplayName(), update.displayName(), entity::setDisplayName);
        changed |= setIfChanged(entity.getFaction(), update.faction(), entity::setFaction);
        changed |= setIfChanged(entity.getFactionKey(), update.factionKey(), entity::setFactionKey);
        changed |= setIfChanged(entity.getIsMajorFaction(), update.isMajorFaction(), entity::setIsMajorFaction);
        changed |= setIfChanged(entity.getHeroKey(), update.heroKey(), entity::setHeroKey);
        changed |= setIfChanged(entity.getHeroClassKey(), update.heroClassKey(), entity::setHeroClassKey);
        changed |= setIfChanged(entity.getOriginKind(), update.originKind(), entity::setOriginKind);
        changed |= setIfChanged(entity.getOriginFactionKey(), update.originFactionKey(), entity::setOriginFactionKey);
        changed |= setIfChanged(entity.getMinorFactionKey(), update.minorFactionKey(), entity::setMinorFactionKey);
        changed |= setIfChanged(entity.getUnitClassKey(), update.unitClassKey(), entity::setUnitClassKey);
        changed |= setIfChanged(entity.getAttackSkillKey(), update.attackSkillKey(), entity::setAttackSkillKey);
        changed |= setListIfChanged(entity.getOwnAbilityKeys(), update.ownAbilityKeys(), entity::setOwnAbilityKeys);
        changed |= setListIfChanged(entity.getAbilityKeys(), update.abilityKeys(), entity::setAbilityKeys);
        changed |= setListIfChanged(entity.getCombatAbilityKeys(), update.combatAbilityKeys(), entity::setCombatAbilityKeys);
        changed |= setListIfChanged(entity.getTacticalAbilityKeys(), update.tacticalAbilityKeys(), entity::setTacticalAbilityKeys);
        changed |= setListIfChanged(entity.getPassiveAbilityKeys(), update.passiveAbilityKeys(), entity::setPassiveAbilityKeys);
        changed |= setListIfChanged(entity.getMechanicalAbilityKeys(), update.mechanicalAbilityKeys(), entity::setMechanicalAbilityKeys);
        changed |= setListIfChanged(entity.getClassRuleAbilityKeys(), update.classRuleAbilityKeys(), entity::setClassRuleAbilityKeys);
        changed |= setListIfChanged(
                entity.getHiddenHelperAbilityKeys(),
                update.hiddenHelperAbilityKeys(),
                entity::setHiddenHelperAbilityKeys
        );
        changed |= setListIfChanged(entity.getDefaultSkillKeys(), update.defaultSkillKeys(), entity::setDefaultSkillKeys);
        changed |= setListIfChanged(
                entity.getApplicableSkillTreeKeys(),
                update.applicableSkillTreeKeys(),
                entity::setApplicableSkillTreeKeys
        );
        changed |= setListIfChanged(entity.getDescriptionLines(), update.descriptionLines(), entity::setDescriptionLines);
        changed |= setListIfChanged(entity.getReferenceKeys(), update.referenceKeys(), entity::setReferenceKeys);

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
