package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.facade.dto.response.quests.*;
import ewshop.facade.interfaces.QuestFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QuestController.class)
@ContextConfiguration(classes = TestApplication.class)
class QuestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QuestFacade questFacade;

    @Test
    void getQuestExplorer_returnsComposedJson() throws Exception {
        QuestDialogLineDto line = new QuestDialogLineDto(0, 3, "character", "Leader", "We begin.");
        QuestDialogBlockDto block = new QuestDialogBlockDto(
                "Quest_A|Choice_A|0|Dialog_A|start",
                "Quest_A",
                "Choice_A",
                0,
                "STEP",
                "Dialog_A",
                "start",
                1,
                0,
                List.of(line)
        );
        QuestStepDto step = new QuestStepDto(
                0,
                0,
                "Find the trail.",
                "Quest_B",
                null,
                List.of("Find the trail."),
                List.of("Complete it"),
                List.of(),
                List.of(),
                List.of("Have a hero"),
                List.of("Reward"),
                List.of("Dialog_A"),
                List.of(block.identity())
        );
        QuestChoiceDto choice = new QuestChoiceDto(
                "Choice_A",
                "Choice A",
                0,
                List.of("Choice description"),
                List.of("Complete it"),
                List.of(),
                List.of("Reward"),
                List.of("Quest_B"),
                List.of("Choice_A"),
                List.of(step)
        );
        QuestDto quest = new QuestDto(
                "Quest_A",
                "A Quest",
                List.of("Quest description"),
                "QuestCategory_Test",
                "Curiosity",
                true,
                false,
                true,
                false,
                false,
                "Chapter_A",
                0,
                1,
                2,
                "Branch_A",
                "Branch label",
                "Faction_A",
                "QuestLine_A",
                "Quest_C",
                List.of("Quest_Prev"),
                List.of("Quest_B"),
                List.of("Quest_A"),
                List.of(),
                List.of(choice)
        );

        when(questFacade.getQuestExplorer()).thenReturn(new QuestExplorerDto(List.of(quest), List.of(block)));

        mockMvc.perform(get("/api/quests")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.quests[0].questKey").value("Quest_A"))
                .andExpect(jsonPath("$.quests[0].categoryType").value("Curiosity"))
                .andExpect(jsonPath("$.quests[0].branchStart").value(true))
                .andExpect(jsonPath("$.quests[0].choices[0].choiceKey").value("Choice_A"))
                .andExpect(jsonPath("$.quests[0].choices[0].steps[0].objectiveText").value("Find the trail."))
                .andExpect(jsonPath("$.quests[0].choices[0].steps[0].dialogBlockIdentities[0]").value(block.identity()))
                .andExpect(jsonPath("$.dialogBlocks[0].identity").value(block.identity()))
                .andExpect(jsonPath("$.dialogBlocks[0].phase").value("start"))
                .andExpect(jsonPath("$.dialogBlocks[0].lines[0].text").value("We begin."));
    }
}
