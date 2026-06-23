package ewshop.domain.model;

public record DistrictLevelUp(
        String targetDistrictKey,
        Integer requiredAdjacentDistrictCount
) {
    public DistrictLevelUp {
        targetDistrictKey = trimToNull(targetDistrictKey);
    }

    public boolean isEmpty() {
        return targetDistrictKey == null && requiredAdjacentDistrictCount == null;
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
