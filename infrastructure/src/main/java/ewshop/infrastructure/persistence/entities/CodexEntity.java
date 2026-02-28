package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "codex",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_codex_kind_key",
                columnNames = {"export_kind", "entry_key"}
        )
)
public class CodexEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "export_kind", nullable = false, length = 80)
    private String exportKind;

    @Column(name = "entry_key", nullable = false, length = 220)
    private String entryKey;

    @Column(name = "display_name", nullable = false, length = 400)
    private String displayName;

    @ElementCollection
    @CollectionTable(name = "codex_description_lines", joinColumns = @JoinColumn(name = "codex_id"))
    @OrderColumn(name = "line_index")
    @Column(name = "line", nullable = false, length = 800)
    private List<String> descriptionLines = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "codex_reference_keys", joinColumns = @JoinColumn(name = "codex_id"))
    @OrderColumn(name = "ref_index")
    @Column(name = "ref_key", nullable = false, length = 220)
    private List<String> referenceKeys = new ArrayList<>();

    public CodexEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getExportKind() { return exportKind; }
    public void setExportKind(String exportKind) { this.exportKind = exportKind; }

    public String getEntryKey() { return entryKey; }
    public void setEntryKey(String entryKey) { this.entryKey = entryKey; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public List<String> getDescriptionLines() { return descriptionLines; }
    public void setDescriptionLines(List<String> descriptionLines) {
        this.descriptionLines = descriptionLines == null ? new ArrayList<>() : new ArrayList<>(descriptionLines);
    }

    public List<String> getReferenceKeys() { return referenceKeys; }
    public void setReferenceKeys(List<String> referenceKeys) {
        this.referenceKeys = referenceKeys == null ? new ArrayList<>() : new ArrayList<>(referenceKeys);
    }
}