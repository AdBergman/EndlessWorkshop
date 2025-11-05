package ewshop.domain.entity;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
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
    private final Integer upkeep;
    private final Set<UnitSkill> skills;
    private final String faction;
    private final Integer tier;
    private final Set<String> upgradesTo;
    private final String artId; // 🆕 new field

    private UnitSpecialization(Builder builder) {
        this.name = builder.name;
        this.description = builder.description;
        this.type = builder.type;
        this.health = builder.health;
        this.defense = builder.defense;
        this.minDamage = builder.minDamage;
        this.maxDamage = builder.maxDamage;
        this.movementPoints = builder.movementPoints;
        this.costs = Set.copyOf(builder.costs);
        this.upkeep = builder.upkeep;
        this.skills = Set.copyOf(builder.skills);
        this.faction = builder.faction;
        this.tier = builder.tier;
        this.upgradesTo = Set.copyOf(builder.upgradesTo);
        this.artId = builder.artId; // 🆕 added
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
    public Integer getUpkeep() { return upkeep; }
    public Set<UnitSkill> getSkills() { return skills; }
    public String getFaction() { return faction; }
    public Integer getTier() { return tier; }
    public Set<String> getUpgradesTo() { return upgradesTo; }
    public String getArtId() { return artId; } // 🆕

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
        private Set<UnitCost> costs = new HashSet<>();
        private Integer upkeep;
        private Set<UnitSkill> skills = new HashSet<>();
        private String faction = "";
        private Integer tier;
        private Set<String> upgradesTo = new HashSet<>();
        private String artId; // 🆕

        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder type(UnitType type) { this.type = type; return this; }
        public Builder health(int health) { this.health = health; return this; }
        public Builder defense(int defense) { this.defense = defense; return this; }
        public Builder minDamage(int minDamage) { this.minDamage = minDamage; return this; }
        public Builder maxDamage(int maxDamage) { this.maxDamage = maxDamage; return this; }
        public Builder movementPoints(int movementPoints) { this.movementPoints = movementPoints; return this; }

        public Builder cost(List<UnitCost> costs) {
            this.costs = (costs != null) ? new HashSet<>(costs) : new HashSet<>();
            return this;
        }

        public Builder upkeep(Integer upkeep) { this.upkeep = upkeep; return this; }

        public Builder skills(Set<UnitSkill> skills) {
            this.skills = (skills != null) ? new HashSet<>(skills) : new HashSet<>();
            return this;
        }

        public Builder faction(String faction) { this.faction = faction; return this; }

        public Builder tier(Integer tier) { this.tier = tier; return this; }

        public Builder upgradesTo(Set<String> upgradesTo) {
            this.upgradesTo = (upgradesTo != null) ? new HashSet<>(upgradesTo) : new HashSet<>();
            return this;
        }

        public Builder artId(String artId) { this.artId = artId; return this; } // 🆕

        public UnitSpecialization build() { return new UnitSpecialization(this); }
    }
}
