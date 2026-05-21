package ewshop.domain.repository;

import ewshop.domain.command.QuestExplorerEntryImportSnapshot;
import ewshop.domain.command.QuestExplorerImportMetadata;
import ewshop.domain.model.quest.QuestExplorer;
import ewshop.domain.model.results.ImportResult;

import java.util.List;

public interface QuestExplorerRepository {

    ImportResult importQuestExplorerEntries(
            QuestExplorerImportMetadata metadata,
            List<QuestExplorerEntryImportSnapshot> snapshots
    );

    QuestExplorer findQuestExplorer();
}
