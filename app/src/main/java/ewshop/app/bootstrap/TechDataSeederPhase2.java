package ewshop.app.bootstrap;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.domain.entity.Tech;
import ewshop.domain.repository.TechRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class TechDataSeederPhase2 {

    private static final Logger log = LoggerFactory.getLogger(TechDataSeederPhase2.class);

    private final TechRepository techRepository;
    private final ObjectMapper objectMapper;

    @Value("${seeders.enabled:true}")
    private boolean seedersEnabled;

    public TechDataSeederPhase2(TechRepository techRepository, ObjectMapper objectMapper) {
        this.techRepository = techRepository;
        this.objectMapper = objectMapper;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Order(6) // Run after the main seeder (Order 3)
    public void seedPhase2() {
        if (!seedersEnabled) {
            System.out.println("TechDataSeeder2 is disabled, skipping...");
            return;
        }
        try {
            log.info("Starting Tech Seeding Phase 2: Relationships.");

            // Step 1: Read the source JSON into DTOs that only contain relationship information.
            InputStream is = getClass().getResourceAsStream("/data/techs.json");
            if (is == null) {
                log.error("Failed to find techs.json for Phase 2 seeding.");
                return;
            }
            TechDTO[] techDTOs = objectMapper.readValue(is, TechDTO[].class);

            // Step 2: Build a map of detached domain objects representing the desired final state.
            // This map serves as the "source of truth" for the relationships.
            Map<String, Tech> techDomainMap = Arrays.stream(techDTOs)
                    .map(dto -> {
                        Tech.Builder techBuilder = Tech.builder().name(dto.name);

                        if (dto.prereq != null && !dto.prereq.isBlank()) {
                            // Create a shallow domain object for the relationship.
                            techBuilder.prereq(Tech.builder().name(dto.prereq).build());
                        }

                        if (dto.excludes != null && !dto.excludes.isBlank()) {
                            techBuilder.excludes(Tech.builder().name(dto.excludes).build());
                        }

                        return techBuilder.build();
                    })
                    .collect(Collectors.toMap(Tech::getName, Function.identity()));

            // Step 3: Pass the map to the repository layer. It will handle the transactional update.
            techRepository.updateRelationships(techDomainMap);

            log.info("Tech Seeding Phase 2 completed successfully for {} techs.", techDomainMap.size());

        } catch (Exception e) {
            log.error("Failed during TechDataSeederPhase2", e);
        }
    }

    /**
     * A lightweight DTO for deserializing only the relationship names from the JSON file.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class TechDTO {
        public String name;
        public String prereq;
        public String excludes;
    }
}
