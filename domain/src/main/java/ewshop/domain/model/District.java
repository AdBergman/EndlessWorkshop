package ewshop.domain.model;

import java.util.List;

public class District {
    private final String districtKey;
    private final String displayName;
    private final String category; // nullable ok
    private final List<String> descriptionLines;
    private final List<String> unlockTechnologyKeys;
    private final DistrictLevelUp levelUp;
    private final ConstructiblePlacementPrerequisites placementPrerequisites;

    private District(Builder b) {
        this.districtKey = b.districtKey;
        this.displayName = b.displayName;
        this.category = b.category;
        this.descriptionLines = List.copyOf(b.descriptionLines);
        this.unlockTechnologyKeys = List.copyOf(b.unlockTechnologyKeys);
        this.levelUp = b.levelUp != null && b.levelUp.isEmpty() ? null : b.levelUp;
        this.placementPrerequisites = b.placementPrerequisites != null && b.placementPrerequisites.isEmpty()
                ? null
                : b.placementPrerequisites;
    }

    public String getDistrictKey() { return districtKey; }
    public String getDisplayName() { return displayName; }
    public String getCategory() { return category; }
    public List<String> getDescriptionLines() { return descriptionLines; }
    public List<String> getUnlockTechnologyKeys() { return unlockTechnologyKeys; }
    public DistrictLevelUp getLevelUp() { return levelUp; }
    public ConstructiblePlacementPrerequisites getPlacementPrerequisites() { return placementPrerequisites; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String districtKey;
        private String displayName;
        private String category;
        private final java.util.ArrayList<String> descriptionLines = new java.util.ArrayList<>();
        private final java.util.ArrayList<String> unlockTechnologyKeys = new java.util.ArrayList<>();
        private DistrictLevelUp levelUp;
        private ConstructiblePlacementPrerequisites placementPrerequisites;

        public Builder districtKey(String v) { this.districtKey = v; return this; }
        public Builder displayName(String v) { this.displayName = v; return this; }
        public Builder category(String v) { this.category = v; return this; }
        public Builder descriptionLines(List<String> v) {
            this.descriptionLines.clear();
            if (v != null) this.descriptionLines.addAll(v);
            return this;
        }
        public Builder unlockTechnologyKeys(List<String> v) {
            this.unlockTechnologyKeys.clear();
            if (v != null) this.unlockTechnologyKeys.addAll(v);
            return this;
        }
        public Builder levelUp(DistrictLevelUp v) { this.levelUp = v; return this; }
        public Builder placementPrerequisites(ConstructiblePlacementPrerequisites v) {
            this.placementPrerequisites = v;
            return this;
        }

        public District build() { return new District(this); }
    }
}
