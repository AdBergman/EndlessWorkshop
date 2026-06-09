package ewshop.facade.dto.importing.units;

import java.util.List;

public record UnitImportVeterancyLevelDto(
        Integer level,
        List<UnitImportVeterancyEffectDto> effects
) {}
