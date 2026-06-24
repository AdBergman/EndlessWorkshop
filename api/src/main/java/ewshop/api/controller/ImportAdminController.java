package ewshop.api.controller;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.ImportPreviewSummaryDto;
import ewshop.facade.dto.response.importing.AdminLatestImportDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.factions.FactionImportBatchDto;
import ewshop.facade.dto.importing.heroes.HeroImportBatchDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBatchDto;
import ewshop.facade.dto.importing.skills.SkillImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.interfaces.FactionImportAdminFacade;
import ewshop.facade.interfaces.HeroImportAdminFacade;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.interfaces.ImportHistoryFacade;
import ewshop.facade.interfaces.QuestExplorerImportAdminFacade;
import ewshop.facade.interfaces.SkillImportAdminFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.function.Supplier;

@RestController
@RequestMapping("/api/admin/import")
public class ImportAdminController {

    private static final Logger log = LoggerFactory.getLogger(ImportAdminController.class);

    private final TechImportAdminFacade techImportAdminFacade;
    private final DistrictImportAdminFacade districtImportAdminFacade;
    private final ImprovementImportAdminFacade improvementImportAdminFacade;
    private final UnitImportAdminFacade unitImportAdminFacade;
    private final FactionImportAdminFacade factionImportAdminFacade;
    private final HeroImportAdminFacade heroImportAdminFacade;
    private final SkillImportAdminFacade skillImportAdminFacade;
    private final CodexImportAdminFacade codexImportAdminFacade;
    private final QuestExplorerImportAdminFacade questExplorerImportAdminFacade;
    private final ImportHistoryFacade importHistoryFacade;

    public ImportAdminController(
            TechImportAdminFacade techImportAdminFacade,
            DistrictImportAdminFacade districtImportAdminFacade,
            ImprovementImportAdminFacade improvementImportAdminFacade,
            UnitImportAdminFacade unitImportAdminFacade,
            FactionImportAdminFacade factionImportAdminFacade,
            HeroImportAdminFacade heroImportAdminFacade,
            SkillImportAdminFacade skillImportAdminFacade,
            CodexImportAdminFacade codexImportAdminFacade,
            QuestExplorerImportAdminFacade questExplorerImportAdminFacade,
            ImportHistoryFacade importHistoryFacade
    ) {
        this.techImportAdminFacade = techImportAdminFacade;
        this.districtImportAdminFacade = districtImportAdminFacade;
        this.improvementImportAdminFacade = improvementImportAdminFacade;
        this.unitImportAdminFacade = unitImportAdminFacade;
        this.factionImportAdminFacade = factionImportAdminFacade;
        this.heroImportAdminFacade = heroImportAdminFacade;
        this.skillImportAdminFacade = skillImportAdminFacade;
        this.codexImportAdminFacade = codexImportAdminFacade;
        this.questExplorerImportAdminFacade = questExplorerImportAdminFacade;
        this.importHistoryFacade = importHistoryFacade;
    }

    @GetMapping("/check-token")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void checkAdminToken() {
        // Auth enforced before controller
    }

    @GetMapping(value = "/latest", produces = "application/json")
    public AdminLatestImportDto latestImport() {
        return importHistoryFacade.getLatestImport();
    }

