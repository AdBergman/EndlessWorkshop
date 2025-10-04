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
class ConvertorRepositoryIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SpringDataConvertorRepository convertorRepository;

    @Test
    void testSaveAndFindByName() {
        // Arrange
        ConvertorEntity newConvertor = new ConvertorEntity();
        newConvertor.setName("Test Convertor");
        newConvertor.setDescription("A test description.");
        entityManager.persistAndFlush(newConvertor);

        // Act
        Optional<ConvertorEntity> foundConvertor = convertorRepository.findByName("Test Convertor");

        // Assert
        assertThat(foundConvertor).isPresent();
        assertThat(foundConvertor.get().getName()).isEqualTo("Test Convertor");
        assertThat(foundConvertor.get().getDescription()).isEqualTo("A test description.");
    }
}
