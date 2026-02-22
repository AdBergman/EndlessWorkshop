package ewshop.facade.mapper;

import ewshop.domain.model.Unit;
import ewshop.facade.dto.response.UnitDto;

public final class UnitMapper {

    private UnitMapper() {}

    public static UnitDto toDto(Unit unit) {
        if (unit == null) return null;

        return new UnitDto(
                unit.getUnitKey(),
                unit.getDisplayName(),
                unit.getArtId(),
                unit.isHero(),
                unit.isChosen(),
                unit.getSpawnType(),
                unit.getPreviousUnitKey(),
                unit.getNextEvolutionUnitKeys(),
                unit.getEvolutionTierIndex(),
                unit.getUnitClassKey(),
                unit.getAttackSkillKey(),
                unit.getAbilityKeys(),
                unit.getDescriptionLines()
        );
    }
}