package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.facade.dto.response.RichHeroDto;
import ewshop.facade.interfaces.RichHeroFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RichHeroController.class)
@ContextConfiguration(classes = TestApplication.class)
class RichHeroControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RichHeroFacade richHeroFacade;

    @Test
    void getAllHeroesReturnsRichHeroKeys() throws Exception {
        when(richHeroFacade.getAllHeroes()).thenReturn(List.of(new RichHeroDto(
                "Hero_KinOfSheredyn_Archer_2",
                "Lieutenant Brezvez",
                "Kin",
                "Faction_KinOfSheredyn",
                true,
                "Hero_KinOfSheredyn_Archer_2",
                "HeroClass_Archer",
                "majorFaction",
                "Faction_KinOfSheredyn",
                null,
                "UnitClass_Ranged_Hero",
                null,
                List.of(),
                List.of("UnitAbility_Prototype_HeroUnit"),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of("UnitAbility_Prototype_HeroUnit"),
                List.of("HeroSkill_Archer02"),
                List.of("HeroSkillTree_Archer"),
                List.of("+40 [Damage] Damage"),
                List.of("HeroSkill_Archer02")
        )));

        mockMvc.perform(get("/api/heroes").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].unitKey").value("Hero_KinOfSheredyn_Archer_2"))
                .andExpect(jsonPath("$[0].factionKey").value("Faction_KinOfSheredyn"))
                .andExpect(jsonPath("$[0].defaultSkillKeys[0]").value("HeroSkill_Archer02"))
                .andExpect(jsonPath("$[0].applicableSkillTreeKeys[0]").value("HeroSkillTree_Archer"));
    }
}
