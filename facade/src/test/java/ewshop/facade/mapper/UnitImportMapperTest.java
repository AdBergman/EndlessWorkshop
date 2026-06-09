package ewshop.facade.mapper;

import ewshop.domain.command.UnitImportSnapshot;
import ewshop.facade.dto.importing.units.UnitImportUnitDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UnitImportMapperTest {

    @Test
    void mapsMangroveOfHarmonyMinorFactionRowsToDisplayName() {
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
        assertThat(snapshot.faction()).isEqualTo("Mangrove of Harmony");
        assertThat(snapshot.isMajorFaction()).isFalse();
        assertThat(snapshot.unitClassKey()).isEqualTo("UnitClass_Juggernaught");
        assertThat(snapshot.unitClassDisplayName()).isEqualTo("Juggernaught");
        assertThat(snapshot.nextEvolutionUnitKeys()).containsExactly("Unit_MinorFaction_Xavius_Upgraded");
    }

    @Test
    void storesUnitClassDisplayNameWhileKeepingRawClassKey() {
        UnitImportSnapshot snapshot = UnitImportMapper.toSnapshot(new UnitImportUnitDto(
                "Unit_LastLord_DustBishopChariot_Upgrade01",
                "Leeching Palanquin",
                "LastLord",
                true,
                false,
                false,
                "Land",
                "Unit_LastLord_DustBishopChariot",
                List.of(),
                1,
                "UnitClass_JuggernaughtRanged",
                null,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of()
        ));

        assertThat(snapshot.unitClassKey()).isEqualTo("UnitClass_JuggernaughtRanged");
        assertThat(snapshot.unitClassDisplayName()).isEqualTo("Juggernaught Ranged");
    }

    @Test
    void storesRootVeterancyProgressionLinesOnNonHeroUnits() {
        UnitImportSnapshot snapshot = UnitImportMapper.toSnapshot(new UnitImportUnitDto(
                "Unit_Kin_Root",
                "Sentinel",
                "Kin",
                true,
                false,
                false,
                "Land",
                null,
                List.of(),
                0,
                "UnitClass_Cavalry",
                null,
                List.of(),
                List.of(),
                List.of("+120 [Health] Health"),
                List.of(),
                List.of()
        ), List.of("Level 5: +10 [Defense] Defense, +25% [Damage] Damage, +25% [Health] Health"));

        assertThat(snapshot.veterancyProgressionLines())
                .containsExactly("Level 5: +10 [Defense] Defense, +25% [Damage] Damage, +25% [Health] Health");
    }

    @Test
    void doesNotStoreVeterancyProgressionLinesOnHeroes() {
        UnitImportSnapshot snapshot = UnitImportMapper.toSnapshot(new UnitImportUnitDto(
                "Hero_Aspect_Archer_0",
                "Xenos",
                "Aspect",
                true,
                true,
                false,
                "Land",
                null,
                List.of(),
                null,
                "UnitClass_Ranged",
                null,
                List.of(),
                List.of(),
                List.of("+80 [Health] Health"),
                List.of(),
                List.of()
        ), List.of("Level 5: +10 [Defense] Defense, +25% [Damage] Damage, +25% [Health] Health"));

        assertThat(snapshot.veterancyProgressionLines()).isEmpty();
    }

    @Test
    void importsNonXaviusMangroveOfHarmonyRows() {
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
        assertThat(snapshot.faction()).isEqualTo("Mangrove of Harmony");
    }

    @Test
    void rejectsUnknownMajorFactionRows() {
        assertThatThrownBy(() -> UnitImportMapper.toSnapshot(new UnitImportUnitDto(
                        "Unit_NewMajorFaction_Scout",
                        "Wayfinder",
                        "NewMajorFaction",
                        true,
                        false,
                        false,
                        "Land",
                        null,
                        List.of(),
                        0,
                        "UnitClass_Ranged",
                        null,
                        List.of(),
                        List.of(),
                        List.of("A future major faction row."),
                        List.of(),
                        List.of()
                )))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unknown imported major faction");
    }

    @Test
    void rejectsUnknownMinorFactionRows() {
        assertThatThrownBy(() -> UnitImportMapper.toSnapshot(new UnitImportUnitDto(
                        "Unit_MinorFaction_NewMinorFaction",
                        "Glimmerhand",
                        "NewMinorFaction",
                        false,
                        false,
                        false,
                        "Land",
                        null,
                        List.of(),
                        0,
                        "UnitClass_Support",
                        null,
                        List.of(),
                        List.of(),
                        List.of("A future minor faction row."),
                        List.of(),
                        List.of()
                )))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unknown imported minor faction");
    }

    @Test
    void filtersExporterHiddenUnitRowsBeforePersistence() {
        UnitImportSnapshot snapshot = UnitImportMapper.toSnapshot(new UnitImportUnitDto(
                "Unit_MinorFaction_MangroveOfHarmony_Final",
                "%Unit_MinorFaction_MangroveOfHarmony_FinalTitle",
                "MangroveOfHarmony",
                false,
                false,
                false,
                "Land",
                "Unit_MinorFaction_MangroveOfHarmony_Upgraded",
                List.of(),
                2,
                "UnitClass_Juggernaught",
                null,
                List.of(),
                List.of(),
                List.of("Placeholder row from exporter metadata."),
                List.of(),
                List.of(),
                false,
                false,
                false,
                false,
                true,
                false
        ));

        assertThat(snapshot.faction()).isNull();
    }
}
