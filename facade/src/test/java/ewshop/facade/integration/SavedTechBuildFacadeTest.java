package ewshop.facade.integration;

import ewshop.domain.model.SavedTechBuild;
import ewshop.domain.model.enums.MajorFaction;
import ewshop.domain.repository.SavedTechBuildRepository;
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
