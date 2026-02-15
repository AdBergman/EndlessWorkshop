package ewshop.facade.dto.importing.districts;

import java.util.List;

public record DistrictImportBatchDto(
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        List<DistrictImportDistrictDto> districts
) {}
