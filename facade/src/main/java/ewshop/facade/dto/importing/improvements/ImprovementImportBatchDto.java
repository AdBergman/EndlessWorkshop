package ewshop.facade.dto.importing.improvements;

import java.util.List;

public record ImprovementImportBatchDto(
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        List<ImprovementImportImprovementDto> improvements
) {}