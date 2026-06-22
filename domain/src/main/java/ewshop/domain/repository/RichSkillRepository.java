package ewshop.domain.repository;

import ewshop.domain.command.RichSkillImportSnapshot;
import ewshop.domain.model.RichSkills;
import ewshop.domain.model.results.ImportResult;

public interface RichSkillRepository {
    RichSkills findAll();
    ImportResult importSkillSnapshot(RichSkillImportSnapshot snapshot);
}
