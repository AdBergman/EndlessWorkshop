package ewshop.infrastructure.bootstrap;

import ewshop.domain.service.DistrictService;
import ewshop.domain.service.ImprovementService;
import ewshop.domain.service.TechService;
import ewshop.domain.service.UnitSpecializationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.CompletableFuture;

@Service
public class CachePreloadService {

    private static final Logger log = LoggerFactory.getLogger(CachePreloadService.class);
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
        return preload("Districts", districtService::getAllDistricts);
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> preloadTechs() {
        return preload("Techs", techService::getAllTechs);
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> preloadImprovements() {
        return preload("Improvements", improvementService::getAllImprovements);
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Void> preloadUnits() {
        return preload("Units", unitService::getAllUnits);
    }

    // --- Shared logic ---
    private CompletableFuture<Void> preload(String name, Runnable loader) {
        long start = System.currentTimeMillis();
        try {
            log.info("Preloading {} cache...", name);
            loader.run(); // triggers @Cacheable in the @Async thread
            long duration = System.currentTimeMillis() - start;
            log.info("{} cache preloaded in {} ms", name, duration);
            return CompletableFuture.completedFuture(null);
        } catch (Exception ex) {
            long duration = System.currentTimeMillis() - start;
            log.warn("{} preload failed after {} ms", name, duration, ex);
            CompletableFuture<Void> f = new CompletableFuture<>();
            f.completeExceptionally(ex);
            return f;
        }
    }
}
