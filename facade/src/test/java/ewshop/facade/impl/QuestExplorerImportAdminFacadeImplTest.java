package ewshop.facade.impl;

import ewshop.domain.command.QuestExplorerEntryImportSnapshot;
import ewshop.domain.command.QuestExplorerImportMetadata;
import ewshop.domain.model.quest.QuestExplorer;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.QuestExplorerRepository;
import ewshop.domain.service.QuestExplorerImportService;
import ewshop.domain.service.QuestExplorerReadService;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportEntryDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportLoreViewDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportNavigationDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportStrategyViewDto;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class QuestExplorerImportAdminFacadeImplTest {

    @Test
    void importQuestExplorerCollectsEntryMappingErrorsAndImportsValidSnapshots() {
        InMemoryQuestExplorerRepository repository = new InMemoryQuestExplorerRepository();
        QuestExplorerImportAdminFacadeImpl facade = new QuestExplorerImportAdminFacadeImpl(
                new QuestExplorerImportService(repository),
                new QuestExplorerReadService(repository)
        );
        QuestExplorerImportBatchDto file = batch(List.of(validEntry("Quest_A", 1), invalidEntry("Quest_B", 2)));

        var summary = facade.importQuestExplorer(file);

        assertThat(summary.counts().received()).isEqualTo(2);
        assertThat(summary.counts().inserted()).isEqualTo(1);
        assertThat(summary.counts().failed()).isEqualTo(1);
        assertThat(summary.diagnostics().errors()).hasSize(1);
        assertThat(repository.lastMetadata.exportKind()).isEqualTo("quest_explorer");
        assertThat(repository.lastSnapshots).extracting(QuestExplorerEntryImportSnapshot::entryKey).containsExactly("Quest_A");
    }

    private static QuestExplorerImportBatchDto batch(List<QuestExplorerImportEntryDto> entries) {
        return new QuestExplorerImportBatchDto(
                "0.80",
                "0.1.0",
                "2026-05-19T00:00:00Z",
                "quest_explorer",
                "quest_explorer.v3",
                entries
        );
    }

    private static QuestExplorerImportEntryDto validEntry(String key, int sequenceIndex) {
        return new QuestExplorerImportEntryDto(
                key,
                key + " Title",
                List.of("Summary"),
                null,
                null,
                null,
                List.of(),
                new QuestExplorerImportNavigationDto(
                        null, null, null, null, null, null, null, null, sequenceIndex,
                        null, null, null, null, null, null, null, List.of(), List.of(), List.of(), List.of()
                ),
                new QuestExplorerImportLoreViewDto(List.of()),
                new QuestExplorerImportStrategyViewDto(List.of()),
                List.of(),
                null
        );
    }

    private static QuestExplorerImportEntryDto invalidEntry(String key, int sequenceIndex) {
        return new QuestExplorerImportEntryDto(
                key,
                null,
                List.of("Summary"),
                null,
                null,
                null,
                List.of(),
                new QuestExplorerImportNavigationDto(
                        null, null, null, null, null, null, null, null, sequenceIndex,
                        null, null, null, null, null, null, null, List.of(), List.of(), List.of(), List.of()
                ),
                new QuestExplorerImportLoreViewDto(List.of()),
                new QuestExplorerImportStrategyViewDto(List.of()),
                List.of(),
                null
        );
    }

    private static class InMemoryQuestExplorerRepository implements QuestExplorerRepository {
        private QuestExplorerImportMetadata lastMetadata;
        private List<QuestExplorerEntryImportSnapshot> lastSnapshots = List.of();

        @Override
        public ImportResult importQuestExplorerEntries(
                QuestExplorerImportMetadata metadata,
                List<QuestExplorerEntryImportSnapshot> snapshots
        ) {
            lastMetadata = metadata;
            lastSnapshots = List.copyOf(snapshots);
            ImportResult result = new ImportResult();
            snapshots.forEach(ignored -> result.incrementInserted());
            return result;
        }

        @Override
        public QuestExplorer findQuestExplorer() {
            return new QuestExplorer(
                    "0.80",
                    "0.1.0",
                    "2026-05-19T00:00:00Z",
                    "quest_explorer",
                    "quest_explorer.v3",
                    List.of()
            );
        }
    }
}
