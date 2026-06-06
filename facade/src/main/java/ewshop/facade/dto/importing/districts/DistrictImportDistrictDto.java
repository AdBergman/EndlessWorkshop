package ewshop.facade.dto.importing.districts;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DistrictImportDistrictDto(
        String districtKey,
        String displayName,
        String category,
        List<String> descriptionLines
) {}
