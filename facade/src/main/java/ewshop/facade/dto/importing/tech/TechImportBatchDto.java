package ewshop.facade.dto.importing.tech;

import java.util.List;

public record TechImportBatchDto(
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        List<TechImportTechDto> techs
) {}