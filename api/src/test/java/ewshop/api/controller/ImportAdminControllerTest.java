package ewshop.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportDistrictDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportTechDto;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ImportAdminController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(ApiExceptionHandler.class)
class ImportAdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TechImportAdminFacade techImportAdminFacade;

    @MockBean
    private DistrictImportAdminFacade districtImportAdminFacade;

    @MockBean
    private ImprovementImportAdminFacade improvementImportAdminFacade;

    @Test
    void importTechs_returnsOk_andCallsFacade_whenPayloadHasTechs() throws Exception {

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
                "tech",
                List.of(tech)
        );

        mockMvc.perform(post("/api/admin/import/techs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        verify(techImportAdminFacade).importTechs(payload);
    }

    @Test
    void importTechs_returnsBadRequest_andDoesNotCallFacade_whenTechListIsEmpty() throws Exception {

        TechImportBatchDto payload = new TechImportBatchDto(
                "Endless Legend 2",
                "0.75",
                "0.1.0",
                "2026-02-10T00:00:00Z",
                "tech",
                List.<TechImportTechDto>of()
        );

        mockMvc.perform(post("/api/admin/import/techs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(techImportAdminFacade);
    }

    @Test
    void importTechs_returnsBadRequest_andDoesNotCallFacade_whenTechsFieldIsMissing() throws Exception {

        String payload = """
        {
          "game": "Endless Legend 2",
          "gameVersion": "0.75",
          "exporterVersion": "0.1.0",
          "exportedAtUtc": "2026-02-10T00:00:00Z",
          "exportKind": "tech"
        }
        """;

        mockMvc.perform(post("/api/admin/import/techs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(techImportAdminFacade);
    }

    @Test
    void importDistricts_returnsOk_andCallsFacade_whenPayloadHasDistricts() throws Exception {

        DistrictImportDistrictDto dto = new DistrictImportDistrictDto(
                "Aspect_District_Tier1_Science",
                "Laboratory",
                "Science",
                List.of("+2 Science per District Level")
        );

        DistrictImportBatchDto payload = new DistrictImportBatchDto(
                "Endless Legend 2",
                "0.75",
                "0.1.0",
                "2026-02-15T00:00:00Z",
                "district",
                List.of(dto)
        );

        mockMvc.perform(post("/api/admin/import/districts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        verify(districtImportAdminFacade).importDistricts(payload);
    }

    @Test
    void importDistricts_returnsBadRequest_andDoesNotCallFacade_whenDistrictListIsEmpty() throws Exception {

        DistrictImportBatchDto payload = new DistrictImportBatchDto(
                "Endless Legend 2",
                "0.75",
                "0.1.0",
                "2026-02-15T00:00:00Z",
                "district",
                List.<DistrictImportDistrictDto>of()
        );

        mockMvc.perform(post("/api/admin/import/districts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(districtImportAdminFacade);
    }
}