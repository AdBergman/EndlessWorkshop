package ewshop.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportTechDto;
import ewshop.facade.interfaces.ImportAdminFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ImportAdminController.class)
@AutoConfigureMockMvc(addFilters = false)
class ImportAdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ImportAdminFacade importAdminFacade;

    @Test
    void importTechs_returnsNoContent_andCallsFacade_whenPayloadHasTechs() throws Exception {
        // given
        TechImportTechDto tech = new TechImportTechDto(
                "Technology_X",
                "Stonework",
                "Lore",
                false,
                2,
                "Defense",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        TechImportBatchDto payload = new TechImportBatchDto(
                "Endless Legend 2",
                "0.75",
                "0.1.0",
                "2026-02-10T00:00:00Z",
                List.of(tech)
        );

        // when / then
        mockMvc.perform(post("/api/admin/import/techs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNoContent());

        // and
        verify(importAdminFacade).importTechs(payload);
    }

    @Test
    void importTechs_returnsNoContent_andDoesNotCallFacade_whenTechListIsEmpty() throws Exception {
        // given
        TechImportBatchDto payload = new TechImportBatchDto(
                "Endless Legend 2",
                "0.75",
                "0.1.0",
                "2026-02-10T00:00:00Z",
                List.of()
        );

        // when / then
        mockMvc.perform(post("/api/admin/import/techs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNoContent());

        // and
        verifyNoInteractions(importAdminFacade);
    }

    @Test
    void importTechs_returnsNoContent_andDoesNotCallFacade_whenBodyIsNullJson() throws Exception {
        // given
        String payload = "null";

        // when / then
        mockMvc.perform(post("/api/admin/import/techs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isNoContent());

        // and
        verifyNoInteractions(importAdminFacade);
    }
}