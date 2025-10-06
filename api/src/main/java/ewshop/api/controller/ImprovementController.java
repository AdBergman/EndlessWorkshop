package ewshop.api.controller;

import ewshop.facade.dto.response.ImprovementDto;
import ewshop.facade.interfaces.ImprovementFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ImprovementController {

    private final ImprovementFacade improvementFacade;

    public ImprovementController(ImprovementFacade improvementFacade) {
        this.improvementFacade = improvementFacade;
    }

    @GetMapping("/api/improvements")
    public List<ImprovementDto> getAllImprovements() {
        return improvementFacade.getAllImprovements();
    }
}
