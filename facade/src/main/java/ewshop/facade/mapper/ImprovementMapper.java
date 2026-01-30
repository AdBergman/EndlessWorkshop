package ewshop.facade.mapper;

import ewshop.domain.model.Improvement;
import ewshop.domain.model.StrategicCost;
import ewshop.facade.dto.response.ImprovementDto;

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
                .unique(formatEnumName(entity.getUnique()))
                .cost(cost)
                .era(entity.getEra())
                .build();
    }

    private static String convertCost(StrategicCost cost) {
        if (cost == null) return "";
        return cost.amount() + " " + cost.type().name(); // Example: "5 Glassteel"
    }

    private static String formatEnumName(Enum<?> enumConstant) {
        if (enumConstant == null) return "";
        return java.util.Arrays.stream(enumConstant.name().split("_"))
                .map(word -> word.substring(0,1).toUpperCase() + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

}
