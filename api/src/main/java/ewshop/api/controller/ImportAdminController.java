package ewshop.api.controller;

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

    @PostMapping(value = "/techs", consumes = "application/json")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void importTechs(@RequestBody(required = false) TechImportBatchDto dto) {
        if (dto == null || dto.techs() == null || dto.techs().isEmpty()) {
            return;
        }
        importAdminFacade.importTechs(dto);
    }
}