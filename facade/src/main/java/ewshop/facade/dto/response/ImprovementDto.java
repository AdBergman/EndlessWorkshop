package ewshop.facade.dto.response;

import java.util.List;

public record ImprovementDto(
        String improvementKey,
        String displayName,
        String category,
        List<String> descriptionLines
) {}