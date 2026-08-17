package ewshop.domain.model;

import java.util.List;

public record DistrictLevelUp(
        String targetDistrictKey,
        Integer requiredAdjacentDistrictCount,
        List<String> validNeighbourDescriptorKeys,
        String validNeighbourUiMapperKey,
        List<String> requiredFactionTraitKeys
) {
    public DistrictLevelUp(String targetDistrictKey, Integer requiredAdjacentDistrictCount) {
        this(targetDistrictKey, requiredAdjacentDistrictCount, List.of(), null, List.of());
    }

    public DistrictLevelUp {
        targetDistrictKey = trimToNull(targetDistrictKey);
        validNeighbourDescriptorKeys = cleanList(validNeighbourDescriptorKeys);
        validNeighbourUiMapperKey = trimToNull(validNeighbourUiMapperKey);
        requiredFactionTraitKeys = cleanList(requiredFactionTraitKeys);
    }

    public boolean isEmpty() {
        return targetDistrictKey == null &&
                requiredAdjacentDistrictCount == null &&
                validNeighbourDescriptorKeys.isEmpty() &&
                validNeighbourUiMapperKey == null &&
                requiredFactionTraitKeys.isEmpty();
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static List<String> cleanList(List<String> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .map(DistrictLevelUp::trimToNull)
                .filter(value -> value != null)
                .distinct()
                .toList();
    }
}
