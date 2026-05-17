package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.QuestImportSnapshot;
import ewshop.domain.command.QuestImportSnapshot.ChoiceSnapshot;
import ewshop.domain.command.QuestImportSnapshot.DialogBlockSnapshot;
import ewshop.domain.command.QuestImportSnapshot.DialogLineSnapshot;
import ewshop.domain.command.QuestImportSnapshot.QuestSnapshot;
import ewshop.domain.command.QuestImportSnapshot.StepSnapshot;
import ewshop.domain.model.quest.QuestExplorer;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.QuestRepository;
import ewshop.infrastructure.persistence.entities.*;
import ewshop.infrastructure.persistence.repositories.QuestJpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class QuestRepositoryAdapter implements QuestRepository {

    private final QuestJpaRepository questJpaRepository;

    public QuestRepositoryAdapter(QuestJpaRepository questJpaRepository) {
        this.questJpaRepository = questJpaRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public QuestExplorer findQuestExplorer() {
        List<QuestEntity> quests = questJpaRepository.findAllForQuestExplorer();

        List<QuestExplorer.Quest> questModels = quests.stream()
                .map(QuestRepositoryAdapter::toQuestModel)
                .toList();

        List<QuestExplorer.QuestDialogBlock> dialogBlocks = quests.stream()
                .flatMap(quest -> sortedDialogBlocks(quest.getDialogBlocks()).stream())
                .map(QuestRepositoryAdapter::toDialogBlockModel)
                .toList();

        return new QuestExplorer(questModels, dialogBlocks);
    }

    @Override
    @Transactional
    public ImportResult importQuestSnapshot(QuestImportSnapshot snapshot) {
        ImportResult result = new ImportResult();
        if (snapshot == null || snapshot.quests().isEmpty()) return result;

        List<String> keepKeys = snapshot.quests().stream()
                .map(QuestSnapshot::questKey)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();

        if (keepKeys.isEmpty()) {
            throw new IllegalStateException("Refusing to delete all quests: keepKeys empty.");
        }

        Map<String, QuestEntity> existingByKey = questJpaRepository.findAllByQuestKeyIn(keepKeys).stream()
                .collect(Collectors.toMap(QuestEntity::getQuestKey, Function.identity()));

        for (QuestSnapshot questSnapshot : snapshot.quests()) {
            if (questSnapshot == null || questSnapshot.questKey() == null || questSnapshot.questKey().isBlank()) {
                continue;
            }

            QuestEntity next = toEntity(questSnapshot);
            QuestEntity existing = existingByKey.get(questSnapshot.questKey());

            if (existing == null) {
                questJpaRepository.save(next);
                result.incrementInserted();
                continue;
            }

            if (Objects.equals(signature(existing), signature(next))) {
                result.incrementUnchanged();
                continue;
            }

            questJpaRepository.delete(existing);
            questJpaRepository.flush();
            questJpaRepository.save(next);
            result.incrementUpdated();
        }

        List<QuestEntity> obsolete = questJpaRepository.findAllByQuestKeyNotIn(keepKeys);
        if (!obsolete.isEmpty()) {
            questJpaRepository.deleteAll(obsolete);
            result.setDeleted(obsolete.size());
        }

        return result;
    }

    private static QuestExplorer.Quest toQuestModel(QuestEntity entity) {
        List<QuestDialogBlockEntity> sortedDialogBlocks = sortedDialogBlocks(entity.getDialogBlocks());

        List<String> rootDialogBlockIdentities = sortedDialogBlocks.stream()
                .filter(QuestRepositoryAdapter::isRootDialogBlock)
                .map(QuestDialogBlockEntity::getDialogIdentity)
                .toList();

        List<QuestExplorer.QuestChoice> choices = entity.getChoices().stream()
                .sorted(Comparator.comparingInt(QuestChoiceEntity::getChoiceOrder))
                .map(choice -> toChoiceModel(choice, sortedDialogBlocks))
                .toList();

        return new QuestExplorer.Quest(
                entity.getQuestKey(),
                entity.getDisplayName(),
                entity.getDescriptionLines(),
                entity.getCategoryKey(),
                entity.getCategoryType(),
                entity.isBranchStart(),
                entity.isBranchEnd(),
                entity.isMandatory(),
                entity.isKeyNarrativeBeat(),
                entity.isNarrativeVictoryPathChoice(),
                entity.getChapterKey(),
                entity.getChapterIndex(),
                entity.getChapterNumber(),
                entity.getQuestSequenceIndex(),
                entity.getBranchGroupKey(),
                entity.getBranchLabel(),
                entity.getInferredFactionKey(),
                entity.getInferredQuestLineKey(),
                entity.getConvergesIntoQuestKey(),
                entity.getPreviousQuestKeys(),
                entity.getNextQuestKeys(),
                entity.getReferenceKeys(),
                rootDialogBlockIdentities,
                choices
        );
    }

    private static QuestExplorer.QuestChoice toChoiceModel(
            QuestChoiceEntity choice,
            List<QuestDialogBlockEntity> sortedDialogBlocks
    ) {
        List<QuestExplorer.QuestStep> steps = choice.getSteps().stream()
                .sorted(Comparator.comparingInt(QuestStepEntity::getStepOrder))
                .map(step -> toStepModel(choice, step, sortedDialogBlocks))
                .toList();

        return new QuestExplorer.QuestChoice(
                choice.getChoiceKey(),
                choice.getDisplayName(),
                choice.getChoiceOrder(),
                choice.getDescriptionLines(),
                choice.getCompletionPrerequisiteLines(),
                choice.getFailurePrerequisiteLines(),
                choice.getRewardDisplayLines(),
                choice.getNextQuestKeys(),
                choice.getReferenceKeys(),
                steps
        );
    }

    private static QuestExplorer.QuestStep toStepModel(
            QuestChoiceEntity choice,
            QuestStepEntity step,
            List<QuestDialogBlockEntity> sortedDialogBlocks
    ) {
        List<String> dialogBlockIdentities = sortedDialogBlocks.stream()
                .filter(block -> belongsToStep(block, choice, step))
                .map(QuestDialogBlockEntity::getDialogIdentity)
                .toList();

        return new QuestExplorer.QuestStep(
                step.getStepIndex(),
                step.getStepOrder(),
                step.getObjectiveText(),
                step.getNextQuestKey(),
                step.getFailQuestKey(),
                step.getDescriptionLines(),
                step.getCompletionPrerequisiteLines(),
                step.getFailurePrerequisiteLines(),
                step.getForbiddenPrerequisiteLines(),
                step.getSelectionPrerequisiteLines(),
                step.getRewardDisplayLines(),
                step.getReferenceKeys(),
                dialogBlockIdentities
        );
    }

    private static QuestExplorer.QuestDialogBlock toDialogBlockModel(QuestDialogBlockEntity block) {
        List<QuestExplorer.QuestDialogLine> lines = block.getLines().stream()
                .sorted(Comparator.comparingInt(QuestDialogLineEntity::getLineOrder))
                .map(line -> new QuestExplorer.QuestDialogLine(
                        line.getLineOrder(),
                        line.getSourceLineIndex(),
                        line.getRole(),
                        line.getSpeakerLabel(),
                        line.getText()
                ))
                .toList();

        return new QuestExplorer.QuestDialogBlock(
                block.getDialogIdentity(),
                block.getSourceQuestKey(),
                block.getSourceChoiceKey(),
                block.getSourceStepIndex(),
                block.getParentScope(),
                block.getDialogKey(),
                block.getPhase(),
                block.getExpectedLineCount(),
                block.getBlockOrder(),
                lines
        );
    }

    private static List<QuestDialogBlockEntity> sortedDialogBlocks(List<QuestDialogBlockEntity> blocks) {
        return (blocks == null ? List.<QuestDialogBlockEntity>of() : blocks).stream()
                .sorted(Comparator
                        .comparing(QuestDialogBlockEntity::getSourceQuestKey, Comparator.nullsLast(String::compareTo))
                        .thenComparing(QuestDialogBlockEntity::getSourceChoiceKey, Comparator.nullsFirst(String::compareTo))
                        .thenComparing(QuestDialogBlockEntity::getSourceStepIndex, Comparator.nullsFirst(Integer::compareTo))
                        .thenComparingInt(QuestDialogBlockEntity::getBlockOrder)
                        .thenComparing(QuestDialogBlockEntity::getDialogIdentity, Comparator.nullsLast(String::compareTo)))
                .toList();
    }

    private static boolean isRootDialogBlock(QuestDialogBlockEntity block) {
        return block != null && (
                "QUEST".equals(block.getParentScope()) ||
                        (block.getSourceChoiceKey() == null && block.getSourceStepIndex() == null)
        );
    }

    private static boolean belongsToStep(
            QuestDialogBlockEntity block,
            QuestChoiceEntity choice,
            QuestStepEntity step
    ) {
        return block != null &&
                Objects.equals(block.getSourceChoiceKey(), choice.getChoiceKey()) &&
                Objects.equals(block.getSourceStepIndex(), step.getStepIndex());
    }

    private static QuestEntity toEntity(QuestSnapshot snapshot) {
        QuestEntity entity = new QuestEntity();
        entity.setQuestKey(snapshot.questKey());
        entity.setDisplayName(snapshot.displayName());
        entity.setDescriptionLines(snapshot.descriptionLines());
        entity.setCategoryKey(snapshot.categoryKey());
        entity.setCategoryType(snapshot.categoryType());
        entity.setBranchStart(snapshot.branchStart());
        entity.setBranchEnd(snapshot.branchEnd());
        entity.setMandatory(snapshot.mandatory());
        entity.setKeyNarrativeBeat(snapshot.keyNarrativeBeat());
        entity.setNarrativeVictoryPathChoice(snapshot.narrativeVictoryPathChoice());
        entity.setChapterKey(snapshot.chapterKey());
        entity.setChapterIndex(snapshot.chapterIndex());
        entity.setChapterNumber(snapshot.chapterNumber());
        entity.setQuestSequenceIndex(snapshot.questSequenceIndex());
        entity.setBranchGroupKey(snapshot.branchGroupKey());
        entity.setBranchLabel(snapshot.branchLabel());
        entity.setInferredFactionKey(snapshot.inferredFactionKey());
        entity.setInferredQuestLineKey(snapshot.inferredQuestLineKey());
        entity.setConvergesIntoQuestKey(snapshot.convergesIntoQuestKey());
        entity.setPreviousQuestKeys(snapshot.previousQuestKeys());
        entity.setNextQuestKeys(snapshot.nextQuestKeys());
        entity.setReferenceKeys(snapshot.referenceKeys());

        Map<String, QuestChoiceEntity> choicesByKey = new HashMap<>();
        Map<String, QuestStepEntity> stepsByKey = new HashMap<>();

        for (ChoiceSnapshot choiceSnapshot : snapshot.choices()) {
            QuestChoiceEntity choice = toChoiceEntity(choiceSnapshot);
            entity.addChoice(choice);
            choicesByKey.put(choice.getChoiceKey(), choice);

            for (QuestStepEntity step : choice.getSteps()) {
                stepsByKey.put(stepKey(choice.getChoiceKey(), step.getStepIndex()), step);
            }
        }

        for (DialogBlockSnapshot blockSnapshot : snapshot.rootDialogBlocks()) {
            entity.addDialogBlock(toDialogBlockEntity(blockSnapshot, null, null));
        }

        for (ChoiceSnapshot choiceSnapshot : snapshot.choices()) {
            QuestChoiceEntity choice = choicesByKey.get(choiceSnapshot.choiceKey());
            for (StepSnapshot stepSnapshot : choiceSnapshot.steps()) {
                QuestStepEntity step = stepsByKey.get(stepKey(choiceSnapshot.choiceKey(), stepSnapshot.stepIndex()));
                for (DialogBlockSnapshot blockSnapshot : stepSnapshot.dialogBlocks()) {
                    entity.addDialogBlock(toDialogBlockEntity(blockSnapshot, choice, step));
                }
            }
        }

        return entity;
    }

    private static QuestChoiceEntity toChoiceEntity(ChoiceSnapshot snapshot) {
        QuestChoiceEntity entity = new QuestChoiceEntity();
        entity.setChoiceKey(snapshot.choiceKey());
        entity.setChoiceOrder(snapshot.choiceOrder());
        entity.setDisplayName(snapshot.displayName());
        entity.setDescriptionLines(snapshot.descriptionLines());
        entity.setCompletionPrerequisiteLines(snapshot.completionPrerequisiteLines());
        entity.setFailurePrerequisiteLines(snapshot.failurePrerequisiteLines());
        entity.setRewardDisplayLines(snapshot.rewardDisplayLines());
        entity.setNextQuestKeys(snapshot.nextQuestKeys());
        entity.setReferenceKeys(snapshot.referenceKeys());

        for (StepSnapshot stepSnapshot : snapshot.steps()) {
            entity.addStep(toStepEntity(stepSnapshot));
        }

        return entity;
    }

    private static QuestStepEntity toStepEntity(StepSnapshot snapshot) {
        QuestStepEntity entity = new QuestStepEntity();
        entity.setStepIndex(snapshot.stepIndex());
        entity.setStepOrder(snapshot.stepOrder());
        entity.setObjectiveText(snapshot.objectiveText());
        entity.setNextQuestKey(snapshot.nextQuestKey());
        entity.setFailQuestKey(snapshot.failQuestKey());
        entity.setDescriptionLines(snapshot.descriptionLines());
        entity.setCompletionPrerequisiteLines(snapshot.completionPrerequisiteLines());
        entity.setFailurePrerequisiteLines(snapshot.failurePrerequisiteLines());
        entity.setForbiddenPrerequisiteLines(snapshot.forbiddenPrerequisiteLines());
        entity.setSelectionPrerequisiteLines(snapshot.selectionPrerequisiteLines());
        entity.setRewardDisplayLines(snapshot.rewardDisplayLines());
        entity.setReferenceKeys(snapshot.referenceKeys());
        return entity;
    }

    private static QuestDialogBlockEntity toDialogBlockEntity(
            DialogBlockSnapshot snapshot,
            QuestChoiceEntity choice,
            QuestStepEntity step
    ) {
        QuestDialogBlockEntity entity = new QuestDialogBlockEntity();
        entity.setChoice(choice);
        entity.setStep(step);
        entity.setDialogIdentity(snapshot.identity());
        entity.setParentScope(step == null ? "QUEST" : "STEP");
        entity.setBlockOrder(snapshot.blockOrder());
        entity.setSourceQuestKey(snapshot.questKey());
        entity.setSourceChoiceKey(snapshot.choiceKey());
        entity.setSourceStepIndex(snapshot.stepIndex());
        entity.setDialogKey(snapshot.dialogKey());
        entity.setPhase(snapshot.phase());
        entity.setExpectedLineCount(snapshot.expectedLineCount());

        for (DialogLineSnapshot lineSnapshot : snapshot.lines()) {
            QuestDialogLineEntity line = new QuestDialogLineEntity();
            line.setLineOrder(lineSnapshot.lineOrder());
            line.setSourceLineIndex(lineSnapshot.sourceLineIndex());
            line.setRole(lineSnapshot.role());
            line.setSpeakerLabel(lineSnapshot.speakerLabel());
            line.setText(lineSnapshot.text());
            entity.addLine(line);
        }

        return entity;
    }

    private static String signature(QuestEntity entity) {
        StringBuilder sb = new StringBuilder(4096);
        append(sb, entity.getQuestKey());
        append(sb, entity.getDisplayName());
        appendList(sb, entity.getDescriptionLines());
        append(sb, entity.getCategoryKey());
        append(sb, entity.getCategoryType());
        append(sb, entity.isBranchStart());
        append(sb, entity.isBranchEnd());
        append(sb, entity.isMandatory());
        append(sb, entity.isKeyNarrativeBeat());
        append(sb, entity.isNarrativeVictoryPathChoice());
        append(sb, entity.getChapterKey());
        append(sb, entity.getChapterIndex());
        append(sb, entity.getChapterNumber());
        append(sb, entity.getQuestSequenceIndex());
        append(sb, entity.getBranchGroupKey());
        append(sb, entity.getBranchLabel());
        append(sb, entity.getInferredFactionKey());
        append(sb, entity.getInferredQuestLineKey());
        append(sb, entity.getConvergesIntoQuestKey());
        appendList(sb, entity.getPreviousQuestKeys());
        appendList(sb, entity.getNextQuestKeys());
        appendList(sb, entity.getReferenceKeys());

        entity.getChoices().stream()
                .sorted(Comparator.comparingInt(QuestChoiceEntity::getChoiceOrder))
                .forEach(choice -> appendChoice(sb, choice));

        entity.getDialogBlocks().stream()
                .sorted(Comparator.comparing(QuestDialogBlockEntity::getDialogIdentity))
                .forEach(block -> appendDialogBlock(sb, block));

        return sb.toString();
    }

    private static void appendChoice(StringBuilder sb, QuestChoiceEntity choice) {
        append(sb, "choice");
        append(sb, choice.getChoiceKey());
        append(sb, choice.getChoiceOrder());
        append(sb, choice.getDisplayName());
        appendList(sb, choice.getDescriptionLines());
        appendList(sb, choice.getCompletionPrerequisiteLines());
        appendList(sb, choice.getFailurePrerequisiteLines());
        appendList(sb, choice.getRewardDisplayLines());
        appendList(sb, choice.getNextQuestKeys());
        appendList(sb, choice.getReferenceKeys());

        choice.getSteps().stream()
                .sorted(Comparator.comparingInt(QuestStepEntity::getStepOrder))
                .forEach(step -> appendStep(sb, step));
    }

    private static void appendStep(StringBuilder sb, QuestStepEntity step) {
        append(sb, "step");
        append(sb, step.getStepIndex());
        append(sb, step.getStepOrder());
        append(sb, step.getObjectiveText());
        append(sb, step.getNextQuestKey());
        append(sb, step.getFailQuestKey());
        appendList(sb, step.getDescriptionLines());
        appendList(sb, step.getCompletionPrerequisiteLines());
        appendList(sb, step.getFailurePrerequisiteLines());
        appendList(sb, step.getForbiddenPrerequisiteLines());
        appendList(sb, step.getSelectionPrerequisiteLines());
        appendList(sb, step.getRewardDisplayLines());
        appendList(sb, step.getReferenceKeys());
    }

    private static void appendDialogBlock(StringBuilder sb, QuestDialogBlockEntity block) {
        append(sb, "dialog");
        append(sb, block.getDialogIdentity());
        append(sb, block.getParentScope());
        append(sb, block.getBlockOrder());
        append(sb, block.getSourceQuestKey());
        append(sb, block.getSourceChoiceKey());
        append(sb, block.getSourceStepIndex());
        append(sb, block.getDialogKey());
        append(sb, block.getPhase());
        append(sb, block.getExpectedLineCount());

        block.getLines().stream()
                .sorted(Comparator.comparingInt(QuestDialogLineEntity::getLineOrder))
                .forEach(line -> {
                    append(sb, "line");
                    append(sb, line.getLineOrder());
                    append(sb, line.getSourceLineIndex());
                    append(sb, line.getRole());
                    append(sb, line.getSpeakerLabel());
                    append(sb, line.getText());
                });
    }

    private static void appendList(StringBuilder sb, List<String> values) {
        List<String> safe = values == null ? List.of() : values;
        append(sb, safe.size());
        safe.forEach(value -> append(sb, value));
    }

    private static void append(StringBuilder sb, Object value) {
        if (value == null) {
            sb.append("<null>");
        } else {
            String text = String.valueOf(value);
            sb.append(text.length()).append(':').append(text);
        }
        sb.append('\u001E');
    }

    private static String stepKey(String choiceKey, int stepIndex) {
        return choiceKey + "|" + stepIndex;
    }
}
