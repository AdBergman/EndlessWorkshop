package ewshop.infrastructure.persistence.repository;

import ewshop.domain.entity.TechCoords;
import ewshop.domain.entity.enums.Faction;
import ewshop.domain.entity.enums.TechType;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.repositories.SpringDataTechRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TechRepositoryIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SpringDataTechRepository techRepository;

    @Test
    void testSaveAndFindByName() {
        // Arrange
        TechEntity newTech = new TechEntity();
        newTech.setName("Test Tech");
        newTech.setEra(3);
        newTech.setType(TechType.ECONOMY);
        newTech.setEffects(List.of("+10 Dust"));
        newTech.setFactions(Set.of(Faction.KIN, Faction.ASPECTS));
        newTech.setTechCoords(new TechCoords(10.5, 20.5));
        // We are NOT testing relationships in this simple test
        entityManager.persistAndFlush(newTech);

        // Act
        Optional<TechEntity> foundTech = techRepository.findByName("Test Tech");

        // Assert
        assertThat(foundTech).isPresent();
        TechEntity result = foundTech.get();
        assertThat(result.getName()).isEqualTo("Test Tech");
        assertThat(result.getEra()).isEqualTo(3);
        assertThat(result.getType()).isEqualTo(TechType.ECONOMY);
        assertThat(result.getFactions()).contains(Faction.KIN, Faction.ASPECTS);
        assertThat(result.getTechCoords().getXPct()).isEqualTo(10.5);
    }
}
