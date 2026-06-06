package ewshop.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.facade.dto.importing.ImportCountsDto;
import ewshop.facade.dto.importing.ImportDiagnosticsDto;
import ewshop.facade.dto.importing.ImportPreviewSummaryDto;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportEntryDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportLoreViewDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportNavigationDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportStrategyViewDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportTechDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportUnitDto;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.QuestExplorerImportAdminFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ImportAdminControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private RecordingTechImportAdminFacade techFacade;
    private RecordingUnitImportAdminFacade unitFacade;
    private RecordingQuestExplorerImportAdminFacade questFacade;
    private RecordingCodexImportAdminFacade codexFacade;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        techFacade = new RecordingTechImportAdminFacade();
        unitFacade = new RecordingUnitImportAdminFacade();
        questFacade = new RecordingQuestExplorerImportAdminFacade();
        codexFacade = new RecordingCodexImportAdminFacade();
        ImportAdminController controller = new ImportAdminController(
                techFacade,
                file -> okSummary("districts"),
                file -> okSummary("improvements"),
                unitFacade,
                codexFacade,
                questFacade
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    @Test
    void smokeTestTechs_returnsOk_andCallsFacade_whenPayloadHasTechs() throws Exception {
        TechImportBatchDto payload = new TechImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "now",
                "tech",
                List.of(new TechImportTechDto(
                        "Tech_A",
                        "A",
                        null,
                        false,
                        1,
                        "Discovery",
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                ))
        );

        mockMvc.perform(post("/api/admin/import/techs/smoke")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kind").value("tech"))
                .andExpect(jsonPath("$.received").value(1));

        assertEquals(payload, techFacade.lastSmokeDto);
        assertNull(techFacade.lastImportDto);
    }

    @Test
    void smokeTestUnits_returnsOk_andCallsFacade_whenPayloadHasUnits() throws Exception {
        UnitImportBatchDto payload = new UnitImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "now",
                "units",
                List.of(new UnitImportUnitDto(
                        "Unit_A",
                        "A",
                        "Kin",
                        true,
                        false,
                        false,
                        "Land",
                        null,
                        List.of(),
                        0,
                        "UnitClass_Ranged",
                        null,
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                ))
        );

        mockMvc.perform(post("/api/admin/import/units/smoke")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kind").value("units"))
                .andExpect(jsonPath("$.received").value(1));

        assertEquals(payload, unitFacade.lastSmokeDto);
        assertNull(unitFacade.lastImportDto);
    }

    @Test
    void importQuestExplorer_returnsOk_andCallsFacade_whenPayloadHasEntries() throws Exception {
        QuestExplorerImportBatchDto payload = questPayload(List.of(questEntry()));

        mockMvc.perform(post("/api/admin/import/quests/explorer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        assertEquals(payload, questFacade.lastDto);
    }

    @Test
    void importQuestExplorer_returnsBadRequest_andDoesNotCallFacade_whenEntriesAreEmpty() throws Exception {
        QuestExplorerImportBatchDto payload = questPayload(List.of());

        mockMvc.perform(post("/api/admin/import/quests/explorer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());

        assertNull(questFacade.lastDto);
    }

    @Test
    void importTemporaryChronicleEndpoint_isNotMapped() throws Exception {
        mockMvc.perform(post("/api/admin/import/quests/chronicle")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void importCodexStillUsesGenericEntriesContract() throws Exception {
        CodexImportBatchDto payload = new CodexImportBatchDto(
                "Endless Legend 2", "0.80", "0.1.0", "now", "quests", List.of()
        );

        mockMvc.perform(post("/api/admin/import/codex")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());

        assertNull(codexFacade.lastDto);
    }

    private static QuestExplorerImportBatchDto questPayload(List<QuestExplorerImportEntryDto> entries) {
        return new QuestExplorerImportBatchDto(
                "0.80",
                "0.1.0",
                "now",
                "quest_explorer",
                "quest_explorer.v3",
                entries
        );
    }

    private static QuestExplorerImportEntryDto questEntry() {
        return new QuestExplorerImportEntryDto(
                "Quest_A",
                "A Quest",
                List.of("Summary"),
                "Curiosity",
                true,
                false,
                List.of("Source_A"),
                new QuestExplorerImportNavigationDto(
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        1,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                ),
                new QuestExplorerImportLoreViewDto(List.of()),
                new QuestExplorerImportStrategyViewDto(List.of()),
                List.of(),
                null
        );
    }

    private static ImportSummaryDto okSummary(String kind) {
        return new ImportSummaryDto(
                kind,
                "2026-05-02T00:00:00Z",
                new ImportCountsDto(1, 1, 0, 0, 0, 0),
                new ImportDiagnosticsDto(List.of(), List.of(), null),
                1L
        );
    }

    private static ImportPreviewSummaryDto okSmokeSummary(String kind) {
        return new ImportPreviewSummaryDto(
                kind,
                1,
                1,
                1,
                0,
                0,
                List.of(),
                List.of()
        );
    }

    private static final class RecordingQuestExplorerImportAdminFacade implements QuestExplorerImportAdminFacade {
        private QuestExplorerImportBatchDto lastDto;

        @Override
        public ImportSummaryDto importQuestExplorer(QuestExplorerImportBatchDto file) {
            lastDto = file;
            return okSummary("quest_explorer");
        }
    }

    private static final class RecordingCodexImportAdminFacade implements CodexImportAdminFacade {
        private CodexImportBatchDto lastDto;

        @Override
        public ImportSummaryDto importCodex(CodexImportBatchDto file) {
            lastDto = file;
            return okSummary("codex");
        }
    }

    private static final class RecordingTechImportAdminFacade implements TechImportAdminFacade {
        private TechImportBatchDto lastImportDto;
        private TechImportBatchDto lastSmokeDto;

        @Override
        public ImportSummaryDto importTechs(TechImportBatchDto file) {
            lastImportDto = file;
            return okSummary("tech");
        }

        @Override
        public ImportPreviewSummaryDto smokeTestTechs(TechImportBatchDto file) {
            lastSmokeDto = file;
            return okSmokeSummary("tech");
        }
    }

    private static final class RecordingUnitImportAdminFacade implements UnitImportAdminFacade {
        private UnitImportBatchDto lastImportDto;
        private UnitImportBatchDto lastSmokeDto;

        @Override
        public ImportSummaryDto importUnits(UnitImportBatchDto dto) {
            lastImportDto = dto;
            return okSummary("units");
        }

        @Override
        public ImportPreviewSummaryDto smokeTestUnits(UnitImportBatchDto dto) {
            lastSmokeDto = dto;
            return okSmokeSummary("units");
        }
    }
}
