package ewshop.facade.dto.importing.skills;

import java.util.List;

public record SkillImportHeroDefaultDto(
        String heroKey,
        List<String> defaultSkillKeys,
        List<String> referenceKeys,
        String factionKey,
        String classKey
) {
}
