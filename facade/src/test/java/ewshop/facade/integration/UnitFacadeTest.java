package ewshop.facade.integration;

import ewshop.domain.command.UnitImportSnapshot;
import ewshop.domain.repository.UnitRepository;
import ewshop.facade.dto.response.UnitDto;
import ewshop.facade.interfaces.UnitFacade;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UnitFacadeTest extends BaseIT {

    @Autowired
    private UnitFacade unitFacade;

    @Autowired
    private UnitRepository unitRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Test
    void contextLoads() {
        assertThat(unitFacade).isNotNull();
        assertThat(unitRepository).isNotNull();
    }

    @Test
    void getAllUnits_integration() {

        UnitImportSnapshot unit1 = new UnitImportSnapshot(
                "Unit_Test_1",
                "Test Unit 1",
                false,
                false,
                "Land",
                null,
                List.of("Unit_Test_1_Upgraded"),
                1,
                "UnitClass_Infantry",
                "Skill_Attack_1",
                List.of("UnitAbility_A", "UnitAbility_B"),
                List.of("Line 1", "Line 2")
        );

        UnitImportSnapshot unit2 = new UnitImportSnapshot(
                "Unit_Test_2",
                "Test Unit 2",
                false,
                false,
                "Land",
                "Unit_Test_1",
                List.of(),
                2,
                "UnitClass_Cavalry",
                "Skill_Attack_2",
                List.of("UnitAbility_C"),
                List.of("Only line")
        );

        unitRepository.importUnitSnapshot(List.of(unit1, unit2));
        entityManager.flush();

        List<UnitDto> result = unitFacade.getAllUnits();

        assertThat(result).hasSize(2);

        UnitDto dto = result.stream()
                .filter(u -> "Unit_Test_1".equals(u.unitKey()))
                .findFirst()
                .orElseThrow();

        assertThat(dto.displayName()).isEqualTo("Test Unit 1");
        assertThat(dto.isHero()).isFalse();
        assertThat(dto.isChosen()).isFalse();
        assertThat(dto.spawnType()).isEqualTo("Land");
        assertThat(dto.previousUnitKey()).isNull();
        assertThat(dto.nextEvolutionUnitKeys()).containsExactly("Unit_Test_1_Upgraded");
        assertThat(dto.evolutionTierIndex()).isEqualTo(1);
        assertThat(dto.unitClassKey()).isEqualTo("UnitClass_Infantry");
        assertThat(dto.attackSkillKey()).isEqualTo("Skill_Attack_1");
        assertThat(dto.abilityKeys()).containsExactly("UnitAbility_A", "UnitAbility_B");
        assertThat(dto.descriptionLines()).containsExactly("Line 1", "Line 2");
    }
}