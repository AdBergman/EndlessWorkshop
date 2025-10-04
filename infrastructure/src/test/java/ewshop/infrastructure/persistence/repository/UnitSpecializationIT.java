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
class UnitSpecializationIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SpringDataUnitSpecializationRepository repository;

    @Test
    void shouldSaveAndFindByName() {
        // Arrange
        UnitSpecializationEntity newEntity = new UnitSpecializationEntity();
        newEntity.setName("Vanguard");
        newEntity.setDescription("A powerful frontline unit.");
        entityManager.persistAndFlush(newEntity);

        // Act
        Optional<UnitSpecializationEntity> foundEntity = repository.findByName("Vanguard");

        // Assert
        assertThat(foundEntity).isPresent();
        assertThat(foundEntity.get().getName()).isEqualTo("Vanguard");
        assertThat(foundEntity.get().getDescription()).isEqualTo("A powerful frontline unit.");
    }
}
