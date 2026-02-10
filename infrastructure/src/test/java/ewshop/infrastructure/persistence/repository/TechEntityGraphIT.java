package ewshop.infrastructure.persistence.repository;

import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.TechType;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.entities.TechUnlockEntity;
import ewshop.infrastructure.persistence.repositories.TechJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TechEntityGraphIT {

    @Autowired
    TestEntityManager em;
    @Autowired
    TechJpaRepository repo;

    @Test
    void findAll_shouldEagerLoadUnlocksAndNestedAssociations_viaEntityGraph() {
        // Arrange
        TechEntity tech = new TechEntity();
        tech.setName("Advanced Weapons");
        tech.setType(TechType.DEFENSE);
        tech.setEra(4);
        tech.setTechCoords(new TechCoords(0.0, 0.0));

        TechUnlockEntity unlock = new TechUnlockEntity();
        unlock.setUnlockText("Unlocks something");
        unlock.setTech(tech);
        tech.setUnlocks(List.of(unlock));

        em.persistAndFlush(tech);
        em.clear(); // important: force load from DB, not persistence context

        // Act
        var all = repo.findAll();

        // Assert
        TechEntity loaded = all.stream()
                .filter(t -> "Advanced Weapons".equals(t.getName()))
                .findFirst().orElseThrow();

        assertThat(loaded.getUnlocks()).hasSize(1);

        TechUnlockEntity loadedUnlock = loaded.getUnlocks().get(0);
        assertThat(loadedUnlock.getUnlockText()).isEqualTo("Unlocks something");
    }
}