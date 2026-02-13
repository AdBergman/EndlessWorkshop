package ewshop.facade.dto.importing.tech;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TechImportUnlockDto(
        String unlockType,
        String unlockCategory,
        String unlockElementName,

        List<String> descriptorKeys,
        List<String> descriptorLines,
        List<String> descriptorLineKeys
) {
}