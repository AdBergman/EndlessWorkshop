package ewshop.facade.mapper;

import ewshop.domain.model.Unit;
import ewshop.facade.dto.response.UnitDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UnitMapperTest {

    @Test
    void toDto_shouldMapAllFields() {
        // Given
        Unit domainUnit = Unit.builder()
                .unitKey("Unit_Griffin_Rider")
                .displayName("Griffin Rider")
                .isHero(false)
                .isChosen(false)
                .spawnType("Land")
                .previousUnitKey("Unit_Griffin")
                .nextEvolutionUnitKeys(List.of("Unit_Royal_Griffin"))
                .evolutionTierIndex(3)
                .unitClassKey("UnitClass_Cavalry")
                .attackSkillKey("Skill_Attack_Griffin")
                .abilityKeys(List.of("UnitAbility_Flying", "UnitAbility_Charge"))
                .descriptionLines(List.of("Strong aerial unit", "High mobility"))
                .build();

        // When
        UnitDto dto = UnitMapper.toDto(domainUnit);

        // Then
        assertThat(dto).isNotNull();
        assertThat(dto.unitKey()).isEqualTo("Unit_Griffin_Rider");
        assertThat(dto.displayName()).isEqualTo("Griffin Rider");
        assertThat(dto.isHero()).isFalse();
        assertThat(dto.isChosen()).isFalse();
        assertThat(dto.spawnType()).isEqualTo("Land");
        assertThat(dto.previousUnitKey()).isEqualTo("Unit_Griffin");
        assertThat(dto.nextEvolutionUnitKeys()).containsExactly("Unit_Royal_Griffin");
        assertThat(dto.evolutionTierIndex()).isEqualTo(3);
        assertThat(dto.unitClassKey()).isEqualTo("UnitClass_Cavalry");
        assertThat(dto.attackSkillKey()).isEqualTo("Skill_Attack_Griffin");
        assertThat(dto.abilityKeys()).containsExactly("UnitAbility_Flying", "UnitAbility_Charge");
        assertThat(dto.descriptionLines()).containsExactly("Strong aerial unit", "High mobility");
    }

    @Test
    void toDto_shouldReturnNull_whenInputIsNull() {
        // When
        UnitDto dto = UnitMapper.toDto(null);

        // Then
        assertThat(dto).isNull();
    }
}