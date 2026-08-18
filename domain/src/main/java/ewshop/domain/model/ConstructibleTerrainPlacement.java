package ewshop.domain.model;

import java.util.List;

public record ConstructibleTerrainPlacement(
        String constraint,
        List<String> terrainTypeKeys,
        Boolean canBuildOnWasteland,
        Boolean canBuildOnMud
) {
    public ConstructibleTerrainPlacement {
        constraint = trimToNull(constraint);
        terrainTypeKeys = cleanLines(terrainTypeKeys);
    }

    public boolean isEmpty() {
        return constraint == null &&
                terrainTypeKeys.isEmpty() &&
                canBuildOnWasteland == null &&
                canBuildOnMud == null;
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static List<String> cleanLines(List<String> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .filter(value -> value != null && !value.trim().isEmpty())
                .map(String::trim)
                .toList();
    }
}
