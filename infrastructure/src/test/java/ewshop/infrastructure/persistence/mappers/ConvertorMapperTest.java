package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.Convertor;
import ewshop.infrastructure.persistence.entities.ConvertorEntity;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ConvertorMapperTest {

    @Test
    void testToDomainMapping() {
        // Setup
        ConvertorEntity entity = new ConvertorEntity();
        entity.setName("Test Convertor");
        entity.setDescription("Test Description");

        // Act
        Convertor domain = ConvertorMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Test Convertor");
        assertThat(domain.getDescription()).isEqualTo("Test Description");
    }

    @Test
    void testToEntityMapping() {
        // Setup
        Convertor domain = Convertor.builder()
                .name("Test Convertor")
                .description("Test Description")
                .build();

        // Act
        ConvertorEntity entity = ConvertorMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Test Convertor");
        assertThat(entity.getDescription()).isEqualTo("Test Description");
    }
}
