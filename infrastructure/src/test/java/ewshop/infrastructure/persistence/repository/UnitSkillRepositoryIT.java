package ewshop.infrastructure.persistence.repository;

import ewshop.infrastructure.persistence.entities.UnitSkillEntity;
import ewshop.infrastructure.persistence.repositories.SpringDataUnitSkillRepository;
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
    private SpringDataUnitSkillRepository unitSkillRepository;

    @Test
    void shouldSaveAndFindByName() {
        // Arrange
        UnitSkillEntity newSkill = new UnitSkillEntity(
                "Tactical Retreat",
                "self",
                1,
                "movement",
                0, 0, 0, 0
        );
        entityManager.persistAndFlush(newSkill);
        entityManager.clear(); // Clear persistence context

        // Act
        Optional<UnitSkillEntity> foundSkill = unitSkillRepository.findByName("Tactical Retreat");

        // Assert
        assertThat(foundSkill).isPresent();
        UnitSkillEntity result = foundSkill.get();
        assertThat(result.getName()).isEqualTo("Tactical Retreat");
        assertThat(result.getTarget()).isEqualTo("self");
        assertThat(result.getAmount()).isEqualTo(1);
        assertThat(result.getType()).isEqualTo("movement");
    }
}
