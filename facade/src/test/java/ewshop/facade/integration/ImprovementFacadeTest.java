package ewshop.facade.integration;

import ewshop.domain.entity.Improvement;
import ewshop.domain.entity.enums.UniqueType;
import ewshop.domain.repository.ImprovementRepository;
import ewshop.facade.dto.response.ImprovementDto;
import ewshop.facade.interfaces.ImprovementFacade;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ImprovementFacadeTest extends BaseIT {

    @Autowired
    private ImprovementFacade improvementFacade;

    @Autowired
    private ImprovementRepository improvementRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void contextLoads() {
        assertThat(improvementFacade).isNotNull();
        assertThat(improvementRepository).isNotNull();
    }

    @Test
    void shouldReturnAllImprovements() {
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
        entityManager.flush();

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
        assertThat(shrineDto.unique()).isEqualTo("City");
        assertThat(shrineDto.era()).isEqualTo(1);

        // Verify Garrison DTO
        ImprovementDto garrisonDto = result.stream()
                .filter(i -> "Garrison".equals(i.name()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Garrison DTO not found"));
        assertThat(garrisonDto.effects()).containsExactly("+500 District Fortification");
        assertThat(garrisonDto.unique()).isEqualTo("City");
        assertThat(garrisonDto.era()).isEqualTo(2);
    }

}
