package ewshop.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.facade.dto.importing.*;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestChronicleImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.interfaces.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ImportAdminControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private RecordingQuestChronicleImportAdminFacade questFacade;
    private RecordingCodexImportAdminFacade codexFacade;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        questFacade = new RecordingQuestChronicleImportAdminFacade();
        codexFacade = new RecordingCodexImportAdminFacade();
        ImportAdminController controller = new ImportAdminController(
                file -> okSummary("techs"),
                file -> okSummary("districts"),
                file -> okSummary("improvements"),
                file -> okSummary("units"),
                codexFacade,
                questFacade
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    @Test
    void importQuestChronicle_returnsOk_andCallsFacade_whenPayloadHasEntries() throws Exception {
        QuestChronicleImportBatchDto payload = questPayload(List.of(questEntry()));

        mockMvc.perform(post("/api/admin/import/quests/chronicle")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        assertEquals(payload, questFacade.lastDto);
    }

    @Test
    void importQuestChronicle_returnsBadRequest_andDoesNotCallFacade_whenEntriesAreEmpty() throws Exception {
        QuestChronicleImportBatchDto payload = questPayload(List.of());

        mockMvc.perform(post("/api/admin/import/quests/chronicle")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());

        assertNull(questFacade.lastDto);
    }

    @Test
    void importLegacyPairedQuestEndpoint_isNotMapped() throws Exception {
        mockMvc.perform(post("/api/admin/import/quests")
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

    private static QuestChronicleImportBatchDto questPayload(List<QuestChronicleImportBatchDto.EntryDto> entries) {
        return new QuestChronicleImportBatchDto(
                "Endless Legend 2", "0.80", "0.1.0", "now", "quest_chronicle", "1", "questChronicle",
                entries
        );
    }

    private static QuestChronicleImportBatchDto.EntryDto questEntry() {
        return new QuestChronicleImportBatchDto.EntryDto(
                "Quest_A",
                "Quest_A",
                List.of("Quest_A"),
                null,
                null,
                "A Quest",
                List.of("Summary"),
                "Curiosity",
                true,
                false,
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
                List.of(),
                List.of(),
                List.of(),
                List.of()
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

    private static final class RecordingQuestChronicleImportAdminFacade implements QuestChronicleImportAdminFacade {
        private QuestChronicleImportBatchDto lastDto;

        @Override
        public ImportSummaryDto importQuestChronicle(QuestChronicleImportBatchDto file) {
            lastDto = file;
            return okSummary("quest_chronicle");
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
}
