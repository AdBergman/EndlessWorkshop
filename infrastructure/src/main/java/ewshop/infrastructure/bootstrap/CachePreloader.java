package ewshop.infrastructure.bootstrap;

import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class CachePreloader {

    private static final Logger log = LoggerFactory.getLogger(CachePreloader.class);
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
        CompletableFuture<Void> unitsFuture = preloadService.preloadUnits();

        CompletableFuture.allOf(districtsFuture, techsFuture, improvementsFuture, unitsFuture)
                .thenRun(() -> log.info("All caches preloaded successfully"))
                .exceptionally(ex -> {
                    log.warn("Some cache preloads did not complete: {}", ex.getMessage());
                    return null;
                });
    }
}
