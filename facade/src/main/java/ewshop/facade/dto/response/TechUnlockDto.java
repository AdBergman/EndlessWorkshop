package ewshop.facade.dto.response;

import java.util.List;

public record TechUnlockDto(
        String unlockType,
        String unlockKey,
        String unlockCategory,
        List<String> fallbackDescriptionLines
) {

    public TechUnlockDto {
        unlockCategory = normalizeNullable(unlockCategory);
        fallbackDescriptionLines = cleanLines(fallbackDescriptionLines);
    }

    public TechUnlockDto(String unlockType, String unlockKey, String unlockCategory) {
        this(unlockType, unlockKey, unlockCategory, List.of());
    }

    public TechUnlockDto(String unlockType, String unlockKey) {
        this(unlockType, unlockKey, null, List.of());
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
}
