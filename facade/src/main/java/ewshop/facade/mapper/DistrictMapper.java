package ewshop.facade.mapper;

import ewshop.domain.model.District;
import ewshop.facade.dto.response.DistrictDto;

import java.util.List;

public class DistrictMapper {

    public static DistrictDto toDto(District domain) {
        if (domain == null) return null;

        List<String> lines = (domain.getDescriptionLines() == null)
                ? List.of()
                : List.copyOf(domain.getDescriptionLines());

        return new DistrictDto(
                domain.getDistrictKey(),
                domain.getDisplayName(),
                domain.getCategory(),
                lines
        );
    }
}