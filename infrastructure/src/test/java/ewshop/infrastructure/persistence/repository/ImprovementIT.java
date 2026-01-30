package ewshop.infrastructure.persistence.repository;

import ewshop.domain.entity.enums.StrategicResourceType;
import ewshop.domain.entity.enums.UniqueType;
import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import ewshop.infrastructure.persistence.entities.StrategicCostEntity;
import ewshop.infrastructure.persistence.repositories.ImprovementJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.groups.Tuple.tuple;

@DataJpaTest
class ImprovementIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ImprovementJpaRepository repository;

    @Test
    void shouldSaveAndFindByName_WithCosts() {
        // Arrange
        StrategicCostEntity cost1 = new StrategicCostEntity(StrategicResourceType.GLASSTEEL, 10);
        StrategicCostEntity cost2 = new StrategicCostEntity(StrategicResourceType.TITANIUM, 5);

        ImprovementEntity newImprovement = new ImprovementEntity();
        newImprovement.setName("Crystal Forge");
        newImprovement.setEra(3);
        newImprovement.setUnique(UniqueType.CITY);
        newImprovement.setEffects(List.of("+20 Industry"));
        newImprovement.setCost(List.of(cost1, cost2));

        entityManager.persistAndFlush(newImprovement);

        // Act
        Optional<ImprovementEntity> foundImprovement = repository.findByName("Crystal Forge");

        // Assert
        assertThat(foundImprovement).isPresent();
        ImprovementEntity result = foundImprovement.get();
        assertThat(result.getName()).isEqualTo("Crystal Forge");
        assertThat(result.getUnique()).isEqualTo(UniqueType.CITY);

        // Assert that the embedded collection was persisted and retrieved correctly
        assertThat(result.getCost()).hasSize(2);
        assertThat(result.getCost())
                .extracting(StrategicCostEntity::getType, StrategicCostEntity::getAmount)
                .containsExactlyInAnyOrder(
                        tuple(StrategicResourceType.GLASSTEEL, 10),
                        tuple(StrategicResourceType.TITANIUM, 5)
                );
    }
}
