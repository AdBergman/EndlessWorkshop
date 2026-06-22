package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.heroes.HeroImportBatchDto;

public interface RichHeroImportAdminFacade {
    ImportSummaryDto importHeroes(HeroImportBatchDto file);
}
