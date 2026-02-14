package ewshop.domain.command;

import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.TechType;

public record TechPlacementUpdate(
        String techKey,
        String name,
        TechType type,
        int era,
        TechCoords coords
) {
    public TechPlacementUpdate {
        String trimmedKey = (techKey == null) ? null : techKey.trim();
        if (trimmedKey == null || trimmedKey.isEmpty()) {
            throw new IllegalArgumentException("TechPlacementUpdate.techKey is required");
        }
        techKey = trimmedKey;

        name = (name == null) ? null : name.trim();
        if (name != null && name.isEmpty()) {
            name = null;
        }

        if (type == null) {
            throw new IllegalArgumentException("TechPlacementUpdate.type is required");
        }
        if (coords == null) {
            throw new IllegalArgumentException("TechPlacementUpdate.coords is required");
        }
        if (era < 1 || era > 6) {
            throw new IllegalArgumentException(
                    "TechPlacementUpdate.era must be between 1 and 6 (got: " + era + ")"
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String techKey;
        private String name;
        private TechType type;
        private int era;
        private TechCoords coords;

        public Builder techKey(String techKey) { this.techKey = techKey; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder type(TechType type) { this.type = type; return this; }
        public Builder era(int era) { this.era = era; return this; }
        public Builder coords(TechCoords coords) { this.coords = coords; return this; }

        public TechPlacementUpdate build() {
            return new TechPlacementUpdate(techKey, name, type, era, coords);
        }
    }
}