package ewshop.api.controller;

import ewshop.facade.dto.response.ImprovementDto;
import ewshop.facade.interfaces.ImprovementFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ImprovementController.class)
class ImprovementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ImprovementFacade improvementFacade;

    @Test
    void getAllImprovements_returnsJson() throws Exception {
        ImprovementDto i1 = ImprovementDto.builder()
                .name("Traveler's Shrine")
                .effects(List.of("+15 Approval"))
                .unique("CITY")
                .cost(List.of())
                .era(1)
                .build();

        when(improvementFacade.getAllImprovements()).thenReturn(List.of(i1));

        mockMvc.perform(get("/api/improvements")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].name").value("Traveler's Shrine"))
                .andExpect(jsonPath("$[0].effects[0]").value("+15 Approval"))
                .andExpect(jsonPath("$[0].unique").value("CITY"))
                .andExpect(jsonPath("$[0].cost").isEmpty())
                .andExpect(jsonPath("$[0].era").value(1));
    }
}
