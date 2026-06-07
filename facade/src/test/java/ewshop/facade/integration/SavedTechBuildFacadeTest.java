package ewshop.facade.integration;

import ewshop.domain.model.SavedTechBuild;
import ewshop.domain.model.enums.MajorFaction;
import ewshop.domain.repository.SavedTechBuildRepository;
import ewshop.facade.dto.request.CreateSavedTechBuildRequest;
import ewshop.facade.dto.response.SavedTechBuildDto;
import ewshop.facade.interfaces.SavedTechBuildFacade;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SavedTechBuildFacadeTest extends  BaseIT {

    @Autowired
    private SavedTechBuildFacade savedTechBuildFacade;

    @Autowired
    private SavedTechBuildRepository savedTechBuildRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void contextLoads() {
        assertThat(savedTechBuildFacade).isNotNull();
        assertThat(savedTechBuildRepository).isNotNull();
    }

    @Test
    void createSavedBuild_thenFetchByReturnedUuid_roundtripsFactionAndTechIds() {
        CreateSavedTechBuildRequest request = CreateSavedTechBuildRequest.builder()
                .name("Release Candidate Build")
                .selectedFaction("NewMajorFaction")
                .techIds(List.of("Tech_FirstEra_One", "Tech_FirstEra_Two", "Tech_FirstEra_Three"))
                .build();

        SavedTechBuildDto created = savedTechBuildFacade.createSavedBuild(request);
        entityManager.flush();
        entityManager.clear();

        Optional<SavedTechBuildDto> fetched = savedTechBuildFacade.getSavedBuildByUuid(created.uuid());

        assertThat(fetched).isPresent();
        assertThat(fetched.get().uuid()).isEqualTo(created.uuid());
        assertThat(fetched.get().name()).isEqualTo("Release Candidate Build");
        assertThat(fetched.get().selectedFaction()).isEqualTo("New Major Faction");
        assertThat(fetched.get().techIds())
                .containsExactly("Tech_FirstEra_One", "Tech_FirstEra_Two", "Tech_FirstEra_Three");
    }

    @Test
    void createSavedBuild_normalizesTechIdsAndPreservesOrder() {
        CreateSavedTechBuildRequest request = CreateSavedTechBuildRequest.builder()
                .name("  Normalized Build  ")
                .selectedFaction(" Kin ")
                .techIds(List.of(" Tech_A ", "", "Tech_B", "   ", "Tech_A"))
                .build();

        SavedTechBuildDto created = savedTechBuildFacade.createSavedBuild(request);
        entityManager.flush();
        entityManager.clear();

        Optional<SavedTechBuildDto> fetched = savedTechBuildFacade.getSavedBuildByUuid(created.uuid());

        assertThat(fetched).isPresent();
        assertThat(fetched.get().name()).isEqualTo("Normalized Build");
        assertThat(fetched.get().selectedFaction()).isEqualTo("Kin");
        assertThat(fetched.get().techIds()).containsExactly("Tech_A", "Tech_B", "Tech_A");
    }

    @Test
    void createSavedBuild_rejectsInvalidPayloads() {
        assertThatThrownBy(() -> savedTechBuildFacade.createSavedBuild(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Saved tech build request is required");

        assertThatThrownBy(() -> savedTechBuildFacade.createSavedBuild(CreateSavedTechBuildRequest.builder()
                .name("Missing Faction")
                .selectedFaction(" ")
                .techIds(List.of("Tech_A"))
                .build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("selectedFaction is required");

        assertThatThrownBy(() -> savedTechBuildFacade.createSavedBuild(CreateSavedTechBuildRequest.builder()
                .name("Null Tech")
                .selectedFaction("Kin")
                .techIds(java.util.Arrays.asList("Tech_A", null))
                .build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("techIds must not contain null entries");

        assertThatThrownBy(() -> savedTechBuildFacade.createSavedBuild(CreateSavedTechBuildRequest.builder()
                .name("Too Large")
                .selectedFaction("Kin")
                .techIds(java.util.stream.IntStream.range(0, 513)
                        .mapToObj(index -> "Tech_" + index)
                        .toList())
                .build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("techIds must contain at most 512 entries");
    }

    @Test
    void createAndFetchSavedBuild_integration() {
        // Given
        UUID uuid = UUID.randomUUID();

        SavedTechBuild build = SavedTechBuild.builder()
                .uuid(uuid)
                .name("Test Build")
                .faction(MajorFaction.ASPECTS)
                .techIds(List.of("tech1", "tech2"))
                .build();

        savedTechBuildRepository.save(build);
        entityManager.flush();

        // When
        Optional<SavedTechBuildDto> result = savedTechBuildFacade.getSavedBuildByUuid(uuid);

        // Then
        assertThat(result).isPresent();
        SavedTechBuildDto dto = result.get();
        assertThat(dto.uuid()).isEqualTo(uuid);
        assertThat(dto.name()).isEqualTo("Test Build");
        assertThat(dto.selectedFaction()).isEqualTo("Aspects");
        assertThat(dto.techIds()).containsExactly("tech1", "tech2");
    }

    @Test
    void getSavedBuildByUuid_returnsEmptyForUnknownUuid() {
        // Given
        UUID unknown = UUID.randomUUID();

        // When
        Optional<SavedTechBuildDto> result = savedTechBuildFacade.getSavedBuildByUuid(unknown);

        // Then
        assertThat(result).isEmpty();
    }
}
