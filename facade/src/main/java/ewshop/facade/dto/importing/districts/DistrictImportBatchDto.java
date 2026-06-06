package ewshop.facade.dto.importing.districts;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DistrictImportBatchDto(
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        List<DistrictImportDistrictDto> districts
) {}
