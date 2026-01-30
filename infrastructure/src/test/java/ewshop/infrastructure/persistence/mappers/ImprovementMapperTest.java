package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Improvement;
import ewshop.domain.model.StrategicCost;
import ewshop.domain.model.enums.StrategicResourceType;
import ewshop.domain.model.enums.UniqueType;
import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import ewshop.infrastructure.persistence.entities.StrategicCostEntity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ImprovementMapperTest {

    private final StrategicCostMapper strategicCostMapper = new StrategicCostMapper();
    private final ImprovementMapper improvementMapper = new ImprovementMapper(strategicCostMapper);

    @Test
    void toDomain_shouldMapAllFields() {
        // Setup
        StrategicCostEntity costEntity = new StrategicCostEntity();
        costEntity.setType(StrategicResourceType.GLASSTEEL);
        costEntity.setAmount(10);

        ImprovementEntity entity = new ImprovementEntity();
        entity.setName("Test Improvement");
        entity.setEra(2);
        entity.setUnique(UniqueType.CITY);
        entity.setEffects(List.of("Effect 1"));
        entity.setCost(List.of(costEntity));

        // Act
        Improvement domain = improvementMapper.toDomain(entity);

        // Assert
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
    void toEntity_shouldMapAllFields() {
        // Setup
        StrategicCost cost = new StrategicCost(StrategicResourceType.GLASSTEEL, 10);
        Improvement domain = Improvement.builder()
                .name("Test Improvement")
                .era(2)
                .unique(UniqueType.CITY)
                .effects(List.of("Effect 1"))
                .cost(List.of(cost))
                .build();

        // Act
        ImprovementEntity entity = improvementMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Test Improvement");
        assertThat(entity.getEra()).isEqualTo(2);
        assertThat(entity.getUnique()).isEqualTo(UniqueType.CITY);
        assertThat(entity.getEffects()).containsExactly("Effect 1");
        assertThat(entity.getCost()).hasSize(1);
        assertThat(entity.getCost().get(0).getType()).isEqualTo(StrategicResourceType.GLASSTEEL);
        assertThat(entity.getCost().get(0).getAmount()).isEqualTo(10);
    }

    @Test
    void toDomain_shouldMapNullListsToEmptyLists() {
        // Setup
        ImprovementEntity entity = new ImprovementEntity();
        entity.setName("Test Improvement");
        entity.setCost(null);
        entity.setEffects(null);

        // Act
        Improvement domain = improvementMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getCost()).isNotNull().isEmpty();
        assertThat(domain.getEffects()).isNotNull().isEmpty();
    }

    @Test
    void toEntity_shouldMapNullListsToEmptyLists() {
        // Setup
        Improvement domain = Improvement.builder()
                .name("Test Improvement")
                .cost(null)
                .effects(null)
                .build();

        // Act
        ImprovementEntity entity = improvementMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getCost()).isNotNull().isEmpty();
        assertThat(entity.getEffects()).isNotNull().isEmpty();
    }

    @Test
    void toDomain_returnsNullWhenEntityIsNull() {
        assertThat(improvementMapper.toDomain(null)).isNull();
    }

    @Test
    void toEntity_returnsNullWhenDomainIsNull() {
        assertThat(improvementMapper.toEntity(null)).isNull();
    }
}
