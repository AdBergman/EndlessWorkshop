package ewshop.domain.service;

import ewshop.domain.model.Skills;
import ewshop.domain.repository.SkillRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("skills")
    public Skills getAllSkills() {
        return skillRepository.findAll();
    }
}
