package ewshop.facade.dto.response;

import java.util.List;

public record ConstructiblePointOfInterestPlacementDto(
        String constraint,
        List<String> pointOfInterestKeys
) {}
