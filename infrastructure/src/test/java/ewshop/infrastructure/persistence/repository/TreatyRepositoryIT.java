package ewshop.infrastructure.persistence.repository;

import ewshop.infrastructure.persistence.entities.TreatyEntity;
import ewshop.infrastructure.persistence.repositories.SpringDataTreatyRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TreatyRepositoryIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SpringDataTreatyRepository treatyRepository;

    @Test
    void testSaveAndFindByName() {
        // Arrange
        TreatyEntity newTreaty = new TreatyEntity();
        newTreaty.setName("Test Treaty");
        newTreaty.setDescription("A treaty for testing.");

        // Act
        entityManager.persistAndFlush(newTreaty);

        Optional<TreatyEntity> foundTreaty = treatyRepository.findByName("Test Treaty");

        // Assert
        assertThat(foundTreaty).isPresent();
        assertThat(foundTreaty.get().getName()).isEqualTo("Test Treaty");
        assertThat(foundTreaty.get().getDescription()).isEqualTo("A treaty for testing.");
    }
}
