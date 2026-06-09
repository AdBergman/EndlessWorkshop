package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.facade.dto.response.UnitDto;
import ewshop.facade.interfaces.UnitFacade;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UnitController.class)
@ContextConfiguration(classes = TestApplication.class)
class UnitControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UnitFacade unitFacade;

    @Test
    void getAllUnits_returnsJson() throws Exception {
        UnitDto unit1 = new UnitDto(
                "Unit_Test_1",
                "Test Unit 1",
                null,
                "ASPECTS",
                true,
                false,
                false,
                "Land",
                null,
                List.of("Unit_Test_1_Upgraded"),
                1,
                "UnitClass_Infantry",
                "Infantry",
                "Skill_Attack_1",
                List.of("UnitAbility_A", "UnitAbility_B"),
                List.of("Line 1", "Line 2")
        );

        UnitDto unit2 = new UnitDto(
                "Unit_Test_2",
                "Test Unit 2",
                "herald",
                "KIN",
                true,
                false,
                false,
                "Land",
                "Unit_Test_1",
                List.of(),
                2,
                "UnitClass_Cavalry",
                "Cavalry",
                "Skill_Attack_2",
                List.of("UnitAbility_C"),
                List.of("Only line")
        );

        when(unitFacade.getAllUnits()).thenReturn(List.of(unit1, unit2));

        mockMvc.perform(get("/api/units")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))

                // Unit 1
                .andExpect(jsonPath("$[0].length()").value(17))
                .andExpect(jsonPath("$[0].unitKey").value("Unit_Test_1"))
                .andExpect(jsonPath("$[0].displayName").value("Test Unit 1"))
                // null fields still exist unless Jackson NON_NULL is configured
                .andExpect(jsonPath("$[0].artId").isEmpty())
                .andExpect(jsonPath("$[0].faction").value("ASPECTS"))
                .andExpect(jsonPath("$[0].isMajorFaction").value(true))
                .andExpect(jsonPath("$[0].isHero").value(false))
                .andExpect(jsonPath("$[0].isChosen").value(false))
                .andExpect(jsonPath("$[0].spawnType").value("Land"))
                .andExpect(jsonPath("$[0].previousUnitKey").isEmpty())
                .andExpect(jsonPath("$[0].nextEvolutionUnitKeys[0]").value("Unit_Test_1_Upgraded"))
                .andExpect(jsonPath("$[0].evolutionTierIndex").value(1))
                .andExpect(jsonPath("$[0].unitClassKey").value("UnitClass_Infantry"))
                .andExpect(jsonPath("$[0].unitClassDisplayName").value("Infantry"))
                .andExpect(jsonPath("$[0].attackSkillKey").value("Skill_Attack_1"))
                .andExpect(jsonPath("$[0].abilityKeys[0]").value("UnitAbility_A"))
                .andExpect(jsonPath("$[0].abilityKeys[1]").value("UnitAbility_B"))
                .andExpect(jsonPath("$[0].descriptionLines[0]").value("Line 1"))
                .andExpect(jsonPath("$[0].descriptionLines[1]").value("Line 2"))
                .andExpect(jsonPath("$[0].veterancyProgressionLines").isEmpty())

                // Unit 2
                .andExpect(jsonPath("$[1].length()").value(17))
                .andExpect(jsonPath("$[1].unitKey").value("Unit_Test_2"))
                .andExpect(jsonPath("$[1].displayName").value("Test Unit 2"))
                .andExpect(jsonPath("$[1].artId").value("herald"))
                .andExpect(jsonPath("$[1].faction").value("KIN"))
                .andExpect(jsonPath("$[1].isMajorFaction").value(true))
                .andExpect(jsonPath("$[1].isHero").value(false))
                .andExpect(jsonPath("$[1].isChosen").value(false))
                .andExpect(jsonPath("$[1].spawnType").value("Land"))
                .andExpect(jsonPath("$[1].previousUnitKey").value("Unit_Test_1"))
                .andExpect(jsonPath("$[1].nextEvolutionUnitKeys").isEmpty())
                .andExpect(jsonPath("$[1].evolutionTierIndex").value(2))
                .andExpect(jsonPath("$[1].unitClassKey").value("UnitClass_Cavalry"))
                .andExpect(jsonPath("$[1].unitClassDisplayName").value("Cavalry"))
                .andExpect(jsonPath("$[1].attackSkillKey").value("Skill_Attack_2"))
                .andExpect(jsonPath("$[1].abilityKeys[0]").value("UnitAbility_C"))
                .andExpect(jsonPath("$[1].descriptionLines[0]").value("Only line"))
                .andExpect(jsonPath("$[1].veterancyProgressionLines").isEmpty());
    }

    @Test
    void getAllUnits_returnsImportedMinorFactionDisplayName() throws Exception {
        UnitDto mangrove = new UnitDto(
                "Unit_MinorFaction_MangroveOfHarmony",
                "Rootstalk",
                null,
                "Mangrove of Harmony",
                false,
                false,
                false,
                "Land",
                null,
                List.of(),
                0,
                "UnitClass_Juggernaught",
                "Juggernaught",
                null,
                List.of("UnitAbility_Roots"),
                List.of("Minor faction line")
        );

        when(unitFacade.getAllUnits()).thenReturn(List.of(mangrove));

        mockMvc.perform(get("/api/units")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].unitKey").value("Unit_MinorFaction_MangroveOfHarmony"))
                .andExpect(jsonPath("$[0].faction").value("Mangrove of Harmony"))
                .andExpect(jsonPath("$[0].isMajorFaction").value(false));
    }
}
