package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.facade.dto.response.TechCoordsDto;
import ewshop.facade.dto.response.TechDto;
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
        // Setup: Create a DTO that accurately reflects the real mapper's output
        TechDto t1 = TechDto.builder()
                .name("Stonework")
                .techKey("Stonework_X")
                .era(1)
                .type("DEFENSE")
                .effects(List.of("+100 Fortification on Capital"))
                .factions(List.of("ASPECT", "KIN"))
                .unlocks(List.of("District: Keep"))
                .prereq("Masonry")
                .excludes("")
                .coords(new TechCoordsDto(10.5, 20.5))
                .build();

        when(techFacade.getAllTechs()).thenReturn(List.of(t1));

        // Act & Assert
        mockMvc.perform(get("/api/techs")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                // Assert on the actual complex fields of the DTO
                .andExpect(jsonPath("$[0].name").value("Stonework"))
                .andExpect(jsonPath("$[0].techKey").value("Stonework_X"))
                .andExpect(jsonPath("$[0].era").value(1))
                .andExpect(jsonPath("$[0].type").value("DEFENSE"))
                .andExpect(jsonPath("$[0].effects[0]").value("+100 Fortification on Capital"))
                .andExpect(jsonPath("$[0].factions[0]").value("ASPECT"))
                .andExpect(jsonPath("$[0].factions[1]").value("KIN"))
                .andExpect(jsonPath("$[0].unlocks[0]").value("District: Keep"))
                .andExpect(jsonPath("$[0].prereq").value("Masonry"))
                .andExpect(jsonPath("$[0].coords.xPct").value(10.5));
    }
}
