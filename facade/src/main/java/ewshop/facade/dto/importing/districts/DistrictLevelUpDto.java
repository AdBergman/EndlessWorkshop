package ewshop.facade.dto.importing.districts;

public record DistrictLevelUpDto(
        String targetDistrictKey,
        Integer requiredAdjacentDistrictCount
) {}
