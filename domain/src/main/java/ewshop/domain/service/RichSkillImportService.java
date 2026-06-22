package ewshop.domain.service;

import ewshop.domain.command.RichSkillImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.RichSkillRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RichSkillImportService {

    private final RichSkillRepository richSkillRepository;

    public RichSkillImportService(RichSkillRepository richSkillRepository) {
        this.richSkillRepository = richSkillRepository;
    }

    @Transactional
    @CacheEvict(value = "richSkills", allEntries = true)
    public ImportResult importSkills(RichSkillImportSnapshot snapshot) {
        if (snapshot == null || snapshot.skills().isEmpty()) {
            return new ImportResult();
        }
        return richSkillRepository.importSkillSnapshot(snapshot);
    }
}
