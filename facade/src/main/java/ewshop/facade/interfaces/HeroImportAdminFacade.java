package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.heroes.HeroImportBatchDto;

public interface HeroImportAdminFacade {
    ImportSummaryDto importHeroes(HeroImportBatchDto file);
}
