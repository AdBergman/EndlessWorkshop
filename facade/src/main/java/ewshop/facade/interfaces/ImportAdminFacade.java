package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.tech.TechImportBatchDto;

public interface ImportAdminFacade {
    void importTechs(TechImportBatchDto file);
}