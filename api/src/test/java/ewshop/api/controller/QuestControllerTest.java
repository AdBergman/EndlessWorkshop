package ewshop.api.controller;

import ewshop.facade.dto.response.quests.QuestExplorerDto;
import ewshop.facade.interfaces.QuestExplorerFacade;
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
    void getQuestExplorer_returnsExplorerJson() throws Exception {
        QuestExplorerFacade facade = mock(QuestExplorerFacade.class);
        QuestExplorerDto dto = new QuestExplorerDto(
                "0.80",
                "0.1.0",
                "now",
                "quest_explorer",
                "quest_explorer.v3",
                List.of(new QuestExplorerDto.EntryDto(
                        "Quest_A",
                        "First Quest",
                        List.of("Summary"),
                        "Curiosity",
                        true,
                        false,
                        List.of("Source_A"),
                        new QuestExplorerDto.NavigationDto(
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
                        new QuestExplorerDto.LoreViewDto(List.of()),
                        new QuestExplorerDto.StrategyViewDto(List.of()),
                        List.of(),
                        null
                )),
                new QuestExplorerDto.ProgressionDto(
                        List.of(new QuestExplorerDto.QuestlineDto(
                                "FactionQuest_Mukag",
                                "FactionQuest_Mukag",
                                "Mukag",
                                "Faction_Mukag",
                                "Faction_Mukag",
                                "Mukag",
                                List.of("FactionQuest_Mukag"),
                                List.of("Faction_Mukag"),
                                List.of(new QuestExplorerDto.ChapterDto(
                                        2,
                                        2,
                                        "Chapter 2",
                                        List.of(new QuestExplorerDto.StepDto(
                                                "FactionQuest_Mukag:Faction_Mukag:chapter-2:step-0",
                                                1,
                                                0,
                                                "First Quest",
                                                "real_entry_backed",
                                                "Quest_A",
                                                List.of("Quest_A"),
                                                List.of(),
                                                List.of(new QuestExplorerDto.VariantDto(
                                                        "Quest_A",
                                                        "First Quest",
                                                        "entry",
                                                        null,
                                                        null,
                                                        null,
                                                        List.of(),
                                                        List.of("Quest_B"),
                                                        List.of(),
                                                        List.of()
                                                ))
                                        ))
                                ))
                        )),
                        null
                )
        );
        when(facade.getQuestExplorer()).thenReturn(dto);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new QuestController(facade)).build();

        mockMvc.perform(get("/api/quests/explorer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exportKind").value("quest_explorer"))
                .andExpect(jsonPath("$.schemaVersion").value("quest_explorer.v3"))
                .andExpect(jsonPath("$.entries[0].entryKey").value("Quest_A"))
                .andExpect(jsonPath("$.entries[0].aliases[0]").value("Source_A"))
                .andExpect(jsonPath("$.progression.questlines[0].chapters[0].steps[0].stepKey").value("FactionQuest_Mukag:Faction_Mukag:chapter-2:step-0"))
                .andExpect(jsonPath("$.progression.questlines[0].chapters[0].steps[0].projectionKind").value("real_entry_backed"))
                .andExpect(jsonPath("$.progression.questlines[0].chapters[0].steps[0].detailEntryKey").value("Quest_A"));
    }

    @Test
    void getTemporaryChronicleEndpoint_isNotMapped() throws Exception {
        QuestExplorerFacade facade = mock(QuestExplorerFacade.class);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new QuestController(facade)).build();

        mockMvc.perform(get("/api/quests/chronicle"))
                .andExpect(status().isNotFound());
    }
}
