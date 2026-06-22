package ewshop.facade.dto.importing.heroes;

import ewshop.facade.dto.importing.ImportVisibilityPolicy;

import java.util.List;

public record HeroImportHeroDto(
        String entryKey,
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
        List<String> referenceKeys,
        Boolean isHidden,
        Boolean isPlayerFacing,
        Boolean isPrototype,
        Boolean isBaseTemplate,
        Boolean isPlaceholder,
        Boolean isInternal
) {
    public boolean filteredFromImport() {
        return ImportVisibilityPolicy.shouldFilter(
                null,
                isHidden,
                isPlayerFacing,
                isPrototype,
                isBaseTemplate,
                isPlaceholder,
                isInternal
        );
    }
}
