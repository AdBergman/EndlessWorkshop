package ewshop.infrastructure.persistence.repository;

import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.Faction;
import ewshop.domain.model.enums.TechType;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.repositories.TechJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TechIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TechJpaRepository repository;

    @Test
    void shouldSaveAndFindByTechKey() {
        TechEntity tech = new TechEntity();
        tech.setTechKey("Tech_AdvancedWeapons");
        tech.setName("Advanced Weapons");
        tech.setEra(4);
        tech.setType(TechType.DEFENSE);
        tech.setFactions(Set.of(Faction.KIN));
        tech.setTechCoords(new TechCoords(50, 50));
        tech.setDescriptionLines(List.of("Unlocks a powerful new weapon."));

        entityManager.persistAndFlush(tech);

        Optional<TechEntity> found = repository.findByTechKey("Tech_AdvancedWeapons");

        assertThat(found).isPresent();
        TechEntity result = found.get();

        assertThat(result.getTechKey()).isEqualTo("Tech_AdvancedWeapons");
        assertThat(result.getName()).isEqualTo("Advanced Weapons");
        assertThat(result.getEra()).isEqualTo(4);
        assertThat(result.getDescriptionLines())
                .containsExactly("Unlocks a powerful new weapon.");
        assertThat(result.getFactions())
                .containsExactly(Faction.KIN);
    }
}