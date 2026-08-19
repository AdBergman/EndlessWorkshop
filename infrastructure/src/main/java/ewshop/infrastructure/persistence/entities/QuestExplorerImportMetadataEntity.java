package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Access(AccessType.FIELD)
@Table(name = "quest_explorer_import_metadata")
public class QuestExplorerImportMetadataEntity {

    @Id
    @Column(name = "id")
    public Long id = 1L;

    @Column(name = "game_version", length = 80)
    public String gameVersion;

    @Column(name = "exporter_version", length = 80)
    public String exporterVersion;

    @Column(name = "exported_at_utc", length = 80)
    public String exportedAtUtc;

    @Column(name = "export_kind", nullable = false, length = 80)
    public String exportKind;

    @Column(name = "schema_version", nullable = false, length = 80)
    public String schemaVersion;

    @Convert(converter = JsonMapConverter.class)
    @Column(name = "chapter_root_evidence_json", columnDefinition = "TEXT")
    public Map<String, Object> chapterRootEvidence = new HashMap<>();

    @Column(name = "imported_at", nullable = false)
    public LocalDateTime importedAt;

    public QuestExplorerImportMetadataEntity() {}
}
