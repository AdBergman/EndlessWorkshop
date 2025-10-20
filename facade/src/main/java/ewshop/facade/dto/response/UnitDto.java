package ewshop.facade.dto.response;

import java.util.List;

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
        String faction
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
        private String faction = "";

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
        public Builder skills(List<String> skills) { this.skills = skills; return this; }
        public Builder faction(String faction) { this.faction = faction; return this; }

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
                    faction
            );
        }
    }
}
