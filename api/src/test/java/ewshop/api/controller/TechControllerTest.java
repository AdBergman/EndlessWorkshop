package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.facade.dto.response.TechCoordsDto;
import ewshop.facade.dto.response.TechDto;
import ewshop.facade.dto.response.TechUnlockDto;
import ewshop.facade.interfaces.TechFacade;
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

@WebMvcTest(TechController.class)
@ContextConfiguration(classes = TestApplication.class)
class TechControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TechFacade techFacade;

    @Test
    void getAllTechs_returnsJson() throws Exception {
        TechDto techDto = new TechDto(
                "Stonework",
                "Stonework_X",
                1,
                "Defense",
                List.of(new TechUnlockDto("Constructible", "Aspect_District_Tier1_Food")),
                List.of("+100 Fortification on Capital"),
                "Masonry",
                List.of("Aspect", "Kin"),
                null,
                new TechCoordsDto(10.5, 20.5)
        );

        when(techFacade.getAllTechs()).thenReturn(List.of(techDto));

        mockMvc.perform(get("/api/techs")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].name").value("Stonework"))
                .andExpect(jsonPath("$[0].techKey").value("Stonework_X"))
                .andExpect(jsonPath("$[0].era").value(1))
                .andExpect(jsonPath("$[0].type").value("Defense"))
                .andExpect(jsonPath("$[0].descriptionLines[0]").value("+100 Fortification on Capital"))
                .andExpect(jsonPath("$[0].factions[0]").value("Aspect"))
                .andExpect(jsonPath("$[0].factions[1]").value("Kin"))
                .andExpect(jsonPath("$[0].unlocks[0].unlockType").value("Constructible"))
                .andExpect(jsonPath("$[0].unlocks[0].unlockKey").value("Aspect_District_Tier1_Food"))
                .andExpect(jsonPath("$[0].prereq").value("Masonry"))
                .andExpect(jsonPath("$[0].coords.xPct").value(10.5));
    }
}