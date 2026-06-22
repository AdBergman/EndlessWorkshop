package ewshop.facade.mapper;

import ewshop.domain.model.Skills;
import ewshop.facade.dto.response.SkillsDto;

public final class SkillMapper {

    private SkillMapper() {}

    public static SkillsDto toDto(Skills skills) {
        if (skills == null) return new SkillsDto(java.util.List.of(), java.util.List.of(), java.util.List.of(), java.util.List.of());

        return new SkillsDto(
                skills.skillTrees().stream().map(SkillMapper::toDto).toList(),
                skills.skillTiers().stream().map(SkillMapper::toDto).toList(),
                skills.skills().stream().map(SkillMapper::toDto).toList(),
                skills.heroSkillDefaults().stream().map(SkillMapper::toDto).toList()
        );
    }

    private static SkillsDto.SkillTreeDto toDto(Skills.SkillTree tree) {
        return new SkillsDto.SkillTreeDto(
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

    private static SkillsDto.SkillTierDto toDto(Skills.SkillTier tier) {
        return new SkillsDto.SkillTierDto(
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

    private static SkillsDto.HeroSkillDto toDto(Skills.HeroSkill skill) {
        return new SkillsDto.HeroSkillDto(
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

    private static SkillsDto.HeroSkillDefaultDto toDto(Skills.HeroSkillDefault defaultSkill) {
        return new SkillsDto.HeroSkillDefaultDto(
                defaultSkill.heroKey(),
                defaultSkill.defaultSkillKeys(),
                defaultSkill.referenceKeys(),
                defaultSkill.factionKey(),
                defaultSkill.classKey()
        );
    }
}
