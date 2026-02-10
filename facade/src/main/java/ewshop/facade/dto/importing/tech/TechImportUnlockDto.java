package ewshop.facade.dto.importing.tech;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TechImportUnlockDto(
        String unlockType,
        String unlockCategory,
        String unlockElementName
) {}