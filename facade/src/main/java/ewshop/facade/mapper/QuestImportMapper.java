package ewshop.facade.mapper;

import ewshop.domain.command.QuestImportSnapshot;
import ewshop.domain.command.QuestImportSnapshot.ChoiceSnapshot;
import ewshop.domain.command.QuestImportSnapshot.DialogBlockSnapshot;
import ewshop.domain.command.QuestImportSnapshot.DialogLineSnapshot;
import ewshop.domain.command.QuestImportSnapshot.QuestSnapshot;
import ewshop.domain.command.QuestImportSnapshot.StepSnapshot;
import ewshop.facade.dto.importing.quests.*;

import java.util.*;

public final class QuestImportMapper {

    public static final String GRAPH_EXPORT_KIND = "quest_graph";
    public static final String DIALOG_EXPORT_KIND = "quest_dialog";

    private QuestImportMapper() {}

    public static QuestImportSnapshot toSnapshot(QuestGraphImportBatchDto graph, QuestDialogImportBatchDto dialog) {
        if (graph == null) throw new IllegalArgumentException("Quest graph file is required");
        if (dialog == null) throw new IllegalArgumentException("Quest dialog file is required");

        assertExportKind("graph", graph.exportKind(), GRAPH_EXPORT_KIND);
        assertExportKind("dialog", dialog.exportKind(), DIALOG_EXPORT_KIND);

        List<QuestGraphQuestDto> questRows = graph.quests();
        if (questRows == null || questRows.isEmpty()) {
            throw new IllegalArgumentException("Quest graph file has no quests");
        }

        List<QuestDialogBlockDto> dialogRows = dialog.dialogs();
        if (dialogRows == null || dialogRows.isEmpty()) {
            throw new IllegalArgumentException("Quest dialog file has no dialogs");
        }

        Map<DialogIdentity, QuestDialogBlockDto> dialogsByIdentity = buildDialogIndex(dialogRows);
        Set<DialogIdentity> referencedDialogIdentities = new HashSet<>();
        Set<String> questKeys = new HashSet<>();
        List<QuestSnapshot> quests = new ArrayList<>(questRows.size());

        for (QuestGraphQuestDto questDto : questRows) {
            String questKey = required(questDto == null ? null : questDto.entryKey(), "quest.entryKey");
            if (!questKeys.add(questKey)) {
                throw new IllegalArgumentException("Duplicate quest entryKey in import file: " + questKey);
            }

            List<DialogBlockSnapshot> rootDialogBlocks = resolveDialogRefs(
                    "quest " + questKey,
                    questKey,
                    null,
                    null,
                    questDto.dialogBlockRefs(),
                    dialogsByIdentity,
                    referencedDialogIdentities
            );

            List<ChoiceSnapshot> choices = toChoiceSnapshots(questKey, questDto.choices(), dialogsByIdentity, referencedDialogIdentities);

            quests.add(new QuestSnapshot(
                    questKey,
                    trimToNull(questDto.displayName()),
                    cleanLines(questDto.descriptionLines()),
                    trimToNull(questDto.categoryKey()),
                    trimToNull(questDto.categoryType()),
                    Boolean.TRUE.equals(questDto.isBranchStart()),
                    Boolean.TRUE.equals(questDto.isBranchEnd()),
                    Boolean.TRUE.equals(questDto.isMandatory()),
                    Boolean.TRUE.equals(questDto.isKeyNarrativeBeat()),
                    Boolean.TRUE.equals(questDto.isNarrativeVictoryPathChoice()),
                    trimToNull(questDto.chapterKey()),
                    questDto.chapterIndex(),
                    questDto.chapterNumber(),
                    questDto.questSequenceIndex(),
                    trimToNull(questDto.branchGroupKey()),
                    trimToNull(questDto.branchLabel()),
                    trimToNull(questDto.inferredFactionKey()),
                    trimToNull(questDto.inferredQuestLineKey()),
                    trimToNull(questDto.convergesIntoQuestKey()),
                    cleanKeys(questDto.previousQuestKeys()),
                    cleanKeys(questDto.nextQuestKeys()),
                    cleanKeys(questDto.referenceKeys()),
                    choices,
                    rootDialogBlocks
            ));
        }

        if (!referencedDialogIdentities.containsAll(dialogsByIdentity.keySet())) {
            List<String> orphanExamples = dialogsByIdentity.keySet().stream()
                    .filter(identity -> !referencedDialogIdentities.contains(identity))
                    .map(DialogIdentity::value)
                    .limit(5)
                    .toList();
            throw new IllegalArgumentException("Quest dialog file contains dialog rows not referenced by graph: " + orphanExamples);
        }

        return new QuestImportSnapshot(quests);
    }

