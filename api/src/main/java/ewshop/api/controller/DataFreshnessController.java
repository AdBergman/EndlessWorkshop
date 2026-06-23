package ewshop.api.controller;

import ewshop.facade.dto.response.importing.DataFreshnessDto;
import ewshop.facade.interfaces.ImportHistoryFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/data-freshness")
public class DataFreshnessController {

    private final ImportHistoryFacade importHistoryFacade;

    public DataFreshnessController(ImportHistoryFacade importHistoryFacade) {
        this.importHistoryFacade = importHistoryFacade;
    }

    @GetMapping(produces = "application/json")
    public DataFreshnessDto latestDataFreshness() {
        return importHistoryFacade.getLatestDataFreshness();
    }
}
