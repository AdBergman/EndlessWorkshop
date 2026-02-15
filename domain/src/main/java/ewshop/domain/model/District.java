package ewshop.domain.model;

import java.util.List;

public class District {
    private final String districtKey;
    private final String displayName;
    private final String category; // nullable ok
    private final List<String> descriptionLines;

    private District(Builder b) {
        this.districtKey = b.districtKey;
        this.displayName = b.displayName;
        this.category = b.category;
        this.descriptionLines = List.copyOf(b.descriptionLines);
    }

    public String getDistrictKey() { return districtKey; }
    public String getDisplayName() { return displayName; }
    public String getCategory() { return category; }
    public List<String> getDescriptionLines() { return descriptionLines; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String districtKey;
        private String displayName;
        private String category;
        private final java.util.ArrayList<String> descriptionLines = new java.util.ArrayList<>();

        public Builder districtKey(String v) { this.districtKey = v; return this; }
        public Builder displayName(String v) { this.displayName = v; return this; }
        public Builder category(String v) { this.category = v; return this; }
        public Builder descriptionLines(List<String> v) {
            this.descriptionLines.clear();
            if (v != null) this.descriptionLines.addAll(v);
            return this;
        }

        public District build() { return new District(this); }
    }
}