    private static List<ChoiceSnapshot> toChoiceSnapshots(
            String questKey,
            List<QuestGraphChoiceDto> choiceDtos,
            Map<DialogIdentity, QuestDialogBlockDto> dialogsByIdentity,
            Set<DialogIdentity> referencedDialogIdentities
    ) {
        if (choiceDtos == null || choiceDtos.isEmpty()) return List.of();

        List<ChoiceSnapshot> choices = new ArrayList<>(choiceDtos.size());
        Set<String> choiceKeys = new HashSet<>();

        for (int choiceOrder = 0; choiceOrder < choiceDtos.size(); choiceOrder++) {
            QuestGraphChoiceDto choiceDto = choiceDtos.get(choiceOrder);
            String choiceKey = required(choiceDto == null ? null : choiceDto.choiceKey(), "choice.choiceKey for " + questKey);
            if (!choiceKeys.add(choiceKey)) {
                throw new IllegalArgumentException("Duplicate choiceKey in quest " + questKey + ": " + choiceKey);
            }

            List<StepSnapshot> steps = toStepSnapshots(
                    questKey,
                    choiceKey,
                    choiceDto.steps(),
                    dialogsByIdentity,
                    referencedDialogIdentities
            );

            choices.add(new ChoiceSnapshot(
                    choiceKey,
                    trimToNull(choiceDto.displayName()),
                    choiceOrder,
                    cleanLines(choiceDto.descriptionLines()),
                    cleanLines(choiceDto.completionPrerequisiteLines()),
                    cleanLines(choiceDto.failurePrerequisiteLines()),
                    cleanLines(choiceDto.rewardDisplayLines()),
                    cleanKeys(choiceDto.nextQuestKeys()),
                    cleanKeys(choiceDto.referenceKeys()),
                    steps
            ));
        }

        return choices;
    }

    private static List<StepSnapshot> toStepSnapshots(
            String questKey,
            String choiceKey,
            List<QuestGraphStepDto> stepDtos,
            Map<DialogIdentity, QuestDialogBlockDto> dialogsByIdentity,
            Set<DialogIdentity> referencedDialogIdentities
    ) {
        if (stepDtos == null || stepDtos.isEmpty()) return List.of();

        List<StepSnapshot> steps = new ArrayList<>(stepDtos.size());
        Set<Integer> stepIndexes = new HashSet<>();

        for (int stepOrder = 0; stepOrder < stepDtos.size(); stepOrder++) {
            QuestGraphStepDto stepDto = stepDtos.get(stepOrder);
            if (stepDto == null || stepDto.index() == null) {
                throw new IllegalArgumentException("step.index is required for choice " + choiceKey);
            }
            int stepIndex = stepDto.index();
            if (!stepIndexes.add(stepIndex)) {
                throw new IllegalArgumentException("Duplicate step index in choice " + choiceKey + ": " + stepIndex);
            }

            List<DialogBlockSnapshot> dialogBlocks = resolveDialogRefs(
                    "step " + questKey + "/" + choiceKey + "/" + stepIndex,
                    questKey,
                    choiceKey,
                    stepIndex,
                    stepDto.dialogBlockRefs(),
                    dialogsByIdentity,
                    referencedDialogIdentities
            );

            steps.add(new StepSnapshot(
                    stepIndex,
                    stepOrder,
                    trimToNull(stepDto.objectiveText()),
                    trimToNull(stepDto.nextQuestKey()),
                    trimToNull(stepDto.failQuestKey()),
                    cleanLines(stepDto.descriptionLines()),
                    cleanLines(stepDto.completionPrerequisiteLines()),
                    cleanLines(stepDto.failurePrerequisiteLines()),
                    cleanLines(stepDto.forbiddenPrerequisiteLines()),
                    cleanLines(stepDto.selectionPrerequisiteLines()),
                    cleanLines(stepDto.rewardDisplayLines()),
                    cleanKeys(stepDto.referenceKeys()),
                    dialogBlocks
            ));
        }

        return steps;
    }

    private static List<DialogBlockSnapshot> resolveDialogRefs(
            String owner,
            String questKey,
            String choiceKey,
            Integer stepIndex,
            List<QuestDialogBlockRefDto> refs,
            Map<DialogIdentity, QuestDialogBlockDto> dialogsByIdentity,
            Set<DialogIdentity> referencedDialogIdentities
    ) {
        if (refs == null || refs.isEmpty()) return List.of();

        List<DialogBlockSnapshot> blocks = new ArrayList<>(refs.size());

        for (int blockOrder = 0; blockOrder < refs.size(); blockOrder++) {
            QuestDialogBlockRefDto ref = refs.get(blockOrder);
            DialogIdentity identity = DialogIdentity.fromRef(ref, owner);

            if (!Objects.equals(identity.questKey(), questKey)) {
                throw new IllegalArgumentException("Dialog ref questKey mismatch for " + owner + ": " + identity.value());
            }
            if (!Objects.equals(identity.choiceKey(), choiceKey)) {
                throw new IllegalArgumentException("Dialog ref choiceKey mismatch for " + owner + ": " + identity.value());
            }
            if (!Objects.equals(identity.stepIndex(), stepIndex)) {
                throw new IllegalArgumentException("Dialog ref stepIndex mismatch for " + owner + ": " + identity.value());
            }
            if (!referencedDialogIdentities.add(identity)) {
                throw new IllegalArgumentException("Duplicate dialog block ref in quest graph: " + identity.value());
            }

            QuestDialogBlockDto dialog = dialogsByIdentity.get(identity);
            if (dialog == null) {
                throw new IllegalArgumentException("Quest graph references missing dialog block: " + identity.value());
            }

            List<DialogLineSnapshot> lines = toLineSnapshots(identity, dialog.lines());
            int expectedLineCount = ref.lineCount() == null ? lines.size() : ref.lineCount();
            if (ref.lineCount() != null && expectedLineCount != lines.size()) {
                throw new IllegalArgumentException(
                        "Dialog lineCount mismatch for " + identity.value() +
                                ": graph expected " + expectedLineCount + " but dialog has " + lines.size()
                );
            }

            blocks.add(new DialogBlockSnapshot(
                    identity.value(),
                    identity.questKey(),
                    identity.choiceKey(),
                    identity.stepIndex(),
                    identity.dialogKey(),
                    identity.phase(),
                    expectedLineCount,
                    blockOrder,
                    lines
            ));
        }

        return blocks;
    }

