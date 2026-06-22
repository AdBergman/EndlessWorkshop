package ewshop.facade.dto.importing.skills;

import java.util.List;

public record SkillImportTreeDto(
        String treeKey,
        String treeType,
        Boolean isHidden,
        List<String> tierPlacementKeys,
        List<String> tierKeys,
        List<String> skillKeys,
        List<String> referenceKeys,
        String classPrerequisiteKey,
        String factionPrerequisiteKey
) {
}
