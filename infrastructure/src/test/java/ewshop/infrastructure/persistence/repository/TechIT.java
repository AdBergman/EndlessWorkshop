package ewshop.infrastructure.persistence.repository;

import ewshop.domain.entity.TechCoords;
import ewshop.domain.entity.enums.Faction;
import ewshop.domain.entity.enums.TechType;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.entities.TechUnlockEntity;
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
class TechIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SpringDataTechRepository repository;

    @Test
    void shouldSaveAndFindByName_WithUnlocks() {
        // Arrange
        // Create the child entity first
        TechUnlockEntity unlock = new TechUnlockEntity();
        unlock.setUnlockText("Unlocks a powerful new weapon.");

        // Create the parent entity
        TechEntity newTech = new TechEntity();
        newTech.setName("Advanced Weapons");
        newTech.setEra(4);
        newTech.setType(TechType.DEFENSE);
        newTech.setFactions(Set.of(Faction.KIN));
        newTech.setTechCoords(new TechCoords(50, 50));

        // Set the relationship
        // Because of CascadeType.ALL, persisting the tech will also persist the unlock.
        newTech.setUnlocks(List.of(unlock));
        unlock.setTech(newTech); // Set the back-reference for bidirectional consistency

        entityManager.persistAndFlush(newTech);

        // Act
        Optional<TechEntity> foundTech = repository.findByName("Advanced Weapons");

        // Assert
        assertThat(foundTech).isPresent();
        TechEntity result = foundTech.get();
        assertThat(result.getName()).isEqualTo("Advanced Weapons");
        assertThat(result.getEra()).isEqualTo(4);

        // Assert that the relationship was persisted and retrieved correctly
        assertThat(result.getUnlocks()).hasSize(1);
        assertThat(result.getUnlocks().get(0).getUnlockText()).isEqualTo("Unlocks a powerful new weapon.");
    }
}
