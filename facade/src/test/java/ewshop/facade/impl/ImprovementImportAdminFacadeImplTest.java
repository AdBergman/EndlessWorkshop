package ewshop.facade.impl;

import ewshop.domain.command.ImprovementImportSnapshot;
import ewshop.domain.model.Improvement;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.service.ImprovementImportService;
import ewshop.domain.service.ImprovementService;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.constructibles.ConstructibleNeighbourPlacementDto;
import ewshop.facade.dto.importing.constructibles.ConstructiblePlacementPrerequisitesDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportImprovementDto;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImprovementImportAdminFacadeImplTest {

    @Test
    void importImprovements_reportsDiagnosticsAndWarningCodes() {
        RecordingImprovementImportService importService = new RecordingImprovementImportService(importResultWithInsert());
        RecordingImprovementService improvementService = new RecordingImprovementService();
        ImprovementImportAdminFacadeImpl facade = new ImprovementImportAdminFacadeImpl(importService, improvementService);

        ImportSummaryDto summary = facade.importImprovements(new ImprovementImportBatchDto(
                "Endless Legend 2",
                "0.80",
                null,
                "",
                "improvements",
                List.of(new ImprovementImportImprovementDto(
                        "Improvement_A",
                        "Improvement A",
                        "",
                        List.of(),
                        List.of("Technology_Improvement_A"),
                        new ConstructiblePlacementPrerequisitesDto(
                                new ConstructibleNeighbourPlacementDto("AnyTile", "SameRegion", false)
                        )
                ))
        ));

        assertThat(summary.importKind()).isEqualTo("improvements");
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
        ImprovementImportSnapshot snapshot = importService.snapshots.getFirst();
        assertThat(snapshot.unlockTechnologyKeys()).containsExactly("Technology_Improvement_A");
        assertThat(snapshot.placementPrerequisites()).isNotNull();
        assertThat(snapshot.placementPrerequisites().neighbourTiles().operator()).isEqualTo("AnyTile");
        assertThat(snapshot.placementPrerequisites().neighbourTiles().territoryConstraint()).isEqualTo("SameRegion");
        assertThat(snapshot.placementPrerequisites().neighbourTiles().ignoreCliff()).isFalse();
        assertThat(improvementService.getAllCalls).isEqualTo(1);
    }

    @Test
    void importImprovements_returnsFailedSummaryWhenAllRowsAreInvalid() {
        RecordingImprovementImportService importService = new RecordingImprovementImportService(importResultWithInsert());
        RecordingImprovementService improvementService = new RecordingImprovementService();
        ImprovementImportAdminFacadeImpl facade = new ImprovementImportAdminFacadeImpl(importService, improvementService);

        ImportSummaryDto summary = facade.importImprovements(new ImprovementImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "2026-06-07T00:00:00Z",
                "improvements",
                List.of(new ImprovementImportImprovementDto(null, "Missing Key", "Economy", List.of("Line")))
        ));

        assertThat(summary.counts().received()).isEqualTo(1);
        assertThat(summary.counts().failed()).isEqualTo(1);
        assertThat(summary.counts().inserted()).isZero();
        assertThat(summary.diagnostics().errors()).hasSize(1);
        assertThat(summary.diagnostics().errors().getFirst().code()).isEqualTo("IMPROVEMENT_IMPORT_INVALID_ROW");
        assertThat(summary.diagnostics().errors().getFirst().details())
                .isEqualTo("Missing required field: constructibleKey");
        assertThat(importService.called).isFalse();
        assertThat(improvementService.getAllCalls).isZero();
    }

    @Test
    void importImprovements_rejectsDuplicateConstructibleKeys() {
        ImprovementImportAdminFacadeImpl facade = new ImprovementImportAdminFacadeImpl(
                new RecordingImprovementImportService(importResultWithInsert()),
                new RecordingImprovementService()
        );

        ImprovementImportBatchDto file = new ImprovementImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "2026-06-07T00:00:00Z",
                "improvements",
                List.of(
                        new ImprovementImportImprovementDto("Improvement_A", "Improvement A", "Economy", List.of("Line")),
                        new ImprovementImportImprovementDto("Improvement_A", "Improvement A 2", "Economy", List.of("Line"))
                )
        );

        assertThatThrownBy(() -> facade.importImprovements(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Duplicate constructibleKey in import file: Improvement_A");
    }

    private static ImportResult importResultWithInsert() {
        ImportResult result = new ImportResult();
        result.incrementInserted();
        return result;
    }

    private static final class RecordingImprovementImportService extends ImprovementImportService {
        private final ImportResult result;
        private List<ImprovementImportSnapshot> snapshots = List.of();
        private boolean called;

        private RecordingImprovementImportService(ImportResult result) {
            super(null);
            this.result = result;
        }

        @Override
        public ImportResult importImprovements(List<ImprovementImportSnapshot> snapshots) {
            this.called = true;
            this.snapshots = new ArrayList<>(snapshots);
            return result;
        }
    }

    private static final class RecordingImprovementService extends ImprovementService {
        private int getAllCalls;

        private RecordingImprovementService() {
            super(null);
        }

        @Override
        public List<Improvement> getAllImprovements() {
            getAllCalls++;
            return List.of();
        }
    }
}
