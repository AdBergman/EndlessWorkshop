package ewshop.facade.mapper;

import ewshop.domain.model.quest.QuestChronicle;
import ewshop.facade.dto.importing.quests.QuestChronicleImportBatchDto;
import ewshop.facade.dto.response.quests.QuestChronicleDto;

import java.util.List;
import java.util.Objects;
import java.util.Set;

public final class QuestChronicleMapper {

    public static final String EXPORT_KIND = "quest_chronicle";

    private QuestChronicleMapper() {}

    public static QuestChronicle toModel(QuestChronicleImportBatchDto dto) {
        if (dto == null) throw new IllegalArgumentException("Quest chronicle import file is required");
        if (!EXPORT_KIND.equals(clean(dto.exportKind()))) {
            throw new IllegalArgumentException(
                    "Wrong quest chronicle file type: expected exportKind='quest_chronicle' but got '" +
                            (dto.exportKind() == null ? "missing" : dto.exportKind()) + "'"
            );
        }
        if (dto.entries() == null || dto.entries().isEmpty()) {
            throw new IllegalArgumentException("Quest chronicle file entries[] must not be empty");
        }
        assertNoDuplicateEntryKeys(dto.entries());

        return new QuestChronicle(
                trimToNull(dto.game()),
                trimToNull(dto.gameVersion()),
                trimToNull(dto.exporterVersion()),
                trimToNull(dto.exportedAtUtc()),
                EXPORT_KIND,
                trimToNull(dto.schemaVersion()),
                trimToNull(dto.contractSurface()),
                dto.entries().stream().map(QuestChronicleMapper::toModel).toList()
        );
    }

    public static QuestChronicleDto toDto(QuestChronicle model) {
        if (model == null) {
            return new QuestChronicleDto(null, null, null, null, EXPORT_KIND, null, null, List.of());
        }

        return new QuestChronicleDto(
                model.game(),
                model.gameVersion(),
                model.exporterVersion(),
                model.exportedAtUtc(),
                model.exportKind(),
                model.schemaVersion(),
                model.contractSurface(),
                safeList(model.entries()).stream().map(QuestChronicleMapper::toDto).toList()
        );
    }

    private static QuestChronicle.Entry toModel(QuestChronicleImportBatchDto.EntryDto dto) {
        String entryKey = required(dto == null ? null : dto.entryKey(), "entry.entryKey");
        return new QuestChronicle.Entry(
                entryKey,
                trimToNull(dto.primaryQuestKey()),
                cleanDistinctValues(dto.sourceQuestKeys()),
                trimToNull(dto.groupingKey()),
                trimToNull(dto.groupingReason()),
                trimToNull(dto.title()),
                cleanValues(dto.summaryLines()),
                trimToNull(dto.questType()),
                Boolean.TRUE.equals(dto.isMandatory()),
                Boolean.TRUE.equals(dto.isKeyNarrativeBeat()),
                trimToNull(dto.factionKey()),
                trimToNull(dto.questLineKey()),
                dto.chapter(),
                trimToNull(dto.chapterLabel()),
                dto.step(),
                trimToNull(dto.stepLabel()),
                trimToNull(dto.branchKey()),
                trimToNull(dto.branchLabel()),
                cleanDistinctValues(dto.nextEntryKeys()),
                cleanDistinctValues(dto.failureEntryKeys()),
                cleanDistinctValues(dto.convergesIntoEntryKeys()),
                safeList(dto.objectives()).stream().map(QuestChronicleMapper::toModel).toList(),
                safeList(dto.paths()).stream().map(QuestChronicleMapper::toModel).toList(),
                safeList(dto.transcriptBlocks()).stream().map(QuestChronicleMapper::toModel).toList()
        );
    }

