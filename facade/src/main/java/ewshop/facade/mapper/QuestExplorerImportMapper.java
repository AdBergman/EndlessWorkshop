package ewshop.facade.mapper;

import ewshop.domain.command.QuestExplorerBranchImportSnapshot;
import ewshop.domain.command.QuestExplorerEntryImportSnapshot;
import ewshop.domain.command.QuestExplorerImportMetadata;
import ewshop.domain.command.QuestExplorerLoreLineImportSnapshot;
import ewshop.domain.command.QuestExplorerLoreSectionImportSnapshot;
import ewshop.domain.command.QuestExplorerNavigationImportSnapshot;
import ewshop.domain.command.QuestExplorerQualityImportSnapshot;
import ewshop.domain.command.QuestExplorerRequirementImportSnapshot;
import ewshop.domain.command.QuestExplorerRewardImportSnapshot;
import ewshop.domain.command.QuestExplorerStrategyObjectiveImportSnapshot;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBranchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBranchLoreDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBranchStrategyDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportEntryDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportLoreLineDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportLoreSectionDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportLoreViewDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportNavigationDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportObjectiveDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportQualityDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportRequirementDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportRewardDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportStrategyViewDto;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

public final class QuestExplorerImportMapper {

    public static final String EXPORT_KIND = "quest_explorer";
    public static final String SCHEMA_VERSION = "quest_explorer.v3";

    private QuestExplorerImportMapper() {}

    public static QuestExplorerImportMetadata toMetadata(QuestExplorerImportBatchDto dto) {
        if (dto == null) throw new IllegalArgumentException("Quest explorer import file is required");
        if (!EXPORT_KIND.equals(clean(dto.exportKind()))) {
            throw new IllegalArgumentException(
                    "Wrong quest explorer file type: expected exportKind='quest_explorer' but got '" +
                            (dto.exportKind() == null ? "missing" : dto.exportKind()) + "'"
            );
        }
        if (!SCHEMA_VERSION.equals(clean(dto.schemaVersion()))) {
            throw new IllegalArgumentException(
                    "Wrong quest explorer schemaVersion: expected 'quest_explorer.v3' but got '" +
                            (dto.schemaVersion() == null ? "missing" : dto.schemaVersion()) + "'"
            );
        }
        return new QuestExplorerImportMetadata(
                trimToNull(dto.gameVersion()),
                trimToNull(dto.exporterVersion()),
                trimToNull(dto.exportedAtUtc()),
                EXPORT_KIND,
                SCHEMA_VERSION
        );
    }

    public static QuestExplorerEntryImportSnapshot toSnapshot(QuestExplorerImportEntryDto dto) {
        String entryKey = required(dto == null ? null : dto.entryKey(), "entry.entryKey");
        requirePresent(dto.summaryLines(), "entry.summaryLines", entryKey);
        requirePresent(dto.aliases(), "entry.aliases", entryKey);
        requirePresent(dto.branches(), "entry.branches", entryKey);
        if (dto.loreView() == null) {
            throw new IllegalArgumentException("entry.loreView is required for '" + entryKey + "'");
        }
        requirePresent(dto.loreView().sections(), "entry.loreView.sections", entryKey);
        if (dto.strategyView() == null) {
            throw new IllegalArgumentException("entry.strategyView is required for '" + entryKey + "'");
        }
        requirePresent(dto.strategyView().objectives(), "entry.strategyView.objectives", entryKey);

        validateBranches(entryKey, dto.branches());
        validateOrdering(entryKey, dto);

        return new QuestExplorerEntryImportSnapshot(
                entryKey,
                required(dto.title(), "entry.title"),
                cleanValues(dto.summaryLines()),
                trimToNull(dto.questType()),
                dto.isMandatory(),
                dto.isKeyNarrativeBeat(),
                cleanValues(dto.aliases()),
                toSnapshot(dto.navigation()),
                toLoreSections(dto.loreView()),
                toObjectives(dto.strategyView()),
                safeList(dto.branches()).stream().map(QuestExplorerImportMapper::toSnapshot).toList(),
                toSnapshot(dto.quality())
        );
    }

