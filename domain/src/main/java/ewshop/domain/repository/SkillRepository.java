package ewshop.domain.repository;

import ewshop.domain.command.SkillImportSnapshot;
import ewshop.domain.model.Skills;
import ewshop.domain.model.results.ImportResult;

public interface SkillRepository {
    Skills findAll();
    ImportResult importSkillSnapshot(SkillImportSnapshot snapshot);
}
