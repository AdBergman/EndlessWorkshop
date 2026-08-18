package ewshop.domain.model;

import java.util.List;

public record ConstructiblePointOfInterestPlacement(
        String constraint,
        List<String> pointOfInterestKeys
) {
    public ConstructiblePointOfInterestPlacement {
        constraint = trimToNull(constraint);
        pointOfInterestKeys = cleanLines(pointOfInterestKeys);
    }

    public boolean isEmpty() {
        return constraint == null && pointOfInterestKeys.isEmpty();
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
