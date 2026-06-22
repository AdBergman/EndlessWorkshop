package ewshop.facade.mapper;

import ewshop.domain.model.Faction;
import ewshop.facade.dto.response.FactionDto;

public final class FactionMapper {

    private FactionMapper() {}

    public static FactionDto toDto(Faction faction) {
        if (faction == null) return null;

        return new FactionDto(
                faction.getFactionKey(),
                faction.getPublicDisplayName(),
                faction.getLore(),
                faction.getFactionKind(),
                faction.getAffinityKey(),
                faction.getAffinityType(),
                faction.getTraitKeys(),
                faction.getPopulationKeys(),
                faction.getUnitKeys(),
                faction.getBaseUnitKeys(),
                faction.getHeroKeys(),
                faction.getGatedTechnologyKeys(),
                faction.getStartingFactionQuestKey(),
                faction.getSpecificQuestKeys(),
                faction.getProtectorateTraitKeys()
        );
    }
}
