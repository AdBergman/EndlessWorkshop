package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.domain.entity.enums.Faction;
import ewshop.facade.dto.response.UnitDto;
import ewshop.facade.interfaces.UnitFacade;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UnitController.class)
@ContextConfiguration(classes = TestApplication.class)
class UnitControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UnitFacade unitFacade;

    @Test
    void getAllUnits_returnsJson() throws Exception {
        // Given
        UnitDto unit1 = UnitDto.builder()
                .name("Test Unit 1")
                .faction(Faction.ASPECTS)
                .tier(1)
                .skills(List.of("Skill A", "Skill B"))
                .health(100)
                .defense(10)
                .minDamage(5)
                .maxDamage(15)
                .build();

        UnitDto unit2 = UnitDto.builder()
                .name("Test Unit 2")
                .faction(Faction.KIN)
                .tier(2)
                .skills(List.of("Skill C"))
                .health(150)
                .defense(15)
                .minDamage(10)
                .maxDamage(25)
                .build();

        when(unitFacade.getAllUnits()).thenReturn(List.of(unit1, unit2));

        // When & Then
        mockMvc.perform(get("/api/units")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Unit 1"))
                .andExpect(jsonPath("$[0].faction").value("ASPECTS"))
                .andExpect(jsonPath("$[0].tier").value(1))
                .andExpect(jsonPath("$[0].skills[0]").value("Skill A"))
                .andExpect(jsonPath("$[0].skills[1]").value("Skill B"))
                .andExpect(jsonPath("$[0].health").value(100))
                .andExpect(jsonPath("$[0].defense").value(10))
                .andExpect(jsonPath("$[0].minDamage").value(5))
                .andExpect(jsonPath("$[0].maxDamage").value(15))
                .andExpect(jsonPath("$[1].name").value("Test Unit 2"))
                .andExpect(jsonPath("$[1].faction").value("KIN"))
                .andExpect(jsonPath("$[1].tier").value(2))
                .andExpect(jsonPath("$[1].skills[0]").value("Skill C"))
                .andExpect(jsonPath("$[1].health").value(150))
                .andExpect(jsonPath("$[1].defense").value(15))
                .andExpect(jsonPath("$[1].minDamage").value(10))
                .andExpect(jsonPath("$[1].maxDamage").value(25));
    }
}
