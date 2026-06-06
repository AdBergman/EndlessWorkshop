package ewshop.facade.dto.importing.tech;


import java.util.List;

public record TechImportUnlockDto(
        String unlockType,
        String unlockCategory,
        String unlockElementName,

        List<String> descriptorKeys,
        List<String> descriptorLines,
        List<String> descriptorLineKeys
) {
}