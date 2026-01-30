package ewshop.infrastructure.persistence.repository;

import ewshop.domain.entity.TechCoords;
import ewshop.domain.entity.enums.TechType;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.repositories.TechJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TechRepositoryUpdateIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TechJpaRepository repository;

    @Test
    void updateEraAndCoordsByNameAndType_shouldUpdateExactlyOneRow_whenMatchExists() {
        // Arrange: persist a tech row we will update
        TechEntity tech = new TechEntity();
        tech.setName("Advanced Weapons");
        tech.setType(TechType.DEFENSE);
        tech.setEra(4);
        tech.setTechCoords(new TechCoords(10.0, 20.0));
        entityManager.persistAndFlush(tech);

        // Act: run bulk update
        int updated = repository.updateEraAndCoordsByNameAndType(
                "Advanced Weapons",
                TechType.DEFENSE,
                5,
                new TechCoords(55.5, 66.6)
        );

        // Assert: update count
        assertThat(updated).isEqualTo(1);

        // IMPORTANT: bulk updates bypass the persistence context
        entityManager.flush();
        entityManager.clear();

        // Assert: entity is actually updated in DB
        TechEntity reloaded = repository.findByName("Advanced Weapons").orElseThrow();
        assertThat(reloaded.getEra()).isEqualTo(5);
        assertThat(reloaded.getTechCoords()).isNotNull();
        assertThat(reloaded.getTechCoords().getXPct()).isEqualTo(55.5);
        assertThat(reloaded.getTechCoords().getYPct()).isEqualTo(66.6);
    }

    @Test
    void updateEraAndCoordsByNameAndType_shouldReturnZero_whenNameDoesNotMatch() {
        // Arrange
        TechEntity tech = new TechEntity();
        tech.setName("Advanced Weapons");
        tech.setType(TechType.DEFENSE);
        tech.setEra(4);
        tech.setTechCoords(new TechCoords(10.0, 20.0));
        entityManager.persistAndFlush(tech);

        // Act
        int updated = repository.updateEraAndCoordsByNameAndType(
                "Different Name",
                TechType.DEFENSE,
                5,
                new TechCoords(55.5, 66.6)
        );

        // Assert
        assertThat(updated).isEqualTo(0);

        entityManager.flush();
        entityManager.clear();

        TechEntity reloaded = repository.findByName("Advanced Weapons").orElseThrow();
        assertThat(reloaded.getEra()).isEqualTo(4);
        assertThat(reloaded.getTechCoords().getXPct()).isEqualTo(10.0);
        assertThat(reloaded.getTechCoords().getYPct()).isEqualTo(20.0);
    }

    @Test
    void updateEraAndCoordsByNameAndType_shouldReturnZero_whenTypeDoesNotMatch() {
        // Arrange
        TechEntity tech = new TechEntity();
        tech.setName("Advanced Weapons");
        tech.setType(TechType.DEFENSE);
        tech.setEra(4);
        tech.setTechCoords(new TechCoords(10.0, 20.0));
        entityManager.persistAndFlush(tech);

        // Act
        int updated = repository.updateEraAndCoordsByNameAndType(
                "Advanced Weapons",
                TechType.SOCIETY, // wrong type
                5,
                new TechCoords(55.5, 66.6)
        );

        // Assert
        assertThat(updated).isEqualTo(0);

        entityManager.flush();
        entityManager.clear();

        TechEntity reloaded = repository.findByName("Advanced Weapons").orElseThrow();
        assertThat(reloaded.getEra()).isEqualTo(4);
        assertThat(reloaded.getTechCoords().getXPct()).isEqualTo(10.0);
        assertThat(reloaded.getTechCoords().getYPct()).isEqualTo(20.0);
    }
}