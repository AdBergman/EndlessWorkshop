package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.facade.dto.response.DistrictDto;
import ewshop.facade.interfaces.DistrictFacade;
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

@WebMvcTest(DistrictController.class)
@ContextConfiguration(classes = TestApplication.class)
class DistrictControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DistrictFacade districtFacade;

    @Test
    void getAllDistricts_returnsJson() throws Exception {
        DistrictDto dto = new DistrictDto(
                "Aspect_District_Tier1_Science",
                "Laboratory",
                "Science",
                List.of("+2 Science per District Level")
        );

        when(districtFacade.getAllDistricts()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/districts")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].districtKey").value("Aspect_District_Tier1_Science"))
                .andExpect(jsonPath("$[0].displayName").value("Laboratory"))
                .andExpect(jsonPath("$[0].category").value("Science"))
                .andExpect(jsonPath("$[0].descriptionLines[0]").value("+2 Science per District Level"));
    }
}