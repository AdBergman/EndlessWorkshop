package ewshop.facade.dto.response;

import java.util.List;
import java.util.Map;

public record RichSkillsDto(
        List<SkillTreeDto> skillTrees,
        List<SkillTierDto> skillTiers,
        List<HeroSkillDto> skills,
        List<HeroSkillDefaultDto> heroSkillDefaults
) {
    public record SkillTreeDto(
            String treeKey,
            String treeType,
            Boolean isHidden,
            List<String> tierPlacementKeys,
            List<String> tierKeys,
            List<String> skillKeys,
            List<String> referenceKeys,
            String classPrerequisiteKey,
            String factionPrerequisiteKey
    ) {}

    public record SkillTierDto(
            String tierPlacementKey,
            String tierKey,
            String treeKey,
            String treeType,
            Integer tierIndex,
            Integer levelPrerequisite,
            List<String> skillKeys,
            List<String> referenceKeys
    ) {}

    public record HeroSkillDto(
            String skillKey,
            String entryKey,
            String kind,
            String displayName,
            String publicDisplayName,
            String primaryAbilityKey,
            List<String> descriptionLines,
            String resolvedDisplayName,
            List<String> resolvedSummaryLines,
            String resolvedMechanicKind,
            List<String> resolvedMechanicTags,
            Boolean isObsolete,
            Boolean isActive,
            Boolean isPassive,
            List<Map<String, Object>> placements,
            List<String> prerequisiteSkillKeys,
            List<String> inhibitedBySkillKeys,
            List<String> lockedBySkillKeys,
            List<Map<String, Object>> effects,
            List<String> unitAbilityKeys,
            List<String> battleSkillKeys,
            List<String> battleAbilityKeys,
            List<String> descriptorKeys,
            List<String> unitAbilityEventKeys,
            List<String> rewardPerKillInBattleEffectKeys,
            List<String> statAffinityNames,
            List<String> defaultForHeroKeys,
            List<String> referenceKeys
    ) {}

    public record HeroSkillDefaultDto(
            String heroKey,
            List<String> defaultSkillKeys,
            List<String> referenceKeys,
            String factionKey,
            String classKey
    ) {}
}
