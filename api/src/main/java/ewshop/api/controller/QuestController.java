package ewshop.api.controller;

import ewshop.facade.dto.response.quests.QuestChronicleDto;
import ewshop.facade.interfaces.QuestChronicleFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class QuestController {

    private final QuestChronicleFacade questChronicleFacade;

    public QuestController(QuestChronicleFacade questChronicleFacade) {
        this.questChronicleFacade = questChronicleFacade;
    }

    @GetMapping("/api/quests/chronicle")
    public QuestChronicleDto getQuestChronicle() {
        return questChronicleFacade.getQuestChronicle();
    }
}
