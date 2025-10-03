package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.UnitSpecialization;
import ewshop.infrastructure.persistence.entities.UnitSpecializationEntity;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UnitSpecializationMapperTest {

    @Test
    void testToDomainMapping() {
        // Setup
        UnitSpecializationEntity entity = new UnitSpecializationEntity();
        entity.setName("Test Spec");
        entity.setDescription("A test specialization.");

        // Act
        UnitSpecialization domain = UnitSpecializationMapper.toDomain(entity);

        // Assert
        assertThat(domain).isNotNull();
        assertThat(domain.getName()).isEqualTo("Test Spec");
        assertThat(domain.getDescription()).isEqualTo("A test specialization.");
    }

    @Test
    void testToEntityMapping() {
        // Setup
        UnitSpecialization domain = UnitSpecialization.builder()
                .name("Test Spec")
                .description("A test specialization.")
                .build();

        // Act
        UnitSpecializationEntity entity = UnitSpecializationMapper.toEntity(domain);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Test Spec");
        assertThat(entity.getDescription()).isEqualTo("A test specialization.");
    }
}
