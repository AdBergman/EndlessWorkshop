package ewshop.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.api.TestApplication;
import ewshop.domain.model.enums.MajorFaction;
import ewshop.facade.dto.request.CreateSavedTechBuildRequest;
import ewshop.facade.dto.response.SavedTechBuildDto;
import ewshop.facade.interfaces.SavedTechBuildFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

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

    @MockitoBean
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
                .selectedFaction(MajorFaction.ASPECTS)
                .techIds(List.of("tech1", "tech2"))
                .createdAt(LocalDateTime.of(2026, 6, 6, 12, 30, 45))
                .build();

        when(savedTechBuildFacade.createSavedBuild(any(CreateSavedTechBuildRequest.class))).thenReturn(responseDto);

        // When & Then
        mockMvc.perform(post("/api/builds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5))
                .andExpect(jsonPath("$.uuid").value(expectedUuid.toString()))
                .andExpect(jsonPath("$.name").value("My Awesome Build"))
                .andExpect(jsonPath("$.selectedFaction").value("Aspects"))
                .andExpect(jsonPath("$.techIds[0]").value("tech1"))
                .andExpect(jsonPath("$.techIds[1]").value("tech2"))
                .andExpect(jsonPath("$.createdAt").value("2026-06-06T12:30:45"));
    }

    @Test
    void createBuild_thenGetBuild_roundtripsReturnedUuidFactionAndTechIds() throws Exception {
        AtomicReference<SavedTechBuildDto> stored = new AtomicReference<>();

        when(savedTechBuildFacade.createSavedBuild(any(CreateSavedTechBuildRequest.class)))
                .thenAnswer(invocation -> {
                    CreateSavedTechBuildRequest request = invocation.getArgument(0);
                    SavedTechBuildDto dto = SavedTechBuildDto.builder()
                            .uuid(UUID.randomUUID())
                            .name(request.name())
                            .selectedFaction(request.selectedFaction())
                            .techIds(request.techIds())
                            .createdAt(LocalDateTime.of(2026, 6, 6, 13, 15))
                            .build();
                    stored.set(dto);
                    return dto;
                });

        when(savedTechBuildFacade.getSavedBuildByUuid(any(UUID.class)))
                .thenAnswer(invocation -> {
                    UUID uuid = invocation.getArgument(0);
                    SavedTechBuildDto dto = stored.get();
                    return dto != null && dto.uuid().equals(uuid) ? Optional.of(dto) : Optional.empty();
                });

        CreateSavedTechBuildRequest request = CreateSavedTechBuildRequest.builder()
                .name("Roundtrip Build")
                .selectedFaction("NewMajorFaction")
                .techIds(List.of("Tech_A", "Tech_B", "Tech_C"))
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/builds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5))
                .andExpect(jsonPath("$.selectedFaction").value("New Major Faction"))
                .andExpect(jsonPath("$.techIds[0]").value("Tech_A"))
                .andExpect(jsonPath("$.techIds[1]").value("Tech_B"))
                .andExpect(jsonPath("$.techIds[2]").value("Tech_C"))
                .andExpect(jsonPath("$.createdAt").value("2026-06-06T13:15:00"))
                .andReturn();

        String uuid = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("uuid")
                .asText();

        mockMvc.perform(get("/api/builds/{uuid}", uuid)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uuid").value(uuid))
                .andExpect(jsonPath("$.name").value("Roundtrip Build"))
                .andExpect(jsonPath("$.selectedFaction").value("New Major Faction"))
                .andExpect(jsonPath("$.techIds[0]").value("Tech_A"))
                .andExpect(jsonPath("$.techIds[1]").value("Tech_B"))
                .andExpect(jsonPath("$.techIds[2]").value("Tech_C"))
                .andExpect(jsonPath("$.createdAt").value("2026-06-06T13:15:00"));
    }

    @Test
    void getBuild_returnsExistingBuild() throws Exception {
        // Given
        UUID buildUuid = UUID.randomUUID();
        SavedTechBuildDto existingBuild = SavedTechBuildDto.builder()
                .uuid(buildUuid)
                .name("Existing Build")
                .selectedFaction(MajorFaction.KIN)
                .techIds(List.of("techA", "techB"))
                .createdAt(LocalDateTime.of(2026, 6, 6, 14, 0, 1))
                .build();

        when(savedTechBuildFacade.getSavedBuildByUuid(buildUuid)).thenReturn(Optional.of(existingBuild));

        // When & Then
        mockMvc.perform(get("/api/builds/{uuid}", buildUuid)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uuid").value(buildUuid.toString()))
                .andExpect(jsonPath("$.name").value("Existing Build"))
                .andExpect(jsonPath("$.selectedFaction").value("Kin"))
                .andExpect(jsonPath("$.techIds[0]").value("techA"))
                .andExpect(jsonPath("$.createdAt").value("2026-06-06T14:00:01"));
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
