package ewshop.facade.dto.importing.constructibles;

import java.util.List;

public record ConstructiblePointOfInterestPlacementDto(
        String constraint,
        List<String> pointOfInterestKeys
) {}
