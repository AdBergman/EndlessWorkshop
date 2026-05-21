package ewshop.domain.service;

import ewshop.domain.model.quest.QuestExplorer;
import ewshop.domain.repository.QuestExplorerRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuestExplorerReadService {

    private final QuestExplorerRepository questExplorerRepository;

    public QuestExplorerReadService(QuestExplorerRepository questExplorerRepository) {
        this.questExplorerRepository = questExplorerRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("questExplorer")
    public QuestExplorer getQuestExplorer() {
        return questExplorerRepository.findQuestExplorer();
    }
}
