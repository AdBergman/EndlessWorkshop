package ewshop.api.controller;

import ewshop.facade.dto.response.quests.QuestExplorerDto;
import ewshop.facade.interfaces.QuestFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class QuestController {

    private final QuestFacade questFacade;

    public QuestController(QuestFacade questFacade) {
        this.questFacade = questFacade;
    }

    @GetMapping("/api/quests")
    public QuestExplorerDto getQuestExplorer() {
        return questFacade.getQuestExplorer();
    }
}
