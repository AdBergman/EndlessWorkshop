package ewshop.facade.dto;

import java.util.List;

public record TechDto(
        String name,
        int era,
        String type,
        List<String> unlocks,
        List<String> effects,
        String prereq,
        List<String> factions,
        String excludes,
        TechCoordsDto coords
) {
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String name;
        private int era;
        private String type;
        private List<String> unlocks = List.of();
        private List<String> effects = List.of();
        private String prereq = "";
        private List<String> factions = List.of();
        private String excludes = "";
        private TechCoordsDto coords;

        public Builder name(String name) { this.name = name; return this; }
        public Builder era(int era) { this.era = era; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder unlocks(List<String> unlocks) { this.unlocks = unlocks; return this; }
        public Builder effects(List<String> effects) { this.effects = effects; return this; }
        public Builder prereq(String prereq) { this.prereq = prereq; return this; }
        public Builder factions(List<String> factions) { this.factions = factions; return this; }
        public Builder excludes(String excludes) { this.excludes = excludes; return this; }
        public Builder coords(TechCoordsDto coords) { this.coords = coords; return this; }

        public TechDto build() {
            return new TechDto(name, era, type, unlocks, effects, prereq, factions, excludes, coords);
        }
    }
}
