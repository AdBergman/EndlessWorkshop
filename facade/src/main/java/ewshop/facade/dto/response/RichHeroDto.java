package ewshop.facade.dto.response;

import java.util.List;

public record RichHeroDto(
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
}
