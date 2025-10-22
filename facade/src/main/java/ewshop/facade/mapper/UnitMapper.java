package ewshop.facade.mapper;

import ewshop.domain.entity.UnitCost;
import ewshop.domain.entity.UnitSkill;
import ewshop.domain.entity.UnitSpecialization;
import ewshop.facade.dto.response.UnitDto;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class UnitMapper {

    public static UnitDto toDto(UnitSpecialization unit) {
        if (unit == null) return null;

        // Convert costs to strings
        List<String> costs = unit.getCosts() != null
                ? unit.getCosts().stream()
                .map(UnitMapper::formatCost)
                .collect(Collectors.toList())
                : Collections.emptyList();

        // Convert skills to simple name list
        List<String> skills = unit.getSkills() != null
                ? unit.getSkills().stream()
                .map(UnitSkill::getName)
                .collect(Collectors.toList())
                : Collections.emptyList();

        // Map upgradesTo directly from domain
        List<String> upgradesTo = unit.getUpgradesTo() != null
                ? unit.getUpgradesTo().stream().toList()
                : Collections.emptyList();

        return UnitDto.builder()
                .name(unit.getName())
                .description(unit.getDescription())
                .type(unit.getType() != null ? formatEnumName(unit.getType()) : "")
                .health(unit.getHealth())
                .defense(unit.getDefense())
                .minDamage(unit.getMinDamage())
                .maxDamage(unit.getMaxDamage())
                .movementPoints(unit.getMovementPoints())
                .tier(unit.getTier() != null ? unit.getTier() : 0)
                .upkeep(unit.getUpkeep() != null ? unit.getUpkeep() : 0)
                .costs(costs)
                .skills(skills)
                .faction(unit.getFaction())
                .upgradesTo(upgradesTo)
                // upgradesFrom is filled later in UnitFacade
                .build();
    }

    private static String formatCost(UnitCost cost) {
        if (cost == null || cost.getType() == null) return "";
        return cost.getAmount() + " " + cost.getType().name();
    }

    private static String formatEnumName(Enum<?> value) {
        if (value == null) return "";
        String name = value.name().toLowerCase();
        return Character.toUpperCase(name.charAt(0)) + name.substring(1);
    }
}
