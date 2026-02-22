package ewshop.infrastructure.persistence.repository;

import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.MajorFaction;
import ewshop.domain.model.enums.TechType;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.repositories.TechJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TechEntityGraphIT {

    @Autowired TestEntityManager em;
    @Autowired TechJpaRepository repo;

    @Test
    void findAll_shouldLoadEffectLinesAndPrereq() {
        // prereq
        TechEntity prereq = new TechEntity();
        prereq.setTechKey("Tech_Masonry");
        prereq.setName("Masonry");
        prereq.setType(TechType.DISCOVERY);
        prereq.setEra(1);
        prereq.setTechCoords(new TechCoords(0.0, 0.0));
        prereq.setDescriptionLines(List.of("Prereq line"));
        prereq.setFactions(Set.of(MajorFaction.ASPECTS));

        // main tech
        TechEntity tech = new TechEntity();
        tech.setTechKey("Tech_AdvancedWeapons");
        tech.setName("Advanced Weapons");
        tech.setType(TechType.DEFENSE);
        tech.setEra(4);
        tech.setTechCoords(new TechCoords(0.0, 0.0));
        tech.setDescriptionLines(List.of("Unlocks something"));
        tech.setFactions(Set.of(MajorFaction.ASPECTS));
        tech.setPrereq(prereq);

        em.persist(prereq);
        em.persistAndFlush(tech);
        em.clear();

        var loaded = repo.findAllForCache().stream()
                .filter(t -> "Tech_AdvancedWeapons".equals(t.getTechKey()))
                .findFirst()
                .orElseThrow();

        assertThat(loaded.getDescriptionLines()).containsExactly("Unlocks something");
        assertThat(loaded.getPrereq()).isNotNull();
        assertThat(loaded.getPrereq().getTechKey()).isEqualTo("Tech_Masonry");
    }
}