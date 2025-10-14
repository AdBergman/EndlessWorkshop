package ewshop.domain.entity;

import ewshop.domain.entity.enums.UnitType;

import java.util.List;

public class UnitSpecialization {
    private final String name;
    private final String description;
    private final UnitType type;
    private final int health;
    private final int defense;
    private final int minDamage;
    private final int maxDamage;
    private final int movementPoints;
    private final Integer cost;
    private final Integer upkeepPerTurn;
    private final List<String> skills;
    private final String faction; // Optional

    private UnitSpecialization(Builder builder) {
        this.name = builder.name;
        this.description = builder.description;
        this.type = builder.type;
        this.health = builder.health;
        this.defense = builder.defense;
        this.minDamage = builder.minDamage;
        this.maxDamage = builder.maxDamage;
        this.movementPoints = builder.movementPoints;
        this.cost = builder.cost;
        this.upkeepPerTurn = builder.upkeepPerTurn;
        this.skills = builder.skills;
        this.faction = builder.faction;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public UnitType getType() {
        return type;
    }

    public int getHealth() {
        return health;
    }

    public int getDefense() {
        return defense;
    }

    public int getMinDamage() {
        return minDamage;
    }

    public int getMaxDamage() {
        return maxDamage;
    }

    public int getMovementPoints() {
        return movementPoints;
    }

    public Integer getCost() {
        return cost;
    }

    public Integer getUpkeepPerTurn() {
        return upkeepPerTurn;
    }

    public List<String> getSkills() {
        return skills;
    }

    public String getFaction() {
        return faction;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String name;
        private String description;
        private UnitType type;
        private int health;
        private int defense;
        private int minDamage;
        private int maxDamage;
        private int movementPoints;
        private Integer cost;
        private Integer upkeepPerTurn;
        private List<String> skills;
        private String faction;

        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder type(UnitType type) { this.type = type; return this; }
        public Builder health(int health) { this.health = health; return this; }
        public Builder defense(int defense) { this.defense = defense; return this; }
        public Builder minDamage(int minDamage) { this.minDamage = minDamage; return this; }
        public Builder maxDamage(int maxDamage) { this.maxDamage = maxDamage; return this; }
        public Builder movementPoints(int movementPoints) { this.movementPoints = movementPoints; return this; }
        public Builder cost(Integer cost) { this.cost = cost; return this; }
        public Builder upkeepPerTurn(Integer upkeepPerTurn) { this.upkeepPerTurn = upkeepPerTurn; return this; }
        public Builder skills(List<String> skills) { this.skills = skills; return this; }
        public Builder faction(String faction) { this.faction = faction; return this; }

        public UnitSpecialization build() { return new UnitSpecialization(this); }
    }
}
