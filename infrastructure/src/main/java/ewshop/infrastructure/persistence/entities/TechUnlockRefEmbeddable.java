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

    protected TechUnlockRefEmbeddable() {
    }

    public TechUnlockRefEmbeddable(String unlockType, String unlockKey) {
        this.unlockType = unlockType;
        this.unlockKey = unlockKey;
    }

    public String getUnlockType() {
        return unlockType;
    }

    public String getUnlockKey() {
        return unlockKey;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (other == null || getClass() != other.getClass()) return false;
        TechUnlockRefEmbeddable that = (TechUnlockRefEmbeddable) other;
        return Objects.equals(unlockType, that.unlockType)
                && Objects.equals(unlockKey, that.unlockKey);
    }

    @Override
    public int hashCode() {
        return Objects.hash(unlockType, unlockKey);
    }
}