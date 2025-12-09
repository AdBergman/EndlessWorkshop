package ewshop.api.controller;

import ewshop.facade.dto.response.DistrictDto;
import ewshop.facade.interfaces.DistrictFacade;
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

@WebMvcTest(DistrictController.class)
class DistrictControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DistrictFacade districtFacade;

    @Test
    void getAllDistricts_returnsJson() throws Exception {
        DistrictDto d1 = DistrictDto.builder()
                .name("Farm")
                .effect("+2 Food")
                .tileBonus(List.of("+1 Food on tile producing Food"))
                .adjacencyBonus(List.of("+1 Food for each adjacent River"))
                .info(List.of())
                .placementPrereq("")
                .build();

        when(districtFacade.getAllDistricts()).thenReturn(List.of(d1));

        mockMvc.perform(get("/api/districts")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].name").value("Farm"))
                .andExpect(jsonPath("$[0].effect").value("+2 Food"))
                .andExpect(jsonPath("$[0].tileBonus[0]").value("+1 Food on tile producing Food"))
                .andExpect(jsonPath("$[0].adjacencyBonus[0]").value("+1 Food for each adjacent River"));
    }
}
