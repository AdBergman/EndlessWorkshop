package ewshop.facade.dto.importing.factions;

import java.util.List;

public record FactionImportBatchDto(
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        List<FactionImportFactionDto> factions
) {
}
