package ewshop.api.controller;

import ewshop.facade.dto.response.quests.QuestExplorerDto;
import ewshop.facade.interfaces.QuestExplorerFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class QuestController {

    private final QuestExplorerFacade questExplorerFacade;

    public QuestController(QuestExplorerFacade questExplorerFacade) {
        this.questExplorerFacade = questExplorerFacade;
    }

    @GetMapping("/api/quests/explorer")
    public QuestExplorerDto getQuestExplorer() {
        return questExplorerFacade.getQuestExplorer();
    }
}
