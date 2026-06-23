package ewshop.facade.interfaces;

import ewshop.facade.dto.response.importing.AdminLatestImportDto;
import ewshop.facade.dto.response.importing.DataFreshnessDto;

public interface ImportHistoryFacade {

    DataFreshnessDto getLatestDataFreshness();

    AdminLatestImportDto getLatestImport();
}
