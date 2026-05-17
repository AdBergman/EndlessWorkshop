package ewshop.facade.impl;

import ewshop.domain.service.QuestService;
import ewshop.facade.dto.response.quests.QuestExplorerDto;
import ewshop.facade.interfaces.QuestFacade;
import ewshop.facade.mapper.QuestMapper;

public class QuestFacadeImpl implements QuestFacade {

    private final QuestService questService;

    public QuestFacadeImpl(QuestService questService) {
        this.questService = questService;
    }

    @Override
    public QuestExplorerDto getQuestExplorer() {
        return QuestMapper.toDto(questService.getQuestExplorer());
    }
}
