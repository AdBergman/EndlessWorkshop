package ewshop.facade.impl;

import ewshop.domain.service.UnitImportService;
import ewshop.facade.dto.importing.ImportPreviewSummaryDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportUnitDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UnitImportAdminFacadeImplTest {

    private final UnitImportAdminFacadeImpl facade =
            new UnitImportAdminFacadeImpl(new UnitImportService(null), null);

    @Test
    void smokeTestUnits_reportsRowsFilteredBeforePersistence() {
        UnitImportBatchDto file = new UnitImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "2026-06-06T00:00:00Z",
                "units",
                List.of(
                        unit("Unit_Kin_Visible", "Kin", true, "UnitClass_Ranged", null),
                        unit("Unit_Kin_Hidden", "Kin", true, "UnitClass_Ranged", false),
                        unit("Unit_Kin_Prototype", "Kin", true, "UnitClass_Prototype_LandUnit", true),
                        unit("Unit_Unknown", "FutureFaction", true, "UnitClass_Ranged", true)
                )
        );

        ImportPreviewSummaryDto summary = facade.smokeTestUnits(file);

        assertThat(summary.kind()).isEqualTo("units");
        assertThat(summary.received()).isEqualTo(4);
        assertThat(summary.valid()).isEqualTo(3);
        assertThat(summary.importable()).isEqualTo(1);
        assertThat(summary.filtered()).isEqualTo(2);
        assertThat(summary.failed()).isEqualTo(1);
        assertThat(summary.filters()).anySatisfy(filter -> {
            assertThat(filter.code()).isEqualTo("MISSING_OR_FILTERED_FACTION");
            assertThat(filter.count()).isEqualTo(1);
        });
        assertThat(summary.filters()).anySatisfy(filter -> {
            assertThat(filter.code()).isEqualTo("PROTOTYPE_UNIT_CLASS");
            assertThat(filter.count()).isEqualTo(1);
        });
        assertThat(summary.errors()).hasSize(1);
    }

    private static UnitImportUnitDto unit(
            String unitKey,
            String faction,
            boolean majorFaction,
            String unitClassKey,
            Boolean isPlayerFacing
    ) {
        return new UnitImportUnitDto(
                unitKey,
                unitKey,
                faction,
                majorFaction,
                false,
                false,
                "Land",
                null,
                List.of(),
                0,
                unitClassKey,
                null,
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                false,
                isPlayerFacing,
                false,
                false,
                false,
                false
        );
    }
}
