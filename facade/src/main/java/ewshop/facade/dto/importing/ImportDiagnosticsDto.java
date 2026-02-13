package ewshop.facade.dto.importing;

import java.util.List;

public record ImportDiagnosticsDto(
        List<ImportCountDto> warnings,
        List<ImportIssueDto> errors,
        ImportDetailsDto details
) {
}