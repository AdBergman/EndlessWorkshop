package ewshop.facade.impl;

import ewshop.domain.service.RichSkillService;
import ewshop.facade.dto.response.RichSkillsDto;
import ewshop.facade.interfaces.RichSkillFacade;
import ewshop.facade.mapper.RichSkillMapper;

public class RichSkillFacadeImpl implements RichSkillFacade {

    private final RichSkillService richSkillService;

    public RichSkillFacadeImpl(RichSkillService richSkillService) {
        this.richSkillService = richSkillService;
    }

    @Override
    public RichSkillsDto getAllSkills() {
        return RichSkillMapper.toDto(richSkillService.getAllSkills());
    }
}
