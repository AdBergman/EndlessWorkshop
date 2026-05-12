package ewshop.domain.command;

public record TechUnlockTuple(
        String unlockType,
        String unlockCategory,
        String unlockElementName
) {
    public TechUnlockTuple {
        unlockType = unlockType == null ? "" : unlockType.trim();
        unlockCategory = normalizeNullable(unlockCategory);

        String trimmedName = unlockElementName == null ? null : unlockElementName.trim();
        if (trimmedName == null || trimmedName.isEmpty()) {
            throw new IllegalArgumentException("TechUnlockTuple.unlockElementName is required");
        }
        unlockElementName = trimmedName;
    }

    private static String normalizeNullable(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String unlockType = "";
        private String unlockCategory = "";
        private String unlockElementName = "";

        public Builder unlockType(String unlockType) { this.unlockType = unlockType; return this; }
        public Builder unlockCategory(String unlockCategory) { this.unlockCategory = unlockCategory; return this; }
        public Builder unlockElementName(String unlockElementName) { this.unlockElementName = unlockElementName; return this; }

        public TechUnlockTuple build() {
            return new TechUnlockTuple(unlockType, unlockCategory, unlockElementName);
        }
    }
}
