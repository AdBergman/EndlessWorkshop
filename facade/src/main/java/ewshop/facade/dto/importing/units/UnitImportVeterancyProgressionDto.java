package ewshop.facade.dto.importing.units;

import java.util.List;

public record UnitImportVeterancyProgressionDto(
        String appliesTo,
        String stacking,
        String source,
        String displayLevelOffset,
        List<UnitImportVeterancyLevelDto> levels
) {}
