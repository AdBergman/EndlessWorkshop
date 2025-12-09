package ewshop.facade.integration;

import ewshop.domain.entity.SavedTechBuild;
import ewshop.domain.entity.enums.Faction;
import ewshop.domain.repository.SavedTechBuildRepository;
import ewshop.facade.config.FacadeConfig;
import ewshop.facade.dto.response.SavedTechBuildDto;
import ewshop.facade.interfaces.SavedTechBuildFacade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = IntegrationTestConfig.class) // Use the shared IntegrationTestConfig
@Import(FacadeConfig.class)
@Transactional
class SavedTechBuildFacadeTest {

    @Autowired
    private SavedTechBuildFacade savedTechBuildFacade;

    @Autowired
    private SavedTechBuildRepository savedTechBuildRepository;

    @BeforeEach
    void cleanDatabase() {
        savedTechBuildRepository.deleteAll();
    }

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
                .faction(Faction.ASPECTS)
                .techIds(List.of("tech1", "tech2"))
                .build();

        savedTechBuildRepository.save(build);

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
