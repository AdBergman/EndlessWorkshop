package ewshop.domain.model;

import java.util.List;
import java.util.Map;

public record RichSkills(
        List<SkillTree> skillTrees,
        List<SkillTier> skillTiers,
        List<HeroSkill> skills,
        List<HeroSkillDefault> heroSkillDefaults
) {
    public RichSkills {
        skillTrees = skillTrees == null ? List.of() : List.copyOf(skillTrees);
        skillTiers = skillTiers == null ? List.of() : List.copyOf(skillTiers);
        skills = skills == null ? List.of() : List.copyOf(skills);
        heroSkillDefaults = heroSkillDefaults == null ? List.of() : List.copyOf(heroSkillDefaults);
    }

    public record SkillTree(
            String treeKey,
            String treeType,
            Boolean isHidden,
            List<String> tierPlacementKeys,
            List<String> tierKeys,
            List<String> skillKeys,
            List<String> referenceKeys,
            String classPrerequisiteKey,
            String factionPrerequisiteKey
    ) {
        public SkillTree {
            tierPlacementKeys = copy(tierPlacementKeys);
            tierKeys = copy(tierKeys);
            skillKeys = copy(skillKeys);
            referenceKeys = copy(referenceKeys);
        }
    }

    public record SkillTier(
            String tierPlacementKey,
            String tierKey,
            String treeKey,
            String treeType,
            Integer tierIndex,
            Integer levelPrerequisite,
            List<String> skillKeys,
            List<String> referenceKeys
    ) {
        public SkillTier {
            skillKeys = copy(skillKeys);
            referenceKeys = copy(referenceKeys);
        }
    }

    public record HeroSkill(
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
    ) {
        public HeroSkill {
            descriptionLines = copy(descriptionLines);
            resolvedSummaryLines = copy(resolvedSummaryLines);
            resolvedMechanicTags = copy(resolvedMechanicTags);
            placements = copyMaps(placements);
            prerequisiteSkillKeys = copy(prerequisiteSkillKeys);
            inhibitedBySkillKeys = copy(inhibitedBySkillKeys);
            lockedBySkillKeys = copy(lockedBySkillKeys);
            effects = copyMaps(effects);
            unitAbilityKeys = copy(unitAbilityKeys);
            battleSkillKeys = copy(battleSkillKeys);
            battleAbilityKeys = copy(battleAbilityKeys);
            descriptorKeys = copy(descriptorKeys);
            unitAbilityEventKeys = copy(unitAbilityEventKeys);
            rewardPerKillInBattleEffectKeys = copy(rewardPerKillInBattleEffectKeys);
            statAffinityNames = copy(statAffinityNames);
            defaultForHeroKeys = copy(defaultForHeroKeys);
            referenceKeys = copy(referenceKeys);
        }
    }

    public record HeroSkillDefault(
            String heroKey,
            List<String> defaultSkillKeys,
            List<String> referenceKeys,
            String factionKey,
            String classKey
    ) {
        public HeroSkillDefault {
            defaultSkillKeys = copy(defaultSkillKeys);
            referenceKeys = copy(referenceKeys);
        }
    }

    private static List<String> copy(List<String> values) {
        return values == null ? List.of() : List.copyOf(values);
    }

    private static List<Map<String, Object>> copyMaps(List<Map<String, Object>> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream().map(Map::copyOf).toList();
    }
}
