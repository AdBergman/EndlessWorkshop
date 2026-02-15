package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;

public interface ImprovementImportAdminFacade {
    ImportSummaryDto importImprovements(ImprovementImportBatchDto dto);
}