package ewshop.api.controller;

import ewshop.facade.dto.response.UnitDto;
import ewshop.facade.interfaces.UnitFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UnitController {
    private final UnitFacade unitFacade;

    public UnitController(UnitFacade unitFacade) {
        this.unitFacade = unitFacade;
    }

    @GetMapping("/api/units")
    public List<UnitDto> getAllUnits() {
        return unitFacade.getAllUnits();
    }
}
