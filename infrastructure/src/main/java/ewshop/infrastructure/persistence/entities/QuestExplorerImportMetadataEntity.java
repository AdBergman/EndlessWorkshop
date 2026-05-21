package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

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

    @Column(name = "imported_at", nullable = false)
    public LocalDateTime importedAt;

    public QuestExplorerImportMetadataEntity() {}
}
