package ewshop.infrastructure.persistence.repository;

import ewshop.infrastructure.persistence.entities.DistrictEntity;
import ewshop.infrastructure.persistence.repositories.SpringDataDistrictRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class DistrictIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SpringDataDistrictRepository repository;

    @Test
    void shouldSaveAndFindByName() {
        // Arrange
        DistrictEntity newDistrict = new DistrictEntity();
        newDistrict.setName("Market District");
        newDistrict.setEffect("+10 Dust per population");
        newDistrict.setAdjacencyBonus(List.of("+5 Dust if next to River"));

        entityManager.persistAndFlush(newDistrict);

        // Act
        Optional<DistrictEntity> foundDistrict = repository.findByName("Market District");

        // Assert
        assertThat(foundDistrict).isPresent();
        DistrictEntity result = foundDistrict.get();
        assertThat(result.getName()).isEqualTo("Market District");
        assertThat(result.getEffect()).isEqualTo("+10 Dust per population");

        // Assert that the element collection was persisted and retrieved correctly
        assertThat(result.getAdjacencyBonus()).containsExactly("+5 Dust if next to River");
    }
}
