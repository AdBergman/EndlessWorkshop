package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.facade.dto.response.ConstructibleNeighbourPlacementDto;
import ewshop.facade.dto.response.ConstructiblePlacementPrerequisitesDto;
import ewshop.facade.dto.response.DistrictDto;
import ewshop.facade.dto.response.DistrictLevelUpDto;
import ewshop.facade.interfaces.DistrictFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
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

    @MockitoBean
    private DistrictFacade districtFacade;

    @Test
    void getAllDistricts_returnsJson() throws Exception {
        DistrictDto dto = new DistrictDto(
                "Aspect_District_Tier1_Science",
                "Laboratory",
                "Science",
                List.of("+2 Science per District Level"),
                List.of("Technology_Science_01"),
                new DistrictLevelUpDto("Aspect_District_Tier2_Science", 3),
                new ConstructiblePlacementPrerequisitesDto(
                        new ConstructibleNeighbourPlacementDto("AnyTile", "SameRegion", true)
                )
        );

        when(districtFacade.getAllDistricts()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/districts")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].length()").value(7))
                .andExpect(jsonPath("$[0].districtKey").value("Aspect_District_Tier1_Science"))
                .andExpect(jsonPath("$[0].displayName").value("Laboratory"))
                .andExpect(jsonPath("$[0].category").value("Science"))
                .andExpect(jsonPath("$[0].descriptionLines[0]").value("+2 Science per District Level"))
                .andExpect(jsonPath("$[0].unlockTechnologyKeys[0]").value("Technology_Science_01"))
                .andExpect(jsonPath("$[0].levelUp.targetDistrictKey").value("Aspect_District_Tier2_Science"))
                .andExpect(jsonPath("$[0].levelUp.requiredAdjacentDistrictCount").value(3))
                .andExpect(jsonPath("$[0].placementPrerequisites.neighbourTiles.operator").value("AnyTile"))
                .andExpect(jsonPath("$[0].placementPrerequisites.neighbourTiles.territoryConstraint").value("SameRegion"))
                .andExpect(jsonPath("$[0].placementPrerequisites.neighbourTiles.ignoreCliff").value(true));
    }
}
