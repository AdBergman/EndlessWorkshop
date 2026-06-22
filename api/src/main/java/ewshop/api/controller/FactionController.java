package ewshop.api.controller;

import ewshop.facade.dto.response.FactionDto;
import ewshop.facade.interfaces.FactionFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class FactionController {

    private final FactionFacade factionFacade;

    public FactionController(FactionFacade factionFacade) {
        this.factionFacade = factionFacade;
    }

    @GetMapping("/api/factions")
    public List<FactionDto> getAllFactions() {
        return factionFacade.getAllFactions();
    }
}
