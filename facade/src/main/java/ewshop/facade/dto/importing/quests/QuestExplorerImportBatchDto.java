package ewshop.facade.dto.importing.quests;


import java.util.List;

public record QuestExplorerImportBatchDto(
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        String schemaVersion,
        List<QuestExplorerImportEntryDto> entries
) {}
