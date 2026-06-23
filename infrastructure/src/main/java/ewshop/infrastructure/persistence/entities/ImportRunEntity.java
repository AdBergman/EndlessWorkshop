package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "import_runs",
        uniqueConstraints = @UniqueConstraint(name = "uq_import_runs_run_key", columnNames = "run_key")
)
public class ImportRunEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "run_key", nullable = false, length = 80)
    public String runKey;

    @Column(name = "trigger", nullable = false, length = 80)
    public String trigger;

    @Column(name = "status", nullable = false, length = 80)
    public String status;

    @Column(name = "started_at_utc", nullable = false)
    public Instant startedAtUtc;

    @Column(name = "completed_at_utc", nullable = false)
    public Instant completedAtUtc;

    @Column(name = "source_label", length = 260)
    public String sourceLabel;

    @Column(name = "profile", length = 160)
    public String profile;

    @Column(name = "file_count", nullable = false)
    public int fileCount;

    @Column(name = "imported_file_count", nullable = false)
    public int importedFileCount;

    @Column(name = "skipped_file_count", nullable = false)
    public int skippedFileCount;

    @Column(name = "failed_file_count", nullable = false)
    public int failedFileCount;

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

    @Column(name = "game", length = 120)
    public String game;

    @Column(name = "game_version", length = 120)
    public String gameVersion;

    @Column(name = "exporter_version", length = 120)
    public String exporterVersion;

    @Column(name = "exported_at_utc", length = 120)
    public String exportedAtUtc;

    @Column(name = "notes", columnDefinition = "TEXT")
    public String notes;

    @OneToMany(mappedBy = "importRun", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("fileOrder ASC")
    public List<ImportFileResultEntity> fileResults = new ArrayList<>();

    public ImportRunEntity() {}
}
