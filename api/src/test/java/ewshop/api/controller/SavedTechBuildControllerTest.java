package ewshop.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.api.TestApplication;
import ewshop.domain.model.enums.Faction;
import ewshop.facade.dto.request.CreateSavedTechBuildRequest;
import ewshop.facade.dto.response.SavedTechBuildDto;
import ewshop.facade.interfaces.SavedTechBuildFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SavedTechBuildController.class)
@ContextConfiguration(classes = TestApplication.class)
class SavedTechBuildControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SavedTechBuildFacade savedTechBuildFacade;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createBuild_returnsCreatedBuild() throws Exception {
        // Given
        CreateSavedTechBuildRequest request = CreateSavedTechBuildRequest.builder()
                .name("My Awesome Build")
                .selectedFaction("ASPECTS")
                .techIds(List.of("tech1", "tech2"))
                .build();

        UUID expectedUuid = UUID.randomUUID();
        SavedTechBuildDto responseDto = SavedTechBuildDto.builder()
                .uuid(expectedUuid)
                .name("My Awesome Build")
                .selectedFaction(Faction.ASPECTS)
                .techIds(List.of("tech1", "tech2"))
                .createdAt(LocalDateTime.now())
                .build();

        when(savedTechBuildFacade.createSavedBuild(any(CreateSavedTechBuildRequest.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(post("/api/builds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uuid").value(expectedUuid.toString()))
                .andExpect(jsonPath("$.name").value("My Awesome Build"))
                .andExpect(jsonPath("$.selectedFaction").value("Aspects"))
                .andExpect(jsonPath("$.techIds[0]").value("tech1"))
                .andExpect(jsonPath("$.techIds[1]").value("tech2"));
    }

    @Test
    void getBuild_returnsExistingBuild() throws Exception {
        // Given
        UUID buildUuid = UUID.randomUUID();
        SavedTechBuildDto existingBuild = SavedTechBuildDto.builder()
                .uuid(buildUuid)
                .name("Existing Build")
                .selectedFaction(Faction.KIN)
                .techIds(List.of("techA", "techB"))
                .createdAt(LocalDateTime.now())
                .build();

        when(savedTechBuildFacade.getSavedBuildByUuid(buildUuid)).thenReturn(Optional.of(existingBuild));

        // When & Then
        mockMvc.perform(get("/api/builds/{uuid}", buildUuid)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uuid").value(buildUuid.toString()))
                .andExpect(jsonPath("$.name").value("Existing Build"))
                .andExpect(jsonPath("$.selectedFaction").value("Kin"))
                .andExpect(jsonPath("$.techIds[0]").value("techA"));
    }

    @Test
    void getBuild_returnsNotFoundForUnknownUuid() throws Exception {
        // Given
        UUID unknownUuid = UUID.randomUUID();
        when(savedTechBuildFacade.getSavedBuildByUuid(unknownUuid)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/builds/{uuid}", unknownUuid)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
