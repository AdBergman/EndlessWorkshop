package ewshop.api.controller;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/import")
public class ImportAdminController {

    private final TechImportAdminFacade techImportAdminFacade;
    private final DistrictImportAdminFacade districtImportAdminFacade;
    private final ImprovementImportAdminFacade improvementImportAdminFacade;
    private final UnitImportAdminFacade unitImportAdminFacade;

    public ImportAdminController(
            TechImportAdminFacade techImportAdminFacade,
            DistrictImportAdminFacade districtImportAdminFacade,
            ImprovementImportAdminFacade improvementImportAdminFacade,
            UnitImportAdminFacade unitImportAdminFacade
    ) {
        this.techImportAdminFacade = techImportAdminFacade;
        this.districtImportAdminFacade = districtImportAdminFacade;
        this.improvementImportAdminFacade = improvementImportAdminFacade;
        this.unitImportAdminFacade = unitImportAdminFacade;
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

    @PostMapping(value = "/improvements", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importImprovements(@RequestBody ImprovementImportBatchDto dto) {
        if (dto.improvements() == null || dto.improvements().isEmpty()) {
            throw new IllegalArgumentException("Import file is missing improvements[]");
        }
        return improvementImportAdminFacade.importImprovements(dto);
    }

    @PostMapping(value = "/units", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importUnits(@RequestBody UnitImportBatchDto dto) {
        if (dto.units() == null || dto.units().isEmpty()) {
            throw new IllegalArgumentException("Import file is missing units[]");
        }
        return unitImportAdminFacade.importUnits(dto);
    }
}