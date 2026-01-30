package ewshop.facade.mapper;

import ewshop.domain.model.UnitCost;
import ewshop.domain.model.UnitSkill;
import ewshop.domain.model.UnitSpecialization;
import ewshop.domain.model.enums.CostType;
import ewshop.domain.model.enums.Faction;
import ewshop.domain.model.enums.UnitType;
import ewshop.facade.dto.response.UnitDto;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class UnitMapperTest {

    @Test
    void toDto_shouldMapAllFields() {
        // Given
        UnitCost goldCost = UnitCost.builder().type(CostType.TITANIUM).amount(100).build();
        UnitCost woodCost = UnitCost.builder().type(CostType.GLASSTEEL).amount(50).build();

        UnitSkill skill1 = UnitSkill.builder().name("Flying").build();
        UnitSkill skill2 = UnitSkill.builder().name("Charge").build();

        UnitSpecialization domainUnit = UnitSpecialization.builder()
                .name("Griffin Rider")
                .type(UnitType.CAVALRY)
                .health(150)
                .defense(10)
                .minDamage(20)
                .maxDamage(30)
                .movementPoints(8)
                .cost(List.of(goldCost, woodCost))
                .upkeep(5)
                .skills(Set.of(skill1, skill2))
                .faction(Faction.KIN)
                .minorFaction("Knights")
                .tier(3)
                .upgradesTo(Set.of("Royal Griffin"))
                .artId("griffin_rider_art")
                .build();

        // When
        UnitDto dto = UnitMapper.toDto(domainUnit);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("Griffin Rider");
        assertThat(dto.type()).isEqualTo("Cavalry"); // Formatted enum name
        assertThat(dto.health()).isEqualTo(150);
        assertThat(dto.defense()).isEqualTo(10);
        assertThat(dto.minDamage()).isEqualTo(20);
        assertThat(dto.maxDamage()).isEqualTo(30);
        assertThat(dto.movementPoints()).isEqualTo(8);
        assertThat(dto.tier()).isEqualTo(3);
        assertThat(dto.upkeep()).isEqualTo(5);
        assertThat(dto.costs()).containsExactlyInAnyOrder("100 TITANIUM", "50 GLASSTEEL"); // Formatted costs
        assertThat(dto.skills()).containsExactlyInAnyOrder("Flying", "Charge"); // Skill names
        assertThat(dto.faction()).isEqualTo(Faction.KIN);
        assertThat(dto.minorFaction()).isEqualTo("Knights");
        assertThat(dto.upgradesTo()).containsExactly("Royal Griffin");
        assertThat(dto.artId()).isEqualTo("griffin_rider_art");
    }

    @Test
    void toDto_shouldReturnNull_whenInputIsNull() {
        // When
        UnitDto dto = UnitMapper.toDto(null);

        // Then
        assertThat(dto).isNull();
    }
}
