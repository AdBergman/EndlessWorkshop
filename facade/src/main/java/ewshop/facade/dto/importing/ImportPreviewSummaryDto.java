package ewshop.facade.dto.importing;

import java.util.List;

public record ImportPreviewSummaryDto(
        String kind,
        int received,
        int valid,
        int importable,
        int filtered,
        int failed,
        List<ImportCountDto> filters,
        List<ImportIssueDto> errors
) {
    public ImportPreviewSummaryDto {
        filters = filters == null ? List.of() : List.copyOf(filters);
        errors = errors == null ? List.of() : List.copyOf(errors);
    }
}
