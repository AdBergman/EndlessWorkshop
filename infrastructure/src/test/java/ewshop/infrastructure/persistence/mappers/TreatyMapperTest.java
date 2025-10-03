package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.Treaty;
import ewshop.infrastructure.persistence.entities.TreatyEntity;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TreatyMapperTest {

    @Test
    void testToDomainMapping() {
        // Setup
        TreatyEntity entity = new TreatyEntity();
        entity.setName("Test Treaty");
        entity.setDescription("A test treaty.");

        // Act
        Treaty domain = TreatyMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Test Treaty");
        assertThat(domain.getDescription()).isEqualTo("A test treaty.");
    }

    @Test
    void testToEntityMapping() {
        // Setup
        Treaty domain = Treaty.builder()
                .name("Test Treaty")
                .description("A test treaty.")
                .build();

        // Act
        TreatyEntity entity = TreatyMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Test Treaty");
        assertThat(entity.getDescription()).isEqualTo("A test treaty.");
    }
}
