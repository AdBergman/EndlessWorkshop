package ewshop.facade.dto.importing.skills;

import java.util.List;

public record SkillImportBatchDto(
        String game,
        String gameVersion,
        String exporterVersion,
        String exportedAtUtc,
        String exportKind,
        List<SkillImportTreeDto> skillTrees,
        List<SkillImportTierDto> skillTiers,
        List<SkillImportSkillDto> skills,
        List<SkillImportHeroDefaultDto> heroSkillDefaults
) {
}
