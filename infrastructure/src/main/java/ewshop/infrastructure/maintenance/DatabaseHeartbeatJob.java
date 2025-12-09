package ewshop.infrastructure.maintenance;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Periodic lightweight heartbeat to keep Neon Postgres awake.
 * Runs once every midnight (00:05 Stockholm time).
 *
 * Infrastructure-only responsibility: does NOT touch domain logic.
 */
@Component
public class DatabaseHeartbeatJob {

    private static final Logger log = LoggerFactory.getLogger(DatabaseHeartbeatJob.class);

    private final JdbcTemplate jdbcTemplate;

    @Value("${ewshop.heartbeat.enabled:true}")
    private boolean enabled;

    public DatabaseHeartbeatJob(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Executes SELECT 1 at 00:05 Stockholm time every day.
     * Does nothing if disabled via config.
     */
    @Scheduled(cron = "0 5 0 * * *", zone = "Europe/Stockholm")
    public void pingDatabase() {
        if (!enabled) return;

        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            if (result != null && result == 1) {
                log.debug("💓 Database heartbeat OK (SELECT 1)");
            } else {
                log.warn("💓 Database heartbeat returned unexpected result: {}", result);
            }
        } catch (Exception ex) {
            log.warn("💥 Database heartbeat FAILED", ex);
        }
    }
}
