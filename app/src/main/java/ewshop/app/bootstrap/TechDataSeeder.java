package ewshop.app.bootstrap;

import com.fasterxml.jackson.databind.ObjectMapper;
import ewshop.domain.entity.Tech;
import ewshop.domain.entity.TechCoords;
import ewshop.domain.entity.enums.Faction;
import ewshop.domain.entity.enums.TechType;
import ewshop.domain.repository.TechRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class TechDataSeeder {

    private final TechRepository techRepository;
    private final ObjectMapper objectMapper;

    public TechDataSeeder(TechRepository techRepository, ObjectMapper objectMapper) {
        this.techRepository = techRepository;
        this.objectMapper = objectMapper;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Order(4) // after districts and improvements
    public void seedData() {
        try {
            if (!techRepository.findAll().isEmpty()) return;

            InputStream is = getClass().getResourceAsStream("/data/techs.json");
            if (is == null) throw new RuntimeException("techs.json not found in /data/");

            TechDTO[] techDTOs = objectMapper.readValue(is, TechDTO[].class);

            List<Tech> techs = new ArrayList<>();

            for (TechDTO dto : techDTOs) {
                // --- factions ---
                Set<Faction> factions = Optional.ofNullable(dto.factions)
                        .orElse(Collections.emptyList())
                        .stream()
                        .map(f -> {
                            try { return Faction.valueOf(f.toUpperCase()); }
                            catch (IllegalArgumentException e) {
                                System.err.println("Unknown faction in JSON: " + f);
                                return null;
                            }
                        })
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());

                // --- type ---
                TechType type = null;
                if (dto.type != null) {
                    try { type = TechType.valueOf(dto.type.toUpperCase()); }
                    catch (IllegalArgumentException e) {
                        System.err.println("Unknown tech type in JSON: " + dto.type);
                    }
                }

                // --- build Tech (skipping prereq, excludes, unlocks) ---
                Tech tech = Tech.builder()
                        .name(dto.name)
                        .era(dto.era)
                        .type(type)
                        .effects(dto.effects != null ? dto.effects : Collections.emptyList())
                        .factions(factions)
                        .techCoords(dto.coords != null ? new TechCoords(dto.coords.xPct, dto.coords.yPct) : null)
                        .build();

                techs.add(tech);
            }

            // --- save all in one go ---
            techRepository.saveAll(techs);

            System.out.println("Seeded " + techs.size() + " techs (basic, no prereq/excludes/unlocks).");

        } catch (Exception e) {
            System.err.println("Failed to seed techs: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // --- DTO for JSON deserialization ---
    private static class TechDTO {
        public String name;
        public int era;
        public String type;
        public List<String> effects;
        public List<String> factions;
        public Coord coords;

        public static class Coord {
            public double xPct;
            public double yPct;
        }
    }
}
