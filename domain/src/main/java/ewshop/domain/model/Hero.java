package ewshop.domain.model;

import java.util.List;

public record Hero(
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
    public Hero {
        ownAbilityKeys = copy(ownAbilityKeys);
        abilityKeys = copy(abilityKeys);
        combatAbilityKeys = copy(combatAbilityKeys);
        tacticalAbilityKeys = copy(tacticalAbilityKeys);
        passiveAbilityKeys = copy(passiveAbilityKeys);
        mechanicalAbilityKeys = copy(mechanicalAbilityKeys);
        classRuleAbilityKeys = copy(classRuleAbilityKeys);
        hiddenHelperAbilityKeys = copy(hiddenHelperAbilityKeys);
        defaultSkillKeys = copy(defaultSkillKeys);
        applicableSkillTreeKeys = copy(applicableSkillTreeKeys);
        descriptionLines = copy(descriptionLines);
        referenceKeys = copy(referenceKeys);
    }

    private static List<String> copy(List<String> values) {
        return values == null ? List.of() : List.copyOf(values);
    }
}
