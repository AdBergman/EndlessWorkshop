package ewshop.facade.dto.response;

public record TechUnlockDto(
        String unlockType,
        String unlockKey,
        String unlockCategory
) {

    public TechUnlockDto {
        unlockCategory = normalizeNullable(unlockCategory);
    }

    public TechUnlockDto(String unlockType, String unlockKey) {
        this(unlockType, unlockKey, null);
    }

    private static String normalizeNullable(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
