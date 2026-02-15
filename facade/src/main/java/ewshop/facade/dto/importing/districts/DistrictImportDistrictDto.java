package ewshop.facade.dto.importing.districts;

import java.util.List;

public record DistrictImportDistrictDto(
        String districtKey,
        String displayName,
        String category,
        List<String> descriptionLines
) {}