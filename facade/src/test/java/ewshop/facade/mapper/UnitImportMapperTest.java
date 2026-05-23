package ewshop.facade.mapper;

import ewshop.domain.command.UnitImportSnapshot;
import ewshop.facade.dto.importing.units.UnitImportUnitDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UnitImportMapperTest {

    @Test
    void mapsXaviusPantinelRowsExportedAsMangroveOfHarmonyToXavius() {
        UnitImportSnapshot snapshot = UnitImportMapper.toSnapshot(new UnitImportUnitDto(
                "Unit_MinorFaction_Xavius",
                "Pantinel",
                "MangroveOfHarmony",
                false,
                false,
                false,
                "Land",
                null,
                List.of("Unit_MinorFaction_Xavius_Upgraded"),
                0,
                "UnitClass_Juggernaught",
                null,
                List.of("UnitAbility_DefensiveAura_1"),
                List.of("UnitAbility_DefensiveAura_1"),
                List.of("+5 Additional Defense while Defending"),
                List.of(),
                List.of()
        ));

        assertThat(snapshot.unitKey()).isEqualTo("Unit_MinorFaction_Xavius");
        assertThat(snapshot.faction()).isEqualTo("Xavius");
        assertThat(snapshot.isMajorFaction()).isFalse();
        assertThat(snapshot.nextEvolutionUnitKeys()).containsExactly("Unit_MinorFaction_Xavius_Upgraded");
    }

    @Test
    void stillBlocksNonXaviusMangroveOfHarmonyRows() {
        UnitImportSnapshot snapshot = UnitImportMapper.toSnapshot(new UnitImportUnitDto(
                "Unit_MinorFaction_MangroveOfHarmony",
                "Rootstalk",
                "MangroveOfHarmony",
                false,
                false,
                false,
                "Land",
                null,
                List.of("Unit_MinorFaction_MangroveOfHarmony_Upgraded"),
                0,
                "UnitClass_Juggernaught",
                null,
                List.of(),
                List.of(),
                List.of("+3 Vision Range"),
                List.of(),
                List.of()
        ));

        assertThat(snapshot.unitKey()).isEqualTo("Unit_MinorFaction_MangroveOfHarmony");
        assertThat(snapshot.faction()).isNull();
    }
}
