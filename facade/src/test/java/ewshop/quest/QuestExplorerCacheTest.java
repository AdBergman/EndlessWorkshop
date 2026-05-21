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
    void readEnrichesQuestExplorerFactionDisplayNamesFromKnownKeys() {
        QuestExplorer explorer = explorer(List.of(
                entry(
                        "FactionQuest_KinOfSheredyn_Chapter01_Step01",
                        "The Missing Youth",
                        "Faction Quest",
                        "Faction_KinOfSheredyn",
                        "FactionQuest_KinOfSheredyn",
                        1,
                        0,
                        1
                ),
                entry(
                        "MinorFaction_SpecificQuest_Noquensii01",
                        "Artistic License",
                        "Minor Faction Quest",
                        "MinorFaction_Noquensii",
                        "MinorFaction_SpecificQuest_Noquensii",
                        null,
                        null,
                        2
                )
        ));
        QuestExplorerReadService readService = new QuestExplorerReadService(new InMemoryQuestExplorerRepository(explorer));

        QuestExplorer result = readService.getQuestExplorer();

        assertThat(result.entries().getFirst().navigation().factionName()).isEqualTo("Kin");
        assertThat(result.entries().getFirst().navigation().questLineName()).isEqualTo("Kin");
        assertThat(result.entries().get(1).navigation().factionName()).isEqualTo("Noquensii");
        assertThat(result.entries().get(1).navigation().questLineName()).isEqualTo("Noquensii");
        assertThat(result.progression().questlines().getFirst().factionName()).isEqualTo("Kin");
    }

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
        return explorer(List.of(entry(
                entryKey,
                entryKey + " Title",
                null,
                null,
                null,
                null,
                null,
                sequenceIndex
        )));
    }

    private static QuestExplorer explorer(List<QuestExplorer.Entry> entries) {
        return new QuestExplorer(
                "0.80",
                "0.1.0",
                "2026-05-19T00:00:00Z",
                "quest_explorer",
                "quest_explorer.v3",
                entries
        );
    }

    private static QuestExplorer.Entry entry(
            String entryKey,
            String title,
            String questType,
            String factionKey,
            String questLineKey,
            Integer chapter,
            Integer stepOrder,
            int sequenceIndex
    ) {
        return new QuestExplorer.Entry(
                entryKey,
                title,
                List.of("Summary"),
                questType,
                null,
                null,
                List.of(),
                new QuestExplorer.Navigation(
                        factionKey,
                        null,
                        questLineKey,
                        null,
                        chapter,
                        chapter == null ? null : "Chapter " + chapter,
                        stepOrder == null ? null : stepOrder + 1,
                        stepOrder == null ? null : "Step " + (stepOrder + 1),
                        sequenceIndex,
                        chapter,
                        stepOrder,
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
        );
    }
}
