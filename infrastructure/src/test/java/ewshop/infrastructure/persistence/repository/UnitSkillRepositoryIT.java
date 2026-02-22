package ewshop.infrastructure.persistence.repository;

import ewshop.infrastructure.persistence.entities.UnitSkillEntityLegacy;
import ewshop.infrastructure.persistence.repositories.UnitSkillJpaRepositoryLegacy;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UnitSkillRepositoryIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UnitSkillJpaRepositoryLegacy unitSkillRepository;

    @Test
    void shouldSaveAndFindByName() {
        // Arrange
        UnitSkillEntityLegacy newSkill = new UnitSkillEntityLegacy(
                "Tactical Retreat",
                "self",
                1,
                "movement",
                0, 0, 0, 0
        );
        entityManager.persistAndFlush(newSkill);
        entityManager.clear(); // Clear persistence context

        // Act
        Optional<UnitSkillEntityLegacy> foundSkill = unitSkillRepository.findByName("Tactical Retreat");

        // Assert
        assertThat(foundSkill).isPresent();
        UnitSkillEntityLegacy result = foundSkill.get();
        assertThat(result.getName()).isEqualTo("Tactical Retreat");
        assertThat(result.getTarget()).isEqualTo("self");
        assertThat(result.getAmount()).isEqualTo(1);
        assertThat(result.getType()).isEqualTo("movement");
    }
}
