package ewshop.domain.service;

import ewshop.domain.model.quest.QuestChronicle;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.QuestChronicleRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuestChronicleImportService {

    private final QuestChronicleRepository questChronicleRepository;

    public QuestChronicleImportService(QuestChronicleRepository questChronicleRepository) {
        this.questChronicleRepository = questChronicleRepository;
    }

    @Transactional
    @CacheEvict(value = "questChronicle", allEntries = true)
    public ImportResult importChronicle(QuestChronicle chronicle) {
        if (chronicle == null || chronicle.entries().isEmpty()) return new ImportResult();
        return questChronicleRepository.replaceQuestChronicle(chronicle);
    }
}
