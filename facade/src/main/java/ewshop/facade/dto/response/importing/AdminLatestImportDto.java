package ewshop.facade.dto.response.importing;

import ewshop.facade.dto.importing.ImportCountsDto;

import java.util.List;

public record AdminLatestImportDto(
        boolean available,
        String runKey,
        String trigger,
        String status,
        String startedAtUtc,
        String completedAtUtc,
        String sourceLabel,
        int fileCount,
        int importedFileCount,
        int skippedFileCount,
        int failedFileCount,
        ImportCountsDto counts,
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String notes,
        List<AdminImportFileResultDto> fileResults
) {
    public AdminLatestImportDto {
        fileResults = fileResults == null ? List.of() : List.copyOf(fileResults);
    }

    public static AdminLatestImportDto unavailable() {
        return new AdminLatestImportDto(
                false,
                null,
                null,
                null,
                null,
                null,
                null,
                0,
                0,
                0,
                0,
                new ImportCountsDto(0, 0, 0, 0, 0, 0),
                null,
                null,
                null,
                null,
                null,
                List.of()
        );
    }
}