    public static void validateSnapshots(List<QuestExplorerEntryImportSnapshot> snapshots) {
        Set<String> entryKeys = new HashSet<>();
        Set<Integer> sequenceIndexes = new HashSet<>();

        for (QuestExplorerEntryImportSnapshot snapshot : safeList(snapshots)) {
            String entryKey = required(snapshot == null ? null : snapshot.entryKey(), "entry.entryKey");
            if (!entryKeys.add(entryKey)) {
                throw new IllegalArgumentException("Duplicate quest explorer entryKey '" + entryKey + "'");
            }
            if (snapshot.navigation() == null) {
                throw new IllegalArgumentException("entry.navigation is required for '" + entryKey + "'");
            }
            if (!sequenceIndexes.add(snapshot.navigation().sequenceIndex())) {
                throw new IllegalArgumentException(
                        "Duplicate quest explorer navigation.sequenceIndex '" + snapshot.navigation().sequenceIndex() + "'"
                );
            }
        }

        for (QuestExplorerEntryImportSnapshot snapshot : safeList(snapshots)) {
            String entryKey = snapshot.entryKey();
            validateLinks(entryKeys, entryKey, "navigation.previousEntryKeys", snapshot.navigation().previousEntryKeys());
            validateLinks(entryKeys, entryKey, "navigation.nextEntryKeys", snapshot.navigation().nextEntryKeys());
            validateLinks(entryKeys, entryKey, "navigation.failureEntryKeys", snapshot.navigation().failureEntryKeys());
            validateLinks(entryKeys, entryKey, "navigation.convergesIntoEntryKeys", snapshot.navigation().convergesIntoEntryKeys());
            for (QuestExplorerBranchImportSnapshot branch : snapshot.branches()) {
                validateLinks(entryKeys, entryKey, "branch.nextEntryKeys", branch.nextEntryKeys());
                validateLinks(entryKeys, entryKey, "branch.failureEntryKeys", branch.failureEntryKeys());
                validateLinks(entryKeys, entryKey, "branch.convergesIntoEntryKeys", branch.convergesIntoEntryKeys());
            }
        }
    }

    private static QuestExplorerNavigationImportSnapshot toSnapshot(QuestExplorerImportNavigationDto dto) {
        if (dto == null) throw new IllegalArgumentException("entry.navigation is required");
        if (dto.sequenceIndex() == null) throw new IllegalArgumentException("entry.navigation.sequenceIndex is required");
        return new QuestExplorerNavigationImportSnapshot(
                trimToNull(dto.factionKey()),
                trimToNull(dto.factionName()),
                trimToNull(dto.questLineKey()),
                trimToNull(dto.questLineName()),
                dto.chapter(),
                trimToNull(dto.chapterLabel()),
                dto.step(),
                trimToNull(dto.stepLabel()),
                dto.sequenceIndex(),
                dto.chapterOrder(),
                dto.stepOrder(),
                trimToNull(dto.branchGroupKey()),
                trimToNull(dto.branchLabel()),
                dto.branchOrder(),
                dto.isBranchStart(),
                dto.isBranchEnd(),
                cleanReferenceValues(dto.previousEntryKeys()),
                cleanReferenceValues(dto.nextEntryKeys()),
                cleanReferenceValues(dto.failureEntryKeys()),
                cleanReferenceValues(dto.convergesIntoEntryKeys())
        );
    }

    private static List<QuestExplorerLoreSectionImportSnapshot> toLoreSections(QuestExplorerImportLoreViewDto dto) {
        return safeList(dto == null ? null : dto.sections()).stream()
                .map(QuestExplorerImportMapper::toSnapshot)
                .toList();
    }

    private static QuestExplorerLoreSectionImportSnapshot toSnapshot(QuestExplorerImportLoreSectionDto dto) {
        return new QuestExplorerLoreSectionImportSnapshot(
                required(dto == null ? null : dto.sectionKey(), "lore.sectionKey"),
                required(dto.phase(), "lore.phase"),
                trimToNull(dto.choiceKey()),
                dto.stepIndex(),
                trimToNull(dto.objectiveKey()),
                cleanValues(dto.revealedByBranchKeys()),
                cleanValues(dto.revealedByChoiceKeys()),
                cleanPathAlternatives(dto.revealedByBranchPathAlternatives()),
                safeList(dto.lines()).stream().map(QuestExplorerImportMapper::toSnapshot).toList()
        );
    }

