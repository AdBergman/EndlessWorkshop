package ewshop.domain.repository;

import ewshop.domain.command.QuestImportSnapshot;
import ewshop.domain.model.quest.QuestExplorer;
import ewshop.domain.model.results.ImportResult;

public interface QuestRepository {

    ImportResult importQuestSnapshot(QuestImportSnapshot snapshot);

    QuestExplorer findQuestExplorer();
}
