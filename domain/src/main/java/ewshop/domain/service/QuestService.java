package ewshop.domain.service;

import ewshop.domain.model.quest.QuestExplorer;
import ewshop.domain.repository.QuestRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuestService {

    private final QuestRepository questRepository;

    public QuestService(QuestRepository questRepository) {
        this.questRepository = questRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("quests")
    public QuestExplorer getQuestExplorer() {
        return questRepository.findQuestExplorer();
    }
}
