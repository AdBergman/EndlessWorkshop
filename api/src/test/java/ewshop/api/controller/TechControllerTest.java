package ewshop.api.controller;

import ewshop.facade.dto.TechDto;
import ewshop.facade.interfaces.TechFacade;
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

@WebMvcTest(TechController.class)
class TechControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TechFacade techFacade;

    @Test
    void getAllTechs_returnsJson() throws Exception {
        // Use the new builder
        TechDto t1 = TechDto.builder()
                .name("Stonework")
                .era(1)
                .type("Defense")
                .effects(List.of("+100 Fortification on Capital"))
                .factions(List.of("Aspect", "Kin", "Lost Lords", "Necrophage", "Tahuk"))
                .unlocks(List.of("District: Keep"))
                .prereq("")
                .excludes("")
                .coords(null) // can also create a TechCoordsDto if needed
                .build();

        when(techFacade.getAllTechs()).thenReturn(List.of(t1));

        mockMvc.perform(get("/api/techs")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].name").value("Stonework"))
                .andExpect(jsonPath("$[0].era").value(1))
                .andExpect(jsonPath("$[0].type").value("Defense"))
                .andExpect(jsonPath("$[0].effects[0]").value("+100 Fortification on Capital"))
                .andExpect(jsonPath("$[0].factions[0]").value("Aspect"))
                .andExpect(jsonPath("$[0].factions[1]").value("Kin"))
                .andExpect(jsonPath("$[0].unlocks[0]").value("District: Keep"));
    }
}
