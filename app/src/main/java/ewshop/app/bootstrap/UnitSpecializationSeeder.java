package ewshop.app.bootstrap;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.domain.entity.UnitSpecialization;
import ewshop.domain.repository.UnitSpecializationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

@Component
public class UnitSpecializationSeeder {

    private final UnitSpecializationRepository unitSpecializationRepository;
    private final ObjectMapper objectMapper;

    @Value("${seeders.enabled:true}")
    private boolean seedersEnabled;

    public UnitSpecializationSeeder(UnitSpecializationRepository unitSpecializationRepository,
                                    ObjectMapper objectMapper) {
        this.unitSpecializationRepository = unitSpecializationRepository;
        this.objectMapper = objectMapper;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Order(3)
    public void seedData() {
        if (!seedersEnabled) {
            System.out.println("UnitDataSeeder is disabled, skipping...");
            return;
        }
        try {
            if (unitSpecializationRepository.findAll().isEmpty()) {
                InputStream is = getClass().getResourceAsStream("/data/units.json");
                List<UnitSpecialization> specializations = Arrays.asList(
                        objectMapper.readValue(is, UnitSpecialization[].class)
                );
                unitSpecializationRepository.saveAll(specializations);
                System.out.println("Seeded " + specializations.size() + " unit specializations.");
            }
        } catch (Exception e) {
            System.err.println("Failed to seed unit specializations: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
