package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.tech.TechImportFileDto;

public interface ImportAdminFacade {
    void importTechs(TechImportFileDto file);
}