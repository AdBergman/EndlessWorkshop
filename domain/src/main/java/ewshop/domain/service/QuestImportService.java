package ewshop.domain.service;

import ewshop.domain.command.QuestImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.QuestRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuestImportService {

    private final QuestRepository questRepository;

    public QuestImportService(QuestRepository questRepository) {
        this.questRepository = questRepository;
    }

    @Transactional
    @CacheEvict(value = "quests", allEntries = true)
    public ImportResult importQuests(QuestImportSnapshot snapshot) {
        if (snapshot == null || snapshot.quests().isEmpty()) return new ImportResult();
        return questRepository.importQuestSnapshot(snapshot);
    }
}
