package ewshop.app.bootstrap;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.domain.entity.UnitSpecialization;
import ewshop.infrastructure.persistence.entities.UnitSkillEntity;
import ewshop.infrastructure.persistence.entities.UnitSpecializationEntity;
import ewshop.infrastructure.persistence.mappers.UnitSpecializationMapper;
import ewshop.infrastructure.persistence.adapters.UnitSkillRepositoryAdapter;
import ewshop.infrastructure.persistence.repositories.SpringDataUnitSpecializationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Transactional
@Component
@Order(4)
public class UnitSpecializationSeeder {

    private final SpringDataUnitSpecializationRepository springDataUnitSpecializationRepository;
    private final UnitSpecializationMapper mapper;
    private final UnitSkillRepositoryAdapter unitSkillRepository;
    private final ObjectMapper objectMapper;

    @Value("${seeders.enabled:true}")
    private boolean seedersEnabled;

    public UnitSpecializationSeeder(
            SpringDataUnitSpecializationRepository springDataUnitSpecializationRepository,
            UnitSpecializationMapper mapper,
            UnitSkillRepositoryAdapter unitSkillRepository,
            ObjectMapper objectMapper
    ) {
        this.springDataUnitSpecializationRepository = springDataUnitSpecializationRepository;
        this.mapper = mapper;
        this.unitSkillRepository = unitSkillRepository;
        this.objectMapper = objectMapper;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedData() {
        if (!seedersEnabled) return;

        try {
            // Skip if already seeded
            if (!springDataUnitSpecializationRepository.findAll().isEmpty()) return;

            InputStream is = getClass().getResourceAsStream("/data/units.json");
            if (is == null) {
                System.err.println("❌ units.json not found, cannot seed UnitSpecializations.");
                return;
            }

            // 1️⃣ Deserialize JSON → domain objects
            UnitSpecialization[] units = objectMapper.readValue(is, UnitSpecialization[].class);

            // 2️⃣ Fetch all referenced UnitSkillEntities
            Set<String> skillNames = Arrays.stream(units)
                    .flatMap(u -> u.getSkills() != null ? u.getSkills().stream() : Stream.empty())
                    .collect(Collectors.toSet());

            List<UnitSkillEntity> persistedSkills = skillNames.stream()
                    .map(name -> unitSkillRepository.findEntityByName(name)
                            .orElseThrow(() -> new IllegalStateException("UnitSkill not found: " + name)))
                    .collect(Collectors.toList());

            // 3️⃣ Map domain → entities (including join table)
            List<UnitSpecializationEntity> entities = Arrays.stream(units)
                    .map(u -> mapper.toEntity(u, persistedSkills))
                    .collect(Collectors.toList());

            // 4️⃣ Persist to database & flush immediately
            springDataUnitSpecializationRepository.saveAll(entities);
            springDataUnitSpecializationRepository.flush();

            System.out.println("✅ Seeded " + entities.size() + " unit specializations with skills.");

        } catch (Exception e) {
            System.err.println("❌ Failed to seed unit specializations: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
