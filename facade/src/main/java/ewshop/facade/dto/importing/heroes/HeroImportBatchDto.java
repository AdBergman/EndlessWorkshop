package ewshop.facade.dto.importing.heroes;

import java.util.List;

public record HeroImportBatchDto(
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        List<HeroImportHeroDto> units
) {
}
