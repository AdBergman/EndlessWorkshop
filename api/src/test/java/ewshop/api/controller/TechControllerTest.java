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

@WebMvcTest(TechController.class) // Only load the controller layer
class TechControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TechFacade techFacade; // Mocked, so no domain/db needed

    @Test
    void getAllTechs_returnsJson() throws Exception {
        TechDto t1 = new TechDto("Stonework", 1, "Defense", "+100 Fortification on Capital",
                "Aspect, Kin, Lost Lords, Necrophage, Tahuk");

        when(techFacade.getAllTechs()).thenReturn(List.of(t1));

        mockMvc.perform(get("/api/techs")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].name").value("Stonework"))
                .andExpect(jsonPath("$[0].era").value(1))
                .andExpect(jsonPath("$[0].type").value("Defense"))
                .andExpect(jsonPath("$[0].effects").value("+100 Fortification on Capital"))
                .andExpect(jsonPath("$[0].factions").value("Aspect, Kin, Lost Lords, Necrophage, Tahuk"));
    }
}
