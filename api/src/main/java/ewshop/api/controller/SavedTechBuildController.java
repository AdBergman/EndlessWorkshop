package ewshop.api.controller;

import ewshop.facade.dto.response.SavedTechBuildDto;
import ewshop.facade.dto.request.CreateSavedTechBuildRequest;
import ewshop.facade.interfaces.SavedTechBuildFacade;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/builds")
public class SavedTechBuildController {

    private static final Logger log = LoggerFactory.getLogger(SavedTechBuildController.class);
    private final SavedTechBuildFacade facade;

    public SavedTechBuildController(SavedTechBuildFacade facade) {
        this.facade = facade;
    }

    @PostMapping
    public ResponseEntity<SavedTechBuildDto> createBuild(@RequestBody CreateSavedTechBuildRequest request) {
        SavedTechBuildDto dto = facade.createSavedBuild(request);
        return ResponseEntity.ok(dto);
    }


    @Cacheable(value = "savedTechBuilds", key = "#uuid")
    @GetMapping("/{uuid}")
    public ResponseEntity<SavedTechBuildDto> getBuild(@PathVariable UUID uuid) {
        log.info("Cache miss, fetching from DB: " + uuid);
        Optional<SavedTechBuildDto> dtoOpt = facade.getSavedBuildByUuid(uuid);
        return dtoOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
