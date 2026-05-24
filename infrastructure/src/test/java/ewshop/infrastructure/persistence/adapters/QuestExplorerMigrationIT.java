package ewshop.infrastructure.persistence.adapters;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class QuestExplorerMigrationIT {

    @Test
    void questExplorerMigrationDropsTemporaryChronicleTablesAndCreatesV3Tables() {
        DataSource dataSource = new DriverManagerDataSource(
                "jdbc:h2:mem:quest_explorer_migration_" + UUID.randomUUID() + ";DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
                "sa",
                ""
        );

        new ResourceDatabasePopulator(
                new ClassPathResource("db/migration/common/V3_4_0__quest_chronicle_vertical_slice.sql"),
                new ClassPathResource("db/migration/common/V3_4_1__quest_explorer_v3_vertical_slice.sql"),
                new ClassPathResource("db/migration/common/V3_4_3__quest_explorer_branch_continuity_metadata.sql")
        ).execute(dataSource);

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

        assertThat(tableExists(jdbcTemplate, "QUEST_CHRONICLE_ENTRIES")).isFalse();
        assertThat(tableExists(jdbcTemplate, "QUEST_EXPLORER_IMPORT_BATCHES")).isFalse();
        assertThat(tableExists(jdbcTemplate, "QUEST_EXPLORER_IMPORT_METADATA")).isTrue();
        assertThat(tableExists(jdbcTemplate, "QUEST_EXPLORER_ENTRIES")).isTrue();
        assertThat(tableExists(jdbcTemplate, "QUEST_EXPLORER_NAVIGATION")).isTrue();
        assertThat(tableExists(jdbcTemplate, "QUEST_EXPLORER_BRANCHES")).isTrue();
        assertThat(tableExists(jdbcTemplate, "QUEST_EXPLORER_BRANCH_CONDITIONS")).isTrue();
        assertThat(primaryKeyColumns(
                jdbcTemplate,
                "QUEST_EXPLORER_BRANCH_PREREQUISITE_KEYS",
                "PK_QUEST_EXPLORER_BRANCH_PREREQ_KEYS"
        )).containsExactly("BRANCH_ID", "KEY_ORDER");
        assertThat(primaryKeyColumns(
                jdbcTemplate,
                "QUEST_EXPLORER_BRANCH_PREREQUISITE_PATH",
                "PK_QUEST_EXPLORER_BRANCH_PREREQ_PATH"
        )).containsExactly("BRANCH_ID", "PATH_ORDER");
    }

    private static boolean tableExists(JdbcTemplate jdbcTemplate, String tableName) {
        Integer count = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_SCHEMA = 'PUBLIC'
                  AND TABLE_NAME = ?
                """, Integer.class, tableName);
        return count != null && count > 0;
    }

    private static java.util.List<String> primaryKeyColumns(
            JdbcTemplate jdbcTemplate,
            String tableName,
            String constraintName
    ) {
        return jdbcTemplate.queryForList("""
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = 'PUBLIC'
                  AND TABLE_NAME = ?
                  AND CONSTRAINT_NAME = ?
                ORDER BY ORDINAL_POSITION
                """, String.class, tableName, constraintName);
    }
}
