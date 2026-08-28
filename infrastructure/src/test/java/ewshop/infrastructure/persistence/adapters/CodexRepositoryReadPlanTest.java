package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.model.Codex;
import ewshop.domain.repository.CodexRepository;
import ewshop.infrastructure.persistence.entities.CodexEntity;
import ewshop.infrastructure.persistence.mappers.CodexMapper;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.context.annotation.Import;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = {
        "spring.jpa.properties.hibernate.generate_statistics=true",
        "spring.jpa.properties.hibernate.show_sql=false",
        "spring.jpa.show-sql=false"
})
@Import({CodexRepositoryAdapter.class, CodexMapper.class})
class CodexRepositoryReadPlanTest {

    private static final int ENTRY_COUNT = 205;
    private static final long MAX_COLD_READ_STATEMENTS = 6;

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CodexRepository codexRepository;

    @Test
    void findAllLoadsAllOrderedCollectionsWithBoundedStatements() {
        for (int index = 0; index < ENTRY_COUNT; index++) {
            entityManager.persist(codexEntity(index));
        }
        entityManager.flush();
        entityManager.clear();

        Statistics statistics = entityManager.getEntityManager()
                .getEntityManagerFactory()
                .unwrap(SessionFactory.class)
                .getStatistics();
        statistics.clear();

        List<Codex> entries = codexRepository.findAll();

        assertThat(entries).hasSize(ENTRY_COUNT);
        assertThat(entries).allSatisfy(entry -> {
            assertThat(entry.getDescriptionLines()).hasSize(1);
            assertThat(entry.getReferenceKeys()).hasSize(1);
            assertThat(entry.getPublicContextKeys()).hasSize(1);
        });
        assertThat(statistics.getPrepareStatementCount())
                .isLessThanOrEqualTo(MAX_COLD_READ_STATEMENTS);
    }

    private static CodexEntity codexEntity(int index) {
        CodexEntity entity = new CodexEntity();
        entity.setExportKind("abilities");
        entity.setEntryKey("Ability_" + index);
        entity.setDisplayName("Ability " + index);
        entity.setCategory("Combat");
        entity.setKind("Ability");
        entity.setDescriptionLines(List.of("Description " + index));
        entity.setReferenceKeys(List.of("Reference_" + index));
        entity.setPublicContextKeys(List.of("Context_" + index));
        return entity;
    }
}
