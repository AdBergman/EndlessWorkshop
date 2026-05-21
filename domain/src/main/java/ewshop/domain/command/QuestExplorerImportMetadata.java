package ewshop.domain.command;

public record QuestExplorerImportMetadata(
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        String schemaVersion
) {}
