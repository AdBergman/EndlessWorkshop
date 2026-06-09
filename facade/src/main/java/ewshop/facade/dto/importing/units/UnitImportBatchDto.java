package ewshop.facade.dto.importing.units;


import java.util.List;

public record UnitImportBatchDto(
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,

        UnitImportVeterancyProgressionDto veterancyProgression,

        List<UnitImportUnitDto> units
) {
    public UnitImportBatchDto(
            String game,
            String gameVersion,
            String exporterVersion,
            String exportedAtUtc,
            String exportKind,
            List<UnitImportUnitDto> units
    ) {
        this(
                game,
                gameVersion,
                exporterVersion,
                exportedAtUtc,
                exportKind,
                null,
                units
        );
    }
}
