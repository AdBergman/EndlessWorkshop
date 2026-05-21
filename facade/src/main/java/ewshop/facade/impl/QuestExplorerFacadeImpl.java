package ewshop.facade.impl;

import ewshop.domain.service.QuestExplorerReadService;
import ewshop.facade.dto.response.quests.QuestExplorerDto;
import ewshop.facade.interfaces.QuestExplorerFacade;
import ewshop.facade.mapper.QuestExplorerMapper;

public class QuestExplorerFacadeImpl implements QuestExplorerFacade {

    private final QuestExplorerReadService questExplorerReadService;

    public QuestExplorerFacadeImpl(QuestExplorerReadService questExplorerReadService) {
        this.questExplorerReadService = questExplorerReadService;
    }

    @Override
    public QuestExplorerDto getQuestExplorer() {
        return QuestExplorerMapper.toDto(questExplorerReadService.getQuestExplorer());
    }
}
