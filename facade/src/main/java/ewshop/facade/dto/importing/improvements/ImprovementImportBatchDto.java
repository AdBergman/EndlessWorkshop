package ewshop.facade.dto.importing.improvements;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ImprovementImportBatchDto(
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        List<ImprovementImportImprovementDto> improvements
) {}
