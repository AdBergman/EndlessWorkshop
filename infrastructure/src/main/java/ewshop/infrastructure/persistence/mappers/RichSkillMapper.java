package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.RichSkills;
import ewshop.infrastructure.persistence.entities.*;
import org.springframework.stereotype.Component;

@Component
public class RichSkillMapper {

    public RichSkills.SkillTree toDomain(HeroSkillTreeEntity entity) {
        if (entity == null) return null;
        return new RichSkills.SkillTree(
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

    public RichSkills.SkillTier toDomain(HeroSkillTierEntity entity) {
        if (entity == null) return null;
        return new RichSkills.SkillTier(
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

    public RichSkills.HeroSkill toDomain(HeroSkillEntity entity) {
        if (entity == null) return null;
        return new RichSkills.HeroSkill(
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

    public RichSkills.HeroSkillDefault toDomain(HeroSkillDefaultEntity entity) {
        if (entity == null) return null;
        return new RichSkills.HeroSkillDefault(
                entity.getHeroKey(),
                entity.getDefaultSkillKeys(),
                entity.getReferenceKeys(),
                entity.getFactionKey(),
                entity.getClassKey()
        );
    }
}
