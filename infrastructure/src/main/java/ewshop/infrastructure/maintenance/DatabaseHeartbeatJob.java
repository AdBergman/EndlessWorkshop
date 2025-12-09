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
        if (!enabled) {
            log.debug("Database heartbeat is disabled, skipping.");
            return;
        }

        long startTime = System.currentTimeMillis();
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            long duration = System.currentTimeMillis() - startTime;
            log.info("Database heartbeat successful in {} ms", duration);
        } catch (Exception ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.warn("Database heartbeat failed after {} ms", duration, ex);
        }
    }
}