    private static QuestChronicle.Objective toModel(QuestChronicleImportBatchDto.ObjectiveDto dto) {
        return new QuestChronicle.Objective(
                trimToNull(dto.objectiveText()),
                trimToNull(dto.sourceQuestKey()),
                trimToNull(dto.choiceKey()),
                dto.stepIndex(),
                cleanValues(dto.descriptionLines()),
                cleanValues(dto.completionLines()),
                cleanValues(dto.failureLines()),
                cleanValues(dto.forbiddenLines()),
                cleanValues(dto.selectionLines()),
                cleanValues(dto.rewardLines()),
                safeList(dto.completionRequirements()).stream().map(QuestChronicleMapper::toModel).toList(),
                safeList(dto.failureRequirements()).stream().map(QuestChronicleMapper::toModel).toList(),
                safeList(dto.forbiddenRequirements()).stream().map(QuestChronicleMapper::toModel).toList(),
                safeList(dto.selectionRequirements()).stream().map(QuestChronicleMapper::toModel).toList(),
                safeList(dto.rewards()).stream().map(QuestChronicleMapper::toModel).toList()
        );
    }

    private static QuestChronicle.Path toModel(QuestChronicleImportBatchDto.PathDto dto) {
        return new QuestChronicle.Path(
                required(dto.pathKey(), "path.pathKey"),
                trimToNull(dto.label()),
                trimToNull(dto.labelSource()),
                dto.choiceOrdinal(),
                trimToNull(dto.sourceQuestKey()),
                trimToNull(dto.choiceKey()),
                cleanValues(dto.conditionLines()),
                cleanValues(dto.rewardLines()),
                cleanValues(dto.nextEntryKeys()),
                cleanValues(dto.failureEntryKeys()),
                safeList(dto.requirements()).stream().map(QuestChronicleMapper::toModel).toList(),
                safeList(dto.rewards()).stream().map(QuestChronicleMapper::toModel).toList()
        );
    }

    private static QuestChronicle.Requirement toModel(QuestChronicleImportBatchDto.RequirementDto dto) {
        return new QuestChronicle.Requirement(
                trimToNull(dto.requirementKey()),
                trimToNull(dto.kind()),
                trimToNull(dto.phase()),
                trimToNull(dto.polarity()),
                trimToNull(dto.displayText()),
                trimToNull(dto.referenceKey()),
                trimToNull(dto.referenceKind()),
                trimToNull(dto.referenceDisplayName()),
                trimToNull(dto.targetRole()),
                trimToNull(dto.targetLabel()),
                trimToNull(dto.state()),
                dto.requiredCount(),
                dto.durationTurns()
        );
    }

    private static QuestChronicle.Reward toModel(QuestChronicleImportBatchDto.RewardDto dto) {
        return new QuestChronicle.Reward(
                trimToNull(dto.rewardKey()),
                cleanDistinctValues(dto.sourceRewardKeys()),
                trimToNull(dto.kind()),
                trimToNull(dto.displayText()),
                trimToNull(dto.formulaText()),
                dto.amount(),
                trimToNull(dto.assetKind()),
                trimToNull(dto.assetKey()),
                trimToNull(dto.assetDisplayName()),
                trimToNull(dto.targetScopeLabel())
        );
    }

    private static QuestChronicle.TranscriptBlock toModel(QuestChronicleImportBatchDto.TranscriptBlockDto dto) {
        return new QuestChronicle.TranscriptBlock(
                trimToNull(dto.dialogKey()),
                trimToNull(dto.phase()),
                trimToNull(dto.sourceQuestKey()),
                trimToNull(dto.choiceKey()),
                dto.stepIndex(),
                safeList(dto.lines()).stream().map(QuestChronicleMapper::toModel).toList()
        );
    }

    private static QuestChronicle.TranscriptLine toModel(QuestChronicleImportBatchDto.TranscriptLineDto dto) {
        return new QuestChronicle.TranscriptLine(
                dto.lineIndex(),
                trimToNull(dto.role()),
                trimToNull(dto.speakerLabel()),
                trimToNull(dto.text())
        );
    }

    private static QuestChronicleDto.EntryDto toDto(QuestChronicle.Entry model) {
        return new QuestChronicleDto.EntryDto(
                model.entryKey(), model.primaryQuestKey(), model.sourceQuestKeys(), model.groupingKey(),
                model.groupingReason(), model.title(), model.summaryLines(), model.questType(), model.mandatory(),
                model.keyNarrativeBeat(), model.factionKey(), model.questLineKey(), model.chapter(), model.chapterLabel(),
                model.step(), model.stepLabel(), model.branchKey(), model.branchLabel(), model.nextEntryKeys(),
                model.failureEntryKeys(), model.convergesIntoEntryKeys(),
                model.objectives().stream().map(QuestChronicleMapper::toDto).toList(),
                model.paths().stream().map(QuestChronicleMapper::toDto).toList(),
                model.transcriptBlocks().stream().map(QuestChronicleMapper::toDto).toList()
        );
    }

