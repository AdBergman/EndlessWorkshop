package ewshop.facade.mapper;

import ewshop.domain.entity.Tech;
import ewshop.facade.dto.TechDto;

import java.util.stream.Collectors;

public class TechMapper {

    public static TechDto toDto(Tech entity) {
        if (entity == null) return null;

        // Builder-style fluent construction
        return builder()
                .name(entity.getName())
                .era(entity.getEra())
                .type(entity.getType().name())
                .effects(String.join(", ", entity.getEffects()))
                .factions(entity.getFactions().stream()
                        .map(Enum::name)
                        .sorted() // ensures consistent order
                        .collect(Collectors.joining(", ")))
                .build();
    }

    private static Builder builder() {
        return new Builder();
    }

    // Simple builder for record construction
    private static class Builder {
        private String name;
        private int era;
        private String type;
        private String effects;
        private String factions;

        Builder name(String name) { this.name = name; return this; }
        Builder era(int era) { this.era = era; return this; }
        Builder type(String type) { this.type = type; return this; }
        Builder effects(String effects) { this.effects = effects; return this; }
        Builder factions(String factions) { this.factions = factions; return this; }

        TechDto build() {
            return new TechDto(name, era, type, effects, factions);
        }
    }
}
