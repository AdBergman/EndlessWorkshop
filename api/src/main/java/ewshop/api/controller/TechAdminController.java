package ewshop.api.controller;

import ewshop.facade.dto.request.TechAdminDto;
import ewshop.facade.interfaces.TechAdminFacade;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/techs")
public class TechAdminController {

    private final TechAdminFacade techAdminFacade;

    public TechAdminController(TechAdminFacade techAdminFacade) {
        this.techAdminFacade = techAdminFacade;
    }

    @PostMapping("/placements")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void applyPlacementUpdates(@RequestBody List<TechAdminDto> techDtos) {
        techAdminFacade.applyPlacementUpdates(techDtos);
    }
}