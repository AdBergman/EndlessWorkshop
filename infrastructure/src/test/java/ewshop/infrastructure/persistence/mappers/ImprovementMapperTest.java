package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.Improvement;
import ewshop.domain.entity.StrategicCost;
import ewshop.domain.entity.enums.StrategicResourceType;
import ewshop.domain.entity.enums.UniqueType;
import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import ewshop.infrastructure.persistence.entities.StrategicCostEntity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ImprovementMapperTest {

    // Instantiate the mappers to use their instance methods
    private final StrategicCostMapper strategicCostMapper = new StrategicCostMapper();
    private final ImprovementMapper improvementMapper = new ImprovementMapper(strategicCostMapper);

    @Test
    void testToDomainMapping_shouldMapAllFields() {
        // Setup: Create an entity with all fields set
        StrategicCostEntity costEntity = new StrategicCostEntity();
        costEntity.setType(StrategicResourceType.GLASSTEEL);
        costEntity.setAmount(10);

        ImprovementEntity entity = new ImprovementEntity();
        entity.setName("Test Improvement");
        entity.setEra(2);
        entity.setUnique(UniqueType.CITY);
        entity.setEffects(List.of("Effect 1"));
        entity.setCost(List.of(costEntity));

        // Act: Map to domain
        Improvement domain = improvementMapper.toDomain(entity);

        // Assert: Check all fields
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Test Improvement");
        assertThat(domain.getEra()).isEqualTo(2);
        assertThat(domain.getUnique()).isEqualTo(UniqueType.CITY);
        assertThat(domain.getEffects()).containsExactly("Effect 1");
        assertThat(domain.getCost()).hasSize(1);
        assertThat(domain.getCost().get(0).type()).isEqualTo(StrategicResourceType.GLASSTEEL);
        assertThat(domain.getCost().get(0).amount()).isEqualTo(10);
    }

    @Test
    void testToEntityMapping_shouldMapAllFields() {
        // Setup: Create a domain object with all fields set
        StrategicCost cost = new StrategicCost(StrategicResourceType.GLASSTEEL, 10);
        Improvement domain = Improvement.builder()
                .name("Test Improvement")
                .era(2)
                .unique(UniqueType.CITY)
                .effects(List.of("Effect 1"))
                .cost(List.of(cost))
                .build();

        // Act: Map to entity
        ImprovementEntity entity = improvementMapper.toEntity(domain);

        // Assert: Check all fields
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Test Improvement");
        assertThat(entity.getEra()).isEqualTo(2);
        assertThat(entity.getUnique()).isEqualTo(UniqueType.CITY);
        assertThat(entity.getEffects()).containsExactly("Effect 1");
        assertThat(entity.getCost()).hasSize(1);
        assertThat(entity.getCost().get(0).getType()).isEqualTo(StrategicResourceType.GLASSTEEL);
        assertThat(entity.getCost().get(0).getAmount()).isEqualTo(10);
    }
}
