package ewshop.api.controller;

import ewshop.api.TestApplication;
import ewshop.facade.dto.response.CodexDto;
import ewshop.facade.dto.response.CodexMetadataFactDto;
import ewshop.facade.dto.response.CodexMetadataSectionDto;
import ewshop.facade.dto.response.CodexMetadataSectionItemDto;
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
                "resources",
                "Resource_Luxury01",
                "Klax",
                "Luxury",
                "Resource",
                List.of("Line 1", "Line 2"),
                List.of("Extractor_Luxury01"),
                List.of(new CodexMetadataFactDto("Type", "Luxury", null)),
                List.of(new CodexMetadataSectionDto(
                        "Extractors",
                        List.of(),
                        List.of(new CodexMetadataSectionItemDto(
                                "Klax Extractor",
                                "Extractor_Luxury01",
                                List.of(new CodexMetadataFactDto("Tier", "1", null)),
                                List.of()
                        ))
                )),
                List.of("Resource_Luxury01", "Extractor_Luxury01")
        );

        when(codexFacade.getAllCodexEntries()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/codex")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].length()").value(10))
                .andExpect(jsonPath("$[0].exportKind").value("resources"))
                .andExpect(jsonPath("$[0].entryKey").value("Resource_Luxury01"))
                .andExpect(jsonPath("$[0].displayName").value("Klax"))
                .andExpect(jsonPath("$[0].category").value("Luxury"))
                .andExpect(jsonPath("$[0].kind").value("Resource"))
                .andExpect(jsonPath("$[0].descriptionLines[0]").value("Line 1"))
                .andExpect(jsonPath("$[0].descriptionLines[1]").value("Line 2"))
                .andExpect(jsonPath("$[0].referenceKeys[0]").value("Extractor_Luxury01"))
                .andExpect(jsonPath("$[0].facts[0].label").value("Type"))
                .andExpect(jsonPath("$[0].facts[0].value").value("Luxury"))
                .andExpect(jsonPath("$[0].sections[0].title").value("Extractors"))
                .andExpect(jsonPath("$[0].sections[0].items[0].label").value("Klax Extractor"))
                .andExpect(jsonPath("$[0].sections[0].items[0].referenceKey").value("Extractor_Luxury01"))
                .andExpect(jsonPath("$[0].publicContextKeys[0]").value("Resource_Luxury01"));
    }
}
