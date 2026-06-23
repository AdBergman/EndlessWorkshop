package ewshop.facade.dto.response.importing;

import ewshop.facade.dto.importing.ImportCountsDto;

public record AdminImportFileResultDto(
        String filename,
        String folder,
        String exportKind,
        String importKind,
        String status,
        String skipReason,
        String errorMessage,
        ImportCountsDto counts,
        Long durationMs,
        String fileSha256Short
) { }
