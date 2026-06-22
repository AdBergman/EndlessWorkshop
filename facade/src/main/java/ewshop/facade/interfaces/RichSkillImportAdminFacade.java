package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.skills.SkillImportBatchDto;

public interface RichSkillImportAdminFacade {
    ImportSummaryDto importSkills(SkillImportBatchDto file);
}
