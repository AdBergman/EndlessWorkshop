package ewshop.app.bootstrap;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.domain.entity.Improvement;
import ewshop.domain.repository.ImprovementRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

@Component
public class ImprovementDataSeeder {

    private final ImprovementRepository improvementRepository;
    private final ObjectMapper objectMapper;

    @Value("${seeders.enabled:true}")
    private boolean seedersEnabled;

    public ImprovementDataSeeder(ImprovementRepository improvementRepository,
                                 ObjectMapper objectMapper) {
        this.improvementRepository = improvementRepository;
        this.objectMapper = objectMapper;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Order(2)
    public void seedData() {
        if (!seedersEnabled) {
            System.out.println("ImprovementDataSeeder is disabled, skipping...");
            return;
        }
        try {
            if (improvementRepository.findAll().isEmpty()) {
                InputStream is = getClass().getResourceAsStream("/data/improvements.json");
                List<Improvement> improvements = Arrays.asList(
                        objectMapper.readValue(is, Improvement[].class)
                );
                improvementRepository.saveAll(improvements);
                System.out.println("Seeded " + improvements.size() + " improvements.");
            }
        } catch (Exception e) {
            System.err.println("Failed to seed improvements: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
