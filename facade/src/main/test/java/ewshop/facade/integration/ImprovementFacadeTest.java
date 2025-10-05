package ewshop.facade.integration;

import ewshop.domain.entity.Improvement;
import ewshop.domain.entity.enums.UniqueType;
import ewshop.domain.repository.ImprovementRepository;
import ewshop.facade.config.FacadeConfig;
import ewshop.facade.dto.ImprovementDto;
import ewshop.facade.interfaces.ImprovementFacade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = ImprovementFacadeTest.TestConfig.class)
@Import(FacadeConfig.class)
@Transactional
class ImprovementFacadeTest {

    @SpringBootConfiguration
    @EnableAutoConfiguration
    @EntityScan("ewshop.infrastructure.persistence.entities")
    @EnableJpaRepositories("ewshop.infrastructure.persistence.repositories")
    @ComponentScan(basePackages = {"ewshop.domain", "ewshop.infrastructure"})
    static class TestConfig {}

    @Autowired
    private ImprovementFacade improvementFacade;

    @Autowired
    private ImprovementRepository improvementRepository;

    @BeforeEach
    void cleanDatabase() {
        improvementRepository.deleteAll();
    }

    @Test
    void contextLoads() {
        assertThat(improvementFacade).isNotNull();
        assertThat(improvementRepository).isNotNull();
    }

    @Test
    void getAllImprovements_integration() {
        // Given
        Improvement shrine = Improvement.builder()
                .name("Traveler's Shrine")
                .effects(List.of("+15 Approval"))
                .unique(UniqueType.CITY)
                .era(1)
                .build();

        Improvement garrison = Improvement.builder()
                .name("Garrison")
                .effects(List.of("+500 District Fortification"))
                .unique(UniqueType.CITY)
                .era(2)
                .build();

        improvementRepository.save(shrine);
        improvementRepository.save(garrison);

        // When
        List<ImprovementDto> result = improvementFacade.getAllImprovements();

        // Then
        assertThat(result).hasSize(2);

        // Verify Traveler's Shrine DTO
        ImprovementDto shrineDto = result.stream()
                .filter(i -> "Traveler's Shrine".equals(i.name()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Traveler's Shrine DTO not found"));
        assertThat(shrineDto.effects()).containsExactly("+15 Approval");
        assertThat(shrineDto.unique()).isEqualTo("CITY");
        assertThat(shrineDto.era()).isEqualTo(1);

        // Verify Garrison DTO
        ImprovementDto garrisonDto = result.stream()
                .filter(i -> "Garrison".equals(i.name()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Garrison DTO not found"));
        assertThat(garrisonDto.effects()).containsExactly("+500 District Fortification");
        assertThat(garrisonDto.unique()).isEqualTo("CITY");
        assertThat(garrisonDto.era()).isEqualTo(2);
    }
}
