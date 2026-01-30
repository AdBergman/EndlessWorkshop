package ewshop.infrastructure.persistence.repository;

import ewshop.domain.model.enums.FIDSI;
import ewshop.domain.model.enums.StrategicResourceType;
import ewshop.domain.model.enums.UnitType;
import ewshop.infrastructure.persistence.entities.UnitCostEmbeddable;
import ewshop.infrastructure.persistence.entities.UnitSkillEntity;
import ewshop.infrastructure.persistence.entities.UnitSpecializationEntity;
import ewshop.infrastructure.persistence.entities.UnitSpecializationSkillEntity;
import ewshop.infrastructure.persistence.repositories.UnitSpecializationJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.groups.Tuple.tuple;

@DataJpaTest
class UnitSpecializationIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UnitSpecializationJpaRepository repository;

    private UnitSkillEntity skill1;
    private UnitSkillEntity skill2;

    @BeforeEach
    void setUp() {
        // Pre-populate UnitSkillEntity for relationships
        skill1 = new UnitSkillEntity(
                "Melee Attack", "target", 10, "damage", 1, 0, 0, 0
        );
        skill2 = new UnitSkillEntity(
                "Ranged Defense", "self", 5, "defense", 0, 1, 0, 0
        );
        entityManager.persist(skill1);
        entityManager.persist(skill2);
        entityManager.flush();
    }

    @Test
    void shouldSaveAndFindUnitSpecializationWithSkillsAndCosts() {
        // Arrange
        UnitSpecializationEntity newSpecialization = new UnitSpecializationEntity();
        newSpecialization.setName("Elite Guard");
        newSpecialization.setDescription("Heavily armored frontline unit.");
        newSpecialization.setType(UnitType.INFANTRY);
        newSpecialization.setHealth(100);
        newSpecialization.setDefense(50);
        newSpecialization.setMinDamage(15);
        newSpecialization.setMaxDamage(25);
        newSpecialization.setMovementPoints(2);
        newSpecialization.setTier(3);
        newSpecialization.setFaction("Vaulters");
        newSpecialization.setArtId("elite_guard_art");
        newSpecialization.setUpkeep(5);

        // Add costs
        Set<UnitCostEmbeddable> costs = new HashSet<>();
        costs.add(new UnitCostEmbeddable(100, FIDSI.INDUSTRY, null));
        costs.add(new UnitCostEmbeddable(2, null, StrategicResourceType.TITANIUM));
        newSpecialization.setCosts(costs);

        // Add skills
        newSpecialization.addSkill(skill1, 2); // Level 2 Melee Attack
        newSpecialization.addSkill(skill2, 1); // Level 1 Ranged Defense

        entityManager.persistAndFlush(newSpecialization);
        entityManager.clear(); // Clear persistence context to ensure data is reloaded from DB

        // Act
        Optional<UnitSpecializationEntity> foundSpecialization = repository.findByName("Elite Guard");

        // Assert
        assertThat(foundSpecialization).isPresent();
        UnitSpecializationEntity result = foundSpecialization.get();

        assertThat(result.getName()).isEqualTo("Elite Guard");
        assertThat(result.getDescription()).isEqualTo("Heavily armored frontline unit.");
        assertThat(result.getType()).isEqualTo(UnitType.INFANTRY);
        assertThat(result.getHealth()).isEqualTo(100);
        assertThat(result.getDefense()).isEqualTo(50);
        assertThat(result.getMinDamage()).isEqualTo(15);
        assertThat(result.getMaxDamage()).isEqualTo(25);
        assertThat(result.getMovementPoints()).isEqualTo(2);
        assertThat(result.getTier()).isEqualTo(3);
        assertThat(result.getFaction()).isEqualTo("Vaulters");
        assertThat(result.getArtId()).isEqualTo("elite_guard_art");
        assertThat(result.getUpkeep()).isEqualTo(5);

        // Assert costs
        assertThat(result.getCosts()).hasSize(2);
        assertThat(result.getCosts())
                .extracting(UnitCostEmbeddable::getAmount, UnitCostEmbeddable::getResource, UnitCostEmbeddable::getStrategic)
                .containsExactlyInAnyOrder(
                        tuple(100, FIDSI.INDUSTRY, null),
                        tuple(2, null, StrategicResourceType.TITANIUM)
                );

        // Assert unit skills
        assertThat(result.getUnitSkills()).hasSize(2);
        assertThat(result.getUnitSkills())
                .extracting(uss -> uss.getSkill().getName(), UnitSpecializationSkillEntity::getLevel)
                .containsExactlyInAnyOrder(
                        tuple("Melee Attack", 2),
                        tuple("Ranged Defense", 1)
                );
    }

    @Test
    void shouldFindAllUnitSpecializationsAndTraverseGraph() {
        // Arrange
        UnitSpecializationEntity spec1 = new UnitSpecializationEntity();
        spec1.setName("Scout");
        spec1.setHealth(30);
        spec1.setDefense(10);
        spec1.setMinDamage(5);
        spec1.setMaxDamage(10);
        spec1.setMovementPoints(4);
        spec1.setTier(1);
        spec1.addSkill(skill1, 1);
        spec1.getCosts().add(new UnitCostEmbeddable(50, FIDSI.DUST, null));
        entityManager.persist(spec1);

        UnitSpecializationEntity spec2 = new UnitSpecializationEntity();
        spec2.setName("Heavy Cavalry");
        spec2.setHealth(120);
        spec2.setDefense(60);
        spec2.setMinDamage(20);
        spec2.setMaxDamage(35);
        spec2.setMovementPoints(3);
        spec2.setTier(3);
        spec2.addSkill(skill2, 2);
        spec2.getCosts().add(new UnitCostEmbeddable(150, FIDSI.INDUSTRY, null));
        spec2.getCosts().add(new UnitCostEmbeddable(1, null, StrategicResourceType.TITANIUM));
        entityManager.persist(spec2);

        entityManager.flush();
        entityManager.clear();

        // Act
        List<UnitSpecializationEntity> allSpecializations = repository.findAll();

        // Assert
        assertThat(allSpecializations).hasSize(2); // Assuming only these two are in the DB

        for (UnitSpecializationEntity specialization : allSpecializations) {
            assertThat(specialization.getName()).isNotNull();
            // Access unitSkills and unitSkills.skill
            assertThat(specialization.getUnitSkills()).isNotNull();
            for (UnitSpecializationSkillEntity uss : specialization.getUnitSkills()) {
                assertThat(uss.getLevel()).isNotNull();
                assertThat(uss.getSkill()).isNotNull(); // Ensure skill is loaded
                assertThat(uss.getSkill().getName()).isNotNull(); // Access skill's properties
            }

            // Access costs
            assertThat(specialization.getCosts()).isNotNull();
            for (UnitCostEmbeddable cost : specialization.getCosts()) {
                assertThat(cost.getAmount()).isNotNull();
                // Access embeddable properties
            }
        }
    }

    @Test
    void shouldSaveAndFindByName() {
        // Arrange
        UnitSpecializationEntity newEntity = new UnitSpecializationEntity();
        newEntity.setName("Vanguard");
        newEntity.setDescription("A powerful frontline unit.");
        newEntity.setHealth(10); // Add required fields
        newEntity.setDefense(10);
        newEntity.setMinDamage(1);
        newEntity.setMaxDamage(2);
        newEntity.setMovementPoints(1);
        newEntity.setTier(1);
        entityManager.persistAndFlush(newEntity);

        // Act
        Optional<UnitSpecializationEntity> foundEntity = repository.findByName("Vanguard");

        // Assert
        assertThat(foundEntity).isPresent();
        assertThat(foundEntity.get().getName()).isEqualTo("Vanguard");
        assertThat(foundEntity.get().getDescription()).isEqualTo("A powerful frontline unit.");
    }
}