    private static QuestExplorerLoreLineImportSnapshot toSnapshot(QuestExplorerImportLoreLineDto dto) {
        return new QuestExplorerLoreLineImportSnapshot(
                trimToNull(dto == null ? null : dto.speakerLabel()),
                required(dto == null ? null : dto.role(), "lore.line.role"),
                required(dto.text(), "lore.line.text")
        );
    }

    private static List<QuestExplorerStrategyObjectiveImportSnapshot> toObjectives(QuestExplorerImportStrategyViewDto dto) {
        return safeList(dto == null ? null : dto.objectives()).stream()
                .map(QuestExplorerImportMapper::toSnapshot)
                .toList();
    }

    private static QuestExplorerStrategyObjectiveImportSnapshot toSnapshot(QuestExplorerImportObjectiveDto dto) {
        return new QuestExplorerStrategyObjectiveImportSnapshot(
                trimToNull(dto == null ? null : dto.objectiveKey()),
                trimToNull(dto == null ? null : dto.choiceKey()),
                required(dto == null ? null : dto.text(), "objective.text"),
                trimToNull(dto.phase()),
                cleanValues(dto.revealedByBranchKeys()),
                cleanValues(dto.revealedByChoiceKeys()),
                cleanPathAlternatives(dto.revealedByBranchPathAlternatives()),
                safeList(dto.requirements()).stream().map(QuestExplorerImportMapper::toSnapshot).toList(),
                safeList(dto.rewards()).stream().map(QuestExplorerImportMapper::toSnapshot).toList()
        );
    }

    private static QuestExplorerBranchImportSnapshot toSnapshot(QuestExplorerImportBranchDto dto) {
        QuestExplorerImportBranchLoreDto lore = dto.lore();
        QuestExplorerImportBranchStrategyDto strategy = dto.strategy();
        return new QuestExplorerBranchImportSnapshot(
                required(dto == null ? null : dto.branchKey(), "branch.branchKey"),
                trimToNull(dto.choiceKey()),
                required(dto.label(), "branch.label"),
                dto.orderIndex(),
                trimToNull(dto.groupKey()),
                trimToNull(dto.groupLabel()),
                dto.branchStepOrder(),
                trimToNull(dto.parentBranchKey()),
                trimToNull(dto.parentChoiceKey()),
                cleanReferenceValues(dto.prerequisiteBranchKeys()),
                cleanReferenceValues(dto.prerequisiteBranchPath()),
                cleanValues(dto.revealedByBranchKeys()),
                cleanValues(dto.revealedByChoiceKeys()),
                cleanPathAlternatives(dto.revealedByBranchPathAlternatives()),
                trimToNull(dto.choiceGroupKey()),
                trimToNull(dto.convergenceGroupKey()),
                trimToNull(dto.sectionRole()),
                cleanReferenceValues(dto.nextEntryKeys()),
                cleanReferenceValues(dto.failureEntryKeys()),
                cleanReferenceValues(dto.convergesIntoEntryKeys()),
                lore == null ? List.of() : cleanValues(lore.outcomePreviewLines()),
                strategy == null ? List.of() : cleanValues(strategy.conditions()),
                strategy == null ? List.of() : safeList(strategy.requirements()).stream().map(QuestExplorerImportMapper::toSnapshot).toList(),
                strategy == null ? List.of() : safeList(strategy.rewards()).stream().map(QuestExplorerImportMapper::toSnapshot).toList()
        );
    }

    private static QuestExplorerRequirementImportSnapshot toSnapshot(QuestExplorerImportRequirementDto dto) {
        return new QuestExplorerRequirementImportSnapshot(
                required(dto == null ? null : dto.requirementKey(), "requirement.requirementKey"),
                required(dto.kind(), "requirement.kind"),
                required(dto.displayText(), "requirement.displayText"),
                trimToNull(dto.polarity()),
                trimToNull(dto.groupLabel()),
                dto.groupOrder(),
                trimToNull(dto.targetRole()),
                trimToNull(dto.targetLabel()),
                dto.requiredCount(),
                dto.durationTurns(),
                trimToNull(dto.state()),
                trimToNull(dto.referenceKind()),
                trimToNull(dto.referenceKey()),
                trimToNull(dto.referenceDisplayName()),
                trimToNull(dto.codexEntryKey())
        );
    }

