package ewshop.facade.dto.importing.improvements;

import java.util.List;

public record ImprovementImportImprovementDto(
        String constructibleKey,
        String displayName,
        String category,
        List<String> descriptionLines
) {}