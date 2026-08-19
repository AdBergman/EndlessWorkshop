package ewshop.app.migration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class QuestExplorerChapterRootEvidenceMigrationTest {

    @Test
    void commonMigrations_shouldAddQuestExplorerChapterRootEvidenceMetadataColumn() throws Exception {
        String url = "jdbc:h2:mem:flyway_quest_chapter_root_evidence_" + UUID.randomUUID()
                + ";MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1";

        createPreExistingQuestExplorerMetadataTable(url);

        Flyway.configure()
                .dataSource(url, "sa", "")
                .locations("classpath:db/migration/common")
                .baselineOnMigrate(true)
                .baselineVersion("3.5.6")
                .target("3.5.7")
                .load()
                .migrate();

        try (var connection = DriverManager.getConnection(url, "sa", "")) {
            assertThat(columnExists(connection, "quest_explorer_import_metadata", "chapter_root_evidence_json"))
                    .isTrue();

            try (var statement = connection.prepareStatement("""
                    insert into quest_explorer_import_metadata (
                        id,
                        export_kind,
                        schema_version,
                        imported_at,
                        chapter_root_evidence_json
                    )
                    values (1, 'quest_explorer', 'quest_explorer.v3', current_timestamp, ?)
                    """)) {
                statement.setString(1, "{\"evidenceCounts\":{\"chapterRows\":52}}");
                statement.executeUpdate();
            }

            try (var statement = connection.createStatement();
                 var resultSet = statement.executeQuery("""
                         select chapter_root_evidence_json
                           from quest_explorer_import_metadata
                          where id = 1
                         """)) {
                resultSet.next();
                assertThat(resultSet.getString(1)).contains("\"chapterRows\":52");
            }
        }
    }

    private static void createPreExistingQuestExplorerMetadataTable(String url) throws SQLException {
        try (var connection = DriverManager.getConnection(url, "sa", "");
             var statement = connection.createStatement()) {
            statement.execute("""
                    create table quest_explorer_import_metadata (
                        id bigint primary key,
                        game_version varchar(80),
                        exporter_version varchar(80),
                        exported_at_utc varchar(80),
                        export_kind varchar(80) not null,
                        schema_version varchar(80) not null,
                        imported_at timestamp not null
                    )
                    """);
        }
    }

    private static boolean columnExists(
            java.sql.Connection connection,
            String tableName,
            String columnName
    ) throws SQLException {
        try (var statement = connection.prepareStatement("""
                select count(*)
                  from information_schema.columns
                 where table_schema = 'public'
                   and table_name = ?
                   and column_name = ?
                """)) {
            statement.setString(1, tableName);
            statement.setString(2, columnName);
            try (var resultSet = statement.executeQuery()) {
                resultSet.next();
                return resultSet.getInt(1) == 1;
            }
        }
    }
}
