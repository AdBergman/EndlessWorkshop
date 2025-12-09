package ewshop.facade.integration;

import ewshop.domain.entity.UnitSpecialization;
import ewshop.domain.entity.enums.Faction;
import ewshop.domain.entity.enums.UnitType;
import ewshop.domain.repository.UnitSpecializationRepository;
import ewshop.facade.dto.response.UnitDto;
import ewshop.facade.interfaces.UnitFacade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = IntegrationTestConfig.class)
@Transactional
class UnitFacadeTest {

    @Autowired
    private UnitFacade unitFacade;

    @Autowired
    private UnitSpecializationRepository unitRepository;

    @BeforeEach
    void cleanDatabase() {
        unitRepository.deleteAll();
    }

    @Test
    void contextLoads() {
        assertThat(unitFacade).isNotNull();
        assertThat(unitRepository).isNotNull();
    }

    @Test
    void getAllUnits_integration() {
        // Given
        UnitSpecialization unit1 = UnitSpecialization.builder()
                .name("Test Unit 1")
                .tier(1)
                .faction(Faction.ASPECTS)
                .type(UnitType.INFANTRY)
                .health(100)
                .defense(10)
                .minDamage(5)
                .maxDamage(15)
                .movementPoints(4)
                .upkeep(2)
                .build();

        UnitSpecialization unit2 = UnitSpecialization.builder()
                .name("Test Unit 2")
                .tier(2)
                .faction(Faction.KIN)
                .type(UnitType.CAVALRY)
                .health(150)
                .defense(15)
                .minDamage(10)
                .maxDamage(25)
                .movementPoints(6)
                .upkeep(4)
                .build();

        unitRepository.save(unit1);
        unitRepository.save(unit2);

        // When
        List<UnitDto> result = unitFacade.getAllUnits();

        // Then
        assertThat(result).hasSize(2);

        UnitDto unit1Dto = result.stream()
                .filter(u -> "Test Unit 1".equals(u.name()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Unit 1 DTO not found"));

        assertThat(unit1Dto.tier()).isEqualTo(1);
        assertThat(unit1Dto.faction()).isEqualTo(Faction.ASPECTS);
        assertThat(unit1Dto.type()).isEqualTo("Infantry");
        assertThat(unit1Dto.health()).isEqualTo(100);
        assertThat(unit1Dto.defense()).isEqualTo(10);
        assertThat(unit1Dto.minDamage()).isEqualTo(5);
        assertThat(unit1Dto.maxDamage()).isEqualTo(15);
        assertThat(unit1Dto.movementPoints()).isEqualTo(4);
        assertThat(unit1Dto.upkeep()).isEqualTo(2);
    }
}
