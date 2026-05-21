package ewshop.quest;

import ewshop.domain.command.QuestExplorerEntryImportSnapshot;
import ewshop.domain.command.QuestExplorerImportMetadata;
import ewshop.domain.command.QuestExplorerNavigationImportSnapshot;
import ewshop.domain.model.quest.QuestExplorer;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.QuestExplorerRepository;
import ewshop.domain.service.QuestExplorerImportService;
import ewshop.domain.service.QuestExplorerReadService;
import org.junit.jupiter.api.Test;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class QuestExplorerCacheTest {

    @Test
    void importEvictsQuestExplorerReadCache() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(TestConfig.class)) {
            QuestExplorerReadService readService = context.getBean(QuestExplorerReadService.class);
            QuestExplorerImportService importService = context.getBean(QuestExplorerImportService.class);
            InMemoryQuestExplorerRepository repository = context.getBean(InMemoryQuestExplorerRepository.class);

            assertThat(readService.getQuestExplorer().entries().getFirst().entryKey()).isEqualTo("Quest_A");
            assertThat(readService.getQuestExplorer().entries().getFirst().entryKey()).isEqualTo("Quest_A");
            assertThat(repository.findCalls).isEqualTo(1);

            importService.importQuestExplorer(metadata(), List.of(snapshot("Quest_B", 2)));

            assertThat(readService.getQuestExplorer().entries().getFirst().entryKey()).isEqualTo("Quest_B");
            assertThat(repository.findCalls).isEqualTo(2);
        }
    }

    @Configuration
    @EnableCaching
    static class TestConfig {
        @Bean
        CacheManager cacheManager() {
            return new ConcurrentMapCacheManager("questExplorer");
        }

        @Bean
        InMemoryQuestExplorerRepository questExplorerRepository() {
            return new InMemoryQuestExplorerRepository(explorer("Quest_A", 1));
        }

        @Bean
        QuestExplorerReadService questExplorerReadService(QuestExplorerRepository repository) {
            return new QuestExplorerReadService(repository);
        }

        @Bean
        QuestExplorerImportService questExplorerImportService(QuestExplorerRepository repository) {
            return new QuestExplorerImportService(repository);
        }
    }

    static class InMemoryQuestExplorerRepository implements QuestExplorerRepository {
        private QuestExplorer current;
        private int findCalls;

        InMemoryQuestExplorerRepository(QuestExplorer current) {
            this.current = current;
        }

        @Override
        public ImportResult importQuestExplorerEntries(
                QuestExplorerImportMetadata metadata,
                List<QuestExplorerEntryImportSnapshot> snapshots
        ) {
            this.current = explorer(snapshots.getFirst().entryKey(), snapshots.getFirst().navigation().sequenceIndex());
            ImportResult result = new ImportResult();
            snapshots.forEach(ignored -> result.incrementInserted());
            return result;
        }

        @Override
        public QuestExplorer findQuestExplorer() {
            findCalls++;
            return current;
        }
    }

    private static QuestExplorerImportMetadata metadata() {
        return new QuestExplorerImportMetadata("0.80", "0.1.0", "2026-05-19T00:00:00Z", "quest_explorer", "quest_explorer.v3");
    }

    private static QuestExplorerEntryImportSnapshot snapshot(String entryKey, int sequenceIndex) {
        return new QuestExplorerEntryImportSnapshot(
                entryKey,
                entryKey + " Title",
                List.of("Summary"),
                null,
                null,
                null,
                List.of(),
                new QuestExplorerNavigationImportSnapshot(
                        null, null, null, null, null, null, null, null, sequenceIndex,
                        null, null, null, null, null, null, null, List.of(), List.of(), List.of(), List.of()
                ),
                List.of(),
                List.of(),
                List.of(),
                null
        );
    }

    private static QuestExplorer explorer(String entryKey, int sequenceIndex) {
        return new QuestExplorer(
                "0.80",
                "0.1.0",
                "2026-05-19T00:00:00Z",
                "quest_explorer",
                "quest_explorer.v3",
                List.of(new QuestExplorer.Entry(
                        entryKey,
                        entryKey + " Title",
                        List.of("Summary"),
                        null,
                        null,
                        null,
                        List.of(),
                        new QuestExplorer.Navigation(
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                sequenceIndex,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                List.of(),
                                List.of(),
                                List.of(),
                                List.of()
                        ),
                        new QuestExplorer.LoreView(List.of()),
                        new QuestExplorer.StrategyView(List.of()),
                        List.of(),
                        null
                ))
        );
    }
}