    private static Map<DialogIdentity, QuestDialogBlockDto> buildDialogIndex(List<QuestDialogBlockDto> dialogs) {
        Map<DialogIdentity, QuestDialogBlockDto> byIdentity = new LinkedHashMap<>();

        for (QuestDialogBlockDto dialog : dialogs) {
            DialogIdentity identity = DialogIdentity.fromDialog(dialog);
            QuestDialogBlockDto previous = byIdentity.putIfAbsent(identity, dialog);
            if (previous != null) {
                throw new IllegalArgumentException("Duplicate dialog block identity in dialog file: " + identity.value());
            }
        }

        return byIdentity;
    }

    private static List<DialogLineSnapshot> toLineSnapshots(DialogIdentity identity, List<QuestDialogLineDto> lines) {
        if (lines == null || lines.isEmpty()) return List.of();

        List<DialogLineSnapshot> snapshots = new ArrayList<>(lines.size());
        Set<Integer> lineIndexes = new HashSet<>();

        for (int lineOrder = 0; lineOrder < lines.size(); lineOrder++) {
            QuestDialogLineDto line = lines.get(lineOrder);
            if (line == null) {
                throw new IllegalArgumentException("Dialog line is null for " + identity.value());
            }

            Integer sourceLineIndex = line.lineIndex();
            if (sourceLineIndex != null && !lineIndexes.add(sourceLineIndex)) {
                throw new IllegalArgumentException(
                        "Duplicate dialog lineIndex " + sourceLineIndex + " for " + identity.value()
                );
            }

            String text = trimToNull(line.text());
            if (text == null) {
                throw new IllegalArgumentException("Dialog line text is required for " + identity.value());
            }

            snapshots.add(new DialogLineSnapshot(
                    lineOrder,
                    sourceLineIndex,
                    trimToNull(line.role()),
                    trimToNull(line.speakerLabel()),
                    text
            ));
        }

        return snapshots;
    }

    private static void assertExportKind(String label, String actual, String expected) {
        if (!expected.equals(actual)) {
            throw new IllegalArgumentException(
                    "Wrong quest " + label + " file type: expected exportKind='" + expected +
                            "' but got '" + actual + "'"
            );
        }
    }

    private static String required(String value, String field) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            throw new IllegalArgumentException(field + " is required");
        }
        return trimmed;
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static List<String> cleanLines(List<String> values) {
        return cleanValues(values);
    }

    private static List<String> cleanKeys(List<String> values) {
        return cleanValues(values);
    }

    private static List<String> cleanValues(List<String> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
    }

    private record DialogIdentity(
            String questKey,
            String choiceKey,
            Integer stepIndex,
            String dialogKey,
            String phase
    ) {
        private static DialogIdentity fromDialog(QuestDialogBlockDto dto) {
            if (dto == null) throw new IllegalArgumentException("Dialog block row is null");
            return new DialogIdentity(
                    required(dto.questKey(), "dialog.questKey"),
                    trimToNull(dto.choiceKey()),
                    dto.stepIndex(),
                    required(dto.dialogKey(), "dialog.dialogKey"),
                    required(dto.phase(), "dialog.phase")
            );
        }

        private static DialogIdentity fromRef(QuestDialogBlockRefDto dto, String owner) {
            if (dto == null) throw new IllegalArgumentException("Dialog block ref is null for " + owner);
            return new DialogIdentity(
                    required(dto.questKey(), "dialogBlockRef.questKey for " + owner),
                    trimToNull(dto.choiceKey()),
                    dto.stepIndex(),
                    required(dto.dialogKey(), "dialogBlockRef.dialogKey for " + owner),
                    required(dto.phase(), "dialogBlockRef.phase for " + owner)
            );
        }

        private String value() {
            return questKey + "|" +
                    (choiceKey == null ? "" : choiceKey) + "|" +
                    (stepIndex == null ? "" : stepIndex) + "|" +
                    dialogKey + "|" +
                    phase;
        }
    }
}
