package ewshop.api.controller;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.interfaces.ImportAdminFacade;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/import")
public class ImportAdminController {

    private final ImportAdminFacade importAdminFacade;

    public ImportAdminController(ImportAdminFacade importAdminFacade) {
        this.importAdminFacade = importAdminFacade;
    }

    @GetMapping("/check-token")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void checkAdminToken() {
        // Intentionally empty - Admin auth is enforced before controller execution.
    }

    @PostMapping(value = "/techs", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importTechs(@RequestBody TechImportBatchDto dto) {
        if (dto.techs() == null || dto.techs().isEmpty()) {
            throw new IllegalArgumentException("Import file is missing techs[]");
        }
        return importAdminFacade.importTechs(dto);
    }
}