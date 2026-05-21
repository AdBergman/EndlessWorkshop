package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBatchDto;

public interface QuestExplorerImportAdminFacade {

    ImportSummaryDto importQuestExplorer(QuestExplorerImportBatchDto file);
}
