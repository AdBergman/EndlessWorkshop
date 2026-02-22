package ewshop.facade.dto.response;

import java.util.List;

public record UnitDto(
        String unitKey,
        String displayName,
        boolean isHero,
        boolean isChosen,
        String spawnType,
        String previousUnitKey,
        List<String> nextEvolutionUnitKeys,
        Integer evolutionTierIndex,
        String unitClassKey,
        String attackSkillKey,
        List<String> abilityKeys,
        List<String> descriptionLines
) {}