package ewshop.facade.dto.importing;

public record ImportCountsDto(
        int received,
        int inserted,
        int updated,
        int unchanged,
        int deleted,
        int failed
) { }