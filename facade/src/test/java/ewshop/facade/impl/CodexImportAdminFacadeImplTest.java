package ewshop.facade.impl;

import ewshop.domain.command.CodexImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.CodexImportService;
import ewshop.domain.service.CodexService;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.codex.CodexImportEntryDto;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CodexImportAdminFacadeImplTest {

    @Test
    void importCodex_acceptsNonAbilitiesKind_andPassesReferenceKeysToImportService() {
        ImportResult result = new ImportResult();
        result.incrementInserted();

        RecordingCodexImportService codexImportService = new RecordingCodexImportService(result);
        RecordingCodexService codexService = new RecordingCodexService();

        CodexImportAdminFacadeImpl facade = new CodexImportAdminFacadeImpl(codexImportService, codexService);

        CodexImportBatchDto dto = new CodexImportBatchDto(
                "Endless Legend 2",
                "0.78",
                "0.4.0",
                "2026-05-02T07:42:00Z",
                "equipment",
                List.of(new CodexImportEntryDto(
                        "Equipment_Accessory_03_Definition",
                        "Crimson Wing Rune",
                        "Accessory",
                        "Equipment",
                        List.of("Type: Accessory", "Rarity: Uncommon"),
                        List.of("UnitAbility_Hero_BattleAbility_Equipment_Passive_44")
                ))
        );

        ImportSummaryDto summary = facade.importCodex(dto);

        assertTrue(codexImportService.called);
        assertEquals(1, codexService.getAllCalls);
        List<CodexImportSnapshot> snapshots = codexImportService.capturedSnapshots;
        assertEquals(1, snapshots.size());
        assertEquals("equipment", snapshots.get(0).exportKind());
        assertEquals("Accessory", snapshots.get(0).category());
        assertEquals("Equipment", snapshots.get(0).kind());
        assertEquals(List.of("UnitAbility_Hero_BattleAbility_Equipment_Passive_44"), snapshots.get(0).referenceKeys());
        assertEquals(1, summary.counts().inserted());
    }

    @Test
    void importCodex_acceptsArbitraryNonBlankExportKind() {
        ImportResult result = new ImportResult();
        result.incrementInserted();

        RecordingCodexImportService codexImportService = new RecordingCodexImportService(result);
        RecordingCodexService codexService = new RecordingCodexService();
        CodexImportAdminFacadeImpl facade = new CodexImportAdminFacadeImpl(codexImportService, codexService);

        facade.importCodex(new CodexImportBatchDto(
                "Endless Legend 2",
                "0.78",
                "0.4.0",
                "2026-05-02T07:42:00Z",
                "futureKind",
                List.of(new CodexImportEntryDto("Future_A", "Future A", List.of("Line"), List.of()))
        ));

        assertEquals(List.of("futureKind"), codexImportService.capturedExportKinds);
        assertEquals(1, codexService.getAllCalls);
    }

    @Test
    void importCodex_preservesDistinctFactionQuestDisplayNames() {
        ImportResult result = new ImportResult();
        result.incrementInserted();

        RecordingCodexImportService codexImportService = new RecordingCodexImportService(result);
        RecordingCodexService codexService = new RecordingCodexService();
        CodexImportAdminFacadeImpl facade = new CodexImportAdminFacadeImpl(codexImportService, codexService);

        facade.importCodex(new CodexImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.4.0",
                "2026-05-15T07:42:00Z",
                "quests",
                List.of(
                        new CodexImportEntryDto("FactionQuest_LastLord_Chapter01_Step01", "A Fragile Dawn", "MajorFaction", "Quest", List.of("Line"), List.of()),
                        new CodexImportEntryDto("FactionQuest_LastLord_Chapter02_Step01", "A Blighted Resurrection", "MajorFaction", "Quest", List.of("Line"), List.of()),
                        new CodexImportEntryDto("FactionQuest_LastLord_Chapter03_Step01", "The Fork in the Road", "MajorFaction", "Quest", List.of("Line"), List.of()),
                        new CodexImportEntryDto("FactionQuest_Necrophage_Chapter01_Step01", "Brave New World", "MajorFaction", "Quest", List.of("Line"), List.of()),
                        new CodexImportEntryDto("FactionQuest_Necrophage_Chapter04_Step01", "A Fresh Lead", "MajorFaction", "Quest", List.of("Line"), List.of())
                )
        ));

        assertEquals(5, codexImportService.capturedSnapshots.size());
        assertEquals(List.of(
                "A Fragile Dawn",
                "A Blighted Resurrection",
                "The Fork in the Road",
                "Brave New World",
                "A Fresh Lead"
        ), codexImportService.capturedSnapshots.stream()
                .map(CodexImportSnapshot::displayName)
                .toList());
    }

    @Test
    void importCodex_normalizesTechnicalMajorFactionDisplayNamesBeforeSaving() {
        ImportResult result = new ImportResult();
        result.incrementInserted();

        RecordingCodexImportService codexImportService = new RecordingCodexImportService(result);
        RecordingCodexService codexService = new RecordingCodexService();
        CodexImportAdminFacadeImpl facade = new CodexImportAdminFacadeImpl(codexImportService, codexService);

        facade.importCodex(new CodexImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.4.0",
                "2026-05-15T07:42:00Z",
                "factions",
                List.of(
                        new CodexImportEntryDto("Faction_Aspect", "Faction_Aspect", List.of("Affinity: Aspects"), List.of("Faction_Mukag")),
                        new CodexImportEntryDto("Faction_KinOfSheredyn", "Faction_KinOfSheredyn", List.of("Affinity: Kin of Sheredyn"), List.of()),
                        new CodexImportEntryDto("Faction_LastLord", "Faction_LastLord", List.of("Affinity: Last Lords"), List.of()),
                        new CodexImportEntryDto("Faction_Mukag", "Faction_Mukag", List.of("Affinity: Tahuks"), List.of()),
                        new CodexImportEntryDto("Faction_Necrophage", "Faction_Necrophage", List.of("Affinity: Necrophage"), List.of())
                )
        ));

        assertEquals(List.of(
                "Aspects",
                "Kin of Sheredyn",
                "Last Lords",
                "Tahuk",
                "Necrophages"
        ), codexImportService.capturedSnapshots.stream()
                .map(CodexImportSnapshot::displayName)
                .toList());

        assertEquals(List.of(
                "Faction_Aspect",
                "Faction_KinOfSheredyn",
                "Faction_LastLord",
                "Faction_Mukag",
                "Faction_Necrophage"
        ), codexImportService.capturedSnapshots.stream()
                .map(CodexImportSnapshot::entryKey)
                .toList());

        assertEquals(List.of("Faction_Mukag"), codexImportService.capturedSnapshots.getFirst().referenceKeys());
    }

    @Test
    void importCodex_preservesNonTechnicalDisplayNames() {
        ImportResult result = new ImportResult();
        result.incrementInserted();

        RecordingCodexImportService codexImportService = new RecordingCodexImportService(result);
        RecordingCodexService codexService = new RecordingCodexService();
        CodexImportAdminFacadeImpl facade = new CodexImportAdminFacadeImpl(codexImportService, codexService);

        facade.importCodex(new CodexImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.4.0",
                "2026-05-15T07:42:00Z",
                "quests",
                List.of(new CodexImportEntryDto(
                        "FactionQuest_Mukag_Chapter01_Step01",
                        "New Dawn",
                        "MajorFaction",
                        "Quest",
                        List.of("Line"),
                        List.of("Faction_Mukag")
                ))
        ));

        assertEquals("New Dawn", codexImportService.capturedSnapshots.getFirst().displayName());
        assertEquals(List.of("Faction_Mukag"), codexImportService.capturedSnapshots.getFirst().referenceKeys());
    }

    @Test
    void importCodex_stripsLeadingBracketTokensFromDisplayNameBeforeSaving() {
        ImportResult result = new ImportResult();
        result.incrementInserted();

        RecordingCodexImportService codexImportService = new RecordingCodexImportService(result);
        RecordingCodexService codexService = new RecordingCodexService();
        CodexImportAdminFacadeImpl facade = new CodexImportAdminFacadeImpl(codexImportService, codexService);

        facade.importCodex(new CodexImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.4.0",
                "2026-05-15T07:42:00Z",
                "districts",
                List.of(new CodexImportEntryDto(
                        "District_Klax",
                        "[Luxury01] [Klax] Klax Extractor",
                        "Resource",
                        "District",
                        List.of("Line"),
                        List.of("Extractor_Luxury01", "District_Klax")
                ))
        ));

        CodexImportSnapshot snapshot = codexImportService.capturedSnapshots.getFirst();
        assertEquals("Klax Extractor", snapshot.displayName());
        assertEquals("District_Klax", snapshot.entryKey());
        assertEquals(List.of("Extractor_Luxury01", "District_Klax"), snapshot.referenceKeys());
    }

    @Test
    void importCodex_promotesExtractorDistrictRowsToExtractorExportKind() {
        ImportResult result = new ImportResult();
        result.incrementInserted();

        RecordingCodexImportService codexImportService = new RecordingCodexImportService(result);
        RecordingCodexService codexService = new RecordingCodexService();
        CodexImportAdminFacadeImpl facade = new CodexImportAdminFacadeImpl(codexImportService, codexService);

        facade.importCodex(new CodexImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.4.0",
                "2026-05-15T07:42:00Z",
                "districts",
                List.of(
                        new CodexImportEntryDto(
                                "Extractor_Luxury01",
                                "[Luxury01] Klax Extractor",
                                "Resource",
                                "District",
                                List.of("Line"),
                                List.of("District_CityCenter")
                        ),
                        new CodexImportEntryDto(
                                "District_CityCenter",
                                "City Center",
                                "Core",
                                "District",
                                List.of("Line"),
                                List.of("Extractor_Luxury01")
                        )
                )
        ));

        assertEquals(List.of("extractors", "districts"), codexImportService.capturedSnapshots.stream()
                .map(CodexImportSnapshot::exportKind)
                .toList());
        assertEquals(List.of("Extractors", "Core"), codexImportService.capturedSnapshots.stream()
                .map(CodexImportSnapshot::category)
                .toList());
        assertEquals(List.of("District", "District"), codexImportService.capturedSnapshots.stream()
                .map(CodexImportSnapshot::kind)
                .toList());
        assertEquals(List.of("Extractor_Luxury01", "District_CityCenter"), codexImportService.capturedSnapshots.stream()
                .map(CodexImportSnapshot::entryKey)
                .toList());
        assertEquals(List.of("District_CityCenter"), codexImportService.capturedSnapshots.getFirst().referenceKeys());
    }

    @Test
    void importCodex_rejectsBlankExportKind() {
        RecordingCodexImportService codexImportService = new RecordingCodexImportService(new ImportResult());
        RecordingCodexService codexService = new RecordingCodexService();

        CodexImportAdminFacadeImpl facade = new CodexImportAdminFacadeImpl(
                codexImportService,
                codexService
        );

        CodexImportBatchDto dto = new CodexImportBatchDto(
                "Endless Legend 2",
                "0.78",
                "0.4.0",
                "2026-05-02T07:42:00Z",
                "   ",
                List.of(new CodexImportEntryDto("Entry_A", "Entry A", List.of("Line"), List.of("Ref_A")))
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> facade.importCodex(dto));
        assertEquals("exportKind is missing", ex.getMessage());
        assertFalse(codexImportService.called);
        assertEquals(0, codexService.getAllCalls);
    }

    @Test
    void importCodex_rejectsDuplicateEntryKeys() {
        RecordingCodexImportService codexImportService = new RecordingCodexImportService(new ImportResult());
        RecordingCodexService codexService = new RecordingCodexService();

        CodexImportAdminFacadeImpl facade = new CodexImportAdminFacadeImpl(
                codexImportService,
                codexService
        );

        CodexImportBatchDto dto = new CodexImportBatchDto(
                "Endless Legend 2",
                "0.78",
                "0.4.0",
                "2026-05-02T07:42:00Z",
                "heroes",
                List.of(
                        new CodexImportEntryDto("Hero_A", "Hero A", List.of("Line"), List.of("Ref_A")),
                        new CodexImportEntryDto("Hero_A", "Hero A 2", List.of("Line"), List.of("Ref_B"))
                )
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> facade.importCodex(dto));
        assertEquals("Duplicate entryKey in import file: Hero_A", ex.getMessage());
        assertFalse(codexImportService.called);
        assertEquals(0, codexService.getAllCalls);
    }

    @Test
    void importCodex_returnsFailedSummary_whenAllRowsAreInvalid() {
        RecordingCodexImportService codexImportService = new RecordingCodexImportService(new ImportResult());
        RecordingCodexService codexService = new RecordingCodexService();

        CodexImportAdminFacadeImpl facade = new CodexImportAdminFacadeImpl(
                codexImportService,
                codexService
        );

        CodexImportBatchDto dto = new CodexImportBatchDto(
                "Endless Legend 2",
                "0.78",
                "0.4.0",
                "2026-05-02T07:42:00Z",
                "units",
                List.of(new CodexImportEntryDto(null, "Missing Key", List.of("Line"), List.of("Ref_A")))
        );

        ImportSummaryDto summary = facade.importCodex(dto);

        assertEquals(1, summary.counts().received());
        assertEquals(1, summary.counts().failed());
        assertEquals(1, summary.diagnostics().errors().size());
        assertFalse(codexImportService.called);
        assertEquals(0, codexService.getAllCalls);
    }

    private static final class RecordingCodexImportService extends CodexImportService {
        private final ImportResult result;
        private List<CodexImportSnapshot> capturedSnapshots = List.of();
        private final List<String> capturedExportKinds = new ArrayList<>();
        private boolean called;

        private RecordingCodexImportService(ImportResult result) {
            super(null);
            this.result = result;
        }

        @Override
        public ImportResult importCodex(List<CodexImportSnapshot> snapshots) {
            this.called = true;
            this.capturedSnapshots = new ArrayList<>(snapshots);
            snapshots.stream()
                    .map(CodexImportSnapshot::exportKind)
                    .forEach(capturedExportKinds::add);
            return result;
        }
    }

    private static final class RecordingCodexService extends CodexService {
        private int getAllCalls;

        private RecordingCodexService() {
            super(null);
        }

        @Override
        public List<ewshop.domain.model.Codex> getAllCodexEntries() {
            getAllCalls++;
            return List.of();
        }
    }
}
