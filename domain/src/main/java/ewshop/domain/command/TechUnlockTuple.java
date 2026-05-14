package ewshop.domain.command;

import java.util.List;

public record TechUnlockTuple(
        String unlockType,
        String unlockCategory,
        String unlockElementName,
        List<String> fallbackDescriptionLines
) {
    public TechUnlockTuple {
        unlockType = unlockType == null ? "" : unlockType.trim();
        unlockCategory = normalizeNullable(unlockCategory);

        String trimmedName = unlockElementName == null ? null : unlockElementName.trim();
        if (trimmedName == null || trimmedName.isEmpty()) {
            throw new IllegalArgumentException("TechUnlockTuple.unlockElementName is required");
        }
        unlockElementName = trimmedName;
        fallbackDescriptionLines = cleanLines(fallbackDescriptionLines);
    }

    private static String normalizeNullable(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static List<String> cleanLines(List<String> lines) {
        if (lines == null || lines.isEmpty()) return List.of();
        return lines.stream()
                .filter(line -> line != null && !line.trim().isEmpty())
                .map(String::trim)
                .toList();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String unlockType = "";
        private String unlockCategory = "";
        private String unlockElementName = "";
        private List<String> fallbackDescriptionLines = List.of();

        public Builder unlockType(String unlockType) { this.unlockType = unlockType; return this; }
        public Builder unlockCategory(String unlockCategory) { this.unlockCategory = unlockCategory; return this; }
        public Builder unlockElementName(String unlockElementName) { this.unlockElementName = unlockElementName; return this; }
        public Builder fallbackDescriptionLines(List<String> fallbackDescriptionLines) {
            this.fallbackDescriptionLines = fallbackDescriptionLines;
            return this;
        }

        public TechUnlockTuple build() {
            return new TechUnlockTuple(unlockType, unlockCategory, unlockElementName, fallbackDescriptionLines);
        }
    }
}
