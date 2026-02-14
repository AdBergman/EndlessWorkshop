package ewshop.facade.dto.response;

import java.util.ArrayList;
import java.util.List;

public record TechDto(
        String name,
        String techKey,
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
        private String techKey;
        private int era;
        private String type;
        private final List<String> unlocks = new ArrayList<>();
        private final List<String> effects = new ArrayList<>();
        private String prereq;
        private final List<String> factions = new ArrayList<>();
        private String excludes;
        private TechCoordsDto coords;

        public Builder name(String v) { this.name = v; return this; }
        public Builder techKey(String v) { this.techKey = v; return this; }
        public Builder era(int v) { this.era = v; return this; }
        public Builder type(String v) { this.type = v; return this; }

        public Builder unlocks(List<String> v) { this.unlocks.clear(); if (v != null) this.unlocks.addAll(v); return this; }
        public Builder addUnlock(String v) { this.unlocks.add(v); return this; }

        public Builder effects(List<String> v) { this.effects.clear(); if (v != null) this.effects.addAll(v); return this; }
        public Builder addEffect(String v) { this.effects.add(v); return this; }

        public Builder factions(List<String> v) { this.factions.clear(); if (v != null) this.factions.addAll(v); return this; }
        public Builder addFaction(String v) { this.factions.add(v); return this; }

        public Builder prereq(String v) { this.prereq = v; return this; }
        public Builder excludes(String v) { this.excludes = v; return this; }
        public Builder coords(TechCoordsDto v) { this.coords = v; return this; }

        public TechDto build() {
            if (techKey == null || techKey.isBlank()) throw new IllegalStateException("techKey required");
            if (type == null || type.isBlank()) throw new IllegalStateException("type required");
            if (coords == null) throw new IllegalStateException("coords required");
            return new TechDto(
                    name, techKey, era, type,
                    List.copyOf(unlocks),
                    List.copyOf(effects),
                    prereq,
                    List.copyOf(factions),
                    excludes,
                    coords
            );
        }
    }
}