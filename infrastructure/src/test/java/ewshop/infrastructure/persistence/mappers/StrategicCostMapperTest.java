package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.StrategicCost;
import ewshop.domain.entity.enums.StrategicResourceType;
import ewshop.infrastructure.persistence.entities.StrategicCostEntity;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StrategicCostMapperTest {

    private final StrategicCostMapper strategicCostMapper = new StrategicCostMapper();

    @Test
    void toDomain_shouldMapAllFields() {
        // Setup
        StrategicCostEntity entity = new StrategicCostEntity();
        entity.setType(StrategicResourceType.GLASSTEEL);
        entity.setAmount(5);

        // Act
        StrategicCost domain = strategicCostMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.type()).isEqualTo(StrategicResourceType.GLASSTEEL);
        assertThat(domain.amount()).isEqualTo(5);
    }

    @Test
    void toEntity_shouldMapAllFields() {
        // Setup
        StrategicCost domain = new StrategicCost(StrategicResourceType.TITANIUM, 5);

        // Act
        StrategicCostEntity entity = strategicCostMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getType()).isEqualTo(StrategicResourceType.TITANIUM);
        assertThat(entity.getAmount()).isEqualTo(5);
    }

    @Test
    void toDomain_returnsNullWhenEntityIsNull() {
        assertThat(strategicCostMapper.toDomain(null)).isNull();
    }

    @Test
    void toEntity_returnsNullWhenDomainIsNull() {
        assertThat(strategicCostMapper.toEntity(null)).isNull();
    }
}
