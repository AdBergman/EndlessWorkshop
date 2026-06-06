package ewshop.facade.dto.importing.tech;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import ewshop.facade.dto.importing.ImportVisibilityPolicy;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TechImportTechDto(
        String techKey,
        String displayName,
        String lore,
        Boolean hidden,
        Integer eraIndex,
        String quadrant,
        String factionKey,
        Boolean isPlayerFacing,
        Boolean isPrototype,
        Boolean isBaseTemplate,
        Boolean isPlaceholder,
        Boolean isInternal,

        List<String> technologyPrerequisiteTechKeys,
        List<String> exclusiveTechnologyPrerequisiteTechKeys,

        List<TechImportTraitPrereqDto> factionTraitPrerequisites,
        List<TechImportUnlockDto> unlocks
) {
    public TechImportTechDto(
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
    ) {
        this(
                techKey,
                displayName,
                lore,
                hidden,
                eraIndex,
                quadrant,
                null,
                null,
                null,
                null,
                null,
                null,
                technologyPrerequisiteTechKeys,
                exclusiveTechnologyPrerequisiteTechKeys,
                factionTraitPrerequisites,
                unlocks
        );
    }

    public boolean hiddenForImport() {
        return ImportVisibilityPolicy.shouldFilter(
                hidden,
                null,
                isPlayerFacing,
                isPrototype,
                isBaseTemplate,
                isPlaceholder,
                isInternal
        );
    }
}
