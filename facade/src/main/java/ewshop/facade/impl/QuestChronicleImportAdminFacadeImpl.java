package ewshop.facade.impl;

import ewshop.domain.model.quest.QuestChronicle;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.QuestChronicleImportService;
import ewshop.domain.service.QuestChronicleReadService;
import ewshop.facade.dto.importing.*;
import ewshop.facade.dto.importing.quests.QuestChronicleImportBatchDto;
import ewshop.facade.interfaces.QuestChronicleImportAdminFacade;
import ewshop.facade.mapper.QuestChronicleMapper;

import java.util.ArrayList;
import java.util.List;

public class QuestChronicleImportAdminFacadeImpl implements QuestChronicleImportAdminFacade {

    private final QuestChronicleImportService questChronicleImportService;
    private final QuestChronicleReadService questChronicleReadService;

    public QuestChronicleImportAdminFacadeImpl(
            QuestChronicleImportService questChronicleImportService,
            QuestChronicleReadService questChronicleReadService
    ) {
        this.questChronicleImportService = questChronicleImportService;
        this.questChronicleReadService = questChronicleReadService;
    }

    @Override
    public ImportSummaryDto importQuestChronicle(QuestChronicleImportBatchDto file) {
        long startMs = System.currentTimeMillis();
        QuestChronicle chronicle = QuestChronicleMapper.toModel(file);
        ImportResult result = questChronicleImportService.importChronicle(chronicle);

        long durationMs = System.currentTimeMillis() - startMs;
        int received = chronicle.entries().size();
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

        questChronicleReadService.getQuestChronicle();

        return ImportSummaryDto.of("quest_chronicle", counts, diagnostics, durationMs);
    }

    private static List<ImportCountDto> buildWarnings(QuestChronicleImportBatchDto file) {
        List<ImportCountDto> warnings = new ArrayList<>();
        if (file.exporterVersion() == null || file.exporterVersion().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_QUEST_CHRONICLE_EXPORTER_VERSION", 1));
        }
        if (file.exportedAtUtc() == null || file.exportedAtUtc().isBlank()) {
            warnings.add(new ImportCountDto("MISSING_QUEST_CHRONICLE_EXPORTED_AT_UTC", 1));
        }
        return warnings;
    }
}
