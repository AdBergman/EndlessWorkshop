package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;

public interface DistrictImportAdminFacade {
    ImportSummaryDto importDistricts(DistrictImportBatchDto file);
}