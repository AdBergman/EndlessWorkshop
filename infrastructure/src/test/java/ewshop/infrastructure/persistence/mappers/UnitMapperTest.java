package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Unit;
import ewshop.infrastructure.persistence.entities.UnitEntity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UnitMapperTest {

    private final UnitMapper unitMapper = new UnitMapper();

    @Test
    void toDomain_shouldMapUnitClassDisplayNameWithoutChangingRawClassKey() {
        UnitEntity entity = new UnitEntity();
        entity.setUnitKey("Unit_LastLord_DustBishopChariot_Upgrade01");
        entity.setDisplayName("Leeching Palanquin");
        entity.setUnitClassKey("UnitClass_JuggernaughtRanged");
        entity.setUnitClassDisplayName("Juggernaught Ranged");
        entity.setDescriptionLines(List.of("Class: UnitClass_JuggernaughtRanged"));
        entity.setVeterancyProgressionLines(List.of("Level 5: +10 [Defense] Defense"));

        Unit domain = unitMapper.toDomain(entity);

        assertThat(domain).isNotNull();
        assertThat(domain.getUnitClassKey()).isEqualTo("UnitClass_JuggernaughtRanged");
        assertThat(domain.getUnitClassDisplayName()).isEqualTo("Juggernaught Ranged");
        assertThat(domain.getDescriptionLines()).containsExactly("Class: UnitClass_JuggernaughtRanged");
        assertThat(domain.getVeterancyProgressionLines()).containsExactly("Level 5: +10 [Defense] Defense");
    }

    @Test
    void toEntity_shouldMapUnitClassDisplayNameWithoutChangingRawClassKey() {
        Unit domain = Unit.builder()
                .unitKey("Unit_LastLord_DustBishopChariot_Upgrade01")
                .displayName("Leeching Palanquin")
                .unitClassKey("UnitClass_JuggernaughtRanged")
                .unitClassDisplayName("Juggernaught Ranged")
                .descriptionLines(List.of("Class: UnitClass_JuggernaughtRanged"))
                .veterancyProgressionLines(List.of("Level 5: +10 [Defense] Defense"))
                .build();

        UnitEntity entity = unitMapper.toEntity(domain);

        assertThat(entity).isNotNull();
        assertThat(entity.getUnitClassKey()).isEqualTo("UnitClass_JuggernaughtRanged");
        assertThat(entity.getUnitClassDisplayName()).isEqualTo("Juggernaught Ranged");
        assertThat(entity.getDescriptionLines()).containsExactly("Class: UnitClass_JuggernaughtRanged");
        assertThat(entity.getVeterancyProgressionLines()).containsExactly("Level 5: +10 [Defense] Defense");
    }
}
