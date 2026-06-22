package ewshop.api.controller;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.ImportPreviewSummaryDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.factions.FactionImportBatchDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.interfaces.FactionImportAdminFacade;
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
    private final FactionImportAdminFacade factionImportAdminFacade;
    private final CodexImportAdminFacade codexImportAdminFacade;
    private final QuestExplorerImportAdminFacade questExplorerImportAdminFacade;

    public ImportAdminController(
            TechImportAdminFacade techImportAdminFacade,
            DistrictImportAdminFacade districtImportAdminFacade,
            ImprovementImportAdminFacade improvementImportAdminFacade,
            UnitImportAdminFacade unitImportAdminFacade,
            FactionImportAdminFacade factionImportAdminFacade,
            CodexImportAdminFacade codexImportAdminFacade,
            QuestExplorerImportAdminFacade questExplorerImportAdminFacade
    ) {
        this.techImportAdminFacade = techImportAdminFacade;
        this.districtImportAdminFacade = districtImportAdminFacade;
        this.improvementImportAdminFacade = improvementImportAdminFacade;
        this.unitImportAdminFacade = unitImportAdminFacade;
        this.factionImportAdminFacade = factionImportAdminFacade;
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
        return techImportAdminFacade.importTechs(dto);
    }

    @PostMapping(value = "/techs/smoke", consumes = "application/json", produces = "application/json")
    public ImportPreviewSummaryDto smokeTestTechs(@RequestBody TechImportBatchDto dto) {
        return techImportAdminFacade.smokeTestTechs(dto);
    }

    @PostMapping(value = "/districts", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importDistricts(@RequestBody DistrictImportBatchDto dto) {
        return districtImportAdminFacade.importDistricts(dto);
    }

    @PostMapping(value = "/improvements", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importImprovements(@RequestBody ImprovementImportBatchDto dto) {
        return improvementImportAdminFacade.importImprovements(dto);
    }

    @PostMapping(value = "/units", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importUnits(@RequestBody UnitImportBatchDto dto) {
        return unitImportAdminFacade.importUnits(dto);
    }

    @PostMapping(value = "/units/smoke", consumes = "application/json", produces = "application/json")
    public ImportPreviewSummaryDto smokeTestUnits(@RequestBody UnitImportBatchDto dto) {
        return unitImportAdminFacade.smokeTestUnits(dto);
    }

    @PostMapping(value = "/factions", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importFactions(@RequestBody FactionImportBatchDto dto) {
        return factionImportAdminFacade.importFactions(dto);
    }

    @PostMapping(value = "/codex", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importCodex(@RequestBody CodexImportBatchDto dto) {
        return codexImportAdminFacade.importCodex(dto);
    }

    @PostMapping(value = "/quests/explorer", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importQuestExplorer(@RequestBody QuestExplorerImportBatchDto dto) {
        return questExplorerImportAdminFacade.importQuestExplorer(dto);
    }
}
