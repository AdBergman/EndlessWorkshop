package ewshop.domain.command;

import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.TechType;

public record TechPlacementUpdate(
        String name,
        TechType type,
        int era,
        TechCoords coords
) {
    public TechPlacementUpdate {
        String trimmedName = (name == null) ? null : name.trim();
        if (trimmedName == null || trimmedName.isEmpty()) {
            throw new IllegalArgumentException("TechPlacementUpdate.name is required");
        }
        name = trimmedName;

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
        private String name;
        private TechType type;
        private int era;
        private TechCoords coords;

        public Builder name(String name) { this.name = name; return this; }
        public Builder type(TechType type) { this.type = type; return this; }
        public Builder era(int era) { this.era = era; return this; }
        public Builder coords(TechCoords coords) { this.coords = coords; return this; }

        public TechPlacementUpdate build() {
            return new TechPlacementUpdate(name, type, era, coords);
        }
    }
}