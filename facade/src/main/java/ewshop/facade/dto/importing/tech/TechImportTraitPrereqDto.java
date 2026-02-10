package ewshop.facade.dto.importing.tech;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TechImportTraitPrereqDto(
        String operator,   // "Any", "None" (future-proof as String)
        String traitKey
) {}