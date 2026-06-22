package ewshop.domain.service;

import ewshop.domain.model.RichSkills;
import ewshop.domain.repository.RichSkillRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RichSkillService {

    private final RichSkillRepository richSkillRepository;

    public RichSkillService(RichSkillRepository richSkillRepository) {
        this.richSkillRepository = richSkillRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("richSkills")
    public RichSkills getAllSkills() {
        return richSkillRepository.findAll();
    }
}