    private static QuestExplorerRewardImportSnapshot toSnapshot(QuestExplorerImportRewardDto dto) {
        return new QuestExplorerRewardImportSnapshot(
                required(dto == null ? null : dto.rewardKey(), "reward.rewardKey"),
                required(dto.kind(), "reward.kind"),
                required(dto.displayText(), "reward.displayText"),
                dto.amount(),
                trimToNull(dto.groupLabel()),
                dto.groupOrder(),
                trimToNull(dto.formulaText()),
                trimToNull(dto.assetKind()),
                trimToNull(dto.assetKey()),
                trimToNull(dto.assetDisplayName()),
                trimToNull(dto.referenceKind()),
                trimToNull(dto.referenceKey()),
                trimToNull(dto.referenceDisplayName()),
                trimToNull(dto.codexEntryKey()),
                trimToNull(dto.targetScopeLabel())
        );
    }

    private static QuestExplorerQualityImportSnapshot toSnapshot(QuestExplorerImportQualityDto dto) {
        return dto == null ? null : new QuestExplorerQualityImportSnapshot(cleanValues(dto.warnings()));
    }

    private static void validateBranches(String entryKey, List<QuestExplorerImportBranchDto> branches) {
        Set<String> branchKeys = new HashSet<>();
        for (QuestExplorerImportBranchDto branch : safeList(branches)) {
            String branchKey = required(branch == null ? null : branch.branchKey(), "branch.branchKey");
            if (!branchKeys.add(branchKey)) {
                throw new IllegalArgumentException("Duplicate branchKey '" + branchKey + "' in entry '" + entryKey + "'");
            }
            required(branch.label(), "branch.label");
            requirePresent(branch.nextEntryKeys(), "branch.nextEntryKeys", entryKey);
            if (branch.strategy() != null) {
                requirePresent(branch.strategy().conditions(), "branch.strategy.conditions", entryKey);
                requirePresent(branch.strategy().requirements(), "branch.strategy.requirements", entryKey);
                requirePresent(branch.strategy().rewards(), "branch.strategy.rewards", entryKey);
            }
        }
    }

    private static void validateOrdering(String entryKey, QuestExplorerImportEntryDto entry) {
        for (QuestExplorerImportBranchDto branch : safeList(entry.branches())) {
            if (branch != null && branch.orderIndex() != null && branch.orderIndex() < 0) {
                throw new IllegalArgumentException("Negative branch.orderIndex in entry '" + entryKey + "'");
            }
        }
    }

    private static void validateLinks(Set<String> entryKeys, String entryKey, String field, List<String> links) {
        for (String link : safeList(links)) {
            String cleanLink = trimToNull(link);
            if (cleanLink == null) {
                throw new IllegalArgumentException(
                        "Blank quest explorer reference in " + field + " for entry '" + entryKey + "'"
                );
            }
            if (!entryKeys.contains(cleanLink)) {
                throw new IllegalArgumentException(
                        "Invalid quest explorer reference '" + cleanLink + "' in " + field + " for entry '" + entryKey + "'"
                );
            }
        }
    }

    private static void requirePresent(List<?> values, String field, String entryKey) {
        if (values == null) {
            throw new IllegalArgumentException(field + " is required for '" + entryKey + "'");
        }
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
                .map(QuestExplorerImportMapper::trimToNull)
                .filter(Objects::nonNull)
                .toList();
    }

    private static List<String> cleanReferenceValues(List<String> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .map(value -> {
                    String trimmed = clean(value);
                    return trimmed == null ? "" : trimmed;
                })
                .toList();
    }

    private static List<List<String>> cleanPathAlternatives(List<List<String>> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .map(QuestExplorerImportMapper::cleanValues)
                .filter(path -> !path.isEmpty())
                .toList();
    }

    private static <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }
}
