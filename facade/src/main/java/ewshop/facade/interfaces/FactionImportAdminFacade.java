package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.factions.FactionImportBatchDto;

public interface FactionImportAdminFacade {
    ImportSummaryDto importFactions(FactionImportBatchDto file);
}
