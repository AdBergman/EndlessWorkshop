package ewshop.facade.mapper;

import ewshop.facade.dto.importing.units.UnitImportVeterancyEffectDto;
import ewshop.facade.dto.importing.units.UnitImportVeterancyLevelDto;
import ewshop.facade.dto.importing.units.UnitImportVeterancyProgressionDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UnitVeterancyProgressionMapperTest {

    @Test
    void mapsRootVeterancyProgressionToCumulativeDisplayLines() {
        UnitImportVeterancyProgressionDto dto = new UnitImportVeterancyProgressionDto(
                "nonHeroUnits",
                "cumulative",
                "VeterancyLevelDefinition",
                "unverified",
                List.of(
                        level(1),
                        level(2),
                        level(3),
                        level(4),
                        level(5)
                )
        );

        assertThat(UnitVeterancyProgressionMapper.toCumulativeDisplayLines(dto))
                .containsExactly(
                        "Level 1: +2 [Defense] Defense, +5% [Damage] Damage, +5% [Health] Health",
                        "Level 2: +4 [Defense] Defense, +10% [Damage] Damage, +10% [Health] Health",
                        "Level 3: +6 [Defense] Defense, +15% [Damage] Damage, +15% [Health] Health",
                        "Level 4: +8 [Defense] Defense, +20% [Damage] Damage, +20% [Health] Health",
                        "Level 5: +10 [Defense] Defense, +25% [Damage] Damage, +25% [Health] Health"
                );
    }

    private static UnitImportVeterancyLevelDto level(int level) {
        return new UnitImportVeterancyLevelDto(
                level,
                List.of(
                        new UnitImportVeterancyEffectDto("Defense", "Defense", "Add", 2.0, "+2 [Defense] Defense"),
                        new UnitImportVeterancyEffectDto("Damage", "Damage", "Percent", 0.05, "+5% [Damage] Damage"),
                        new UnitImportVeterancyEffectDto("Health", "Health", "Percent", 0.05, "+5% [Health] Health")
                )
        );
    }
}
