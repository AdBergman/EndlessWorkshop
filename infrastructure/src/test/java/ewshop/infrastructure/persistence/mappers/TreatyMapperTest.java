package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.Treaty;
import ewshop.infrastructure.persistence.entities.TreatyEntity;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TreatyMapperTest {

    private final TreatyMapper treatyMapper = new TreatyMapper();

    @Test
    void testToDomainMapping_shouldMapAllFields() {
        // Setup: Create an entity with all fields set
        TreatyEntity entity = new TreatyEntity();
        entity.setName("Test Treaty");
        entity.setDescription("Test Description");

        // Act: Map to domain
        Treaty domain = treatyMapper.toDomain(entity);

        // Assert: Check all fields
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Test Treaty");
        assertThat(domain.getDescription()).isEqualTo("Test Description");
    }

    @Test
    void testToEntityMapping_shouldMapAllFields() {
        // Setup: Create a domain object with all fields set
        Treaty domain = Treaty.builder()
                .name("Test Treaty")
                .description("Test Description")
                .build();

        // Act: Map to entity
        TreatyEntity entity = treatyMapper.toEntity(domain);

        // Assert: Check all fields
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Test Treaty");
        assertThat(entity.getDescription()).isEqualTo("Test Description");
    }
}
