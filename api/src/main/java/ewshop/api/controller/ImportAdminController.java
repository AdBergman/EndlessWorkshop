package ewshop.api.controller;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.ImportSmokeSummaryDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.interfaces.QuestExplorerImportAdminFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/import")
public class ImportAdminController {

    private final TechImportAdminFacade techImportAdminFacade;
    private final DistrictImportAdminFacade districtImportAdminFacade;
    private final ImprovementImportAdminFacade improvementImportAdminFacade;
    private final UnitImportAdminFacade unitImportAdminFacade;
    private final CodexImportAdminFacade codexImportAdminFacade;
    private final QuestExplorerImportAdminFacade questExplorerImportAdminFacade;

    public ImportAdminController(
            TechImportAdminFacade techImportAdminFacade,
            DistrictImportAdminFacade districtImportAdminFacade,
            ImprovementImportAdminFacade improvementImportAdminFacade,
            UnitImportAdminFacade unitImportAdminFacade,
            CodexImportAdminFacade codexImportAdminFacade,
            QuestExplorerImportAdminFacade questExplorerImportAdminFacade
    ) {
        this.techImportAdminFacade = techImportAdminFacade;
        this.districtImportAdminFacade = districtImportAdminFacade;
        this.improvementImportAdminFacade = improvementImportAdminFacade;
        this.unitImportAdminFacade = unitImportAdminFacade;
        this.codexImportAdminFacade = codexImportAdminFacade;
        this.questExplorerImportAdminFacade = questExplorerImportAdminFacade;
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

    @PostMapping(value = "/techs/smoke", consumes = "application/json", produces = "application/json")
    public ImportSmokeSummaryDto smokeTestTechs(@RequestBody TechImportBatchDto dto) {
        if (dto.techs() == null || dto.techs().isEmpty()) {
            throw new IllegalArgumentException("Import file is missing techs[]");
        }
        return techImportAdminFacade.smokeTestTechs(dto);
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

    @PostMapping(value = "/units/smoke", consumes = "application/json", produces = "application/json")
    public ImportSmokeSummaryDto smokeTestUnits(@RequestBody UnitImportBatchDto dto) {
        if (dto.units() == null || dto.units().isEmpty()) {
            throw new IllegalArgumentException("Import file is missing units[]");
        }
        return unitImportAdminFacade.smokeTestUnits(dto);
    }

    @PostMapping(value = "/codex", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importCodex(@RequestBody CodexImportBatchDto dto) {
        if (dto.entries() == null || dto.entries().isEmpty()) {
            throw new IllegalArgumentException("Import file entries[] must not be empty");
        }
        return codexImportAdminFacade.importCodex(dto);
    }

    @PostMapping(value = "/quests/explorer", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importQuestExplorer(@RequestBody QuestExplorerImportBatchDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Quest explorer import file is required");
        }
        if (dto.entries() == null || dto.entries().isEmpty()) {
            throw new IllegalArgumentException("Quest explorer file entries[] must not be empty");
        }
        return questExplorerImportAdminFacade.importQuestExplorer(dto);
    }
}
