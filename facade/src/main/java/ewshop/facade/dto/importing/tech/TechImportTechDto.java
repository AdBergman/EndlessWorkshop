package ewshop.facade.dto.importing.tech;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TechImportTechDto(
        String techKey,
        String displayName,
        String lore,
        Boolean hidden,
        Integer eraIndex,
        String quadrant,

        List<String> technologyPrerequisiteTechKeys,
        List<String> exclusiveTechnologyPrerequisiteTechKeys,

        List<TechImportTraitPrereqDto> factionTraitPrerequisites,
        List<TechImportUnlockDto> unlocks
) {}