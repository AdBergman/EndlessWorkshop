package ewshop.facade.dto.importing.skills;

import java.util.List;

public record SkillImportTierDto(
        String tierPlacementKey,
        String tierKey,
        String treeKey,
        String treeType,
        Integer tierIndex,
        Integer levelPrerequisite,
        List<String> skillKeys,
        List<String> referenceKeys
) {
}
