package ewshop.api.controller;

import ewshop.facade.dto.response.quests.QuestChronicleDto;
import ewshop.facade.interfaces.QuestChronicleFacade;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class QuestControllerTest {

    @Test
    void getQuestChronicle_returnsChronicleJson() throws Exception {
        QuestChronicleFacade facade = mock(QuestChronicleFacade.class);
        QuestChronicleDto dto = new QuestChronicleDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "now",
                "quest_chronicle",
                "1",
                "questChronicle",
                List.of(new QuestChronicleDto.EntryDto(
                        "Quest_A",
                        "Source_A",
                        List.of("Source_A"),
                        null,
                        null,
                        "First Quest",
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
                ))
        );
        when(facade.getQuestChronicle()).thenReturn(dto);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new QuestController(facade)).build();

        mockMvc.perform(get("/api/quests/chronicle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exportKind").value("quest_chronicle"))
                .andExpect(jsonPath("$.entries[0].entryKey").value("Quest_A"))
                .andExpect(jsonPath("$.entries[0].sourceQuestKeys[0]").value("Source_A"));
    }

    @Test
    void getLegacyRawQuestEndpoint_isNotMapped() throws Exception {
        QuestChronicleFacade facade = mock(QuestChronicleFacade.class);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new QuestController(facade)).build();

        mockMvc.perform(get("/api/quests"))
                .andExpect(status().isNotFound());
    }
}
