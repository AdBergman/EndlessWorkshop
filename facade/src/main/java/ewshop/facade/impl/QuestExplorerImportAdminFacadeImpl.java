package ewshop.facade.impl;

import ewshop.domain.command.QuestExplorerEntryImportSnapshot;
import ewshop.domain.command.QuestExplorerImportMetadata;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.QuestExplorerImportService;
import ewshop.domain.service.QuestExplorerReadService;
import ewshop.facade.dto.importing.ImportCountDto;
import ewshop.facade.dto.importing.ImportCountsDto;
import ewshop.facade.dto.importing.ImportDetailsDto;
import ewshop.facade.dto.importing.ImportDiagnosticsDto;
import ewshop.facade.dto.importing.ImportIssueDto;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportEntryDto;
import ewshop.facade.interfaces.QuestExplorerImportAdminFacade;
import ewshop.facade.mapper.QuestExplorerImportMapper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class QuestExplorerImportAdminFacadeImpl implements QuestExplorerImportAdminFacade {

    private static final int MAX_ERRORS = 50;

    private final QuestExplorerImportService questExplorerImportService;
    private final QuestExplorerReadService questExplorerReadService;

    public QuestExplorerImportAdminFacadeImpl(
            QuestExplorerImportService questExplorerImportService,
            QuestExplorerReadService questExplorerReadService
    ) {
        this.questExplorerImportService = questExplorerImportService;
        this.questExplorerReadService = questExplorerReadService;
    }

    @Override
    public ImportSummaryDto importQuestExplorer(QuestExplorerImportBatchDto file) {
        long startMs = System.currentTimeMillis();

        QuestExplorerImportMetadata metadata = QuestExplorerImportMapper.toMetadata(file);
        List<QuestExplorerImportEntryDto> rows = file.entries();
        if (rows == null || rows.isEmpty()) {
            throw new IllegalArgumentException("Quest explorer file entries[] must not be empty");
        }

        int received = rows.size();
        List<ImportIssueDto> errors = new ArrayList<>();
        List<QuestExplorerEntryImportSnapshot> snapshots = new ArrayList<>(received);

        for (QuestExplorerImportEntryDto row : rows) {
            try {
                snapshots.add(QuestExplorerImportMapper.toSnapshot(row));
            } catch (RuntimeException ex) {
                if (errors.size() < MAX_ERRORS) {
                    errors.add(toIssue(row, ex));
                }
            }
        }

        int failed = received - snapshots.size();

        if (snapshots.isEmpty()) {
            long durationMs = System.currentTimeMillis() - startMs;
            ImportCountsDto counts = new ImportCountsDto(received, 0, 0, 0, 0, failed);
            ImportDiagnosticsDto diagnostics = new ImportDiagnosticsDto(
                    buildWarnings(file),
                    errors,
                    new ImportDetailsDto(0, received)
            );
            return ImportSummaryDto.of(QuestExplorerImportMapper.EXPORT_KIND, counts, diagnostics, durationMs);
        }

        QuestExplorerImportMapper.validateSnapshots(snapshots);
        ImportResult result = questExplorerImportService.importQuestExplorer(metadata, snapshots);

        long durationMs = System.currentTimeMillis() - startMs;
        ImportCountsDto counts = new ImportCountsDto(
                received,
                result.getInserted(),
                result.getUpdated(),
                result.getUnchanged(),
                result.getDeleted(),
                failed
        );
        ImportDiagnosticsDto diagnostics = new ImportDiagnosticsDto(
                buildWarnings(file),
                errors,
                buildDetails(snapshots, received)
        );

        questExplorerReadService.getQuestExplorer();

        return ImportSummaryDto.of(QuestExplorerImportMapper.EXPORT_KIND, counts, diagnostics, durationMs);
    }

    private static ImportIssueDto toIssue(QuestExplorerImportEntryDto dto, RuntimeException ex) {
        String key = dto == null ? null : dto.entryKey();
        String title = dto == null ? null : dto.title();
        String message = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();
        return new ImportIssueDto(
                "QUEST_EXPLORER_IMPORT_INVALID_ENTRY",
                "quest_explorer",
                key,
                title,
                message
        );
    }

    private static ImportDetailsDto buildDetails(List<QuestExplorerEntryImportSnapshot> snapshots, int received) {
        Set<String> distinctKeys = new HashSet<>();
        for (QuestExplorerEntryImportSnapshot snapshot : snapshots) {
            if (snapshot != null && snapshot.entryKey() != null) {
                distinctKeys.add(snapshot.entryKey());
            }
        }
        return new ImportDetailsDto(distinctKeys.size(), received - distinctKeys.size());
    }

    private static List<ImportCountDto> buildWarnings(QuestExplorerImportBatchDto file) {
        List<ImportCountDto> warnings = new ArrayList<>();
        if (file.exporterVersion() == null || file.exporterVersion().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_QUEST_EXPLORER_EXPORTER_VERSION", 1));
        }
        if (file.exportedAtUtc() == null || file.exportedAtUtc().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_QUEST_EXPLORER_EXPORTED_AT_UTC", 1));
        }
        return warnings;
    }
}
