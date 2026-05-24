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
                safeList(model.entries()).stream().map(QuestExplorerMapper::toDto).toList(),
                toDto(model.progression())
        );
    }

    private static QuestExplorerDto.ProgressionDto toDto(QuestExplorer.Progression model) {
        return model == null ? null : new QuestExplorerDto.ProgressionDto(
                model.questlines().stream().map(QuestExplorerMapper::toDto).toList(),
                toDto(model.debugSummary())
        );
    }

    private static QuestExplorerDto.QuestlineDto toDto(QuestExplorer.Questline model) {
        return new QuestExplorerDto.QuestlineDto(
                model.questLineKey(),
                model.questLineFamilyKey(),
                model.questLineName(),
                model.factionKey(),
                model.factionFamilyKey(),
                model.factionName(),
                model.sourceQuestLineKeys(),
                model.sourceFactionKeys(),
                model.chapters().stream().map(QuestExplorerMapper::toDto).toList()
        );
    }

    private static QuestExplorerDto.ChapterDto toDto(QuestExplorer.Chapter model) {
        return new QuestExplorerDto.ChapterDto(
                model.chapterNumber(),
                model.chapterOrder(),
                model.title(),
                model.steps().stream().map(QuestExplorerMapper::toDto).toList()
        );
    }

    private static QuestExplorerDto.StepDto toDto(QuestExplorer.Step model) {
        return new QuestExplorerDto.StepDto(
                model.stepKey(),
                model.stepNumber(),
                model.stepOrder(),
                model.title(),
                model.projectionKind(),
                model.detailEntryKey(),
                model.sourceEntryKeys(),
                model.aliasEntryKeys(),
                model.variants().stream().map(QuestExplorerMapper::toDto).toList()
        );
    }

    private static QuestExplorerDto.VariantDto toDto(QuestExplorer.Variant model) {
        return new QuestExplorerDto.VariantDto(
                model.entryKey(),
                model.title(),
                model.variantKind(),
                model.branchGroupKey(),
                model.branchLabel(),
                model.branchOrder(),
                model.previousEntryKeys(),
                model.nextEntryKeys(),
                model.failureEntryKeys(),
                model.convergesIntoEntryKeys()
        );
    }

    private static QuestExplorerDto.ProgressionDebugSummaryDto toDto(QuestExplorer.ProgressionDebugSummary model) {
        return model == null ? null : new QuestExplorerDto.ProgressionDebugSummaryDto(
                model.totalEntries(),
                model.questlineFamiliesFound(),
                model.questlines().stream().map(QuestExplorerMapper::toDto).toList(),
                model.missingMajorFactionChapters().stream().map(QuestExplorerMapper::toDto).toList(),
                model.chaptersWithOnlyOneStep().stream().map(QuestExplorerMapper::toDto).toList(),
                model.numericQuestlineVariantsCollapsed().stream().map(QuestExplorerMapper::toDto).toList(),
                model.entriesWithMissingChapterOrStepOrder(),
                model.suspiciousBranchVariantsWithoutParentStep(),
                model.tutorialEntriesPlaced()
        );
    }

    private static QuestExplorerDto.QuestlineDebugSummaryDto toDto(QuestExplorer.QuestlineDebugSummary model) {
        return new QuestExplorerDto.QuestlineDebugSummaryDto(
                model.questLineFamilyKey(),
                model.factionFamilyKey(),
                model.sourceQuestLineKeys(),
                model.chapters().stream().map(QuestExplorerMapper::toDto).toList()
        );
    }

    private static QuestExplorerDto.ChapterDebugSummaryDto toDto(QuestExplorer.ChapterDebugSummary model) {
        return new QuestExplorerDto.ChapterDebugSummaryDto(
                model.chapterOrder(),
                model.chapterNumber(),
                model.title(),
                model.stepCount(),
                model.steps().stream().map(QuestExplorerMapper::toDto).toList()
        );
    }

    private static QuestExplorerDto.StepDebugSummaryDto toDto(QuestExplorer.StepDebugSummary model) {
        return new QuestExplorerDto.StepDebugSummaryDto(
                model.stepKey(),
                model.stepOrder(),
                model.stepNumber(),
                model.projectionKind(),
                model.detailEntryKey(),
                model.sourceEntryKeys(),
                model.aliasEntryKeys(),
                model.variantCount(),
                model.branchVariantCount()
        );
    }

    private static QuestExplorerDto.MissingMajorFactionChaptersDto toDto(QuestExplorer.MissingMajorFactionChapters model) {
        return new QuestExplorerDto.MissingMajorFactionChaptersDto(
                model.questLineFamilyKey(),
                model.factionFamilyKey(),
                model.missingChapterNumbers()
        );
    }

    private static QuestExplorerDto.ChapterWithOneStepDto toDto(QuestExplorer.ChapterWithOneStep model) {
        return new QuestExplorerDto.ChapterWithOneStepDto(
                model.questLineFamilyKey(),
                model.factionFamilyKey(),
                model.chapterOrder(),
                model.title()
        );
    }

    private static QuestExplorerDto.NumericQuestlineVariantCollapseDto toDto(QuestExplorer.NumericQuestlineVariantCollapse model) {
        return new QuestExplorerDto.NumericQuestlineVariantCollapseDto(
                model.sourceQuestLineKey(),
                model.sourceFactionKey(),
                model.targetQuestLineFamilyKey(),
                model.targetFactionFamilyKey(),
                model.entryCount(),
                model.reason()
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
                model.groupLabel(), model.branchStepOrder(), model.parentBranchKey(), model.parentChoiceKey(),
                model.prerequisiteBranchKeys(), model.prerequisiteBranchPath(), model.choiceGroupKey(),
                model.convergenceGroupKey(), model.sectionRole(), model.nextEntryKeys(), model.failureEntryKeys(), model.convergesIntoEntryKeys(),
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
