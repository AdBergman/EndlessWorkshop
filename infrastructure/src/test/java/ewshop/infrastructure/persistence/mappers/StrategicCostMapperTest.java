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
        // Setup: Create an entity with all fields set
        StrategicCostEntity entity = new StrategicCostEntity();
        entity.setType(StrategicResourceType.GLASSTEEL);
        entity.setAmount(5);

        // Act: Map to domain
        StrategicCost domain = strategicCostMapper.toDomain(entity);

        // Assert: Check all fields
        assertThat(domain).isNotNull();
        assertThat(domain.type()).isEqualTo(StrategicResourceType.GLASSTEEL);
        assertThat(domain.amount()).isEqualTo(5);
    }

    @Test
    void toEntity_shouldMapAllFields() {
        // Setup: Create a domain object with all fields set
        StrategicCost domain = new StrategicCost(StrategicResourceType.TITANIUM, 5);

        // Act: Map to entity
        StrategicCostEntity entity = strategicCostMapper.toEntity(domain);

        // Assert: Check all fields
        assertThat(entity).isNotNull();
        assertThat(entity.getType()).isEqualTo(StrategicResourceType.TITANIUM);
        assertThat(entity.getAmount()).isEqualTo(5);
    }
}
