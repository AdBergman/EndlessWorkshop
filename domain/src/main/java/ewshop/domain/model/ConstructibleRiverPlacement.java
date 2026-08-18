package ewshop.domain.model;

public record ConstructibleRiverPlacement(
        String constraint
) {
    public ConstructibleRiverPlacement {
        if (constraint != null) {
            constraint = constraint.trim();
            if (constraint.isEmpty()) constraint = null;
        }
    }

    public boolean isEmpty() {
        return constraint == null;
    }
}
