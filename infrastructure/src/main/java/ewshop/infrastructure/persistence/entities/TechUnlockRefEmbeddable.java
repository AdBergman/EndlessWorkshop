package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Embeddable
public class TechUnlockRefEmbeddable {
    private static final String LINE_SEPARATOR = "\u001F";

    @Column(name = "unlock_type", nullable = false, length = 64)
    private String unlockType;

    @Column(name = "unlock_key", nullable = false)
    private String unlockKey;

    @Column(name = "unlock_category", length = 64)
    private String unlockCategory;

    @Column(name = "fallback_description_lines", length = 4000)
    private String fallbackDescriptionLines;

    protected TechUnlockRefEmbeddable() {
    }

    public TechUnlockRefEmbeddable(String unlockType, String unlockKey) {
        this(unlockType, unlockKey, null, List.of());
    }

    public TechUnlockRefEmbeddable(String unlockType, String unlockKey, String unlockCategory) {
        this(unlockType, unlockKey, unlockCategory, List.of());
    }

    public TechUnlockRefEmbeddable(
            String unlockType,
            String unlockKey,
            String unlockCategory,
            List<String> fallbackDescriptionLines
    ) {
        this.unlockType = unlockType;
        this.unlockKey = unlockKey;
        this.unlockCategory = normalizeNullable(unlockCategory);
        this.fallbackDescriptionLines = encodeLines(fallbackDescriptionLines);
    }

    public String getUnlockType() {
        return unlockType;
    }

    public String getUnlockKey() {
        return unlockKey;
    }

    public String getUnlockCategory() {
        return unlockCategory;
    }

    public List<String> getFallbackDescriptionLines() {
        return decodeLines(fallbackDescriptionLines);
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (other == null || getClass() != other.getClass()) return false;
        TechUnlockRefEmbeddable that = (TechUnlockRefEmbeddable) other;
        return Objects.equals(unlockType, that.unlockType)
                && Objects.equals(unlockKey, that.unlockKey)
                && Objects.equals(unlockCategory, that.unlockCategory)
                && Objects.equals(fallbackDescriptionLines, that.fallbackDescriptionLines);
    }

    @Override
    public int hashCode() {
        return Objects.hash(unlockType, unlockKey, unlockCategory, fallbackDescriptionLines);
    }

    private static String normalizeNullable(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String encodeLines(List<String> lines) {
        if (lines == null || lines.isEmpty()) return null;
        String encoded = String.join(
                LINE_SEPARATOR,
                lines.stream()
                        .filter(line -> line != null && !line.trim().isEmpty())
                        .map(String::trim)
                        .toList()
        );
        return encoded.isBlank() ? null : encoded;
    }

    private static List<String> decodeLines(String value) {
        if (value == null || value.isBlank()) return List.of();
        return Arrays.stream(value.split(LINE_SEPARATOR, -1))
                .filter(line -> line != null && !line.trim().isEmpty())
                .map(String::trim)
                .toList();
    }
}
