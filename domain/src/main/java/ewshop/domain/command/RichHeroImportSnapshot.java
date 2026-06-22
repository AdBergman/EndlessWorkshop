package ewshop.domain.command;

import java.util.List;

public record RichHeroImportSnapshot(
        String unitKey,
        String displayName,
        String faction,
        String factionKey,
        Boolean isMajorFaction,
        String heroKey,
        String heroClassKey,
        String originKind,
        String originFactionKey,
        String minorFactionKey,
        String unitClassKey,
        String attackSkillKey,
        List<String> ownAbilityKeys,
        List<String> abilityKeys,
        List<String> combatAbilityKeys,
        List<String> tacticalAbilityKeys,
        List<String> passiveAbilityKeys,
        List<String> mechanicalAbilityKeys,
        List<String> classRuleAbilityKeys,
        List<String> hiddenHelperAbilityKeys,
        List<String> defaultSkillKeys,
        List<String> applicableSkillTreeKeys,
        List<String> descriptionLines,
        List<String> referenceKeys
) {
    public RichHeroImportSnapshot {
        unitKey = require(unitKey, "unitKey");
        displayName = blankToDefault(displayName, unitKey);
        faction = trimToNull(faction);
        factionKey = trimToNull(factionKey);
        heroKey = trimToNull(heroKey);
        heroClassKey = trimToNull(heroClassKey);
        originKind = trimToNull(originKind);
        originFactionKey = trimToNull(originFactionKey);
        minorFactionKey = trimToNull(minorFactionKey);
        unitClassKey = trimToNull(unitClassKey);
        attackSkillKey = trimToNull(attackSkillKey);
        ownAbilityKeys = cleanList(ownAbilityKeys);
        abilityKeys = cleanList(abilityKeys);
        combatAbilityKeys = cleanList(combatAbilityKeys);
        tacticalAbilityKeys = cleanList(tacticalAbilityKeys);
        passiveAbilityKeys = cleanList(passiveAbilityKeys);
        mechanicalAbilityKeys = cleanList(mechanicalAbilityKeys);
        classRuleAbilityKeys = cleanList(classRuleAbilityKeys);
        hiddenHelperAbilityKeys = cleanList(hiddenHelperAbilityKeys);
        defaultSkillKeys = cleanList(defaultSkillKeys);
        applicableSkillTreeKeys = cleanList(applicableSkillTreeKeys);
        descriptionLines = cleanList(descriptionLines);
        referenceKeys = cleanList(referenceKeys);
    }

    private static String require(String value, String field) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            throw new IllegalArgumentException("RichHeroImportSnapshot." + field + " is required");
        }
        return trimmed;
    }

    private static String blankToDefault(String value, String fallback) {
        String trimmed = trimToNull(value);
        return trimmed == null ? fallback : trimmed;
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static List<String> cleanList(List<String> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .map(RichHeroImportSnapshot::trimToNull)
                .filter(value -> value != null)
                .toList();
    }
}
