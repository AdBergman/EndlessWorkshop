package ewshop.facade.dto.importing.constructibles;

import java.util.List;

public record ConstructibleTerrainPlacementDto(
        String constraint,
        List<String> terrainTypeKeys,
        Boolean canBuildOnWasteland,
        Boolean canBuildOnMud
) {}
