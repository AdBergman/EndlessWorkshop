package ewshop.facade.dto.importing.quests;


import java.util.List;
import java.util.Map;

public record QuestExplorerImportBatchDto(
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        String schemaVersion,
        Map<String, Object> chapterRootEvidence,
        List<QuestExplorerImportEntryDto> entries
) {
    public QuestExplorerImportBatchDto(
            String gameVersion,
            String exporterVersion,
            String exportedAtUtc,
            String exportKind,
            String schemaVersion,
            List<QuestExplorerImportEntryDto> entries
    ) {
        this(gameVersion, exporterVersion, exportedAtUtc, exportKind, schemaVersion, Map.of(), entries);
    }
}
