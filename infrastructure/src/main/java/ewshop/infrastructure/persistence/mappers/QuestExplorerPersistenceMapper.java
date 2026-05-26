package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.command.QuestExplorerBranchImportSnapshot;
import ewshop.domain.command.QuestExplorerEntryImportSnapshot;
import ewshop.domain.command.QuestExplorerImportMetadata;
import ewshop.domain.command.QuestExplorerLoreLineImportSnapshot;
import ewshop.domain.command.QuestExplorerLoreSectionImportSnapshot;
import ewshop.domain.command.QuestExplorerNavigationImportSnapshot;
import ewshop.domain.command.QuestExplorerRequirementImportSnapshot;
import ewshop.domain.command.QuestExplorerRewardImportSnapshot;
import ewshop.domain.command.QuestExplorerStrategyObjectiveImportSnapshot;
import ewshop.domain.model.quest.QuestExplorer;
import ewshop.infrastructure.persistence.entities.QuestExplorerEntryEntity;
import ewshop.infrastructure.persistence.entities.QuestExplorerImportMetadataEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class QuestExplorerPersistenceMapper {

    public void applyMetadata(
            QuestExplorerImportMetadataEntity entity,
            QuestExplorerImportMetadata metadata,
            long metadataId
    ) {
        entity.id = metadataId;
        entity.gameVersion = metadata == null ? null : metadata.gameVersion();
        entity.exporterVersion = metadata == null ? null : metadata.exporterVersion();
        entity.exportedAtUtc = metadata == null ? null : metadata.exportedAtUtc();
        entity.exportKind = metadata == null ? "quest_explorer" : metadata.exportKind();
        entity.schemaVersion = metadata == null ? "quest_explorer.v3" : metadata.schemaVersion();
        entity.importedAt = LocalDateTime.now();
    }

    public void applySnapshot(QuestExplorerEntryEntity entity, QuestExplorerEntryImportSnapshot model) {
        entity.entryKey = model.entryKey();
        entity.title = model.title();
        entity.questType = model.questType();
        entity.isMandatory = model.isMandatory();
        entity.isKeyNarrativeBeat = model.isKeyNarrativeBeat();
        entity.summaryLines = mutable(model.summaryLines());
        entity.aliases = mutable(model.aliases());
        entity.qualityWarnings = model.quality() == null ? new ArrayList<>() : mutable(model.quality().warnings());

        entity.navigation = toNavigationEntity(entity, entity.navigation, model.navigation());
        entity.loreSections.clear();
        entity.objectives.clear();
        entity.branches.clear();
        model.loreSections().forEach(section -> entity.loreSections.add(toLoreSectionEntity(entity, section)));
        model.objectives().forEach(objective -> entity.objectives.add(toObjectiveEntity(entity, objective)));
        model.branches().forEach(branch -> entity.branches.add(toBranchEntity(entity, branch)));
    }

    public boolean isUnchanged(QuestExplorerEntryEntity entity, QuestExplorerEntryImportSnapshot snapshot) {
        return normalizeForComparison(toModel(entity)).equals(normalizeForComparison(toModel(snapshot)));
    }

    public QuestExplorer toModel(QuestExplorerImportMetadataEntity metadata, List<QuestExplorerEntryEntity> entries) {
        return new QuestExplorer(
                metadata == null ? null : metadata.gameVersion,
                metadata == null ? null : metadata.exporterVersion,
                metadata == null ? null : metadata.exportedAtUtc,
                metadata == null ? "quest_explorer" : metadata.exportKind,
                metadata == null ? "quest_explorer.v3" : metadata.schemaVersion,
                entries.stream().map(this::toModel).toList()
        );
    }

    private QuestExplorerEntryEntity.NavigationEntity toNavigationEntity(
            QuestExplorerEntryEntity entry,
            QuestExplorerEntryEntity.NavigationEntity entity,
            QuestExplorerNavigationImportSnapshot model
    ) {
        if (entity == null) {
            entity = new QuestExplorerEntryEntity.NavigationEntity();
        }
        entity.entry = entry;
        entity.factionKey = model.factionKey();
        entity.factionName = model.factionName();
        entity.questLineKey = model.questLineKey();
        entity.questLineName = model.questLineName();
        entity.chapter = model.chapter();
        entity.chapterLabel = model.chapterLabel();
        entity.step = model.step();
        entity.stepLabel = model.stepLabel();
        entity.sequenceIndex = model.sequenceIndex();
        entity.chapterOrder = model.chapterOrder();
        entity.stepOrder = model.stepOrder();
        entity.branchGroupKey = model.branchGroupKey();
        entity.branchLabel = model.branchLabel();
        entity.branchOrder = model.branchOrder();
        entity.isBranchStart = model.isBranchStart();
        entity.isBranchEnd = model.isBranchEnd();
        entity.previousEntryKeys = mutable(model.previousEntryKeys());
        entity.nextEntryKeys = mutable(model.nextEntryKeys());
        entity.failureEntryKeys = mutable(model.failureEntryKeys());
        entity.convergesIntoEntryKeys = mutable(model.convergesIntoEntryKeys());
        return entity;
    }

    private QuestExplorerEntryEntity.LoreSectionEntity toLoreSectionEntity(
            QuestExplorerEntryEntity entry,
            QuestExplorerLoreSectionImportSnapshot model
    ) {
        QuestExplorerEntryEntity.LoreSectionEntity entity = new QuestExplorerEntryEntity.LoreSectionEntity();
        entity.entry = entry;
        entity.sectionKey = model.sectionKey();
        entity.phase = model.phase();
        entity.choiceKey = model.choiceKey();
        entity.stepIndex = model.stepIndex();
        entity.objectiveKey = model.objectiveKey();
        entity.revealedByBranchKeys = mutable(model.revealedByBranchKeys());
        entity.revealedByChoiceKeys = mutable(model.revealedByChoiceKeys());
        entity.revealedByBranchPathAlternatives = mutableNested(model.revealedByBranchPathAlternatives());
        model.lines().forEach(line -> entity.lines.add(toLoreLineEntity(entity, line)));
        return entity;
    }

    private QuestExplorerEntryEntity.LoreLineEntity toLoreLineEntity(
            QuestExplorerEntryEntity.LoreSectionEntity section,
            QuestExplorerLoreLineImportSnapshot model
    ) {
        QuestExplorerEntryEntity.LoreLineEntity entity = new QuestExplorerEntryEntity.LoreLineEntity();
        entity.section = section;
        entity.speakerLabel = model.speakerLabel();
        entity.role = model.role();
        entity.text = model.text();
        return entity;
    }

    private QuestExplorerEntryEntity.ObjectiveEntity toObjectiveEntity(
            QuestExplorerEntryEntity entry,
            QuestExplorerStrategyObjectiveImportSnapshot model
    ) {
        QuestExplorerEntryEntity.ObjectiveEntity entity = new QuestExplorerEntryEntity.ObjectiveEntity();
        entity.entry = entry;
        entity.objectiveKey = model.objectiveKey();
        entity.choiceKey = model.choiceKey();
        entity.text = model.text();
        entity.phase = model.phase();
        entity.revealedByBranchKeys = mutable(model.revealedByBranchKeys());
        entity.revealedByChoiceKeys = mutable(model.revealedByChoiceKeys());
        entity.revealedByBranchPathAlternatives = mutableNested(model.revealedByBranchPathAlternatives());
        model.requirements().forEach(requirement -> entity.requirements.add(toObjectiveRequirementEntity(entity, requirement)));
        model.rewards().forEach(reward -> entity.rewards.add(toObjectiveRewardEntity(entity, reward)));
        return entity;
    }

    private QuestExplorerEntryEntity.BranchEntity toBranchEntity(
            QuestExplorerEntryEntity entry,
            QuestExplorerBranchImportSnapshot model
    ) {
        QuestExplorerEntryEntity.BranchEntity entity = new QuestExplorerEntryEntity.BranchEntity();
        entity.entry = entry;
        entity.branchKey = model.branchKey();
        entity.choiceKey = model.choiceKey();
        entity.label = model.label();
        entity.orderIndex = model.orderIndex();
        entity.groupKey = model.groupKey();
        entity.groupLabel = model.groupLabel();
        entity.branchStepOrder = model.branchStepOrder();
        entity.parentBranchKey = model.parentBranchKey();
        entity.parentChoiceKey = model.parentChoiceKey();
        entity.prerequisiteBranchKeys = mutable(model.prerequisiteBranchKeys());
        entity.prerequisiteBranchPath = mutable(model.prerequisiteBranchPath());
        entity.revealedByBranchKeys = mutable(model.revealedByBranchKeys());
        entity.revealedByChoiceKeys = mutable(model.revealedByChoiceKeys());
        entity.revealedByBranchPathAlternatives = mutableNested(model.revealedByBranchPathAlternatives());
        entity.choiceGroupKey = model.choiceGroupKey();
        entity.convergenceGroupKey = model.convergenceGroupKey();
        entity.sectionRole = model.sectionRole();
        entity.nextEntryKeys = mutable(model.nextEntryKeys());
        entity.failureEntryKeys = mutable(model.failureEntryKeys());
        entity.convergesIntoEntryKeys = mutable(model.convergesIntoEntryKeys());
        entity.outcomePreviewLines = mutable(model.outcomePreviewLines());
        entity.conditions = mutable(model.conditions());
        model.requirements().forEach(requirement -> entity.requirements.add(toBranchRequirementEntity(entity, requirement)));
        model.rewards().forEach(reward -> entity.rewards.add(toBranchRewardEntity(entity, reward)));
        return entity;
    }

    private QuestExplorerEntryEntity.ObjectiveRequirementEntity toObjectiveRequirementEntity(
            QuestExplorerEntryEntity.ObjectiveEntity objective,
            QuestExplorerRequirementImportSnapshot model
    ) {
        QuestExplorerEntryEntity.ObjectiveRequirementEntity entity = new QuestExplorerEntryEntity.ObjectiveRequirementEntity();
        entity.objective = objective;
        copyRequirement(entity, model);
        return entity;
    }

    private QuestExplorerEntryEntity.BranchRequirementEntity toBranchRequirementEntity(
            QuestExplorerEntryEntity.BranchEntity branch,
            QuestExplorerRequirementImportSnapshot model
    ) {
        QuestExplorerEntryEntity.BranchRequirementEntity entity = new QuestExplorerEntryEntity.BranchRequirementEntity();
        entity.branch = branch;
        copyRequirement(entity, model);
        return entity;
    }

    private QuestExplorerEntryEntity.ObjectiveRewardEntity toObjectiveRewardEntity(
            QuestExplorerEntryEntity.ObjectiveEntity objective,
            QuestExplorerRewardImportSnapshot model
    ) {
        QuestExplorerEntryEntity.ObjectiveRewardEntity entity = new QuestExplorerEntryEntity.ObjectiveRewardEntity();
        entity.objective = objective;
        copyReward(entity, model);
        return entity;
    }

    private QuestExplorerEntryEntity.BranchRewardEntity toBranchRewardEntity(
            QuestExplorerEntryEntity.BranchEntity branch,
            QuestExplorerRewardImportSnapshot model
    ) {
        QuestExplorerEntryEntity.BranchRewardEntity entity = new QuestExplorerEntryEntity.BranchRewardEntity();
        entity.branch = branch;
        copyReward(entity, model);
        return entity;
    }

    private void copyRequirement(QuestExplorerEntryEntity.RequirementFields entity, QuestExplorerRequirementImportSnapshot model) {
        entity.requirementKey = model.requirementKey();
        entity.kind = model.kind();
        entity.displayText = model.displayText();
        entity.polarity = model.polarity();
        entity.groupLabel = model.groupLabel();
        entity.groupOrder = model.groupOrder();
        entity.targetRole = model.targetRole();
        entity.targetLabel = model.targetLabel();
        entity.requiredCount = model.requiredCount();
        entity.durationTurns = model.durationTurns();
        entity.state = model.state();
        entity.referenceKind = model.referenceKind();
        entity.referenceKey = model.referenceKey();
        entity.referenceDisplayName = model.referenceDisplayName();
        entity.codexEntryKey = model.codexEntryKey();
    }

    private void copyReward(QuestExplorerEntryEntity.RewardFields entity, QuestExplorerRewardImportSnapshot model) {
        entity.rewardKey = model.rewardKey();
        entity.kind = model.kind();
        entity.displayText = model.displayText();
        entity.amount = model.amount();
        entity.groupLabel = model.groupLabel();
        entity.groupOrder = model.groupOrder();
        entity.formulaText = model.formulaText();
        entity.assetKind = model.assetKind();
        entity.assetKey = model.assetKey();
        entity.assetDisplayName = model.assetDisplayName();
        entity.referenceKind = model.referenceKind();
        entity.referenceKey = model.referenceKey();
        entity.referenceDisplayName = model.referenceDisplayName();
        entity.codexEntryKey = model.codexEntryKey();
        entity.targetScopeLabel = model.targetScopeLabel();
    }

    private QuestExplorer.Entry toModel(QuestExplorerEntryImportSnapshot snapshot) {
        return new QuestExplorer.Entry(
                snapshot.entryKey(),
                snapshot.title(),
                snapshot.summaryLines(),
                snapshot.questType(),
                snapshot.isMandatory(),
                snapshot.isKeyNarrativeBeat(),
                snapshot.aliases(),
                toModel(snapshot.navigation()),
                new QuestExplorer.LoreView(snapshot.loreSections().stream().map(this::toModel).toList()),
                new QuestExplorer.StrategyView(snapshot.objectives().stream().map(this::toModel).toList()),
                snapshot.branches().stream().map(this::toModel).toList(),
                snapshot.quality() == null ? null : new QuestExplorer.Quality(snapshot.quality().warnings())
        );
    }

    private QuestExplorer.Navigation toModel(QuestExplorerNavigationImportSnapshot snapshot) {
        return new QuestExplorer.Navigation(
                snapshot.factionKey(),
                snapshot.factionName(),
                snapshot.questLineKey(),
                snapshot.questLineName(),
                snapshot.chapter(),
                snapshot.chapterLabel(),
                snapshot.step(),
                snapshot.stepLabel(),
                snapshot.sequenceIndex(),
                snapshot.chapterOrder(),
                snapshot.stepOrder(),
                snapshot.branchGroupKey(),
                snapshot.branchLabel(),
                snapshot.branchOrder(),
                snapshot.isBranchStart(),
                snapshot.isBranchEnd(),
                snapshot.previousEntryKeys(),
                snapshot.nextEntryKeys(),
                snapshot.failureEntryKeys(),
                snapshot.convergesIntoEntryKeys()
        );
    }

    private QuestExplorer.LoreSection toModel(QuestExplorerLoreSectionImportSnapshot snapshot) {
        return new QuestExplorer.LoreSection(
                snapshot.sectionKey(),
                snapshot.phase(),
                snapshot.choiceKey(),
                snapshot.stepIndex(),
                snapshot.objectiveKey(),
                snapshot.revealedByBranchKeys(),
                snapshot.revealedByChoiceKeys(),
                snapshot.revealedByBranchPathAlternatives(),
                snapshot.lines().stream().map(this::toModel).toList()
        );
    }

    private QuestExplorer.LoreLine toModel(QuestExplorerLoreLineImportSnapshot snapshot) {
        return new QuestExplorer.LoreLine(snapshot.speakerLabel(), snapshot.role(), snapshot.text());
    }

    private QuestExplorer.Objective toModel(QuestExplorerStrategyObjectiveImportSnapshot snapshot) {
        return new QuestExplorer.Objective(
                snapshot.objectiveKey(),
                snapshot.choiceKey(),
                snapshot.text(),
                snapshot.phase(),
                snapshot.revealedByBranchKeys(),
                snapshot.revealedByChoiceKeys(),
                snapshot.revealedByBranchPathAlternatives(),
                snapshot.requirements().stream().map(this::toModel).toList(),
                snapshot.rewards().stream().map(this::toModel).toList()
        );
    }

    private QuestExplorer.Branch toModel(QuestExplorerBranchImportSnapshot snapshot) {
        QuestExplorer.BranchLore lore = snapshot.outcomePreviewLines().isEmpty()
                ? null
                : new QuestExplorer.BranchLore(snapshot.outcomePreviewLines());
        QuestExplorer.BranchStrategy strategy = snapshot.conditions().isEmpty()
                && snapshot.requirements().isEmpty()
                && snapshot.rewards().isEmpty()
                ? null
                : new QuestExplorer.BranchStrategy(
                        snapshot.conditions(),
                        snapshot.requirements().stream().map(this::toModel).toList(),
                        snapshot.rewards().stream().map(this::toModel).toList()
                );
        return new QuestExplorer.Branch(
                snapshot.branchKey(),
                snapshot.choiceKey(),
                snapshot.label(),
                snapshot.orderIndex(),
                snapshot.groupKey(),
                snapshot.groupLabel(),
                snapshot.branchStepOrder(),
                snapshot.parentBranchKey(),
                snapshot.parentChoiceKey(),
                snapshot.prerequisiteBranchKeys(),
                snapshot.prerequisiteBranchPath(),
                snapshot.revealedByBranchKeys(),
                snapshot.revealedByChoiceKeys(),
                snapshot.revealedByBranchPathAlternatives(),
                snapshot.choiceGroupKey(),
                snapshot.convergenceGroupKey(),
                snapshot.sectionRole(),
                snapshot.nextEntryKeys(),
                snapshot.failureEntryKeys(),
                snapshot.convergesIntoEntryKeys(),
                lore,
                strategy
        );
    }

    private QuestExplorer.Requirement toModel(QuestExplorerRequirementImportSnapshot snapshot) {
        return new QuestExplorer.Requirement(
                snapshot.requirementKey(),
                snapshot.kind(),
                snapshot.displayText(),
                snapshot.polarity(),
                snapshot.groupLabel(),
                snapshot.groupOrder(),
                snapshot.targetRole(),
                snapshot.targetLabel(),
                snapshot.requiredCount(),
                snapshot.durationTurns(),
                snapshot.state(),
                snapshot.referenceKind(),
                snapshot.referenceKey(),
                snapshot.referenceDisplayName(),
                snapshot.codexEntryKey()
        );
    }

    private QuestExplorer.Reward toModel(QuestExplorerRewardImportSnapshot snapshot) {
        return new QuestExplorer.Reward(
                snapshot.rewardKey(),
                snapshot.kind(),
                snapshot.displayText(),
                snapshot.amount(),
                snapshot.groupLabel(),
                snapshot.groupOrder(),
                snapshot.formulaText(),
                snapshot.assetKind(),
                snapshot.assetKey(),
                snapshot.assetDisplayName(),
                snapshot.referenceKind(),
                snapshot.referenceKey(),
                snapshot.referenceDisplayName(),
                snapshot.codexEntryKey(),
                snapshot.targetScopeLabel()
        );
    }

    private QuestExplorer.Entry toModel(QuestExplorerEntryEntity entity) {
        return new QuestExplorer.Entry(
                entity.entryKey,
                entity.title,
                List.copyOf(entity.summaryLines),
                entity.questType,
                entity.isMandatory,
                entity.isKeyNarrativeBeat,
                List.copyOf(entity.aliases),
                toModel(entity.navigation),
                new QuestExplorer.LoreView(entity.loreSections.stream().map(this::toModel).toList()),
                new QuestExplorer.StrategyView(entity.objectives.stream().map(this::toModel).toList()),
                entity.branches.stream().map(this::toModel).toList(),
                entity.qualityWarnings.isEmpty() ? null : new QuestExplorer.Quality(List.copyOf(entity.qualityWarnings))
        );
    }

    private QuestExplorer.Navigation toModel(QuestExplorerEntryEntity.NavigationEntity entity) {
        return new QuestExplorer.Navigation(
                entity.factionKey,
                entity.factionName,
                entity.questLineKey,
                entity.questLineName,
                entity.chapter,
                entity.chapterLabel,
                entity.step,
                entity.stepLabel,
                entity.sequenceIndex,
                entity.chapterOrder,
                entity.stepOrder,
                entity.branchGroupKey,
                entity.branchLabel,
                entity.branchOrder,
                entity.isBranchStart,
                entity.isBranchEnd,
                List.copyOf(entity.previousEntryKeys),
                List.copyOf(entity.nextEntryKeys),
                List.copyOf(entity.failureEntryKeys),
                List.copyOf(entity.convergesIntoEntryKeys)
        );
    }

    private QuestExplorer.LoreSection toModel(QuestExplorerEntryEntity.LoreSectionEntity entity) {
        return new QuestExplorer.LoreSection(
                entity.sectionKey,
                entity.phase,
                entity.choiceKey,
                entity.stepIndex,
                entity.objectiveKey,
                List.copyOf(entity.revealedByBranchKeys),
                List.copyOf(entity.revealedByChoiceKeys),
                immutableNested(entity.revealedByBranchPathAlternatives),
                entity.lines.stream().map(this::toModel).toList()
        );
    }

    private QuestExplorer.LoreLine toModel(QuestExplorerEntryEntity.LoreLineEntity entity) {
        return new QuestExplorer.LoreLine(entity.speakerLabel, entity.role, entity.text);
    }

    private QuestExplorer.Objective toModel(QuestExplorerEntryEntity.ObjectiveEntity entity) {
        return new QuestExplorer.Objective(
                entity.objectiveKey,
                entity.choiceKey,
                entity.text,
                entity.phase,
                List.copyOf(entity.revealedByBranchKeys),
                List.copyOf(entity.revealedByChoiceKeys),
                immutableNested(entity.revealedByBranchPathAlternatives),
                entity.requirements.stream().map(this::toModel).toList(),
                entity.rewards.stream().map(this::toModel).toList()
        );
    }

    private QuestExplorer.Branch toModel(QuestExplorerEntryEntity.BranchEntity entity) {
        QuestExplorer.BranchLore lore = entity.outcomePreviewLines.isEmpty()
                ? null
                : new QuestExplorer.BranchLore(List.copyOf(entity.outcomePreviewLines));
        QuestExplorer.BranchStrategy strategy = entity.conditions.isEmpty() && entity.requirements.isEmpty() && entity.rewards.isEmpty()
                ? null
                : new QuestExplorer.BranchStrategy(
                        List.copyOf(entity.conditions),
                        entity.requirements.stream().map(this::toModel).toList(),
                        entity.rewards.stream().map(this::toModel).toList()
                );
        return new QuestExplorer.Branch(
                entity.branchKey,
                entity.choiceKey,
                entity.label,
                entity.orderIndex,
                entity.groupKey,
                entity.groupLabel,
                entity.branchStepOrder,
                entity.parentBranchKey,
                entity.parentChoiceKey,
                List.copyOf(entity.prerequisiteBranchKeys),
                List.copyOf(entity.prerequisiteBranchPath),
                List.copyOf(entity.revealedByBranchKeys),
                List.copyOf(entity.revealedByChoiceKeys),
                immutableNested(entity.revealedByBranchPathAlternatives),
                entity.choiceGroupKey,
                entity.convergenceGroupKey,
                entity.sectionRole,
                List.copyOf(entity.nextEntryKeys),
                List.copyOf(entity.failureEntryKeys),
                List.copyOf(entity.convergesIntoEntryKeys),
                lore,
                strategy
        );
    }

    private QuestExplorer.Requirement toModel(QuestExplorerEntryEntity.RequirementFields entity) {
        return new QuestExplorer.Requirement(
                entity.requirementKey,
                entity.kind,
                entity.displayText,
                entity.polarity,
                entity.groupLabel,
                entity.groupOrder,
                entity.targetRole,
                entity.targetLabel,
                entity.requiredCount,
                entity.durationTurns,
                entity.state,
                entity.referenceKind,
                entity.referenceKey,
                entity.referenceDisplayName,
                entity.codexEntryKey
        );
    }

    private QuestExplorer.Reward toModel(QuestExplorerEntryEntity.RewardFields entity) {
        return new QuestExplorer.Reward(
                entity.rewardKey,
                entity.kind,
                entity.displayText,
                entity.amount,
                entity.groupLabel,
                entity.groupOrder,
                entity.formulaText,
                entity.assetKind,
                entity.assetKey,
                entity.assetDisplayName,
                entity.referenceKind,
                entity.referenceKey,
                entity.referenceDisplayName,
                entity.codexEntryKey,
                entity.targetScopeLabel
        );
    }

    private QuestExplorer.Entry normalizeForComparison(QuestExplorer.Entry entry) {
        return new QuestExplorer.Entry(
                entry.entryKey(),
                entry.title(),
                entry.summaryLines(),
                entry.questType(),
                entry.isMandatory(),
                entry.isKeyNarrativeBeat(),
                entry.aliases(),
                entry.navigation(),
                new QuestExplorer.LoreView(entry.loreView().sections().stream().map(this::normalizeForComparison).toList()),
                new QuestExplorer.StrategyView(entry.strategyView().objectives().stream().map(this::normalizeForComparison).toList()),
                entry.branches().stream().map(this::normalizeForComparison).toList(),
                entry.quality()
        );
    }

    private QuestExplorer.LoreSection normalizeForComparison(QuestExplorer.LoreSection section) {
        return new QuestExplorer.LoreSection(
                section.sectionKey(),
                section.phase(),
                section.choiceKey(),
                section.stepIndex(),
                section.objectiveKey(),
                section.revealedByBranchKeys(),
                section.revealedByChoiceKeys(),
                section.revealedByBranchPathAlternatives(),
                section.lines()
        );
    }

    private QuestExplorer.Objective normalizeForComparison(QuestExplorer.Objective objective) {
        return new QuestExplorer.Objective(
                objective.objectiveKey(),
                objective.choiceKey(),
                objective.text(),
                objective.phase(),
                objective.revealedByBranchKeys(),
                objective.revealedByChoiceKeys(),
                objective.revealedByBranchPathAlternatives(),
                objective.requirements(),
                objective.rewards().stream().map(this::normalizeForComparison).toList()
        );
    }

    private QuestExplorer.Branch normalizeForComparison(QuestExplorer.Branch branch) {
        QuestExplorer.BranchStrategy strategy = branch.strategy() == null
                ? null
                : new QuestExplorer.BranchStrategy(
                        branch.strategy().conditions(),
                        branch.strategy().requirements(),
                        branch.strategy().rewards().stream().map(this::normalizeForComparison).toList()
                );
        return new QuestExplorer.Branch(
                branch.branchKey(),
                branch.choiceKey(),
                branch.label(),
                branch.orderIndex(),
                branch.groupKey(),
                branch.groupLabel(),
                branch.branchStepOrder(),
                branch.parentBranchKey(),
                branch.parentChoiceKey(),
                branch.prerequisiteBranchKeys(),
                branch.prerequisiteBranchPath(),
                branch.revealedByBranchKeys(),
                branch.revealedByChoiceKeys(),
                branch.revealedByBranchPathAlternatives(),
                branch.choiceGroupKey(),
                branch.convergenceGroupKey(),
                branch.sectionRole(),
                branch.nextEntryKeys(),
                branch.failureEntryKeys(),
                branch.convergesIntoEntryKeys(),
                branch.lore(),
                strategy
        );
    }

    private QuestExplorer.Reward normalizeForComparison(QuestExplorer.Reward reward) {
        return new QuestExplorer.Reward(
                reward.rewardKey(),
                reward.kind(),
                reward.displayText(),
                reward.amount() == null ? null : reward.amount().stripTrailingZeros(),
                reward.groupLabel(),
                reward.groupOrder(),
                reward.formulaText(),
                reward.assetKind(),
                reward.assetKey(),
                reward.assetDisplayName(),
                reward.referenceKind(),
                reward.referenceKey(),
                reward.referenceDisplayName(),
                reward.codexEntryKey(),
                reward.targetScopeLabel()
        );
    }

    private static <T> ArrayList<T> mutable(List<T> values) {
        return values == null ? new ArrayList<>() : new ArrayList<>(values);
    }

    private static ArrayList<List<String>> mutableNested(List<List<String>> values) {
        if (values == null) return new ArrayList<>();
        return values.stream()
                .map(QuestExplorerPersistenceMapper::mutable)
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
    }

    private static List<List<String>> immutableNested(List<List<String>> values) {
        if (values == null) return List.of();
        return values.stream().map(List::copyOf).toList();
    }
}
