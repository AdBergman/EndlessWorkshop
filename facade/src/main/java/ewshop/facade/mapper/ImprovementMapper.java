package ewshop.facade.mapper;

import ewshop.domain.entity.Improvement;
import ewshop.domain.entity.StrategicCost;
import ewshop.facade.dto.ImprovementDto;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class ImprovementMapper {

    public static ImprovementDto toDto(Improvement entity) {
        if (entity == null) return null;

        // Effects
        List<String> effects = entity.getEffects() != null
                ? List.copyOf(entity.getEffects())
                : Collections.emptyList();

        // Cost: convert each StrategicCost to a readable string
        List<String> cost = entity.getCost() != null
                ? entity.getCost().stream()
                .map(ImprovementMapper::convertCost)
                .collect(Collectors.toList())
                : Collections.emptyList();

        return ImprovementDto.builder()
                .name(entity.getName())
                .effects(effects)
                .unique(entity.getUnique() != null ? entity.getUnique().name() : "")
                .cost(cost)
                .era(entity.getEra())
                .build();
    }

    private static String convertCost(StrategicCost cost) {
        if (cost == null) return "";
        return cost.amount() + " " + cost.type().name(); // Example: "5 Glassteel"
    }
}
