package ewshop.domain.service;

import ewshop.domain.command.SkillImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.SkillRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SkillImportService {

    private final SkillRepository skillRepository;

    public SkillImportService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Transactional
    @CacheEvict(value = "skills", allEntries = true)
    public ImportResult importSkills(SkillImportSnapshot snapshot) {
        if (snapshot == null || snapshot.skills().isEmpty()) {
            return new ImportResult();
        }
        return skillRepository.importSkillSnapshot(snapshot);
    }
}
