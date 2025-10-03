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

    @Test
    void testToDomainMapping() {
        // Setup
        StrategicCostEntity costEntity = new StrategicCostEntity(StrategicResourceType.GLASSTEEL, 10);
        ImprovementEntity entity = new ImprovementEntity();
        entity.setName("Test Improvement");
        entity.setEra(2);
        entity.setEffects(List.of("Effect 1"));
        entity.setUnique(UniqueType.CITY);
        entity.setCost(List.of(costEntity));

        // Act
        Improvement domain = ImprovementMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Test Improvement");
        assertThat(domain.getEra()).isEqualTo(2);
        assertThat(domain.getEffects()).containsExactly("Effect 1");
        assertThat(domain.getUnique()).isEqualTo(UniqueType.CITY);
        assertThat(domain.getCost()).hasSize(1);
        assertThat(domain.getCost().get(0).type()).isEqualTo(StrategicResourceType.GLASSTEEL);
        assertThat(domain.getCost().get(0).amount()).isEqualTo(10);
    }

    @Test
    void testToEntityMapping() {
        // Setup
        StrategicCost cost = new StrategicCost(StrategicResourceType.GLASSTEEL, 10);
        Improvement domain = Improvement.builder()
                .name("Test Improvement")
                .era(2)
                .effects(List.of("Effect 1"))
                .unique(UniqueType.CITY)
                .cost(List.of(cost))
                .build();

        // Act
        ImprovementEntity entity = ImprovementMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Test Improvement");
        assertThat(entity.getEra()).isEqualTo(2);
        assertThat(entity.getEffects()).containsExactly("Effect 1");
        assertThat(entity.getUnique()).isEqualTo(UniqueType.CITY);
        assertThat(entity.getCost()).hasSize(1);
        assertThat(entity.getCost().get(0).getType()).isEqualTo(StrategicResourceType.GLASSTEEL);
        assertThat(entity.getCost().get(0).getAmount()).isEqualTo(10);
    }
}
