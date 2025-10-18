package ewshop.infrastructure.bootstrap;

import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;
import java.util.logging.Logger;

@Component
public class CachePreloader {

    private static final Logger log = Logger.getLogger(CachePreloader.class.getName());

    private final CachePreloadService preloadService;

    public CachePreloader(CachePreloadService preloadService) {
        this.preloadService = preloadService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void preloadCaches() {
        log.info("Starting async cache preloading with timeouts...");

        CompletableFuture<Void> districtsFuture = preloadService.preloadDistricts();
        CompletableFuture<Void> techsFuture = preloadService.preloadTechs();
        CompletableFuture<Void> improvementsFuture = preloadService.preloadImprovements();

        CompletableFuture.allOf(districtsFuture, techsFuture, improvementsFuture)
                .thenRun(() -> log.info("All caches preloaded successfully"))
                .exceptionally(ex -> {
                    log.warning("Some cache preloads did not complete: " + ex.getMessage());
                    return null;
                });
    }
}
