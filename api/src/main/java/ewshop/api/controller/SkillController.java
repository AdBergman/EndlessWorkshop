package ewshop.api.controller;

import ewshop.facade.dto.response.SkillsDto;
import ewshop.facade.interfaces.SkillFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SkillController {

    private final SkillFacade skillFacade;

    public SkillController(SkillFacade skillFacade) {
        this.skillFacade = skillFacade;
    }

    @GetMapping("/api/skills")
    public SkillsDto getAllSkills() {
        return skillFacade.getAllSkills();
    }
}
