package ewshop.domain.service;

import ewshop.domain.model.quest.QuestChronicle;
import ewshop.domain.repository.QuestChronicleRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuestChronicleReadService {

    private final QuestChronicleRepository questChronicleRepository;

    public QuestChronicleReadService(QuestChronicleRepository questChronicleRepository) {
        this.questChronicleRepository = questChronicleRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("questChronicle")
    public QuestChronicle getQuestChronicle() {
        return questChronicleRepository.findQuestChronicle();
    }
}
