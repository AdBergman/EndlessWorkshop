package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "import_file_results")
public class ImportFileResultEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "import_run_id", nullable = false)
    public ImportRunEntity importRun;

    @Column(name = "file_order", nullable = false)
    public int fileOrder;

    @Column(name = "folder", length = 80)
    public String folder;

    @Column(name = "filename", nullable = false, length = 500)
    public String filename;

    @Column(name = "source_path_hash", length = 64)
    public String sourcePathHash;

    @Column(name = "file_sha256", length = 64)
    public String fileSha256;

    @Column(name = "export_kind", length = 160)
    public String exportKind;

    @Column(name = "import_kind", length = 160)
    public String importKind;

    @Column(name = "game", length = 120)
    public String game;

    @Column(name = "game_version", length = 120)
    public String gameVersion;

    @Column(name = "exporter_version", length = 120)
    public String exporterVersion;

    @Column(name = "exported_at_utc", length = 120)
    public String exportedAtUtc;

    @Column(name = "schema_version", length = 160)
    public String schemaVersion;

    @Column(name = "status", nullable = false, length = 80)
    public String status;

    @Column(name = "skip_reason", length = 260)
    public String skipReason;

    @Column(name = "error_message", columnDefinition = "TEXT")
    public String errorMessage;

    @Column(name = "received_count", nullable = false)
    public int receivedCount;

    @Column(name = "inserted_count", nullable = false)
    public int insertedCount;

    @Column(name = "updated_count", nullable = false)
    public int updatedCount;

    @Column(name = "unchanged_count", nullable = false)
    public int unchangedCount;

    @Column(name = "deleted_count", nullable = false)
    public int deletedCount;

    @Column(name = "failed_count", nullable = false)
    public int failedCount;

    @Column(name = "duration_ms")
    public Long durationMs;

    public ImportFileResultEntity() {}
}
