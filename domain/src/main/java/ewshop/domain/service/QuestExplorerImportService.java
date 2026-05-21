package ewshop.domain.service;

import ewshop.domain.command.QuestExplorerEntryImportSnapshot;
import ewshop.domain.command.QuestExplorerImportMetadata;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.QuestExplorerRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuestExplorerImportService {

    private final QuestExplorerRepository questExplorerRepository;

    public QuestExplorerImportService(QuestExplorerRepository questExplorerRepository) {
        this.questExplorerRepository = questExplorerRepository;
    }

    @Transactional
    @CacheEvict(value = "questExplorer", allEntries = true)
    public ImportResult importQuestExplorer(
            QuestExplorerImportMetadata metadata,
            List<QuestExplorerEntryImportSnapshot> snapshots
    ) {
        if (snapshots == null || snapshots.isEmpty()) return new ImportResult();
        return questExplorerRepository.importQuestExplorerEntries(metadata, snapshots);
    }
}
