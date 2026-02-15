package ewshop.infrastructure.persistence.repository;

import ewshop.infrastructure.persistence.entities.DistrictEntity;
import ewshop.infrastructure.persistence.repositories.DistrictJpaRepository;
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
    private DistrictJpaRepository repository;

    @Test
    void shouldSaveAndFindByDistrictKey() {
        DistrictEntity entity = new DistrictEntity();
        entity.setDistrictKey("Aspect_District_Tier1_Science");
        entity.setDisplayName("Laboratory");
        entity.setCategory("Science");
        entity.setDescriptionLines(List.of(
                "+1 Science on special tiles",
                "+2 Science per level"
        ));

        entityManager.persistAndFlush(entity);

        Optional<DistrictEntity> found =
                repository.findByDistrictKey("Aspect_District_Tier1_Science");

        assertThat(found).isPresent();

        DistrictEntity result = found.get();
        assertThat(result.getDistrictKey())
                .isEqualTo("Aspect_District_Tier1_Science");
        assertThat(result.getDisplayName())
                .isEqualTo("Laboratory");
        assertThat(result.getCategory())
                .isEqualTo("Science");

        assertThat(result.getDescriptionLines())
                .containsExactly(
                        "+1 Science on special tiles",
                        "+2 Science per level"
                );
    }
}