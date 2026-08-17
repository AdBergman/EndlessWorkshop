package ewshop.facade.dto.response;

import java.util.List;

public record DistrictLevelUpDto(
        String targetDistrictKey,
        Integer requiredAdjacentDistrictCount,
        List<String> validNeighbourDescriptorKeys,
        String validNeighbourUiMapperKey,
        List<String> requiredFactionTraitKeys
) {
    public DistrictLevelUpDto(String targetDistrictKey, Integer requiredAdjacentDistrictCount) {
        this(targetDistrictKey, requiredAdjacentDistrictCount, List.of(), null, List.of());
    }
}
