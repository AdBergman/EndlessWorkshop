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
            assertThat(repository.findCalls).isEqualTo(1);

            importService.importCodex(List.of(snapshot("Ability_B", "Ability B")));

            assertThat(facade.getCodexIdentities()).extracting(identity -> identity.entryKey())
                    .containsExactly("Ability_B");
            assertThat(repository.findCalls).isEqualTo(2);
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
        private int findCalls;

        InMemoryCodexRepository(Codex initialEntry) {
            this.entries = List.of(initialEntry);
        }

        @Override
        public List<Codex> findAll() {
            findCalls += 1;
            return entries;
        }

        @Override
        public List<Codex> findAllByExportKind(String exportKind) {
            return entries.stream()
                    .filter(entry -> exportKind.equals(entry.getExportKind()))
                    .toList();
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
