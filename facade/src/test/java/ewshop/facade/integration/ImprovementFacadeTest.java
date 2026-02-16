package ewshop.facade.integration;

import ewshop.facade.dto.response.ImprovementDto;
import ewshop.facade.interfaces.ImprovementFacade;
import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ImprovementFacadeTest extends BaseIT {

    @Autowired
    private ImprovementFacade improvementFacade;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void contextLoads() {
        assertThat(improvementFacade).isNotNull();
    }

    @Test
    void shouldReturnAllImprovements() {
        // Given (seed DB directly, since domain repo no longer has save())
        ImprovementEntity shrine = new ImprovementEntity();
        shrine.setConstructibleKey("DistrictImprovement_TravelersShrine");
        shrine.setDisplayName("Traveler's Shrine");
        shrine.setCategory("Economy");
        shrine.setDescriptionLines(List.of("+15 Approval"));

        ImprovementEntity garrison = new ImprovementEntity();
        garrison.setConstructibleKey("DistrictImprovement_Garrison");
        garrison.setDisplayName("Garrison");
        garrison.setCategory("Defense");
        garrison.setDescriptionLines(List.of("+500 District Fortification"));

        entityManager.persist(shrine);
        entityManager.persist(garrison);
        entityManager.flush();
        entityManager.clear();

        // When
        List<ImprovementDto> result = improvementFacade.getAllImprovements();

        // Then
        assertThat(result).hasSize(2);

        ImprovementDto shrineDto = result.stream()
                .filter(i -> "DistrictImprovement_TravelersShrine".equals(i.improvementKey()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Traveler's Shrine DTO not found"));

        assertThat(shrineDto.displayName()).isEqualTo("Traveler's Shrine");
        assertThat(shrineDto.category()).isEqualTo("Economy");
        assertThat(shrineDto.descriptionLines()).containsExactly("+15 Approval");

        ImprovementDto garrisonDto = result.stream()
                .filter(i -> "DistrictImprovement_Garrison".equals(i.improvementKey()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Garrison DTO not found"));

        assertThat(garrisonDto.displayName()).isEqualTo("Garrison");
        assertThat(garrisonDto.category()).isEqualTo("Defense");
        assertThat(garrisonDto.descriptionLines()).containsExactly("+500 District Fortification");
    }
}