    private static QuestChronicleDto.ObjectiveDto toDto(QuestChronicle.Objective model) {
        return new QuestChronicleDto.ObjectiveDto(
                model.objectiveText(), model.sourceQuestKey(), model.choiceKey(), model.stepIndex(),
                model.descriptionLines(), model.completionLines(), model.failureLines(), model.forbiddenLines(),
                model.selectionLines(), model.rewardLines(),
                model.completionRequirements().stream().map(QuestChronicleMapper::toDto).toList(),
                model.failureRequirements().stream().map(QuestChronicleMapper::toDto).toList(),
                model.forbiddenRequirements().stream().map(QuestChronicleMapper::toDto).toList(),
                model.selectionRequirements().stream().map(QuestChronicleMapper::toDto).toList(),
                model.rewards().stream().map(QuestChronicleMapper::toDto).toList()
        );
    }

    private static QuestChronicleDto.PathDto toDto(QuestChronicle.Path model) {
        return new QuestChronicleDto.PathDto(
                model.pathKey(), model.label(), model.labelSource(), model.choiceOrdinal(), model.sourceQuestKey(),
                model.choiceKey(), model.conditionLines(), model.rewardLines(), model.nextEntryKeys(),
                model.failureEntryKeys(), model.requirements().stream().map(QuestChronicleMapper::toDto).toList(),
                model.rewards().stream().map(QuestChronicleMapper::toDto).toList()
        );
    }

    private static QuestChronicleDto.RequirementDto toDto(QuestChronicle.Requirement model) {
        return new QuestChronicleDto.RequirementDto(
                model.requirementKey(), model.kind(), model.phase(), model.polarity(), model.displayText(),
                model.referenceKey(), model.referenceKind(), model.referenceDisplayName(), model.targetRole(),
                model.targetLabel(), model.state(), model.requiredCount(), model.durationTurns()
        );
    }

    private static QuestChronicleDto.RewardDto toDto(QuestChronicle.Reward model) {
        return new QuestChronicleDto.RewardDto(
                model.rewardKey(), model.sourceRewardKeys(), model.kind(), model.displayText(), model.formulaText(),
                model.amount(), model.assetKind(), model.assetKey(), model.assetDisplayName(),
                model.targetScopeLabel()
        );
    }

    private static QuestChronicleDto.TranscriptBlockDto toDto(QuestChronicle.TranscriptBlock model) {
        return new QuestChronicleDto.TranscriptBlockDto(
                model.dialogKey(), model.phase(), model.sourceQuestKey(), model.choiceKey(), model.stepIndex(),
                model.lines().stream().map(QuestChronicleMapper::toDto).toList()
        );
    }

    private static QuestChronicleDto.TranscriptLineDto toDto(QuestChronicle.TranscriptLine model) {
        return new QuestChronicleDto.TranscriptLineDto(
                model.lineIndex(), model.role(), model.speakerLabel(), model.text()
        );
    }

    private static String required(String value, String field) {
        String trimmed = trimToNull(value);
        if (trimmed == null) throw new IllegalArgumentException(field + " is required");
        return trimmed;
    }

    private static String clean(String value) {
        return value == null ? null : value.trim();
    }

    private static String trimToNull(String value) {
        String trimmed = clean(value);
        return trimmed == null || trimmed.isEmpty() ? null : trimmed;
    }

    private static List<String> cleanValues(List<String> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
    }

    private static List<String> cleanDistinctValues(List<String> values) {
        if (values == null || values.isEmpty()) return List.of();
        return cleanValues(values).stream().distinct().toList();
    }

    private static void assertNoDuplicateEntryKeys(List<QuestChronicleImportBatchDto.EntryDto> entries) {
        Set<String> seen = new java.util.HashSet<>();
        for (QuestChronicleImportBatchDto.EntryDto entry : entries) {
            String entryKey = required(entry == null ? null : entry.entryKey(), "entry.entryKey");
            if (!seen.add(entryKey)) {
                throw new IllegalArgumentException("Duplicate entryKey in quest chronicle import file: " + entryKey);
            }
        }
    }

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }
}
