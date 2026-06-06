package ewshop.facade.dto.importing.tech;


public record TechImportTraitPrereqDto(
        String operator,   // "Any", "None" (future-proof as String)
        String traitKey
) {}