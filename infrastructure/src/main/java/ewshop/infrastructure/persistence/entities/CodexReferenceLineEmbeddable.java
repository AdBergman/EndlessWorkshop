package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class CodexReferenceLineEmbeddable {

    @Column(name = "ref_group", nullable = false, length = 80)
    private String refGroup;

    @Column(name = "ref_key", nullable = false, length = 220)
    private String refKey;

    public CodexReferenceLineEmbeddable() {}

    public CodexReferenceLineEmbeddable(String refGroup, String refKey) {
        this.refGroup = refGroup;
        this.refKey = refKey;
    }

    public String getRefGroup() { return refGroup; }
    public void setRefGroup(String refGroup) { this.refGroup = refGroup; }

    public String getRefKey() { return refKey; }
    public void setRefKey(String refKey) { this.refKey = refKey; }
}