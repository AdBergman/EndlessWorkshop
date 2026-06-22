package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.facade.dto.response.RichSkillsDto;
import ewshop.facade.interfaces.RichSkillFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RichSkillController.class)
@ContextConfiguration(classes = TestApplication.class)
class RichSkillControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RichSkillFacade richSkillFacade;

    @Test
    void getAllSkillsReturnsSkillBundle() throws Exception {
        when(richSkillFacade.getAllSkills()).thenReturn(new RichSkillsDto(
                List.of(new RichSkillsDto.SkillTreeDto(
                        "HeroSkillTree_Archer",
                        "Class",
                        false,
                        List.of("HeroSkillTree_Archer::HeroSkillTier_Archer_1"),
                        List.of("HeroSkillTier_Archer_1"),
                        List.of("HeroSkill_Archer02"),
                        List.of("HeroClass_Archer"),
                        "HeroClass_Archer",
                        null
                )),
                List.of(new RichSkillsDto.SkillTierDto(
                        "HeroSkillTree_Archer::HeroSkillTier_Archer_1",
                        "HeroSkillTier_Archer_1",
                        "HeroSkillTree_Archer",
                        "Class",
                        0,
                        0,
                        List.of("HeroSkill_Archer02"),
                        List.of("HeroSkill_Archer02")
                )),
                List.of(new RichSkillsDto.HeroSkillDto(
                        "HeroSkill_Archer02",
                        "HeroSkill_Archer02",
                        "HeroSkill",
                        "HeroSkill_Archer02",
                        "Terrain Logistics",
                        "UnitAbility_Hero_Archer02",
                        List.of(),
                        "Terrain Logistics",
                        List.of("[DoubleArrow] Gain 5 [Experience] Experience"),
                        "reaction",
                        List.of("hero"),
                        false,
                        false,
                        true,
                        List.of(Map.of("treeKey", "HeroSkillTree_Archer", "tierIndex", 0)),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(Map.of("typeName", "SimulationEventEffect_ApplyUnitAbilityOnHero")),
                        List.of("UnitAbility_Hero_Archer02"),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of("UnitAbility_Hero_EventDefinition_Archer02"),
                        List.of(),
                        List.of(),
                        List.of("Hero_KinOfSheredyn_Archer_2"),
                        List.of("UnitAbility_Hero_Archer02")
                )),
                List.of(new RichSkillsDto.HeroSkillDefaultDto(
                        "Hero_KinOfSheredyn_Archer_2",
                        List.of("HeroSkill_Archer02"),
                        List.of("Faction_KinOfSheredyn"),
                        "Faction_KinOfSheredyn",
                        "HeroClass_Archer"
                ))
        ));

        mockMvc.perform(get("/api/skills").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.skillTrees[0].treeKey").value("HeroSkillTree_Archer"))
                .andExpect(jsonPath("$.skills[0].publicDisplayName").value("Terrain Logistics"))
                .andExpect(jsonPath("$.skills[0].placements[0].treeKey").value("HeroSkillTree_Archer"))
                .andExpect(jsonPath("$.heroSkillDefaults[0].defaultSkillKeys[0]").value("HeroSkill_Archer02"));
    }
}
