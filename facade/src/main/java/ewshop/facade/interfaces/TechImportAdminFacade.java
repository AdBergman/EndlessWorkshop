package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;

public interface TechImportAdminFacade {
    ImportSummaryDto importTechs(TechImportBatchDto file);
}