package ewshop.facade.impl;

import ewshop.domain.command.CodexImportSnapshot;
import ewshop.domain.model.Codex;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.CodexRepository;
import ewshop.domain.service.CodexFilterService;
import ewshop.domain.service.CodexImportService;
import ewshop.domain.service.CodexService;
import ewshop.facade.interfaces.CodexFacade;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

class CodexIdentityCacheTest {

    @Test
    void codexImportEvictsTheCachedIdentityDirectory() {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext()) {
            context.getEnvironment().setActiveProfiles("codex-identity-cache-test");
            context.register(TestConfig.class);
            context.refresh();

            CodexFacade facade = context.getBean(CodexFacade.class);
            CodexImportService importService = context.getBean(CodexImportService.class);
            InMemoryCodexRepository repository = context.getBean(InMemoryCodexRepository.class);

            assertThat(facade.getCodexIdentities()).extracting(identity -> identity.entryKey())
                    .containsExactly("Ability_A");
            assertThat(facade.getCodexIdentities()).extracting(identity -> identity.entryKey())
                    .containsExactly("Ability_A");
            assertThat(repository.findCalls()).isEqualTo(1);

            importService.importCodex(List.of(snapshot("Ability_B", "Ability B")));

            assertThat(facade.getCodexIdentities()).extracting(identity -> identity.entryKey())
                    .containsExactly("Ability_B");
            assertThat(repository.findCalls()).isEqualTo(2);
        }
    }

    @Test
    void concurrentFullAndIdentityReadsShareOneCanonicalCatalogLoad() throws Exception {
        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext()) {
            context.getEnvironment().setActiveProfiles("codex-identity-cache-test");
            context.register(TestConfig.class);
            context.refresh();

            CodexFacade facade = context.getBean(CodexFacade.class);
            InMemoryCodexRepository repository = context.getBean(InMemoryCodexRepository.class);
            repository.blockFindAll();

            ExecutorService executor = Executors.newFixedThreadPool(2);
            try {
                CountDownLatch callersReady = new CountDownLatch(2);
                CountDownLatch startCalls = new CountDownLatch(1);
                Future<?> fullEntries = executor.submit(() -> {
                    callersReady.countDown();
                    startCalls.await();
                    return facade.getAllCodexEntries();
                });
                Future<?> identities = executor.submit(() -> {
                    callersReady.countDown();
                    startCalls.await();
                    return facade.getCodexIdentities();
                });

                assertThat(callersReady.await(2, TimeUnit.SECONDS)).isTrue();
                startCalls.countDown();
                assertThat(repository.awaitFirstFind()).isTrue();
                assertThat(repository.awaitSecondFind()).isFalse();
                repository.releaseFindAll();

                fullEntries.get(2, TimeUnit.SECONDS);
                identities.get(2, TimeUnit.SECONDS);

                assertThat(facade.getCodexSummary()).hasSize(1);
                assertThat(facade.getCodexEntriesByCategory("abilities")).hasSize(1);
                assertThat(repository.findCalls()).isEqualTo(1);
            } finally {
                repository.releaseFindAll();
                executor.shutdownNow();
            }
        }
    }

    @TestConfiguration
    @EnableCaching
    @Profile("codex-identity-cache-test")
    static class TestConfig {

        @Bean
        CacheManager cacheManager() {
            return new ConcurrentMapCacheManager("codex");
        }

        @Bean
        InMemoryCodexRepository codexRepository() {
            return new InMemoryCodexRepository(codex("Ability_A", "Ability A"));
        }

        @Bean
        CodexService codexService(CodexRepository repository) {
            return new CodexService(repository);
        }

        @Bean
        CodexFilterService codexFilterService() {
            return new CodexFilterService();
        }

        @Bean
        CodexFacade codexFacade(CodexService service, CodexFilterService filterService) {
            return new CodexFacadeImpl(service, filterService);
        }

        @Bean
        CodexImportService codexImportService(CodexRepository repository) {
            return new CodexImportService(repository);
        }
    }

    static class InMemoryCodexRepository implements CodexRepository {
        private List<Codex> entries;
        private final AtomicInteger findCalls = new AtomicInteger();
        private final CountDownLatch firstFindStarted = new CountDownLatch(1);
        private final CountDownLatch secondFindStarted = new CountDownLatch(1);
        private final CountDownLatch releaseFind = new CountDownLatch(1);
        private volatile boolean blockFind;

        InMemoryCodexRepository(Codex initialEntry) {
            this.entries = List.of(initialEntry);
        }

        @Override
        public List<Codex> findAll() {
            int call = findCalls.incrementAndGet();
            if (call == 1) {
                firstFindStarted.countDown();
            } else if (call == 2) {
                secondFindStarted.countDown();
            }
            if (blockFind) {
                await(releaseFind, 2, TimeUnit.SECONDS);
            }
            return entries;
        }

        int findCalls() {
            return findCalls.get();
        }

        void blockFindAll() {
            blockFind = true;
        }

        boolean awaitFirstFind() {
            return await(firstFindStarted, 2, TimeUnit.SECONDS);
        }

        boolean awaitSecondFind() {
            return await(secondFindStarted, 200, TimeUnit.MILLISECONDS);
        }

        void releaseFindAll() {
            blockFind = false;
            releaseFind.countDown();
        }

        @Override
        public ImportResult importCodexSnapshot(List<CodexImportSnapshot> snapshots) {
            this.entries = snapshots.stream()
                    .map(snapshot -> codex(snapshot.entryKey(), snapshot.displayName()))
                    .toList();
            ImportResult result = new ImportResult();
            snapshots.forEach(ignored -> result.incrementInserted());
            return result;
        }

        private static boolean await(CountDownLatch latch, long timeout, TimeUnit unit) {
            try {
                return latch.await(timeout, unit);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException("Interrupted while coordinating cache test", ex);
            }
        }
    }

    private static CodexImportSnapshot snapshot(String entryKey, String displayName) {
        return new CodexImportSnapshot(
                entryKey,
                displayName,
                "abilities",
                "Combat",
                "Ability",
                List.of("Public ability description."),
                List.of()
        );
    }

    private static Codex codex(String entryKey, String displayName) {
        return Codex.builder()
                .entryKey(entryKey)
                .displayName(displayName)
                .exportKind("abilities")
                .category("Combat")
                .kind("Ability")
                .descriptionLines(List.of("Public ability description."))
                .referenceKeys(List.of())
                .build();
    }
}
