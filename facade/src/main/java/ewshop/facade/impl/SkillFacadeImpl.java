package ewshop.facade.impl;

import ewshop.domain.service.SkillService;
import ewshop.facade.dto.response.SkillsDto;
import ewshop.facade.interfaces.SkillFacade;
import ewshop.facade.mapper.SkillMapper;

public class SkillFacadeImpl implements SkillFacade {

    private final SkillService skillService;

    public SkillFacadeImpl(SkillService skillService) {
        this.skillService = skillService;
    }

    @Override
    public SkillsDto getAllSkills() {
        return SkillMapper.toDto(skillService.getAllSkills());
    }
}
