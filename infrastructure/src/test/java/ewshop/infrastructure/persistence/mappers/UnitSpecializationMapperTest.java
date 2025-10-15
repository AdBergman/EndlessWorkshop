//package ewshop.infrastructure.persistence.mappers;
//
//import ewshop.domain.entity.UnitSpecialization;
//import ewshop.infrastructure.persistence.entities.UnitSpecializationEntity;
//import org.junit.jupiter.api.Test;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//class UnitSpecializationMapperTest {
//
//    private final UnitSpecializationMapper unitSpecializationMapper = new UnitSpecializationMapper();
//
//    @Test
//    void toDomain_shouldMapAllFields() {
//        // Setup: Create an entity with all fields set
//        UnitSpecializationEntity entity = new UnitSpecializationEntity();
//        entity.setName("Test Specialization");
//        entity.setDescription("A test description.");
//
//        // Act: Map to domain
//        UnitSpecialization domain = unitSpecializationMapper.toDomain(entity);
//
//        // Assert: Check all fields
//        assertThat(domain).isNotNull();
//        assertThat(domain.getName()).isEqualTo("Test Specialization");
//        assertThat(domain.getDescription()).isEqualTo("A test description.");
//    }
//
//    @Test
//    void toEntity_shouldMapAllFields() {
//        // Setup: Create a domain object with all fields set
//        UnitSpecialization domain = UnitSpecialization.builder()
//                .name("Test Specialization")
//                .description("A test description.")
//                .build();
//
//        // Act: Map to entity
//        UnitSpecializationEntity entity = unitSpecializationMapper.toEntity(domain);
//
//        // Assert: Check all fields
//        assertThat(entity).isNotNull();
//        assertThat(entity.getName()).isEqualTo("Test Specialization");
//        assertThat(entity.getDescription()).isEqualTo("A test description.");
//    }
//}
