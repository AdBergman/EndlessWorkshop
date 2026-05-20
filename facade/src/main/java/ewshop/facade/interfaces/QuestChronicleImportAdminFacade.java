package ewshop.facade.interfaces;

import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.quests.QuestChronicleImportBatchDto;

public interface QuestChronicleImportAdminFacade {

    ImportSummaryDto importQuestChronicle(QuestChronicleImportBatchDto file);
}
