package ewshop.facade.mapper;

import ewshop.domain.model.RichSkills;
import ewshop.facade.dto.response.RichSkillsDto;

public final class RichSkillMapper {

    private RichSkillMapper() {}

    public static RichSkillsDto toDto(RichSkills skills) {
        if (skills == null) return new RichSkillsDto(java.util.List.of(), java.util.List.of(), java.util.List.of(), java.util.List.of());

        return new RichSkillsDto(
                skills.skillTrees().stream().map(RichSkillMapper::toDto).toList(),
                skills.skillTiers().stream().map(RichSkillMapper::toDto).toList(),
                skills.skills().stream().map(RichSkillMapper::toDto).toList(),
                skills.heroSkillDefaults().stream().map(RichSkillMapper::toDto).toList()
        );
    }

    private static RichSkillsDto.SkillTreeDto toDto(RichSkills.SkillTree tree) {
        return new RichSkillsDto.SkillTreeDto(
                tree.treeKey(),
                tree.treeType(),
                tree.isHidden(),
                tree.tierPlacementKeys(),
                tree.tierKeys(),
                tree.skillKeys(),
                tree.referenceKeys(),
                tree.classPrerequisiteKey(),
                tree.factionPrerequisiteKey()
        );
    }

    private static RichSkillsDto.SkillTierDto toDto(RichSkills.SkillTier tier) {
        return new RichSkillsDto.SkillTierDto(
                tier.tierPlacementKey(),
                tier.tierKey(),
                tier.treeKey(),
                tier.treeType(),
                tier.tierIndex(),
                tier.levelPrerequisite(),
                tier.skillKeys(),
                tier.referenceKeys()
        );
    }

    private static RichSkillsDto.HeroSkillDto toDto(RichSkills.HeroSkill skill) {
        return new RichSkillsDto.HeroSkillDto(
                skill.skillKey(),
                skill.entryKey(),
                skill.kind(),
                skill.displayName(),
                skill.publicDisplayName(),
                skill.primaryAbilityKey(),
                skill.descriptionLines(),
                skill.resolvedDisplayName(),
                skill.resolvedSummaryLines(),
                skill.resolvedMechanicKind(),
                skill.resolvedMechanicTags(),
                skill.isObsolete(),
                skill.isActive(),
                skill.isPassive(),
                skill.placements(),
                skill.prerequisiteSkillKeys(),
                skill.inhibitedBySkillKeys(),
                skill.lockedBySkillKeys(),
                skill.effects(),
                skill.unitAbilityKeys(),
                skill.battleSkillKeys(),
                skill.battleAbilityKeys(),
                skill.descriptorKeys(),
                skill.unitAbilityEventKeys(),
                skill.rewardPerKillInBattleEffectKeys(),
                skill.statAffinityNames(),
                skill.defaultForHeroKeys(),
                skill.referenceKeys()
        );
    }

    private static RichSkillsDto.HeroSkillDefaultDto toDto(RichSkills.HeroSkillDefault defaultSkill) {
        return new RichSkillsDto.HeroSkillDefaultDto(
                defaultSkill.heroKey(),
                defaultSkill.defaultSkillKeys(),
                defaultSkill.referenceKeys(),
                defaultSkill.factionKey(),
                defaultSkill.classKey()
        );
    }
}
