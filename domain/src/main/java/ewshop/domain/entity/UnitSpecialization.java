package ewshop.domain.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import ewshop.domain.entity.enums.CostType;
import ewshop.domain.entity.enums.UnitType;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@JsonDeserialize(builder = UnitSpecialization.Builder.class)
public class UnitSpecialization {

    private final String name;
    private final String description;
    private final UnitType type;
    private final int health;
    private final int defense;
    private final int minDamage;
    private final int maxDamage;
    private final int movementPoints;
    private final Set<UnitCost> costs;
    private final Integer upkeepPerTurn;
    private final Set<UnitSkill> skills;
    private final String faction;

    private UnitSpecialization(Builder builder) {
        this.name = builder.name;
        this.description = builder.description;
        this.type = builder.type;
        this.health = builder.health;
        this.defense = builder.defense;
        this.minDamage = builder.minDamage;
        this.maxDamage = builder.maxDamage;
        this.movementPoints = builder.movementPoints;
        this.costs = Set.copyOf(builder.cost);
        this.upkeepPerTurn = builder.upkeepPerTurn;
        this.skills = Set.copyOf(builder.skills);
        this.faction = builder.faction;
    }

    // --- Getters ---
    public String getName() { return name; }
    public String getDescription() { return description; }
    public UnitType getType() { return type; }
    public int getHealth() { return health; }
    public int getDefense() { return defense; }
    public int getMinDamage() { return minDamage; }
    public int getMaxDamage() { return maxDamage; }
    public int getMovementPoints() { return movementPoints; }
    public Set<UnitCost> getCosts() { return costs; }
    public Integer getUpkeepPerTurn() { return upkeepPerTurn; }
    public Set<UnitSkill> getSkills() { return skills; }
    public String getFaction() { return faction; }

    public static Builder builder() { return new Builder(); }

    // --- Builder ---
    public static class Builder {
        private String name;
        private String description = "";
        private UnitType type;
        private int health;
        private int defense;
        private int minDamage;
        private int maxDamage;
        private int movementPoints;
        private Set<UnitCost> cost = new HashSet<>();
        private Integer upkeepPerTurn;
        private Set<UnitSkill> skills = new HashSet<>();
        private String faction = "";

        @JsonProperty("name")
        public Builder name(String name) { this.name = name; return this; }

        @JsonProperty("description")
        public Builder description(String description) { this.description = description; return this; }

        @JsonProperty("type")
        public Builder type(UnitType type) { this.type = type; return this; }

        @JsonProperty("health")
        public Builder health(int health) { this.health = health; return this; }

        @JsonProperty("defense")
        public Builder defense(int defense) { this.defense = defense; return this; }

        @JsonProperty("minDamage")
        public Builder minDamage(int minDamage) { this.minDamage = minDamage; return this; }

        @JsonProperty("maxDamage")
        public Builder maxDamage(int maxDamage) { this.maxDamage = maxDamage; return this; }

        @JsonProperty("movementPoints")
        public Builder movementPoints(int movementPoints) { this.movementPoints = movementPoints; return this; }

        @JsonProperty("cost")
        public Builder cost(Object rawCost) {
            if (rawCost == null) return this;
            this.cost.clear();

            if (rawCost instanceof String s) {
                String[] parts = s.split("&");
                for (String part : parts) {
                    part = part.trim();
                    String[] tokens = part.split(" ", 2);
                    if (tokens.length == 2) {
                        int amount = Integer.parseInt(tokens[0].trim());
                        CostType type = CostType.valueOf(tokens[1].trim().toUpperCase());
                        this.cost.add(new UnitCost.Builder().amount(amount).type(type).build());
                    } else {
                        int amount = Integer.parseInt(tokens[0].trim());
                        this.cost.add(new UnitCost.Builder().amount(amount).type(CostType.INDUSTRY).build());
                    }
                }
            } else if (rawCost instanceof Integer i) {
                this.cost.add(new UnitCost.Builder().amount(i).type(CostType.INDUSTRY).build());
            } else {
                throw new IllegalArgumentException("Unsupported cost type: " + rawCost.getClass());
            }
            return this;
        }

        public Builder cost(List<UnitCost> costs) {
            if (costs != null) this.cost = new HashSet<>();
            return this;
        }

        @JsonProperty("upkeepPerTurn")
        public Builder upkeepPerTurn(Integer upkeepPerTurn) { this.upkeepPerTurn = upkeepPerTurn; return this; }

        @JsonProperty("skills")
        public Builder skills(Set<UnitSkill> skills) {
            this.skills = (skills != null) ? new HashSet<>(skills) : new HashSet<>();;
            return this;
        }

        @JsonProperty("faction")
        public Builder faction(String faction) { this.faction = faction; return this; }

        public UnitSpecialization build() { return new UnitSpecialization(this); }
    }
}
