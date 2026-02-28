package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;

public interface CodexImportAdminFacade {

    ImportSummaryDto importCodex(CodexImportBatchDto file);

}