    @PostMapping(value = "/techs", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importTechs(
            @RequestHeader(value = "X-Import-Filename", required = false) String filename,
            @RequestBody TechImportBatchDto dto
    ) {
        return importWithHistory(filename, metadata(dto), () -> techImportAdminFacade.importTechs(dto));
    }

    @PostMapping(value = "/techs/smoke", consumes = "application/json", produces = "application/json")
    public ImportPreviewSummaryDto smokeTestTechs(@RequestBody TechImportBatchDto dto) {
        return techImportAdminFacade.smokeTestTechs(dto);
    }

    @PostMapping(value = "/districts", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importDistricts(
            @RequestHeader(value = "X-Import-Filename", required = false) String filename,
            @RequestBody DistrictImportBatchDto dto
    ) {
        return importWithHistory(filename, metadata(dto), () -> districtImportAdminFacade.importDistricts(dto));
    }

    @PostMapping(value = "/improvements", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importImprovements(
            @RequestHeader(value = "X-Import-Filename", required = false) String filename,
            @RequestBody ImprovementImportBatchDto dto
    ) {
        return importWithHistory(filename, metadata(dto), () -> improvementImportAdminFacade.importImprovements(dto));
    }

    @PostMapping(value = "/units", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importUnits(
            @RequestHeader(value = "X-Import-Filename", required = false) String filename,
            @RequestBody UnitImportBatchDto dto
    ) {
        return importWithHistory(filename, metadata(dto), () -> unitImportAdminFacade.importUnits(dto));
    }

    @PostMapping(value = "/units/smoke", consumes = "application/json", produces = "application/json")
    public ImportPreviewSummaryDto smokeTestUnits(@RequestBody UnitImportBatchDto dto) {
        return unitImportAdminFacade.smokeTestUnits(dto);
    }

    @PostMapping(value = "/factions", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importFactions(
            @RequestHeader(value = "X-Import-Filename", required = false) String filename,
            @RequestBody FactionImportBatchDto dto
    ) {
        return importWithHistory(filename, metadata(dto), () -> factionImportAdminFacade.importFactions(dto));
    }

    @PostMapping(value = "/heroes", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importHeroes(
            @RequestHeader(value = "X-Import-Filename", required = false) String filename,
            @RequestBody HeroImportBatchDto dto
    ) {
        return importWithHistory(filename, metadata(dto), () -> heroImportAdminFacade.importHeroes(dto));
    }

    @PostMapping(value = "/skills", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importSkills(
            @RequestHeader(value = "X-Import-Filename", required = false) String filename,
            @RequestBody SkillImportBatchDto dto
    ) {
        return importWithHistory(filename, metadata(dto), () -> skillImportAdminFacade.importSkills(dto));
    }

    @PostMapping(value = "/codex", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importCodex(
            @RequestHeader(value = "X-Import-Filename", required = false) String filename,
            @RequestBody CodexImportBatchDto dto
    ) {
        return importWithHistory(filename, metadata(dto), () -> codexImportAdminFacade.importCodex(dto));
    }

    @PostMapping(value = "/quests/explorer", consumes = "application/json", produces = "application/json")
    public ImportSummaryDto importQuestExplorer(
            @RequestHeader(value = "X-Import-Filename", required = false) String filename,
            @RequestBody QuestExplorerImportBatchDto dto
    ) {
        return importWithHistory(filename, metadata(dto), () -> questExplorerImportAdminFacade.importQuestExplorer(dto));
    }

    private ImportSummaryDto importWithHistory(
            String filename,
            ImportMetadata metadata,
            Supplier<ImportSummaryDto> importAction
    ) {
        Instant startedAtUtc = Instant.now();
        try {
            ImportSummaryDto summary = importAction.get();
            try {
                importHistoryFacade.recordManualAdminImport(
                        filename,
                        metadata.exportKind(),
                        summary.importKind(),
                        metadata.game(),
                        metadata.gameVersion(),
                        metadata.exporterVersion(),
                        metadata.exportedAtUtc(),
                        metadata.schemaVersion(),
                        startedAtUtc,
                        summary
                );
            } catch (RuntimeException historyError) {
                log.warn("Admin import succeeded, but import history recording failed for exportKind={}", metadata.exportKind(), historyError);
            }
            return summary;
        } catch (RuntimeException error) {
            try {
                importHistoryFacade.recordFailedManualAdminImport(
                        filename,
                        metadata.exportKind(),
                        metadata.exportKind(),
                        metadata.game(),
                        metadata.gameVersion(),
                        metadata.exporterVersion(),
                        metadata.exportedAtUtc(),
                        metadata.schemaVersion(),
                        startedAtUtc,
                        error.getMessage()
                );
            } catch (RuntimeException historyError) {
                log.warn("Admin import failed, and import history recording also failed for exportKind={}", metadata.exportKind(), historyError);
            }
            throw error;
        }
    }

    private static ImportMetadata metadata(TechImportBatchDto dto) {
        return new ImportMetadata(dto.game(), dto.gameVersion(), dto.exporterVersion(), dto.exportedAtUtc(), dto.exportKind(), null);
    }

    private static ImportMetadata metadata(DistrictImportBatchDto dto) {
        return new ImportMetadata(dto.game(), dto.gameVersion(), dto.exporterVersion(), dto.exportedAtUtc(), dto.exportKind(), null);
    }

    private static ImportMetadata metadata(ImprovementImportBatchDto dto) {
        return new ImportMetadata(dto.game(), dto.gameVersion(), dto.exporterVersion(), dto.exportedAtUtc(), dto.exportKind(), null);
    }

    private static ImportMetadata metadata(UnitImportBatchDto dto) {
        return new ImportMetadata(dto.game(), dto.gameVersion(), dto.exporterVersion(), dto.exportedAtUtc(), dto.exportKind(), null);
    }

    private static ImportMetadata metadata(FactionImportBatchDto dto) {
        return new ImportMetadata(dto.game(), dto.gameVersion(), dto.exporterVersion(), dto.exportedAtUtc(), dto.exportKind(), null);
    }

    private static ImportMetadata metadata(HeroImportBatchDto dto) {
        return new ImportMetadata(dto.game(), dto.gameVersion(), dto.exporterVersion(), dto.exportedAtUtc(), dto.exportKind(), null);
    }

    private static ImportMetadata metadata(SkillImportBatchDto dto) {
        return new ImportMetadata(dto.game(), dto.gameVersion(), dto.exporterVersion(), dto.exportedAtUtc(), dto.exportKind(), null);
    }

    private static ImportMetadata metadata(CodexImportBatchDto dto) {
        return new ImportMetadata(dto.game(), dto.gameVersion(), dto.exporterVersion(), dto.exportedAtUtc(), dto.exportKind(), null);
    }

    private static ImportMetadata metadata(QuestExplorerImportBatchDto dto) {
        return new ImportMetadata(null, dto.gameVersion(), dto.exporterVersion(), dto.exportedAtUtc(), dto.exportKind(), dto.schemaVersion());
    }

    private record ImportMetadata(
            String game,
            String gameVersion,
            String exporterVersion,
            String exportedAtUtc,
            String exportKind,
            String schemaVersion
    ) { }
}
