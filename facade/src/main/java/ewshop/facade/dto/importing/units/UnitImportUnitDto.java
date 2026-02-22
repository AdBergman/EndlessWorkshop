package ewshop.facade.dto.importing.units;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UnitImportUnitDto(
        String unitKey,
        String displayName,

        Boolean isHero,
        Boolean isChosen,
        String spawnType,

        // evolution graph
        String previousUnitKey,
        List<String> nextEvolutionUnitKeys,
        Integer evolutionTierIndex,

        String unitClassKey,
        String attackSkillKey,

        // merged in domain
        List<String> ownAbilityKeys,
        List<String> abilityKeys,

        List<String> descriptionLines,

        // dropped in Domain, kept for future implementation
        List<String> ownDescriptorKeys,
        List<String> descriptorKeys

) {}