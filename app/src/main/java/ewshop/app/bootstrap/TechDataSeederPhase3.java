package ewshop.app.bootstrap;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.domain.entity.Tech;
import ewshop.domain.entity.TechUnlock;
import ewshop.domain.repository.*;
import ewshop.infrastructure.persistence.mappers.UnitSpecializationMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataUnitSpecializationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class TechDataSeederPhase3 {

    private static final Logger log = LoggerFactory.getLogger(TechDataSeederPhase3.class);

    private final TechRepository techRepository;
    private final TechUnlockRepository techUnlockRepository;
    private final ImprovementRepository improvementRepository;
    private final DistrictRepository districtRepository;
    private final UnitSpecializationRepository unitSpecializationRepository;
    private final SpringDataUnitSpecializationRepository unitSpecializationJpa;
    private final UnitSpecializationMapper mapper;


    private final ObjectMapper objectMapper;

    @Value("${seeders.techPhase3.enabled:false}")
    private boolean phase3Enabled;

    public TechDataSeederPhase3(
            TechRepository techRepository,
            TechUnlockRepository techUnlockRepository,
            ImprovementRepository improvementRepository,
            DistrictRepository districtRepository,
            UnitSpecializationRepository unitSpecializationRepository, SpringDataUnitSpecializationRepository unitSpecializationJpa, UnitSpecializationMapper mapper,
            ObjectMapper objectMapper
    ) {
        this.techRepository = techRepository;
        this.techUnlockRepository = techUnlockRepository;
        this.improvementRepository = improvementRepository;
        this.districtRepository = districtRepository;
        this.unitSpecializationRepository = unitSpecializationRepository;
        this.unitSpecializationJpa = unitSpecializationJpa;
        this.mapper = mapper;
        this.objectMapper = objectMapper;
    }

    @Transactional
    @EventListener(ApplicationReadyEvent.class)
    @Order(7)
    public void seedPhase3() {
        if (!phase3Enabled) {
            System.out.println("TechDataSeeder3 is disabled, skipping...");
            return;
        }
        try {
            log.info("Starting Tech Seeding Phase 3: Unlocks.");

            InputStream is = getClass().getResourceAsStream("/data/techs.json");
            if (is == null) {
                log.error("Failed to find techs.json for Phase 3 seeding.");
                return;
            }

            TechDTO[] techDTOs = objectMapper.readValue(is, TechDTO[].class);

            // Load all Techs
            Map<String, Tech> techDomainMap = techRepository.findAll()
                    .stream()
                    .collect(Collectors.toMap(Tech::getName, t -> t));

            int totalUnlocks = 0;

            for (TechDTO dto : techDTOs) {
                Tech tech = techDomainMap.get(dto.name);
                if (tech == null) {
                    log.warn("Tech not found for Phase 3 seeding: {}", dto.name);
                    continue;
                }

                if (dto.unlocks == null || dto.unlocks.isEmpty()) continue;

                List<TechUnlock> unlocks = new ArrayList<>();

                for (String rawUnlock : dto.unlocks) {
                    TechUnlock.Builder builder = TechUnlock.builder();

                    String[] parts = rawUnlock.split(":", 2);
                    String key = parts[0].trim();
                    String value = parts.length > 1 ? parts[1].trim() : null;

                    switch (key) {
                        case "Improvement" -> {
                            var improvement = improvementRepository.findByName(value);
                            if (improvement == null) {
                                throw new IllegalStateException("Improvement not found: " + value);
                            }
                            builder.improvement(improvement);
                        }

                        case "District" -> {
                            var district = districtRepository.findByName(value);
                            if (district == null) {
                                throw new IllegalStateException("District not found: " + value);
                            }
                            builder.district(district);
                        }

                        case "Unit Specialization" -> {
                            // Fetch existing UnitSpecialization entity
                            var unitEntity = unitSpecializationJpa.findByName(value)
                                    .orElseThrow(() -> new IllegalStateException("UnitSpecialization not found: " + value));

                            log.info("Linking existing UnitSpecialization '{}' to TechUnlock", value);

                            // Build a minimal domain object with just name/id to avoid skill mapping
                            var minimalDomainUnit = ewshop.domain.entity.UnitSpecialization.builder()
                                    .name(unitEntity.getName())
                                    .build();

                            builder.unitSpecialization(minimalDomainUnit);
                        }

                        default -> builder.unlockText(rawUnlock);
                    }

                    unlocks.add(builder.build());
                }

                // Persist the unlocks for this tech
                techUnlockRepository.updateUnlocksForTech(tech, unlocks);
                totalUnlocks += unlocks.size();
            }

            log.info("Tech Seeding Phase 3 completed successfully: {} unlocks processed.", totalUnlocks);

        } catch (Exception e) {
            log.error("Failed during TechDataSeederPhase3", e);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class TechDTO {
        public String name;
        public List<String> unlocks;
    }
}
