package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.ImportSmokeSummaryDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;

public interface UnitImportAdminFacade {
    ImportSummaryDto importUnits(UnitImportBatchDto dto);
    ImportSmokeSummaryDto smokeTestUnits(UnitImportBatchDto dto);
}
