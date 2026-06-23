package ewshop.domain.model;

public record ConstructibleNeighbourPlacement(
        String operator,
        String territoryConstraint,
        Boolean ignoreCliff
) {
    public ConstructibleNeighbourPlacement {
        operator = trimToNull(operator);
        territoryConstraint = trimToNull(territoryConstraint);
    }

    public boolean isEmpty() {
        return operator == null && territoryConstraint == null && ignoreCliff == null;
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
