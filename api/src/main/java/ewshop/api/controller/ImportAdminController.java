package ewshop.api.controller;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/import")
public class ImportAdminController {

    private final TechImportAdminFacade techImportAdminFacade;
    private final DistrictImportAdminFacade districtImportAdminFacade;

    public ImportAdminController(
            TechImportAdminFacade techImportAdminFacade,
            DistrictImportAdminFacade districtImportAdminFacade
    ) {
        this.techImportAdminFacade = techImportAdminFacade;
        this.districtImportAdminFacade = districtImportAdminFacade;
    }

    @GetMapping("/check-token")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void checkAdminToken() {
        // Auth enforced before controller
    }

    @PostMapping(value = "/techs", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importTechs(@RequestBody TechImportBatchDto dto) {
        if (dto.techs() == null || dto.techs().isEmpty()) {
            throw new IllegalArgumentException("Import file is missing techs[]");
        }
        return techImportAdminFacade.importTechs(dto);
    }

    @PostMapping(value = "/districts", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importDistricts(@RequestBody DistrictImportBatchDto dto) {
        if (dto.districts() == null || dto.districts().isEmpty()) {
            throw new IllegalArgumentException("Import file is missing districts[]");
        }
        return districtImportAdminFacade.importDistricts(dto);
    }
}