package ewshop.facade.impl;

import ewshop.domain.service.QuestChronicleReadService;
import ewshop.facade.dto.response.quests.QuestChronicleDto;
import ewshop.facade.interfaces.QuestChronicleFacade;
import ewshop.facade.mapper.QuestChronicleMapper;

public class QuestChronicleFacadeImpl implements QuestChronicleFacade {

    private final QuestChronicleReadService questChronicleReadService;

    public QuestChronicleFacadeImpl(QuestChronicleReadService questChronicleReadService) {
        this.questChronicleReadService = questChronicleReadService;
    }

    @Override
    public QuestChronicleDto getQuestChronicle() {
        return QuestChronicleMapper.toDto(questChronicleReadService.getQuestChronicle());
    }
}
