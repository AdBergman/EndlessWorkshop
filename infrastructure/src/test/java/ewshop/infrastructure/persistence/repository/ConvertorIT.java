package ewshop.infrastructure.persistence.repository;

import ewshop.infrastructure.persistence.entities.ConvertorEntity;
import ewshop.infrastructure.persistence.repositories.SpringDataConvertorRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ConvertorIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SpringDataConvertorRepository repository;

    @Test
    void shouldSaveAndFindByName() {
        // Arrange
        ConvertorEntity newConvertor = new ConvertorEntity();
        newConvertor.setName("Propaganda Machine");
        newConvertor.setDescription("Converts Industry to Influence.");
        entityManager.persistAndFlush(newConvertor);

        // Act
        Optional<ConvertorEntity> foundConvertor = repository.findByName("Propaganda Machine");

        // Assert
        assertThat(foundConvertor).isPresent();
        assertThat(foundConvertor.get().getName()).isEqualTo("Propaganda Machine");
        assertThat(foundConvertor.get().getDescription()).isEqualTo("Converts Industry to Influence.");
    }
}
