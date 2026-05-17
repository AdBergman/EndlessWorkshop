package ewshop.app.migration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

import java.sql.DriverManager;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class TechUnlockCategoryMigrationTest {

    @Test
    void commonMigrations_shouldAddNullableUnlockCategoryColumn() throws Exception {
        String url = "jdbc:h2:mem:flyway_unlock_category_" + UUID.randomUUID()
                + ";MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1";

        try (var connection = DriverManager.getConnection(url, "sa", "");
             var statement = connection.createStatement()) {
            statement.execute("""
                    create table tech_unlocks (
                        tech_id bigint not null,
                        order_index int not null,
                        unlock_type varchar(64) not null,
                        unlock_key varchar(255) not null
                    )
                    """);
        }

        Flyway.configure()
                .dataSource(url, "sa", "")
                .locations("classpath:db/migration/common")
                .baselineOnMigrate(true)
                .baselineVersion("3.3.4")
                .load()
                .migrate();

        try (var connection = DriverManager.getConnection(url, "sa", "");
             var statement = connection.prepareStatement("""
                     select count(*)
                       from information_schema.columns
                      where lower(table_name) = 'tech_unlocks'
                        and lower(column_name) = 'unlock_category'
                        and is_nullable = 'YES'
                     """);
             var resultSet = statement.executeQuery()) {
            resultSet.next();
            assertThat(resultSet.getInt(1)).isEqualTo(1);
        }
    }
}
