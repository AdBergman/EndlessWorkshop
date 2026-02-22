package ewshop.infrastructure.persistence.repository;

import ewshop.infrastructure.persistence.entities.UnitSpecializationEntityLegacy;
import ewshop.infrastructure.persistence.repositories.UnitSpecializationJpaRepositoryLegacy;
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
    private UnitSpecializationJpaRepositoryLegacy unitSpecializationRepository;

    @Test
    void testSaveAndFindByName() {
        // Arrange
        UnitSpecializationEntityLegacy newSpec = new UnitSpecializationEntityLegacy();
        newSpec.setName("Test Specialization");
        newSpec.setDescription("A test description.");
        entityManager.persistAndFlush(newSpec);

        // Act
        Optional<UnitSpecializationEntityLegacy> foundSpec = unitSpecializationRepository.findByName("Test Specialization");

        // Assert
        assertThat(foundSpec).isPresent();
        assertThat(foundSpec.get().getName()).isEqualTo("Test Specialization");
        assertThat(foundSpec.get().getDescription()).isEqualTo("A test description.");
    }
}
