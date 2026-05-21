package ewshop.facade.mapper;

import ewshop.domain.model.quest.QuestExplorer;
import ewshop.facade.dto.response.quests.QuestExplorerDto;

import java.util.List;

public final class QuestExplorerMapper {

    public static final String EXPORT_KIND = "quest_explorer";
    public static final String SCHEMA_VERSION = "quest_explorer.v3";

    private QuestExplorerMapper() {}

    public static QuestExplorerDto toDto(QuestExplorer model) {
        if (model == null) {
            return new QuestExplorerDto(null, null, null, EXPORT_KIND, SCHEMA_VERSION, List.of());
        }

        return new QuestExplorerDto(
                model.gameVersion(),
                model.exporterVersion(),
                model.exportedAtUtc(),
                model.exportKind(),
                model.schemaVersion(),
                safeList(model.entries()).stream().map(QuestExplorerMapper::toDto).toList()
        );
    }

    private static QuestExplorerDto.EntryDto toDto(QuestExplorer.Entry model) {
        return new QuestExplorerDto.EntryDto(
                model.entryKey(),
                model.title(),
                model.summaryLines(),
                model.questType(),
                model.isMandatory(),
                model.isKeyNarrativeBeat(),
                model.aliases(),
                toDto(model.navigation()),
                toDto(model.loreView()),
                toDto(model.strategyView()),
                model.branches().stream().map(QuestExplorerMapper::toDto).toList(),
                toDto(model.quality())
        );
    }

    private static QuestExplorerDto.NavigationDto toDto(QuestExplorer.Navigation model) {
        return new QuestExplorerDto.NavigationDto(
                model.factionKey(), model.factionName(), model.questLineKey(), model.questLineName(),
                model.chapter(), model.chapterLabel(), model.step(), model.stepLabel(), model.sequenceIndex(),
                model.chapterOrder(), model.stepOrder(), model.branchGroupKey(), model.branchLabel(),
                model.branchOrder(), model.isBranchStart(), model.isBranchEnd(), model.previousEntryKeys(),
                model.nextEntryKeys(), model.failureEntryKeys(), model.convergesIntoEntryKeys()
        );
    }

    private static QuestExplorerDto.LoreViewDto toDto(QuestExplorer.LoreView model) {
        return new QuestExplorerDto.LoreViewDto(model.sections().stream().map(QuestExplorerMapper::toDto).toList());
    }

    private static QuestExplorerDto.LoreSectionDto toDto(QuestExplorer.LoreSection model) {
        return new QuestExplorerDto.LoreSectionDto(
                model.sectionKey(), model.phase(), model.choiceKey(), model.stepIndex(), model.objectiveKey(),
                model.lines().stream().map(QuestExplorerMapper::toDto).toList()
        );
    }

    private static QuestExplorerDto.LoreLineDto toDto(QuestExplorer.LoreLine model) {
        return new QuestExplorerDto.LoreLineDto(model.speakerLabel(), model.role(), model.text());
    }

    private static QuestExplorerDto.StrategyViewDto toDto(QuestExplorer.StrategyView model) {
        return new QuestExplorerDto.StrategyViewDto(model.objectives().stream().map(QuestExplorerMapper::toDto).toList());
    }

    private static QuestExplorerDto.ObjectiveDto toDto(QuestExplorer.Objective model) {
        return new QuestExplorerDto.ObjectiveDto(
                model.objectiveKey(), model.text(), model.phase(),
                model.requirements().stream().map(QuestExplorerMapper::toDto).toList(),
                model.rewards().stream().map(QuestExplorerMapper::toDto).toList()
        );
    }

    private static QuestExplorerDto.BranchDto toDto(QuestExplorer.Branch model) {
        return new QuestExplorerDto.BranchDto(
                model.branchKey(), model.choiceKey(), model.label(), model.orderIndex(), model.groupKey(),
                model.groupLabel(), model.nextEntryKeys(), model.failureEntryKeys(), model.convergesIntoEntryKeys(),
                toDto(model.lore()), toDto(model.strategy())
        );
    }

    private static QuestExplorerDto.BranchLoreDto toDto(QuestExplorer.BranchLore model) {
        return model == null ? null : new QuestExplorerDto.BranchLoreDto(model.outcomePreviewLines());
    }

    private static QuestExplorerDto.BranchStrategyDto toDto(QuestExplorer.BranchStrategy model) {
        return model == null ? null : new QuestExplorerDto.BranchStrategyDto(
                model.conditions(),
                model.requirements().stream().map(QuestExplorerMapper::toDto).toList(),
                model.rewards().stream().map(QuestExplorerMapper::toDto).toList()
        );
    }

    private static QuestExplorerDto.RequirementDto toDto(QuestExplorer.Requirement model) {
        return new QuestExplorerDto.RequirementDto(
                model.requirementKey(), model.kind(), model.displayText(), model.polarity(), model.groupLabel(),
                model.groupOrder(), model.targetRole(), model.targetLabel(), model.requiredCount(),
                model.durationTurns(), model.state(), model.referenceKind(), model.referenceKey(),
                model.referenceDisplayName(), model.codexEntryKey()
        );
    }

    private static QuestExplorerDto.RewardDto toDto(QuestExplorer.Reward model) {
        return new QuestExplorerDto.RewardDto(
                model.rewardKey(), model.kind(), model.displayText(), model.amount(), model.groupLabel(),
                model.groupOrder(), model.formulaText(), model.assetKind(), model.assetKey(),
                model.assetDisplayName(), model.referenceKind(), model.referenceKey(), model.referenceDisplayName(),
                model.codexEntryKey(), model.targetScopeLabel()
        );
    }

    private static QuestExplorerDto.QualityDto toDto(QuestExplorer.Quality model) {
        return model == null ? null : new QuestExplorerDto.QualityDto(model.warnings());
    }

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }
}
