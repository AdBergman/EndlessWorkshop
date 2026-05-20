package ewshop.domain.repository;

import ewshop.domain.model.quest.QuestChronicle;
import ewshop.domain.model.results.ImportResult;

public interface QuestChronicleRepository {

    ImportResult replaceQuestChronicle(QuestChronicle chronicle);

    QuestChronicle findQuestChronicle();
}
