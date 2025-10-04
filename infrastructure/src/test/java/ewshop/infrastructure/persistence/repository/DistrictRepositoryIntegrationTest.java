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
class DistrictRepositoryIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SpringDataDistrictRepository districtRepository;

    @Test
    void testSaveAndFindByName() {
        // Arrange
        DistrictEntity newDistrict = new DistrictEntity();
        newDistrict.setName("Test District");
        newDistrict.setInfo(List.of("Info 1", "Info 2"));
        entityManager.persistAndFlush(newDistrict);

        // Act
        Optional<DistrictEntity> foundDistrict = districtRepository.findByName("Test District");

        // Assert
        assertThat(foundDistrict).isPresent();
        assertThat(foundDistrict.get().getName()).isEqualTo("Test District");
        assertThat(foundDistrict.get().getInfo()).containsExactly("Info 1", "Info 2");
    }
}
