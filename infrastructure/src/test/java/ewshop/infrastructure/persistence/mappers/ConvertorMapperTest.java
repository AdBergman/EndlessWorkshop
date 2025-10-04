package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.Convertor;
import ewshop.infrastructure.persistence.entities.ConvertorEntity;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ConvertorMapperTest {

    private final ConvertorMapper convertorMapper = new ConvertorMapper();

    @Test
    void testToDomainMapping_shouldMapAllFields() {
        // Setup: Create an entity with all fields set
        ConvertorEntity entity = new ConvertorEntity();
        entity.setName("Test Convertor");
        entity.setDescription("Test Description");

        // Act: Map to domain
        Convertor domain = convertorMapper.toDomain(entity);

        // Assert: Check all fields
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Test Convertor");
        assertThat(domain.getDescription()).isEqualTo("Test Description");
    }

    @Test
    void testToEntityMapping_shouldMapAllFields() {
        // Setup: Create a domain object with all fields set
        Convertor domain = Convertor.builder()
                .name("Test Convertor")
                .description("Test Description")
                .build();

        // Act: Map to entity
        ConvertorEntity entity = convertorMapper.toEntity(domain);

        // Assert: Check all fields
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Test Convertor");
        assertThat(entity.getDescription()).isEqualTo("Test Description");
    }
}
