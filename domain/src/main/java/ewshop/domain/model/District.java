package ewshop.domain.model;

import java.util.List;

public class District {
    private final String districtKey;
    private final String displayName;
    private final String category; // nullable ok
    private final Integer tier;
    private final Integer constructibleLevel;
    private final List<String> descriptionLines;
    private final List<String> constructionCost;
    private final List<String> descriptorKeys;
    private final List<String> referenceKeys;
    private final List<String> unlockTechnologyKeys;
    private final Boolean factionSpecific;
    private final String factionKey;
    private final Boolean variant;
    private final Boolean playerFacing;
    private final DistrictLevelUp levelUp;
    private final ConstructiblePlacementPrerequisites placementPrerequisites;

    private District(Builder b) {
        this.districtKey = b.districtKey;
        this.displayName = b.displayName;
        this.category = b.category;
        this.tier = b.tier;
        this.constructibleLevel = b.constructibleLevel;
        this.descriptionLines = List.copyOf(b.descriptionLines);
        this.constructionCost = List.copyOf(b.constructionCost);
        this.descriptorKeys = List.copyOf(b.descriptorKeys);
        this.referenceKeys = List.copyOf(b.referenceKeys);
        this.unlockTechnologyKeys = List.copyOf(b.unlockTechnologyKeys);
        this.factionSpecific = b.factionSpecific;
        this.factionKey = trimToNull(b.factionKey);
        this.variant = b.variant;
        this.playerFacing = b.playerFacing;
        this.levelUp = b.levelUp != null && b.levelUp.isEmpty() ? null : b.levelUp;
        this.placementPrerequisites = b.placementPrerequisites != null && b.placementPrerequisites.isEmpty()
                ? null
                : b.placementPrerequisites;
    }

    public String getDistrictKey() { return districtKey; }
    public String getDisplayName() { return displayName; }
    public String getCategory() { return category; }
    public Integer getTier() { return tier; }
    public Integer getConstructibleLevel() { return constructibleLevel; }
    public List<String> getDescriptionLines() { return descriptionLines; }
    public List<String> getConstructionCost() { return constructionCost; }
    public List<String> getDescriptorKeys() { return descriptorKeys; }
    public List<String> getReferenceKeys() { return referenceKeys; }
    public List<String> getUnlockTechnologyKeys() { return unlockTechnologyKeys; }
    public Boolean getFactionSpecific() { return factionSpecific; }
    public String getFactionKey() { return factionKey; }
    public Boolean getVariant() { return variant; }
    public Boolean getPlayerFacing() { return playerFacing; }
    public DistrictLevelUp getLevelUp() { return levelUp; }
    public ConstructiblePlacementPrerequisites getPlacementPrerequisites() { return placementPrerequisites; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String districtKey;
        private String displayName;
        private String category;
        private Integer tier;
        private Integer constructibleLevel;
        private final java.util.ArrayList<String> descriptionLines = new java.util.ArrayList<>();
        private final java.util.ArrayList<String> constructionCost = new java.util.ArrayList<>();
        private final java.util.ArrayList<String> descriptorKeys = new java.util.ArrayList<>();
        private final java.util.ArrayList<String> referenceKeys = new java.util.ArrayList<>();
        private final java.util.ArrayList<String> unlockTechnologyKeys = new java.util.ArrayList<>();
        private Boolean factionSpecific;
        private String factionKey;
        private Boolean variant;
        private Boolean playerFacing;
        private DistrictLevelUp levelUp;
        private ConstructiblePlacementPrerequisites placementPrerequisites;

        public Builder districtKey(String v) { this.districtKey = v; return this; }
        public Builder displayName(String v) { this.displayName = v; return this; }
        public Builder category(String v) { this.category = v; return this; }
        public Builder tier(Integer v) { this.tier = v; return this; }
        public Builder constructibleLevel(Integer v) { this.constructibleLevel = v; return this; }
        public Builder descriptionLines(List<String> v) {
            this.descriptionLines.clear();
            if (v != null) this.descriptionLines.addAll(v);
            return this;
        }
        public Builder constructionCost(List<String> v) {
            this.constructionCost.clear();
            if (v != null) this.constructionCost.addAll(v);
            return this;
        }
        public Builder descriptorKeys(List<String> v) {
            this.descriptorKeys.clear();
            if (v != null) this.descriptorKeys.addAll(v);
            return this;
        }
        public Builder referenceKeys(List<String> v) {
            this.referenceKeys.clear();
            if (v != null) this.referenceKeys.addAll(v);
            return this;
        }
        public Builder unlockTechnologyKeys(List<String> v) {
            this.unlockTechnologyKeys.clear();
            if (v != null) this.unlockTechnologyKeys.addAll(v);
            return this;
        }
        public Builder factionSpecific(Boolean v) { this.factionSpecific = v; return this; }
        public Builder factionKey(String v) { this.factionKey = v; return this; }
        public Builder variant(Boolean v) { this.variant = v; return this; }
        public Builder playerFacing(Boolean v) { this.playerFacing = v; return this; }
        public Builder levelUp(DistrictLevelUp v) { this.levelUp = v; return this; }
        public Builder placementPrerequisites(ConstructiblePlacementPrerequisites v) {
            this.placementPrerequisites = v;
            return this;
        }

        public District build() { return new District(this); }
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmedValue = value.trim();
        return trimmedValue.isEmpty() ? null : trimmedValue;
    }
}
