package ewshop.app.bootstrap;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.domain.entity.UnitSkill;
import ewshop.domain.entity.UnitSpecialization;
import ewshop.domain.repository.UnitSkillRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.HashSet;
import java.util.Set;

@Transactional
@Component
@Order(3)
public class UnitSkillSeeder {

    private final UnitSkillRepository unitSkillRepository;
    private final ObjectMapper objectMapper;

    @Value("${seeders.enabled:true}")
    private boolean seedersEnabled;

    public UnitSkillSeeder(UnitSkillRepository unitSkillRepository,
                           ObjectMapper objectMapper) {
        this.unitSkillRepository = unitSkillRepository;
        this.objectMapper = objectMapper;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedSkillsFromUnits() {
        if (!seedersEnabled) return;

        try {
            InputStream is = getClass().getResourceAsStream("/data/units.json");
            UnitSpecialization[] units = objectMapper.readValue(is, UnitSpecialization[].class);

            // Extract unique skill names from units.json
            Set<String> skillNames = new HashSet<>();
            for (UnitSpecialization u : units) {
                if (u.getSkills() != null) {
                    skillNames.addAll(u.getSkills());
                }
            }

            int seededCount = 0;

            // Only insert skills that do not already exist
            for (String name : skillNames) {
                if (!unitSkillRepository.existsByName(name)) {
                    UnitSkill skill = UnitSkill.builder()
                            .name(name)
                            .amount(0)
                            .target("")
                            .type("")
                            .build();
                    unitSkillRepository.save(skill);
                    seededCount++;
                }
            }

            System.out.println("✅ Seeded " + seededCount + " new unit skills from units.json");
            if (seededCount == 0) System.out.println("ℹ️ No new unit skills needed.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
