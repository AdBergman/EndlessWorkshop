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
        assertEquals(List.of("UnitAbility_Hero_BattleAbility_Equipment_Passive_44"), snapshots.get(0).referenceKeys());
        assertEquals(1, summary.counts().inserted());
    }

    @Test
    void importCodex_acceptsMinorFactionsQuestsAndTraitsKinds() {
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
                "minorFactions",
                List.of(new CodexImportEntryDto("MinorFaction_A", "Minor Faction A", List.of("Line"), List.of()))
        ));
        facade.importCodex(new CodexImportBatchDto(
                "Endless Legend 2",
                "0.78",
                "0.4.0",
                "2026-05-02T07:42:00Z",
                "quests",
                List.of(new CodexImportEntryDto("Quest_A", "Quest A", List.of("Line"), List.of()))
        ));
        facade.importCodex(new CodexImportBatchDto(
                "Endless Legend 2",
                "0.78",
                "0.4.0",
                "2026-05-02T07:42:00Z",
                "traits",
                List.of(new CodexImportEntryDto("Trait_A", "Trait A", List.of("Line"), List.of()))
        ));

        assertEquals(List.of("minorFactions", "quests", "traits"), codexImportService.capturedExportKinds);
        assertEquals(3, codexService.getAllCalls);
    }

    @Test
    void importCodex_rejectsUnsupportedExportKind() {
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
                "debug",
                List.of(new CodexImportEntryDto("Entry_A", "Entry A", List.of("Line"), List.of("Ref_A")))
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> facade.importCodex(dto));
        assertTrue(ex.getMessage().contains("Invalid exportKind."));
        assertTrue(ex.getMessage().contains("debug"));
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
