package ewshop.facade.dto.response;

public record DistrictLevelUpDto(
        String targetDistrictKey,
        Integer requiredAdjacentDistrictCount
) {}
