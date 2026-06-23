package ewshop.domain.model;

import java.util.List;

public class Improvement {
    private final String constructibleKey;
    private final String displayName;
    private final String category;
    private final List<String> descriptionLines;
    private final List<String> unlockTechnologyKeys;
    private final ConstructiblePlacementPrerequisites placementPrerequisites;

    private Improvement(Builder b) {
        this.constructibleKey = b.constructibleKey;
        this.displayName = b.displayName;
        this.category = b.category;
        this.descriptionLines = List.copyOf(b.descriptionLines);
        this.unlockTechnologyKeys = List.copyOf(b.unlockTechnologyKeys);
        this.placementPrerequisites = b.placementPrerequisites != null && b.placementPrerequisites.isEmpty()
                ? null
                : b.placementPrerequisites;
    }

    public static Builder builder() { return new Builder(); }

    public String getConstructibleKey() { return constructibleKey; }
    public String getDisplayName() { return displayName; }
    public String getCategory() { return category; }
    public List<String> getDescriptionLines() { return descriptionLines; }
    public List<String> getUnlockTechnologyKeys() { return unlockTechnologyKeys; }
    public ConstructiblePlacementPrerequisites getPlacementPrerequisites() { return placementPrerequisites; }

    public static class Builder {
        private String constructibleKey;
        private String displayName;
        private String category;
        private List<String> descriptionLines = List.of();
        private List<String> unlockTechnologyKeys = List.of();
        private ConstructiblePlacementPrerequisites placementPrerequisites;

        public Builder constructibleKey(String v) { this.constructibleKey = v; return this; }
        public Builder displayName(String v) { this.displayName = v; return this; }
        public Builder category(String v) { this.category = v; return this; }
        public Builder descriptionLines(List<String> v) {
            this.descriptionLines = (v == null) ? List.of() : List.copyOf(v);
            return this;
        }
        public Builder unlockTechnologyKeys(List<String> v) {
            this.unlockTechnologyKeys = (v == null) ? List.of() : List.copyOf(v);
            return this;
        }
        public Builder placementPrerequisites(ConstructiblePlacementPrerequisites v) {
            this.placementPrerequisites = v;
            return this;
        }

        public Improvement build() {
            if (constructibleKey == null || constructibleKey.isBlank()) throw new IllegalArgumentException("constructibleKey required");
            if (displayName == null || displayName.isBlank()) throw new IllegalArgumentException("displayName required");
            return new Improvement(this);
        }
    }
}
