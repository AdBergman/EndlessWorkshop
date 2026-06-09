package ewshop.facade.dto.response;

import java.util.List;

public record UnitDto(
        String unitKey,
        String displayName,
        String artId,

        String faction,
        boolean isMajorFaction,

        boolean isHero,
        boolean isChosen,
        String spawnType,

        String previousUnitKey,
        List<String> nextEvolutionUnitKeys,
        Integer evolutionTierIndex,

        String unitClassKey,
        String unitClassDisplayName,
        String attackSkillKey,

        List<String> abilityKeys,
        List<String> descriptionLines,
        List<String> veterancyProgressionLines
) {
    public UnitDto(
            String unitKey,
            String displayName,
            String artId,
            String faction,
            boolean isMajorFaction,
            boolean isHero,
            boolean isChosen,
            String spawnType,
            String previousUnitKey,
            List<String> nextEvolutionUnitKeys,
            Integer evolutionTierIndex,
            String unitClassKey,
            String unitClassDisplayName,
            String attackSkillKey,
            List<String> abilityKeys,
            List<String> descriptionLines
    ) {
        this(
                unitKey,
                displayName,
                artId,
                faction,
                isMajorFaction,
                isHero,
                isChosen,
                spawnType,
                previousUnitKey,
                nextEvolutionUnitKeys,
                evolutionTierIndex,
                unitClassKey,
                unitClassDisplayName,
                attackSkillKey,
                abilityKeys,
                descriptionLines,
                List.of()
        );
    }
}
