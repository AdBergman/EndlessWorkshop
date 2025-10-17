package ewshop.infrastructure.bootstrap;

import ewshop.domain.service.DistrictService;
import ewshop.domain.service.TechService;
import ewshop.domain.service.ImprovementService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

@Component
public class CachePreloader {

    private static final Logger log = Logger.getLogger(CachePreloader.class.getName());

    private final DistrictService districtService;
    private final TechService techService;
    private final ImprovementService improvementService;

    private static final long PRELOAD_TIMEOUT_SEC = 60;

    public CachePreloader(DistrictService districtService,
                          TechService techService,
                          ImprovementService improvementService) {
        this.districtService = districtService;
        this.techService = techService;
        this.improvementService = improvementService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void preloadCaches() {
        log.info("Starting async cache preloading with timeouts...");

        CompletableFuture<Void> districtsFuture = preloadDistricts();
        CompletableFuture<Void> techsFuture = preloadTechs();
        CompletableFuture<Void> improvementsFuture = preloadImprovements();

        CompletableFuture.allOf(districtsFuture, techsFuture, improvementsFuture)
                .thenRun(() -> log.info("All caches preloaded successfully"))
                .exceptionally(ex -> {
                    log.warning("Some cache preloads did not complete: " + ex.getMessage());
                    return null;
                });
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> preloadDistricts() {
        return CompletableFuture.runAsync(() -> {
                    long start = System.currentTimeMillis();
                    log.info("Preloading districts cache...");
                    districtService.getAllDistricts(); // @Cacheable triggers
                    long duration = System.currentTimeMillis() - start;
                    log.info("Districts cache preloaded in " + duration + " ms");
                }).orTimeout(PRELOAD_TIMEOUT_SEC, TimeUnit.SECONDS)
                .exceptionally(ex -> {
                    log.warning("Districts preload timed out: " + ex.getMessage());
                    return null;
                });
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> preloadTechs() {
        return CompletableFuture.runAsync(() -> {
                    long start = System.currentTimeMillis();
                    log.info("Preloading techs cache...");
                    techService.getAllTechs(); // @Cacheable triggers
                    long duration = System.currentTimeMillis() - start;
                    log.info("Techs cache preloaded in " + duration + " ms");
                }).orTimeout(PRELOAD_TIMEOUT_SEC, TimeUnit.SECONDS)
                .exceptionally(ex -> {
                    log.warning("Techs preload timed out: " + ex.getMessage());
                    return null;
                });
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> preloadImprovements() {
        return CompletableFuture.runAsync(() -> {
                    long start = System.currentTimeMillis();
                    log.info("Preloading improvements cache...");
                    improvementService.getAllImprovements(); // @Cacheable triggers
                    long duration = System.currentTimeMillis() - start;
                    log.info("Improvements cache preloaded in " + duration + " ms");
                }).orTimeout(PRELOAD_TIMEOUT_SEC, TimeUnit.SECONDS)
                .exceptionally(ex -> {
                    log.warning("Improvements preload timed out: " + ex.getMessage());
                    return null;
                });
    }
}
