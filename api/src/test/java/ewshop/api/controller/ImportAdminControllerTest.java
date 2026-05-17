package ewshop.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.facade.dto.importing.ImportCountsDto;
import ewshop.facade.dto.importing.ImportDiagnosticsDto;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.codex.CodexImportEntryDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportDistrictDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.quests.*;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportTechDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.interfaces.QuestImportAdminFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ImportAdminControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private RecordingTechImportAdminFacade techImportAdminFacade;
    private RecordingDistrictImportAdminFacade districtImportAdminFacade;
    private RecordingImprovementImportAdminFacade improvementImportAdminFacade;
    private RecordingUnitImportAdminFacade unitImportAdminFacade;
    private RecordingCodexImportAdminFacade codexImportAdminFacade;
    private RecordingQuestImportAdminFacade questImportAdminFacade;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        techImportAdminFacade = new RecordingTechImportAdminFacade();
        districtImportAdminFacade = new RecordingDistrictImportAdminFacade();
        improvementImportAdminFacade = new RecordingImprovementImportAdminFacade();
        unitImportAdminFacade = new RecordingUnitImportAdminFacade();
        codexImportAdminFacade = new RecordingCodexImportAdminFacade();
        questImportAdminFacade = new RecordingQuestImportAdminFacade();

        ImportAdminController controller = new ImportAdminController(
                techImportAdminFacade,
                districtImportAdminFacade,
                improvementImportAdminFacade,
                unitImportAdminFacade,
                codexImportAdminFacade,
                questImportAdminFacade
        );

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    @Test
    void importTechs_returnsOk_andCallsFacade_whenPayloadHasTechs() throws Exception {
        TechImportTechDto tech = new TechImportTechDto(
                "Technology_X",
                "Stonework",
                "Lore",
                false,
                2,
                "Defense",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        TechImportBatchDto payload = new TechImportBatchDto(
                "Endless Legend 2",
                "0.75",
                "0.1.0",
                "2026-02-10T00:00:00Z",
                "tech",
                List.of(tech)
        );

        mockMvc.perform(post("/api/admin/import/techs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        assertEquals(payload, techImportAdminFacade.lastDto);
    }

    @Test
    void importTechs_returnsBadRequest_andDoesNotCallFacade_whenTechListIsEmpty() throws Exception {
        TechImportBatchDto payload = new TechImportBatchDto(
                "Endless Legend 2",
                "0.75",
                "0.1.0",
                "2026-02-10T00:00:00Z",
                "tech",
                List.of()
        );

        mockMvc.perform(post("/api/admin/import/techs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());

        assertNull(techImportAdminFacade.lastDto);
    }

    @Test
    void importTechs_returnsBadRequest_andDoesNotCallFacade_whenTechsFieldIsMissing() throws Exception {
        String payload = """
                {
                  "game": "Endless Legend 2",
                  "gameVersion": "0.75",
                  "exporterVersion": "0.1.0",
                  "exportedAtUtc": "2026-02-10T00:00:00Z",
                  "exportKind": "tech"
                }
                """;

        mockMvc.perform(post("/api/admin/import/techs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());

        assertNull(techImportAdminFacade.lastDto);
    }

    @Test
    void importDistricts_returnsOk_andCallsFacade_whenPayloadHasDistricts() throws Exception {
        DistrictImportDistrictDto dto = new DistrictImportDistrictDto(
                "Aspect_District_Tier1_Science",
                "Laboratory",
                "Science",
                List.of("+2 Science per District Level")
        );

        DistrictImportBatchDto payload = new DistrictImportBatchDto(
                "Endless Legend 2",
                "0.75",
                "0.1.0",
                "2026-02-15T00:00:00Z",
                "district",
                List.of(dto)
        );

        mockMvc.perform(post("/api/admin/import/districts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        assertEquals(payload, districtImportAdminFacade.lastDto);
    }

    @Test
    void importDistricts_returnsBadRequest_andDoesNotCallFacade_whenDistrictListIsEmpty() throws Exception {
        DistrictImportBatchDto payload = new DistrictImportBatchDto(
                "Endless Legend 2",
                "0.75",
                "0.1.0",
                "2026-02-15T00:00:00Z",
                "district",
                List.of()
        );

        mockMvc.perform(post("/api/admin/import/districts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());

        assertNull(districtImportAdminFacade.lastDto);
    }

    @Test
    void importCodex_returnsOk_andCallsFacade_whenPayloadHasEntries() throws Exception {
        CodexImportBatchDto payload = new CodexImportBatchDto(
                "Endless Legend 2",
                "0.78",
                "0.4.0",
                "2026-05-02T07:42:00Z",
                "equipment",
                List.of(new CodexImportEntryDto(
                        "Equipment_Accessory_03_Definition",
                        "Crimson Wing Rune",
                        List.of("Type: Accessory"),
                        List.of("UnitAbility_Hero_BattleAbility_Equipment_Passive_44")
                ))
        );

        mockMvc.perform(post("/api/admin/import/codex")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        assertEquals(payload, codexImportAdminFacade.lastDto);
    }

    @Test
    void importCodex_returnsBadRequest_andDoesNotCallFacade_whenEntriesAreEmpty() throws Exception {
        CodexImportBatchDto payload = new CodexImportBatchDto(
                "Endless Legend 2",
                "0.78",
                "0.4.0",
                "2026-05-02T07:42:00Z",
                "equipment",
                List.of()
        );

        mockMvc.perform(post("/api/admin/import/codex")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());

        assertNull(codexImportAdminFacade.lastDto);
    }

    @Test
    void importQuests_returnsOk_andCallsFacade_whenPayloadHasGraphAndDialog() throws Exception {
        QuestImportBatchDto payload = questPayload();

        mockMvc.perform(post("/api/admin/import/quests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        assertEquals(payload, questImportAdminFacade.lastDto);
    }

    @Test
    void importQuests_returnsBadRequest_andDoesNotCallFacade_whenDialogIsMissing() throws Exception {
        QuestImportBatchDto payload = new QuestImportBatchDto(questPayload().graph(), null);

        mockMvc.perform(post("/api/admin/import/quests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());

        assertNull(questImportAdminFacade.lastDto);
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

    private static final class RecordingTechImportAdminFacade implements TechImportAdminFacade {
        private TechImportBatchDto lastDto;

        @Override
        public ImportSummaryDto importTechs(TechImportBatchDto file) {
            this.lastDto = file;
            return okSummary("techs");
        }
    }

    private static final class RecordingDistrictImportAdminFacade implements DistrictImportAdminFacade {
        private DistrictImportBatchDto lastDto;

        @Override
        public ImportSummaryDto importDistricts(DistrictImportBatchDto file) {
            this.lastDto = file;
            return okSummary("districts");
        }
    }

    private static final class RecordingImprovementImportAdminFacade implements ImprovementImportAdminFacade {
        @Override
        public ImportSummaryDto importImprovements(ImprovementImportBatchDto dto) {
            return okSummary("improvements");
        }
    }

    private static final class RecordingUnitImportAdminFacade implements UnitImportAdminFacade {
        @Override
        public ImportSummaryDto importUnits(UnitImportBatchDto dto) {
            return okSummary("units");
        }
    }

    private static final class RecordingCodexImportAdminFacade implements CodexImportAdminFacade {
        private CodexImportBatchDto lastDto;

        @Override
        public ImportSummaryDto importCodex(CodexImportBatchDto file) {
            this.lastDto = file;
            return okSummary("codex");
        }
    }

    private static final class RecordingQuestImportAdminFacade implements QuestImportAdminFacade {
        private QuestImportBatchDto lastDto;

        @Override
        public ImportSummaryDto importQuests(QuestImportBatchDto file) {
            this.lastDto = file;
            return okSummary("quests");
        }
    }

    private static QuestImportBatchDto questPayload() {
        QuestDialogBlockRefDto ref = new QuestDialogBlockRefDto(
                "Quest_A",
                "Choice_A",
                0,
                "Dialog_A",
                "start",
                1
        );
        QuestGraphStepDto step = new QuestGraphStepDto(
                0,
                null,
                null,
                null,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of("Dialog_A"),
                List.of(ref)
        );
        QuestGraphChoiceDto choice = new QuestGraphChoiceDto(
                "Choice_A",
                "Choice A",
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of("Choice_A"),
                List.of(step)
        );
        QuestGraphQuestDto quest = new QuestGraphQuestDto(
                "Quest_A",
                "A Quest",
                List.of(),
                "QuestCategory_Test",
                "Curiosity",
                false,
                false,
                true,
                false,
                false,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                List.of(),
                List.of(),
                List.of("Quest_A"),
                List.of(choice),
                List.of()
        );
        QuestDialogBlockDto dialogBlock = new QuestDialogBlockDto(
                "Quest_A",
                "Choice_A",
                0,
                "Dialog_A",
                "start",
                List.of(new QuestDialogLineDto(0, "narrator", null, "Line"))
        );

        return new QuestImportBatchDto(
                new QuestGraphImportBatchDto("Endless Legend 2", "0.80", "0.1.0", "now", "quest_graph", List.of(quest)),
                new QuestDialogImportBatchDto("Endless Legend 2", "0.80", "0.1.0", "now", "quest_dialog", List.of(dialogBlock))
        );
    }
}
