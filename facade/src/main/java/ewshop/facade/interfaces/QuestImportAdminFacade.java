package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.quests.QuestImportBatchDto;

public interface QuestImportAdminFacade {

    ImportSummaryDto importQuests(QuestImportBatchDto file);
}
