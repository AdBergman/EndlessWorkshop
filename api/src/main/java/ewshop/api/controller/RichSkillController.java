package ewshop.api.controller;

import ewshop.facade.dto.response.RichSkillsDto;
import ewshop.facade.interfaces.RichSkillFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RichSkillController {

    private final RichSkillFacade richSkillFacade;

    public RichSkillController(RichSkillFacade richSkillFacade) {
        this.richSkillFacade = richSkillFacade;
    }

    @GetMapping("/api/skills")
    public RichSkillsDto getAllSkills() {
        return richSkillFacade.getAllSkills();
    }
}
