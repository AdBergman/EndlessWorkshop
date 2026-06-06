package ewshop.facade.dto.importing.improvements;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ImprovementImportImprovementDto(
        String constructibleKey,
        String displayName,
        String category,
        List<String> descriptionLines
) {}
