package ewshop.facade.interfaces;

import ewshop.facade.dto.response.importing.AdminLatestImportDto;
import ewshop.facade.dto.response.importing.DataFreshnessDto;
import ewshop.facade.dto.importing.ImportSummaryDto;

import java.time.Instant;

public interface ImportHistoryFacade {

    DataFreshnessDto getLatestDataFreshness();

    AdminLatestImportDto getLatestImport();

    void recordManualAdminImport(
            String filename,
            String exportKind,
            String importKind,
            String game,
            String gameVersion,
            String exporterVersion,
            String exportedAtUtc,
            String schemaVersion,
            Instant startedAtUtc,
            ImportSummaryDto summary
    );

    void recordFailedManualAdminImport(
            String filename,
            String exportKind,
            String importKind,
            String game,
            String gameVersion,
            String exporterVersion,
            String exportedAtUtc,
            String schemaVersion,
            Instant startedAtUtc,
            String errorMessage
    );
}
