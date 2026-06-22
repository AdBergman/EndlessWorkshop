package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Skills;
import ewshop.infrastructure.persistence.entities.*;
import org.springframework.stereotype.Component;

@Component
public class SkillMapper {

    public Skills.SkillTree toDomain(HeroSkillTreeEntity entity) {
        if (entity == null) return null;
        return new Skills.SkillTree(
                entity.getTreeKey(),
                entity.getTreeType(),
                entity.getIsHidden(),
                entity.getTierPlacementKeys(),
                entity.getTierKeys(),
                entity.getSkillKeys(),
                entity.getReferenceKeys(),
                entity.getClassPrerequisiteKey(),
                entity.getFactionPrerequisiteKey()
        );
    }

    public Skills.SkillTier toDomain(HeroSkillTierEntity entity) {
        if (entity == null) return null;
        return new Skills.SkillTier(
                entity.getTierPlacementKey(),
                entity.getTierKey(),
                entity.getTreeKey(),
                entity.getTreeType(),
                entity.getTierIndex(),
                entity.getLevelPrerequisite(),
                entity.getSkillKeys(),
                entity.getReferenceKeys()
        );
    }

    public Skills.HeroSkill toDomain(HeroSkillEntity entity) {
        if (entity == null) return null;
        return new Skills.HeroSkill(
                entity.getSkillKey(),
                entity.getEntryKey(),
                entity.getKind(),
                entity.getDisplayName(),
                entity.getPublicDisplayName(),
                entity.getPrimaryAbilityKey(),
                entity.getDescriptionLines(),
                entity.getResolvedDisplayName(),
                entity.getResolvedSummaryLines(),
                entity.getResolvedMechanicKind(),
                entity.getResolvedMechanicTags(),
                entity.getIsObsolete(),
                entity.getIsActive(),
                entity.getIsPassive(),
                entity.getPlacements(),
                entity.getPrerequisiteSkillKeys(),
                entity.getInhibitedBySkillKeys(),
                entity.getLockedBySkillKeys(),
                entity.getEffects(),
                entity.getUnitAbilityKeys(),
                entity.getBattleSkillKeys(),
                entity.getBattleAbilityKeys(),
                entity.getDescriptorKeys(),
                entity.getUnitAbilityEventKeys(),
                entity.getRewardPerKillInBattleEffectKeys(),
                entity.getStatAffinityNames(),
                entity.getDefaultForHeroKeys(),
                entity.getReferenceKeys()
        );
    }

    public Skills.HeroSkillDefault toDomain(HeroSkillDefaultEntity entity) {
        if (entity == null) return null;
        return new Skills.HeroSkillDefault(
                entity.getHeroKey(),
                entity.getDefaultSkillKeys(),
                entity.getReferenceKeys(),
                entity.getFactionKey(),
                entity.getClassKey()
        );
    }
}
