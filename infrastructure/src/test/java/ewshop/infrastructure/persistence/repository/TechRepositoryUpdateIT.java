package ewshop.infrastructure.persistence.repository;

import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.TechType;
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
    void updateEraAndCoordsByTechKey_shouldUpdateExactlyOneRow_whenMatchExists() {
        TechEntity tech = new TechEntity();
        tech.setTechKey("Tech_AdvancedWeapons");
        tech.setName("Advanced Weapons");
        tech.setType(TechType.DEFENSE);
        tech.setEra(4);
        tech.setTechCoords(new TechCoords(10.0, 20.0));
        entityManager.persistAndFlush(tech);

        int updated = repository.updateEraAndCoordsByTechKey(
                "Tech_AdvancedWeapons",
                5,
                new TechCoords(55.5, 66.6)
        );

        assertThat(updated).isEqualTo(1);

        entityManager.flush();
        entityManager.clear();

        TechEntity reloaded = repository.findByTechKey("Tech_AdvancedWeapons").orElseThrow();
        assertThat(reloaded.getEra()).isEqualTo(5);
        assertThat(reloaded.getTechCoords()).isNotNull();
        assertThat(reloaded.getTechCoords().getXPct()).isEqualTo(55.5);
        assertThat(reloaded.getTechCoords().getYPct()).isEqualTo(66.6);
    }

    @Test
    void updateEraAndCoordsByTechKey_shouldReturnZero_whenTechKeyDoesNotMatch() {
        TechEntity tech = new TechEntity();
        tech.setTechKey("Tech_AdvancedWeapons");
        tech.setName("Advanced Weapons");
        tech.setType(TechType.DEFENSE);
        tech.setEra(4);
        tech.setTechCoords(new TechCoords(10.0, 20.0));
        entityManager.persistAndFlush(tech);

        int updated = repository.updateEraAndCoordsByTechKey(
                "Tech_Different",
                5,
                new TechCoords(55.5, 66.6)
        );

        assertThat(updated).isEqualTo(0);

        entityManager.flush();
        entityManager.clear();

        TechEntity reloaded = repository.findByTechKey("Tech_AdvancedWeapons").orElseThrow();
        assertThat(reloaded.getEra()).isEqualTo(4);
        assertThat(reloaded.getTechCoords().getXPct()).isEqualTo(10.0);
        assertThat(reloaded.getTechCoords().getYPct()).isEqualTo(20.0);
    }

    @Test
    void updateEraAndCoordsByTechKey_shouldUpdateEvenIfTypeDiffers() {
        TechEntity tech = new TechEntity();
        tech.setTechKey("Tech_AdvancedWeapons");
        tech.setName("Advanced Weapons");
        tech.setType(TechType.DEFENSE);
        tech.setEra(4);
        tech.setTechCoords(new TechCoords(10.0, 20.0));
        entityManager.persistAndFlush(tech);

        int updated = repository.updateEraAndCoordsByTechKey(
                "Tech_AdvancedWeapons",
                5,
                new TechCoords(55.5, 66.6)
        );

        assertThat(updated).isEqualTo(1);

        entityManager.flush();
        entityManager.clear();

        TechEntity reloaded = repository.findByTechKey("Tech_AdvancedWeapons").orElseThrow();
        assertThat(reloaded.getEra()).isEqualTo(5);
        assertThat(reloaded.getTechCoords().getXPct()).isEqualTo(55.5);
        assertThat(reloaded.getTechCoords().getYPct()).isEqualTo(66.6);
    }
}