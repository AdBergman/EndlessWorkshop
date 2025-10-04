package ewshop.infrastructure.persistence.repository;

import ewshop.infrastructure.persistence.entities.UnitSpecializationEntity;
import ewshop.infrastructure.persistence.repositories.SpringDataUnitSpecializationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UnitSpecializationRepositoryIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SpringDataUnitSpecializationRepository unitSpecializationRepository;

    @Test
    void testSaveAndFindByName() {
        // Arrange
        UnitSpecializationEntity newSpec = new UnitSpecializationEntity();
        newSpec.setName("Test Specialization");
        newSpec.setDescription("A test description.");
        entityManager.persistAndFlush(newSpec);

        // Act
        Optional<UnitSpecializationEntity> foundSpec = unitSpecializationRepository.findByName("Test Specialization");

        // Assert
        assertThat(foundSpec).isPresent();
        assertThat(foundSpec.get().getName()).isEqualTo("Test Specialization");
        assertThat(foundSpec.get().getDescription()).isEqualTo("A test description.");
    }
}
