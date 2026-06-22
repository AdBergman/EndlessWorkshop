package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.SkillImportSnapshot;
import ewshop.domain.model.Skills;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.SkillRepository;
import ewshop.infrastructure.persistence.entities.*;
import ewshop.infrastructure.persistence.mappers.SkillMapper;
import ewshop.infrastructure.persistence.repositories.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class SkillRepositoryAdapter implements SkillRepository {

    private final HeroSkillTreeJpaRepository treeRepository;
    private final HeroSkillTierJpaRepository tierRepository;
    private final HeroSkillJpaRepository skillRepository;
    private final HeroSkillDefaultJpaRepository defaultRepository;
    private final SkillMapper mapper;

    public SkillRepositoryAdapter(
            HeroSkillTreeJpaRepository treeRepository,
            HeroSkillTierJpaRepository tierRepository,
            HeroSkillJpaRepository skillRepository,
            HeroSkillDefaultJpaRepository defaultRepository,
            SkillMapper mapper
    ) {
        this.treeRepository = treeRepository;
        this.tierRepository = tierRepository;
        this.skillRepository = skillRepository;
        this.defaultRepository = defaultRepository;
        this.mapper = mapper;
    }

    private enum UpsertOutcome { INSERTED, UPDATED, UNCHANGED }

    @Override
    @Transactional(readOnly = true)
    public Skills findAll() {
        return new Skills(
                treeRepository.findAll().stream().map(mapper::toDomain).toList(),
                tierRepository.findAll().stream().map(mapper::toDomain).toList(),
                skillRepository.findAll().stream().map(mapper::toDomain).toList(),
                defaultRepository.findAll().stream().map(mapper::toDomain).toList()
        );
    }

    @Override
    @Transactional
    public ImportResult importSkillSnapshot(SkillImportSnapshot snapshot) {
        ImportResult result = new ImportResult();
        if (snapshot == null || snapshot.skills().isEmpty()) return result;

        importTrees(snapshot.skillTrees(), result);
        importTiers(snapshot.skillTiers(), result);
        importSkills(snapshot.skills(), result);
        importDefaults(snapshot.heroSkillDefaults(), result);
        return result;
    }

    private void importTrees(List<SkillImportSnapshot.SkillTreeSnapshot> snapshots, ImportResult result) {
        List<String> keepKeys = snapshots.stream().map(SkillImportSnapshot.SkillTreeSnapshot::treeKey).distinct().toList();
        Map<String, HeroSkillTreeEntity> existing = treeRepository.findAllByTreeKeyIn(keepKeys).stream()
                .collect(Collectors.toMap(HeroSkillTreeEntity::getTreeKey, Function.identity()));
        List<HeroSkillTreeEntity> toSave = new ArrayList<>();
        for (SkillImportSnapshot.SkillTreeSnapshot snapshot : snapshots) {
            HeroSkillTreeEntity entity = existing.get(snapshot.treeKey());
            boolean isInsert = entity == null;
            if (isInsert) {
                entity = new HeroSkillTreeEntity();
                entity.setTreeKey(snapshot.treeKey());
            }
            boolean changed = isInsert;
            changed |= setIfChanged(entity.getTreeType(), snapshot.treeType(), entity::setTreeType);
            changed |= setIfChanged(entity.getIsHidden(), snapshot.isHidden(), entity::setIsHidden);
            changed |= setListIfChanged(entity.getTierPlacementKeys(), snapshot.tierPlacementKeys(), entity::setTierPlacementKeys);
            changed |= setListIfChanged(entity.getTierKeys(), snapshot.tierKeys(), entity::setTierKeys);
            changed |= setListIfChanged(entity.getSkillKeys(), snapshot.skillKeys(), entity::setSkillKeys);
            changed |= setListIfChanged(entity.getReferenceKeys(), snapshot.referenceKeys(), entity::setReferenceKeys);
            changed |= setIfChanged(entity.getClassPrerequisiteKey(), snapshot.classPrerequisiteKey(), entity::setClassPrerequisiteKey);
            changed |= setIfChanged(entity.getFactionPrerequisiteKey(), snapshot.factionPrerequisiteKey(), entity::setFactionPrerequisiteKey);
            recordOutcome(result, toSave, entity, isInsert, changed);
        }
        if (!toSave.isEmpty()) treeRepository.saveAll(toSave);
        deleteObsoleteTrees(keepKeys, result);
    }

    private void importTiers(List<SkillImportSnapshot.SkillTierSnapshot> snapshots, ImportResult result) {
        List<String> keepKeys = snapshots.stream().map(SkillImportSnapshot.SkillTierSnapshot::tierPlacementKey).distinct().toList();
        Map<String, HeroSkillTierEntity> existing = tierRepository.findAllByTierPlacementKeyIn(keepKeys).stream()
                .collect(Collectors.toMap(HeroSkillTierEntity::getTierPlacementKey, Function.identity()));
        List<HeroSkillTierEntity> toSave = new ArrayList<>();
        for (SkillImportSnapshot.SkillTierSnapshot snapshot : snapshots) {
            HeroSkillTierEntity entity = existing.get(snapshot.tierPlacementKey());
            boolean isInsert = entity == null;
            if (isInsert) {
                entity = new HeroSkillTierEntity();
                entity.setTierPlacementKey(snapshot.tierPlacementKey());
            }
            boolean changed = isInsert;
            changed |= setIfChanged(entity.getTierKey(), snapshot.tierKey(), entity::setTierKey);
            changed |= setIfChanged(entity.getTreeKey(), snapshot.treeKey(), entity::setTreeKey);
            changed |= setIfChanged(entity.getTreeType(), snapshot.treeType(), entity::setTreeType);
            changed |= setIfChanged(entity.getTierIndex(), snapshot.tierIndex(), entity::setTierIndex);
            changed |= setIfChanged(entity.getLevelPrerequisite(), snapshot.levelPrerequisite(), entity::setLevelPrerequisite);
            changed |= setListIfChanged(entity.getSkillKeys(), snapshot.skillKeys(), entity::setSkillKeys);
            changed |= setListIfChanged(entity.getReferenceKeys(), snapshot.referenceKeys(), entity::setReferenceKeys);
            recordOutcome(result, toSave, entity, isInsert, changed);
        }
        if (!toSave.isEmpty()) tierRepository.saveAll(toSave);
        deleteObsoleteTiers(keepKeys, result);
    }

    private void importSkills(List<SkillImportSnapshot.HeroSkillSnapshot> snapshots, ImportResult result) {
        List<String> keepKeys = snapshots.stream().map(SkillImportSnapshot.HeroSkillSnapshot::skillKey).distinct().toList();
        Map<String, HeroSkillEntity> existing = skillRepository.findAllBySkillKeyIn(keepKeys).stream()
                .collect(Collectors.toMap(HeroSkillEntity::getSkillKey, Function.identity()));
        List<HeroSkillEntity> toSave = new ArrayList<>();
        for (SkillImportSnapshot.HeroSkillSnapshot snapshot : snapshots) {
            HeroSkillEntity entity = existing.get(snapshot.skillKey());
            boolean isInsert = entity == null;
            if (isInsert) {
                entity = new HeroSkillEntity();
                entity.setSkillKey(snapshot.skillKey());
            }
            boolean changed = applySkill(entity, snapshot, isInsert);
            recordOutcome(result, toSave, entity, isInsert, changed);
        }
        if (!toSave.isEmpty()) skillRepository.saveAll(toSave);
        deleteObsoleteSkills(keepKeys, result);
    }

    private void importDefaults(List<SkillImportSnapshot.HeroSkillDefaultSnapshot> snapshots, ImportResult result) {
        if (snapshots.isEmpty()) return;
        List<String> keepKeys = snapshots.stream().map(SkillImportSnapshot.HeroSkillDefaultSnapshot::heroKey).distinct().toList();
        Map<String, HeroSkillDefaultEntity> existing = defaultRepository.findAllByHeroKeyIn(keepKeys).stream()
                .collect(Collectors.toMap(HeroSkillDefaultEntity::getHeroKey, Function.identity()));
        List<HeroSkillDefaultEntity> toSave = new ArrayList<>();
        for (SkillImportSnapshot.HeroSkillDefaultSnapshot snapshot : snapshots) {
            HeroSkillDefaultEntity entity = existing.get(snapshot.heroKey());
            boolean isInsert = entity == null;
            if (isInsert) {
                entity = new HeroSkillDefaultEntity();
                entity.setHeroKey(snapshot.heroKey());
            }
            boolean changed = isInsert;
            changed |= setListIfChanged(entity.getDefaultSkillKeys(), snapshot.defaultSkillKeys(), entity::setDefaultSkillKeys);
            changed |= setListIfChanged(entity.getReferenceKeys(), snapshot.referenceKeys(), entity::setReferenceKeys);
            changed |= setIfChanged(entity.getFactionKey(), snapshot.factionKey(), entity::setFactionKey);
            changed |= setIfChanged(entity.getClassKey(), snapshot.classKey(), entity::setClassKey);
            recordOutcome(result, toSave, entity, isInsert, changed);
        }
        if (!toSave.isEmpty()) defaultRepository.saveAll(toSave);
        deleteObsoleteDefaults(keepKeys, result);
    }

    private static boolean applySkill(
            HeroSkillEntity entity,
            SkillImportSnapshot.HeroSkillSnapshot snapshot,
            boolean isInsert
    ) {
        boolean changed = isInsert;
        changed |= setIfChanged(entity.getEntryKey(), snapshot.entryKey(), entity::setEntryKey);
        changed |= setIfChanged(entity.getKind(), snapshot.kind(), entity::setKind);
        changed |= setIfChanged(entity.getDisplayName(), snapshot.displayName(), entity::setDisplayName);
        changed |= setIfChanged(entity.getPublicDisplayName(), snapshot.publicDisplayName(), entity::setPublicDisplayName);
        changed |= setIfChanged(entity.getPrimaryAbilityKey(), snapshot.primaryAbilityKey(), entity::setPrimaryAbilityKey);
        changed |= setListIfChanged(entity.getDescriptionLines(), snapshot.descriptionLines(), entity::setDescriptionLines);
        changed |= setIfChanged(entity.getResolvedDisplayName(), snapshot.resolvedDisplayName(), entity::setResolvedDisplayName);
        changed |= setListIfChanged(entity.getResolvedSummaryLines(), snapshot.resolvedSummaryLines(), entity::setResolvedSummaryLines);
        changed |= setIfChanged(entity.getResolvedMechanicKind(), snapshot.resolvedMechanicKind(), entity::setResolvedMechanicKind);
        changed |= setListIfChanged(entity.getResolvedMechanicTags(), snapshot.resolvedMechanicTags(), entity::setResolvedMechanicTags);
        changed |= setIfChanged(entity.getIsObsolete(), snapshot.isObsolete(), entity::setIsObsolete);
        changed |= setIfChanged(entity.getIsActive(), snapshot.isActive(), entity::setIsActive);
        changed |= setIfChanged(entity.getIsPassive(), snapshot.isPassive(), entity::setIsPassive);
        changed |= setListIfChanged(entity.getPlacements(), snapshot.placements(), entity::setPlacements);
        changed |= setListIfChanged(entity.getPrerequisiteSkillKeys(), snapshot.prerequisiteSkillKeys(), entity::setPrerequisiteSkillKeys);
        changed |= setListIfChanged(entity.getInhibitedBySkillKeys(), snapshot.inhibitedBySkillKeys(), entity::setInhibitedBySkillKeys);
        changed |= setListIfChanged(entity.getLockedBySkillKeys(), snapshot.lockedBySkillKeys(), entity::setLockedBySkillKeys);
        changed |= setListIfChanged(entity.getEffects(), snapshot.effects(), entity::setEffects);
        changed |= setListIfChanged(entity.getUnitAbilityKeys(), snapshot.unitAbilityKeys(), entity::setUnitAbilityKeys);
        changed |= setListIfChanged(entity.getBattleSkillKeys(), snapshot.battleSkillKeys(), entity::setBattleSkillKeys);
        changed |= setListIfChanged(entity.getBattleAbilityKeys(), snapshot.battleAbilityKeys(), entity::setBattleAbilityKeys);
        changed |= setListIfChanged(entity.getDescriptorKeys(), snapshot.descriptorKeys(), entity::setDescriptorKeys);
        changed |= setListIfChanged(entity.getUnitAbilityEventKeys(), snapshot.unitAbilityEventKeys(), entity::setUnitAbilityEventKeys);
        changed |= setListIfChanged(entity.getRewardPerKillInBattleEffectKeys(), snapshot.rewardPerKillInBattleEffectKeys(), entity::setRewardPerKillInBattleEffectKeys);
        changed |= setListIfChanged(entity.getStatAffinityNames(), snapshot.statAffinityNames(), entity::setStatAffinityNames);
        changed |= setListIfChanged(entity.getDefaultForHeroKeys(), snapshot.defaultForHeroKeys(), entity::setDefaultForHeroKeys);
        changed |= setListIfChanged(entity.getReferenceKeys(), snapshot.referenceKeys(), entity::setReferenceKeys);
        return changed;
    }

    private void deleteObsoleteTrees(List<String> keepKeys, ImportResult result) {
        List<HeroSkillTreeEntity> obsolete = treeRepository.findAllByTreeKeyNotIn(keepKeys);
        if (!obsolete.isEmpty()) { treeRepository.deleteAll(obsolete); result.setDeleted(result.getDeleted() + obsolete.size()); }
    }

    private void deleteObsoleteTiers(List<String> keepKeys, ImportResult result) {
        List<HeroSkillTierEntity> obsolete = tierRepository.findAllByTierPlacementKeyNotIn(keepKeys);
        if (!obsolete.isEmpty()) { tierRepository.deleteAll(obsolete); result.setDeleted(result.getDeleted() + obsolete.size()); }
    }

    private void deleteObsoleteSkills(List<String> keepKeys, ImportResult result) {
        List<HeroSkillEntity> obsolete = skillRepository.findAllBySkillKeyNotIn(keepKeys);
        if (!obsolete.isEmpty()) { skillRepository.deleteAll(obsolete); result.setDeleted(result.getDeleted() + obsolete.size()); }
    }

    private void deleteObsoleteDefaults(List<String> keepKeys, ImportResult result) {
        List<HeroSkillDefaultEntity> obsolete = defaultRepository.findAllByHeroKeyNotIn(keepKeys);
        if (!obsolete.isEmpty()) { defaultRepository.deleteAll(obsolete); result.setDeleted(result.getDeleted() + obsolete.size()); }
    }

    private static <T> void recordOutcome(
            ImportResult result,
            List<T> toSave,
            T entity,
            boolean isInsert,
            boolean changed
    ) {
        if (isInsert) {
            toSave.add(entity);
            result.incrementInserted();
        } else if (changed) {
            toSave.add(entity);
            result.incrementUpdated();
        } else {
            result.incrementUnchanged();
        }
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
