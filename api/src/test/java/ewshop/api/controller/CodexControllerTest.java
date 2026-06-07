package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.facade.dto.response.CodexDto;
import ewshop.facade.interfaces.CodexFacade;
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

@WebMvcTest(CodexController.class)
@ContextConfiguration(classes = TestApplication.class)
class CodexControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CodexFacade codexFacade;

    @Test
    void getAllCodex_returnsJson() throws Exception {
        CodexDto dto = new CodexDto(
                "abilities",
                "Ability_A",
                "Ability A",
                "Combat",
                "Ability",
                List.of("Line 1", "Line 2"),
                List.of("Unit_A")
        );

        when(codexFacade.getAllCodexEntries()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/codex")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].length()").value(7))
                .andExpect(jsonPath("$[0].exportKind").value("abilities"))
                .andExpect(jsonPath("$[0].entryKey").value("Ability_A"))
                .andExpect(jsonPath("$[0].displayName").value("Ability A"))
                .andExpect(jsonPath("$[0].category").value("Combat"))
                .andExpect(jsonPath("$[0].kind").value("Ability"))
                .andExpect(jsonPath("$[0].descriptionLines[0]").value("Line 1"))
                .andExpect(jsonPath("$[0].descriptionLines[1]").value("Line 2"))
                .andExpect(jsonPath("$[0].referenceKeys[0]").value("Unit_A"));
    }
}
