package ewshop.app.bootstrap;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.domain.entity.District;
import ewshop.domain.repository.DistrictRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

@Component
public class DistrictDataSeeder {

    private final DistrictRepository districtRepository;
    private final ObjectMapper objectMapper;

    @Value("${seeders.enabled:true}")
    private boolean seedersEnabled;

    public DistrictDataSeeder(DistrictRepository districtRepository, ObjectMapper objectMapper) {
        this.districtRepository = districtRepository;
        this.objectMapper = objectMapper;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Order(1)
    public void seedData() {
        if (!seedersEnabled) {
            System.out.println("DistrictDataSeeder is disabled, skipping...");
            return;
        }

        try {
            // Only seed if repository is empty
            if (districtRepository.findAll().isEmpty()) {
                // Load JSON from resources
                InputStream is = getClass().getResourceAsStream("/data/districts.json");
                if (is == null) {
                    throw new RuntimeException("districts.json not found in /data/");
                }

                // Deserialize into domain District objects
                List<District> districts = Arrays.asList(objectMapper.readValue(is, District[].class));

                // Save via domain repository (adapter maps to entity)
                districtRepository.saveAll(districts);

                System.out.println("Seeded " + districts.size() + " districts.");
            }
        } catch (Exception e) {
            System.err.println("Failed to seed districts: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
