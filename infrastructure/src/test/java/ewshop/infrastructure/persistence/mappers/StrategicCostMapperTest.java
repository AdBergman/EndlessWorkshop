package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.StrategicCost;
import ewshop.domain.entity.enums.StrategicResourceType;
import ewshop.infrastructure.persistence.entities.StrategicCostEntity;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StrategicCostMapperTest {

    @Test
    void testToDomainMapping() {
        // Setup
        StrategicCostEntity entity = new StrategicCostEntity(StrategicResourceType.IRON, 5);

        // Act
        StrategicCost domain = StrategicCostMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.type()).isEqualTo(StrategicResourceType.IRON);
        assertThat(domain.amount()).isEqualTo(5);
    }

    @Test
    void testToEntityMapping() {
        // Setup
        StrategicCost domain = new StrategicCost(StrategicResourceType.IRON, 5);

        // Act
        StrategicCostEntity entity = StrategicCostMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getType()).isEqualTo(StrategicResourceType.IRON);
        assertThat(entity.getAmount()).isEqualTo(5);
    }
}
