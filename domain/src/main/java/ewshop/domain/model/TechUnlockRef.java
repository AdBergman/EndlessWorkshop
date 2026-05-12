package ewshop.domain.model;

public record TechUnlockRef(String unlockType, String unlockKey, String unlockCategory) {

    public TechUnlockRef {
        unlockCategory = normalizeNullable(unlockCategory);
    }

    public TechUnlockRef(String unlockType, String unlockKey) {
        this(unlockType, unlockKey, null);
    }

    private static String normalizeNullable(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
