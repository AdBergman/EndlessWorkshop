package ewshop.domain.model;

import java.util.ArrayList;
import java.util.List;

public class Codex {

    private final String exportKind;
    private final String entryKey;
    private final String displayName;
    private final List<String> descriptionLines;
    private final List<String> referenceKeys;

    private Codex(Builder b) {
        this.exportKind = b.exportKind;
        this.entryKey = b.entryKey;
        this.displayName = b.displayName;
        this.descriptionLines = List.copyOf(b.descriptionLines);
        this.referenceKeys = List.copyOf(b.referenceKeys);
    }

    public String getExportKind() { return exportKind; }
    public String getEntryKey() { return entryKey; }
    public String getDisplayName() { return displayName; }
    public List<String> getDescriptionLines() { return descriptionLines; }
    public List<String> getReferenceKeys() { return referenceKeys; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String exportKind;
        private String entryKey;
        private String displayName;
        private final ArrayList<String> descriptionLines = new ArrayList<>();
        private final ArrayList<String> referenceKeys = new ArrayList<>();

        public Builder exportKind(String v) { this.exportKind = v; return this; }
        public Builder entryKey(String v) { this.entryKey = v; return this; }
        public Builder displayName(String v) { this.displayName = v; return this; }

        public Builder descriptionLines(List<String> v) {
            this.descriptionLines.clear();
            if (v != null) this.descriptionLines.addAll(v);
            return this;
        }

        public Builder referenceKeys(List<String> v) {
            this.referenceKeys.clear();
            if (v != null) this.referenceKeys.addAll(v);
            return this;
        }

        public Codex build() { return new Codex(this); }
    }
}