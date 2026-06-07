package ewshop.domain.service;

import ewshop.domain.model.enums.FactionNamePolicy;
import ewshop.domain.model.quest.QuestExplorer;
import ewshop.domain.repository.QuestExplorerRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class QuestExplorerReadService {

    private final QuestExplorerRepository questExplorerRepository;

    public QuestExplorerReadService(QuestExplorerRepository questExplorerRepository) {
        this.questExplorerRepository = questExplorerRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("questExplorer")
    public QuestExplorer getQuestExplorer() {
        QuestExplorer explorer = questExplorerRepository.findQuestExplorer();
        if (explorer == null) {
            return null;
        }
        List<QuestExplorer.Entry> entries = enrichedEntries(explorer.entries());
        return new QuestExplorer(
                explorer.gameVersion(),
                explorer.exporterVersion(),
                explorer.exportedAtUtc(),
                explorer.exportKind(),
                explorer.schemaVersion(),
                entries,
                QuestExplorerProgressionProjector.project(new QuestExplorer(
                        explorer.gameVersion(),
                        explorer.exporterVersion(),
                        explorer.exportedAtUtc(),
                        explorer.exportKind(),
                        explorer.schemaVersion(),
                        entries
                ))
        );
    }

    private static List<QuestExplorer.Entry> enrichedEntries(List<QuestExplorer.Entry> entries) {
        return entries.stream()
                .map(QuestExplorerReadService::enrichedEntry)
                .toList();
    }

    private static QuestExplorer.Entry enrichedEntry(QuestExplorer.Entry entry) {
        QuestExplorer.Navigation navigation = entry.navigation();
        if (navigation == null) return entry;

        String factionDisplayName = firstDisplayName(
                navigation.factionName(),
                displayNameForFactionKey(navigation.factionKey()),
                displayNameForQuestLineKey(navigation.questLineKey())
        );
        String questLineDisplayName = firstDisplayName(
                navigation.questLineName(),
                displayNameForQuestLineKey(navigation.questLineKey()),
                factionDisplayName
        );

        if (equalsNullable(navigation.factionName(), factionDisplayName) &&
                equalsNullable(navigation.questLineName(), questLineDisplayName)) {
            return entry;
        }

        return new QuestExplorer.Entry(
                entry.entryKey(),
                entry.title(),
                entry.summaryLines(),
                entry.questType(),
                entry.isMandatory(),
                entry.isKeyNarrativeBeat(),
                entry.aliases(),
                new QuestExplorer.Navigation(
                        navigation.factionKey(),
                        factionDisplayName,
                        navigation.questLineKey(),
                        questLineDisplayName,
                        navigation.chapter(),
                        navigation.chapterLabel(),
                        navigation.step(),
                        navigation.stepLabel(),
                        navigation.sequenceIndex(),
                        navigation.chapterOrder(),
                        navigation.stepOrder(),
                        navigation.branchGroupKey(),
                        navigation.branchLabel(),
                        navigation.branchOrder(),
                        navigation.isBranchStart(),
                        navigation.isBranchEnd(),
                        navigation.previousEntryKeys(),
                        navigation.nextEntryKeys(),
                        navigation.failureEntryKeys(),
                        navigation.convergesIntoEntryKeys()
                ),
                entry.loreView(),
                entry.strategyView(),
                entry.branches(),
                entry.quality()
        );
    }

    private static String displayNameForFactionKey(String key) {
        String majorFaction = suffixAfterPrefix(key, "Faction_");
        if (majorFaction != null) {
            return FactionNamePolicy.bestEffortMajorDisplayName(majorFaction);
        }

        String minorFaction = suffixAfterPrefix(key, "MinorFaction_");
        if (minorFaction != null) {
            return FactionNamePolicy.bestEffortMinorDisplayName(withoutTrailingDigits(minorFaction));
        }

        return null;
    }

    private static String displayNameForQuestLineKey(String key) {
        String majorFaction = suffixAfterPrefix(key, "FactionQuest_");
        if (majorFaction != null) {
            return FactionNamePolicy.bestEffortMajorDisplayName(baseFactionToken(majorFaction));
        }

        String minorFaction = suffixAfterPrefix(key, "MinorFaction_SpecificQuest_");
        if (minorFaction != null) {
            return FactionNamePolicy.bestEffortMinorDisplayName(withoutTrailingDigits(minorFaction));
        }

        return null;
    }

    private static String suffixAfterPrefix(String value, String prefix) {
        if (value == null || !value.startsWith(prefix)) return null;
        String suffix = value.substring(prefix.length()).trim();
        return suffix.isEmpty() ? null : suffix;
    }

    private static String baseFactionToken(String value) {
        if (value == null) return null;
        int separator = value.indexOf('_');
        return withoutTrailingDigits(separator < 0 ? value : value.substring(0, separator));
    }

    private static String withoutTrailingDigits(String value) {
        return value == null ? null : value.replaceFirst("\\d+$", "");
    }

    private static String firstDisplayName(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value.trim();
        }
        return null;
    }

    private static boolean equalsNullable(String left, String right) {
        String cleanLeft = firstDisplayName(left);
        String cleanRight = firstDisplayName(right);
        return Objects.equals(cleanLeft, cleanRight);
    }
}
