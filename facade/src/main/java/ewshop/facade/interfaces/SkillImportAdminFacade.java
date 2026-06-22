package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.skills.SkillImportBatchDto;

public interface SkillImportAdminFacade {
    ImportSummaryDto importSkills(SkillImportBatchDto file);
}
