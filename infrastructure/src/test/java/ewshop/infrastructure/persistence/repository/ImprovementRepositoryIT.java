package ewshop.infrastructure.persistence.repository;

import ewshop.domain.entity.enums.StrategicResourceType;
import ewshop.domain.entity.enums.UniqueType;
import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import ewshop.infrastructure.persistence.entities.StrategicCostEntity;
import ewshop.infrastructure.persistence.repositories.SpringDataImprovementRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ImprovementRepositoryIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SpringDataImprovementRepository improvementRepository;

    @Test
    void testSaveAndFindByName() {
        // Arrange
        StrategicCostEntity cost = new StrategicCostEntity(StrategicResourceType.GLASSTEEL, 10);
        ImprovementEntity newImprovement = new ImprovementEntity();
        newImprovement.setName("Test Improvement");
        newImprovement.setEra(2);
        newImprovement.setUnique(UniqueType.CITY);
        newImprovement.setCost(List.of(cost));
        entityManager.persistAndFlush(newImprovement);

        // Act
        Optional<ImprovementEntity> foundImprovement = improvementRepository.findByName("Test Improvement");

        // Assert
        assertThat(foundImprovement).isPresent();
        ImprovementEntity result = foundImprovement.get();
        assertThat(result.getName()).isEqualTo("Test Improvement");
        assertThat(result.getEra()).isEqualTo(2);
        assertThat(result.getCost()).hasSize(1);
        assertThat(result.getCost().get(0).getType()).isEqualTo(StrategicResourceType.GLASSTEEL);
        assertThat(result.getCost().get(0).getAmount()).isEqualTo(10);
    }
}
