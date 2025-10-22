package ewshop.infrastructure.bootstrap;

import ewshop.domain.service.DistrictService;
import ewshop.domain.service.TechService;
import ewshop.domain.service.ImprovementService;
import ewshop.domain.service.UnitSpecializationService;
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
    private final UnitSpecializationService unitService;

    public CachePreloadService(DistrictService districtService,
                               TechService techService,
                               ImprovementService improvementService,
                               UnitSpecializationService unitService) {
        this.districtService = districtService;
        this.techService = techService;
        this.improvementService = improvementService;
        this.unitService = unitService;
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> preloadDistricts() {
        return preload("districts", districtService::getAllDistricts);
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> preloadTechs() {
        return preload("techs", techService::getAllTechs);
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> preloadImprovements() {
        return preload("improvements", improvementService::getAllImprovements);
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> preloadUnits() {
        return preload("units", unitService::getAllUnits);
    }

    // --- Shared logic ---
    private CompletableFuture<Void> preload(String name, Runnable loader) {
        return CompletableFuture.runAsync(() -> {
                    long start = System.currentTimeMillis();
                    log.info("Preloading " + name + " cache...");
                    loader.run(); // triggers @Cacheable
                    long duration = System.currentTimeMillis() - start;
                    log.info(name.substring(0, 1).toUpperCase() + name.substring(1) + " cache preloaded in " + duration + " ms");
                }).orTimeout(PRELOAD_TIMEOUT_SEC, TimeUnit.SECONDS)
                .exceptionally(ex -> {
                    log.warning(name + " preload timed out: " + ex.getMessage());
                    return null;
                });
    }
}
