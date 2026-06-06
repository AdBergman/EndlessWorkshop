package ewshop.facade.dto.importing.codex;


import java.util.List;

public record CodexImportBatchDto(
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,

        List<CodexImportEntryDto> entries
) {}