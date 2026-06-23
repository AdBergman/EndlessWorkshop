package ewshop.facade.impl;

import ewshop.domain.command.DistrictImportSnapshot;
import ewshop.domain.model.District;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.DistrictImportService;
import ewshop.domain.service.DistrictService;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.constructibles.ConstructibleNeighbourPlacementDto;
import ewshop.facade.dto.importing.constructibles.ConstructiblePlacementPrerequisitesDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportDistrictDto;
import ewshop.facade.dto.importing.districts.DistrictLevelUpDto;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DistrictImportAdminFacadeImplTest {

    @Test
    void importDistricts_reportsDiagnosticsAndWarningCodes() {
        RecordingDistrictImportService importService = new RecordingDistrictImportService(importResultWithInsert());
        RecordingDistrictService districtService = new RecordingDistrictService();
        DistrictImportAdminFacadeImpl facade = new DistrictImportAdminFacadeImpl(importService, districtService);

        ImportSummaryDto summary = facade.importDistricts(new DistrictImportBatchDto(
                "Endless Legend 2",
                "0.80",
                null,
                "",
                "districts",
                List.of(new DistrictImportDistrictDto(
                        "District_A",
                        "District A",
                        "",
                        List.of(),
                        List.of("Technology_District_A"),
                        new DistrictLevelUpDto("District_B", 2),
                        new ConstructiblePlacementPrerequisitesDto(
                                new ConstructibleNeighbourPlacementDto("AnyTile", "SameRegion", true)
                        )
                ))
        ));

        assertThat(summary.importKind()).isEqualTo("districts");
        assertThat(summary.counts().received()).isEqualTo(1);
        assertThat(summary.counts().inserted()).isEqualTo(1);
        assertThat(summary.counts().failed()).isZero();
        assertThat(summary.diagnostics().warnings()).extracting("code")
                .containsExactly(
                        "EMPTY_CATEGORY_IN_FILE",
                        "EMPTY_DESCRIPTION_LINES_IN_FILE",
                        "MISSING_EXPORTER_VERSION",
                        "MISSING_EXPORTED_AT_UTC"
                );
        assertThat(summary.diagnostics().details().receivedDistinctKeys()).isEqualTo(1);
        assertThat(summary.diagnostics().details().duplicatesInFile()).isZero();
        assertThat(importService.snapshots).hasSize(1);
        DistrictImportSnapshot snapshot = importService.snapshots.getFirst();
        assertThat(snapshot.unlockTechnologyKeys()).containsExactly("Technology_District_A");
        assertThat(snapshot.levelUp()).isNotNull();
        assertThat(snapshot.levelUp().targetDistrictKey()).isEqualTo("District_B");
        assertThat(snapshot.levelUp().requiredAdjacentDistrictCount()).isEqualTo(2);
        assertThat(snapshot.placementPrerequisites()).isNotNull();
        assertThat(snapshot.placementPrerequisites().neighbourTiles().operator()).isEqualTo("AnyTile");
        assertThat(snapshot.placementPrerequisites().neighbourTiles().territoryConstraint()).isEqualTo("SameRegion");
        assertThat(snapshot.placementPrerequisites().neighbourTiles().ignoreCliff()).isTrue();
        assertThat(districtService.getAllCalls).isEqualTo(1);
    }

    @Test
    void importDistricts_returnsFailedSummaryWhenAllRowsAreInvalid() {
        RecordingDistrictImportService importService = new RecordingDistrictImportService(importResultWithInsert());
        RecordingDistrictService districtService = new RecordingDistrictService();
        DistrictImportAdminFacadeImpl facade = new DistrictImportAdminFacadeImpl(importService, districtService);

        ImportSummaryDto summary = facade.importDistricts(new DistrictImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "2026-06-07T00:00:00Z",
                "districts",
                List.of(new DistrictImportDistrictDto(null, "Missing Key", "Science", List.of("Line")))
        ));

        assertThat(summary.counts().received()).isEqualTo(1);
        assertThat(summary.counts().failed()).isEqualTo(1);
        assertThat(summary.counts().inserted()).isZero();
        assertThat(summary.diagnostics().errors()).hasSize(1);
        assertThat(summary.diagnostics().errors().getFirst().code()).isEqualTo("DISTRICT_IMPORT_INVALID_ROW");
        assertThat(importService.called).isFalse();
        assertThat(districtService.getAllCalls).isZero();
    }

    @Test
    void importDistricts_rejectsDuplicateDistrictKeys() {
        DistrictImportAdminFacadeImpl facade = new DistrictImportAdminFacadeImpl(
                new RecordingDistrictImportService(importResultWithInsert()),
                new RecordingDistrictService()
        );

        DistrictImportBatchDto file = new DistrictImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "2026-06-07T00:00:00Z",
                "districts",
                List.of(
                        new DistrictImportDistrictDto("District_A", "District A", "Science", List.of("Line")),
                        new DistrictImportDistrictDto("District_A", "District A 2", "Science", List.of("Line"))
                )
        );

        assertThatThrownBy(() -> facade.importDistricts(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Duplicate districtKey in import file: District_A");
    }

    private static ImportResult importResultWithInsert() {
        ImportResult result = new ImportResult();
        result.incrementInserted();
        return result;
    }

    private static final class RecordingDistrictImportService extends DistrictImportService {
        private final ImportResult result;
        private List<DistrictImportSnapshot> snapshots = List.of();
        private boolean called;

        private RecordingDistrictImportService(ImportResult result) {
            super(null);
            this.result = result;
        }

        @Override
        public ImportResult importDistricts(List<DistrictImportSnapshot> snapshots) {
            this.called = true;
            this.snapshots = new ArrayList<>(snapshots);
            return result;
        }
    }

    private static final class RecordingDistrictService extends DistrictService {
        private int getAllCalls;

        private RecordingDistrictService() {
            super(null);
        }

        @Override
        public List<District> getAllDistricts() {
            getAllCalls++;
            return List.of();
        }
    }
}
