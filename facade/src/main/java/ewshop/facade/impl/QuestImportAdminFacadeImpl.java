package ewshop.facade.impl;

import ewshop.domain.command.QuestImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.QuestImportService;
import ewshop.domain.service.QuestService;
import ewshop.facade.dto.importing.*;
import ewshop.facade.dto.importing.quests.QuestImportBatchDto;
import ewshop.facade.interfaces.QuestImportAdminFacade;
import ewshop.facade.mapper.QuestImportMapper;

import java.util.ArrayList;
import java.util.List;

public class QuestImportAdminFacadeImpl implements QuestImportAdminFacade {

    private final QuestImportService questImportService;
    private final QuestService questService;

    public QuestImportAdminFacadeImpl(QuestImportService questImportService, QuestService questService) {
        this.questImportService = questImportService;
        this.questService = questService;
    }

    @Override
    public ImportSummaryDto importQuests(QuestImportBatchDto file) {
        long startMs = System.currentTimeMillis();

        if (file == null) throw new IllegalArgumentException("Quest import file is required");

        QuestImportSnapshot snapshot = QuestImportMapper.toSnapshot(file.graph(), file.dialog());
        ImportResult result = questImportService.importQuests(snapshot);

        long durationMs = System.currentTimeMillis() - startMs;
        int received = snapshot.quests().size();
        ImportCountsDto counts = new ImportCountsDto(
                received,
                result.getInserted(),
                result.getUpdated(),
                result.getUnchanged(),
                result.getDeleted(),
                result.getFailed()
        );

        ImportDiagnosticsDto diagnostics = new ImportDiagnosticsDto(
                buildWarnings(file),
                List.of(),
                new ImportDetailsDto(received, 0)
        );

        questService.getQuestExplorer();

        return ImportSummaryDto.of("quests", counts, diagnostics, durationMs);
    }

    private static List<ImportCountDto> buildWarnings(QuestImportBatchDto file) {
        List<ImportCountDto> warnings = new ArrayList<>();
        if (file.graph().exporterVersion() == null || file.graph().exporterVersion().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_QUEST_GRAPH_EXPORTER_VERSION", 1));
        }
        if (file.graph().exportedAtUtc() == null || file.graph().exportedAtUtc().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_QUEST_GRAPH_EXPORTED_AT_UTC", 1));
        }
        if (file.dialog().exporterVersion() == null || file.dialog().exporterVersion().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_QUEST_DIALOG_EXPORTER_VERSION", 1));
        }
        if (file.dialog().exportedAtUtc() == null || file.dialog().exportedAtUtc().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_QUEST_DIALOG_EXPORTED_AT_UTC", 1));
        }
        return warnings;
    }
}
