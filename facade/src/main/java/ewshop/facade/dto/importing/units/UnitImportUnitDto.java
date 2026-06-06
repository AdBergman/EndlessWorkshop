package ewshop.facade.dto.importing.units;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import ewshop.facade.dto.importing.ImportVisibilityPolicy;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UnitImportUnitDto(

        String unitKey,
        String displayName,

        String faction,
        Boolean isMajorFaction,

        Boolean isHero,
        Boolean isChosen,
        String spawnType,

        String previousUnitKey,
        List<String> nextEvolutionUnitKeys,
        Integer evolutionTierIndex,

        String unitClassKey,
        String attackSkillKey,

        List<String> ownAbilityKeys,
        List<String> abilityKeys,

        List<String> descriptionLines,

        List<String> ownDescriptorKeys,
        List<String> descriptorKeys,

        Boolean isHidden,
        Boolean isPlayerFacing,
        Boolean isPrototype,
        Boolean isBaseTemplate,
        Boolean isPlaceholder,
        Boolean isInternal

) {
    public UnitImportUnitDto(
            String unitKey,
            String displayName,
            String faction,
            Boolean isMajorFaction,
            Boolean isHero,
            Boolean isChosen,
            String spawnType,
            String previousUnitKey,
            List<String> nextEvolutionUnitKeys,
            Integer evolutionTierIndex,
            String unitClassKey,
            String attackSkillKey,
            List<String> ownAbilityKeys,
            List<String> abilityKeys,
            List<String> descriptionLines,
            List<String> ownDescriptorKeys,
            List<String> descriptorKeys
    ) {
        this(
                unitKey,
                displayName,
                faction,
                isMajorFaction,
                isHero,
                isChosen,
                spawnType,
                previousUnitKey,
                nextEvolutionUnitKeys,
                evolutionTierIndex,
                unitClassKey,
                attackSkillKey,
                ownAbilityKeys,
                abilityKeys,
                descriptionLines,
                ownDescriptorKeys,
                descriptorKeys,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }

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
