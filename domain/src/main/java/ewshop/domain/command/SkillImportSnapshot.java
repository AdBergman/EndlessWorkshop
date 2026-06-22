package ewshop.domain.command;

import java.util.List;
import java.util.Map;

public record SkillImportSnapshot(
        List<SkillTreeSnapshot> skillTrees,
        List<SkillTierSnapshot> skillTiers,
        List<HeroSkillSnapshot> skills,
        List<HeroSkillDefaultSnapshot> heroSkillDefaults
) {
    public SkillImportSnapshot {
        skillTrees = skillTrees == null ? List.of() : List.copyOf(skillTrees);
        skillTiers = skillTiers == null ? List.of() : List.copyOf(skillTiers);
        skills = skills == null ? List.of() : List.copyOf(skills);
        heroSkillDefaults = heroSkillDefaults == null ? List.of() : List.copyOf(heroSkillDefaults);
    }

    public record SkillTreeSnapshot(
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
        public SkillTreeSnapshot {
            treeKey = require(treeKey, "treeKey");
            treeType = trimToNull(treeType);
            tierPlacementKeys = cleanList(tierPlacementKeys);
            tierKeys = cleanList(tierKeys);
            skillKeys = cleanList(skillKeys);
            referenceKeys = cleanList(referenceKeys);
            classPrerequisiteKey = trimToNull(classPrerequisiteKey);
            factionPrerequisiteKey = trimToNull(factionPrerequisiteKey);
        }
    }

    public record SkillTierSnapshot(
            String tierPlacementKey,
            String tierKey,
            String treeKey,
            String treeType,
            Integer tierIndex,
            Integer levelPrerequisite,
            List<String> skillKeys,
            List<String> referenceKeys
    ) {
        public SkillTierSnapshot {
            tierPlacementKey = require(tierPlacementKey, "tierPlacementKey");
            tierKey = trimToNull(tierKey);
            treeKey = trimToNull(treeKey);
            treeType = trimToNull(treeType);
            skillKeys = cleanList(skillKeys);
            referenceKeys = cleanList(referenceKeys);
        }
    }

    public record HeroSkillSnapshot(
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
        public HeroSkillSnapshot {
            skillKey = require(skillKey, "skillKey");
            entryKey = trimToNull(entryKey);
            kind = trimToNull(kind);
            displayName = trimToNull(displayName);
            publicDisplayName = trimToNull(publicDisplayName);
            primaryAbilityKey = trimToNull(primaryAbilityKey);
            descriptionLines = cleanList(descriptionLines);
            resolvedDisplayName = trimToNull(resolvedDisplayName);
            resolvedSummaryLines = cleanList(resolvedSummaryLines);
            resolvedMechanicKind = trimToNull(resolvedMechanicKind);
            resolvedMechanicTags = cleanList(resolvedMechanicTags);
            placements = copyMaps(placements);
            prerequisiteSkillKeys = cleanList(prerequisiteSkillKeys);
            inhibitedBySkillKeys = cleanList(inhibitedBySkillKeys);
            lockedBySkillKeys = cleanList(lockedBySkillKeys);
            effects = copyMaps(effects);
            unitAbilityKeys = cleanList(unitAbilityKeys);
            battleSkillKeys = cleanList(battleSkillKeys);
            battleAbilityKeys = cleanList(battleAbilityKeys);
            descriptorKeys = cleanList(descriptorKeys);
            unitAbilityEventKeys = cleanList(unitAbilityEventKeys);
            rewardPerKillInBattleEffectKeys = cleanList(rewardPerKillInBattleEffectKeys);
            statAffinityNames = cleanList(statAffinityNames);
            defaultForHeroKeys = cleanList(defaultForHeroKeys);
            referenceKeys = cleanList(referenceKeys);
        }
    }

    public record HeroSkillDefaultSnapshot(
            String heroKey,
            List<String> defaultSkillKeys,
            List<String> referenceKeys,
            String factionKey,
            String classKey
    ) {
        public HeroSkillDefaultSnapshot {
            heroKey = require(heroKey, "heroKey");
            defaultSkillKeys = cleanList(defaultSkillKeys);
            referenceKeys = cleanList(referenceKeys);
            factionKey = trimToNull(factionKey);
            classKey = trimToNull(classKey);
        }
    }

    private static String require(String value, String field) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            throw new IllegalArgumentException("SkillImportSnapshot." + field + " is required");
        }
        return trimmed;
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static List<String> cleanList(List<String> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .map(SkillImportSnapshot::trimToNull)
                .filter(value -> value != null)
                .toList();
    }

    private static List<Map<String, Object>> copyMaps(List<Map<String, Object>> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .filter(value -> value != null)
                .map(Map::copyOf)
                .toList();
    }
}
