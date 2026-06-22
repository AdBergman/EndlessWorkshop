package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.facade.dto.response.FactionDto;
import ewshop.facade.interfaces.FactionFacade;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FactionController.class)
@ContextConfiguration(classes = TestApplication.class)
class FactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FactionFacade factionFacade;

    @Test
    void getAllFactions_returnsRichFactionKeys() throws Exception {
        FactionDto aspect = new FactionDto(
                "Faction_Aspect",
                "Aspects",
                "Harmony through coral.",
                "major",
                "FactionAffinity_Aspect",
                null,
                List.of("FactionTrait_Aspects_Cohabitation"),
                List.of("Population_Aspect"),
                List.of("Unit_Aspect_Scout"),
                List.of("Unit_Aspect_Scout"),
                List.of("Hero_Aspect_Archer_0"),
                List.of("Aspect_Technology_00"),
                "FactionQuest_Aspect_Chapter01_Step01",
                List.of(),
                List.of()
        );
        FactionDto ametrine = new FactionDto(
                "MinorFaction_Ametrine",
                "Ametrine",
                "The ossified remains of the Ametrine still exist on the seabed.",
                "minor",
                "FactionAffinity_Ametrine",
                "Pacifist",
                List.of(),
                List.of("Population_Minor_Ametrine"),
                List.of("Unit_MinorFaction_Ametrine"),
                List.of("Unit_MinorFaction_Ametrine"),
                List.of("Elder_MinorFaction_Ametrine", "Hero_MinorFaction_Ametrine"),
                List.of(),
                null,
                List.of("MinorFaction_SpecificQuest_Ametrine01"),
                List.of("ProtectorateTrait_Ametrine_Trait01", "ProtectorateTrait_Ametrine_Trait02")
        );

        when(factionFacade.getAllFactions()).thenReturn(List.of(aspect, ametrine));

        mockMvc.perform(get("/api/factions")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].factionKey").value("Faction_Aspect"))
                .andExpect(jsonPath("$[0].publicDisplayName").value("Aspects"))
                .andExpect(jsonPath("$[0].factionKind").value("major"))
                .andExpect(jsonPath("$[0].traitKeys[0]").value("FactionTrait_Aspects_Cohabitation"))
                .andExpect(jsonPath("$[0].populationKeys[0]").value("Population_Aspect"))
                .andExpect(jsonPath("$[0].unitKeys[0]").value("Unit_Aspect_Scout"))
                .andExpect(jsonPath("$[0].baseUnitKeys[0]").value("Unit_Aspect_Scout"))
                .andExpect(jsonPath("$[0].heroKeys[0]").value("Hero_Aspect_Archer_0"))
                .andExpect(jsonPath("$[0].gatedTechnologyKeys[0]").value("Aspect_Technology_00"))
                .andExpect(jsonPath("$[0].startingFactionQuestKey").value("FactionQuest_Aspect_Chapter01_Step01"))
                .andExpect(jsonPath("$[1].factionKey").value("MinorFaction_Ametrine"))
                .andExpect(jsonPath("$[1].affinityType").value("Pacifist"))
                .andExpect(jsonPath("$[1].specificQuestKeys[0]").value("MinorFaction_SpecificQuest_Ametrine01"))
                .andExpect(jsonPath("$[1].protectorateTraitKeys[1]").value("ProtectorateTrait_Ametrine_Trait02"));
    }
}
