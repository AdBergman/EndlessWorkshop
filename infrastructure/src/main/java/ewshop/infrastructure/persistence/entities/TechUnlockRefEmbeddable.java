package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.util.Objects;

@Embeddable
public class TechUnlockRefEmbeddable {

    @Column(name = "unlock_type", nullable = false, length = 64)
    private String unlockType;

    @Column(name = "unlock_key", nullable = false)
    private String unlockKey;

    @Column(name = "unlock_category", length = 64)
    private String unlockCategory;

    protected TechUnlockRefEmbeddable() {
    }

    public TechUnlockRefEmbeddable(String unlockType, String unlockKey) {
        this(unlockType, unlockKey, null);
    }

    public TechUnlockRefEmbeddable(String unlockType, String unlockKey, String unlockCategory) {
        this.unlockType = unlockType;
        this.unlockKey = unlockKey;
        this.unlockCategory = normalizeNullable(unlockCategory);
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

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (other == null || getClass() != other.getClass()) return false;
        TechUnlockRefEmbeddable that = (TechUnlockRefEmbeddable) other;
        return Objects.equals(unlockType, that.unlockType)
                && Objects.equals(unlockKey, that.unlockKey)
                && Objects.equals(unlockCategory, that.unlockCategory);
    }

    @Override
    public int hashCode() {
        return Objects.hash(unlockType, unlockKey, unlockCategory);
    }

    private static String normalizeNullable(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
