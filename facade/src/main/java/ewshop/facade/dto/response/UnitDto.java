package ewshop.facade.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import ewshop.domain.entity.enums.Faction;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UnitDto(
        String name,
        String description,
        String type,
        int health,
        int defense,
        int minDamage,
        int maxDamage,
        int movementPoints,
        int tier,
        int upkeep,
        List<String> costs,
        List<String> skills,
        Faction faction,
        String minorFaction,
        List<String> upgradesTo,
        String upgradesFrom,
        String artId
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String description = "";
        private String type = "";
        private int health;
        private int defense;
        private int minDamage;
        private int maxDamage;
        private int movementPoints;
        private int tier;
        private int upkeep;
        private List<String> costs = List.of();
        private List<String> skills = List.of();
        private Faction faction;
        private String minorFaction;
        private List<String> upgradesTo = List.of();
        private String upgradesFrom = null;
        private String artId;

        public Builder() {}

        public Builder(UnitDto original) {
            this.name = original.name();
            this.description = original.description();
            this.type = original.type();
            this.health = original.health();
            this.defense = original.defense();
            this.minDamage = original.minDamage();
            this.maxDamage = original.maxDamage();
            this.movementPoints = original.movementPoints();
            this.tier = original.tier();
            this.upkeep = original.upkeep();
            this.costs = original.costs();
            this.skills = original.skills();
            this.faction = original.faction();
            this.minorFaction = original.minorFaction();
            this.upgradesTo = original.upgradesTo();
            this.upgradesFrom = original.upgradesFrom();
            this.artId = original.artId();
        }

        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder health(int health) { this.health = health; return this; }
        public Builder defense(int defense) { this.defense = defense; return this; }
        public Builder minDamage(int minDamage) { this.minDamage = minDamage; return this; }
        public Builder maxDamage(int maxDamage) { this.maxDamage = maxDamage; return this; }
        public Builder movementPoints(int movementPoints) { this.movementPoints = movementPoints; return this; }
        public Builder tier(int tier) { this.tier = tier; return this; }
        public Builder upkeep(int upkeep) { this.upkeep = upkeep; return this; }
        public Builder costs(List<String> costs) { this.costs = costs; return this; }
        public Builder skills(List<String> skills) { this.skills = skills.stream()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList(); return this; }
        public Builder faction(Faction faction) { this.faction = faction; return this; }
        public Builder minorFaction(String minorFaction) { this.minorFaction = minorFaction; return this; }
        public Builder upgradesTo(List<String> upgradesTo) { this.upgradesTo = upgradesTo; return this; }
        public Builder upgradesFrom(String upgradesFrom) { this.upgradesFrom = upgradesFrom; return this; }
        public Builder artId(String artId) { this.artId = artId; return this; }

        public UnitDto build() {
            return new UnitDto(
                    name,
                    description,
                    type,
                    health,
                    defense,
                    minDamage,
                    maxDamage,
                    movementPoints,
                    tier,
                    upkeep,
                    costs,
                    skills,
                    faction,
                    minorFaction,
                    upgradesTo,
                    upgradesFrom,
                    artId
            );
        }
    }
}
