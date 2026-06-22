package ewshop.facade.dto.importing.skills;

import java.util.List;
import java.util.Map;

public record SkillImportSkillDto(
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
}
