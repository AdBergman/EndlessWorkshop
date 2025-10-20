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
                .map(cost -> formatCost(cost))
                .collect(Collectors.toList())
                : Collections.emptyList();

        // Convert skills to simple name list
        List<String> skills = unit.getSkills() != null
                ? unit.getSkills().stream()
                .map(UnitSkill::getName)
                .collect(Collectors.toList())
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
                .costs(costs)
                .skills(skills)
                .faction(unit.getFaction())
                .build();
    }

    private static String formatCost(UnitCost cost) {
        return cost.getAmount() + " " + cost.getType().name();
    }

    private static String formatEnumName(Enum<?> value) {
        return value.name().substring(0,1) + value.name().substring(1).toLowerCase();
    }
}
