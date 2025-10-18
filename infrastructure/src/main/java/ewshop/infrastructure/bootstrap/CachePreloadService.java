package ewshop.infrastructure.bootstrap;

import ewshop.domain.service.DistrictService;
import ewshop.domain.service.TechService;
import ewshop.domain.service.ImprovementService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

@Service
public class CachePreloadService {

    private static final Logger log = Logger.getLogger(CachePreloadService.class.getName());
    private static final long PRELOAD_TIMEOUT_SEC = 60;

    private final DistrictService districtService;
    private final TechService techService;
    private final ImprovementService improvementService;

    public CachePreloadService(DistrictService districtService,
                               TechService techService,
                               ImprovementService improvementService) {
        this.districtService = districtService;
        this.techService = techService;
        this.improvementService = improvementService;
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
