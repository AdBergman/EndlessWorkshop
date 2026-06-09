package ewshop.facade.dto.importing.units;

public record UnitImportVeterancyEffectDto(
        String statKey,
        String displayName,
        String operation,
        Double value,
        String formatted
) {}
