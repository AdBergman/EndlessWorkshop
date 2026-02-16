package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.facade.dto.response.ImprovementDto;
import ewshop.facade.interfaces.ImprovementFacade;
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

@WebMvcTest(ImprovementController.class)
@ContextConfiguration(classes = TestApplication.class)
class ImprovementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ImprovementFacade improvementFacade;

    @Test
    void getAllImprovements_returnsJson() throws Exception {
        ImprovementDto i1 = new ImprovementDto(
                "DistrictImprovement_TravelersShrine",
                "Traveler's Shrine",
                "Economy",
                List.of("+15 Approval")
        );

        when(improvementFacade.getAllImprovements()).thenReturn(List.of(i1));

        mockMvc.perform(get("/api/improvements")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].improvementKey").value("DistrictImprovement_TravelersShrine"))
                .andExpect(jsonPath("$[0].displayName").value("Traveler's Shrine"))
                .andExpect(jsonPath("$[0].category").value("Economy"))
                .andExpect(jsonPath("$[0].descriptionLines[0]").value("+15 Approval"));
    }
}