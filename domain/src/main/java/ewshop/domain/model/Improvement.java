package ewshop.domain.model;

import java.util.List;

public class Improvement {
    private final String constructibleKey;
    private final String displayName;
    private final String category;
    private final List<String> descriptionLines;

    private Improvement(Builder b) {
        this.constructibleKey = b.constructibleKey;
        this.displayName = b.displayName;
        this.category = b.category;
        this.descriptionLines = b.descriptionLines;
    }

    public static Builder builder() { return new Builder(); }

    public String getConstructibleKey() { return constructibleKey; }
    public String getDisplayName() { return displayName; }
    public String getCategory() { return category; }
    public List<String> getDescriptionLines() { return descriptionLines; }

    public static class Builder {
        private String constructibleKey;
        private String displayName;
        private String category;
        private List<String> descriptionLines = List.of();

        public Builder constructibleKey(String v) { this.constructibleKey = v; return this; }
        public Builder displayName(String v) { this.displayName = v; return this; }
        public Builder category(String v) { this.category = v; return this; }
        public Builder descriptionLines(List<String> v) {
            this.descriptionLines = (v == null) ? List.of() : List.copyOf(v);
            return this;
        }

        public Improvement build() {
            if (constructibleKey == null || constructibleKey.isBlank()) throw new IllegalArgumentException("constructibleKey required");
            if (displayName == null || displayName.isBlank()) throw new IllegalArgumentException("displayName required");
            return new Improvement(this);
        }
    }
}