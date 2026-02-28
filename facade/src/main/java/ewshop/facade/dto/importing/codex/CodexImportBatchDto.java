package ewshop.facade.dto.importing.codex;

import java.util.List;

public record CodexImportBatchDto(
        String exportKind,
        String sourceVersion,
        List<CodexImportEntryDto> entries
) {}