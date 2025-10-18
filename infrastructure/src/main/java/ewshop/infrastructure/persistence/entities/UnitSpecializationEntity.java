package ewshop.infrastructure.persistence.entities;

import ewshop.domain.entity.enums.UnitType;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "unit_specialization")
public class UnitSpecializationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column()
    private String description;

    @Enumerated(EnumType.STRING)
    @Column()
    private UnitType type;

    @Column(nullable = false)
    private int health;

    @Column(nullable = false)
    private int defense;

    @Column(nullable = false)
    private int minDamage;

    @Column(nullable = false)
    private int maxDamage;

    @Column(nullable = false)
    private int movementPoints;

    @ElementCollection
    @CollectionTable(name = "unit_specialization_costs", joinColumns = @JoinColumn(name = "unit_id"))
    private List<UnitCostEmbeddable> costs = new ArrayList<>();

    @Column()
    private Integer upkeepPerTurn;

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnitSpecializationSkillEntity> unitSkills = new ArrayList<>();

    @Column()
    private String faction; // Optional

    public UnitSpecializationEntity() {}

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public UnitType getType() { return type; }
    public void setType(UnitType type) { this.type = type; }

    public int getHealth() { return health; }
    public void setHealth(int health) { this.health = health; }

    public int getDefense() { return defense; }
    public void setDefense(int defense) { this.defense = defense; }

    public int getMinDamage() { return minDamage; }
    public void setMinDamage(int minDamage) { this.minDamage = minDamage; }

    public int getMaxDamage() { return maxDamage; }
    public void setMaxDamage(int maxDamage) { this.maxDamage = maxDamage; }

    public int getMovementPoints() { return movementPoints; }
    public void setMovementPoints(int movementPoints) { this.movementPoints = movementPoints; }

    public List<UnitCostEmbeddable> getCosts() { return costs; }
    public void setCosts(List<UnitCostEmbeddable> costs) { this.costs = costs; }

    public Integer getUpkeepPerTurn() { return upkeepPerTurn; }
    public void setUpkeepPerTurn(Integer upkeepPerTurn) { this.upkeepPerTurn = upkeepPerTurn; }

    public List<UnitSpecializationSkillEntity> getUnitSkills() {
        return unitSkills;
    }

    public void setUnitSkills(List<UnitSpecializationSkillEntity> unitSkills) {
        this.unitSkills = unitSkills;
    }

    public void addSkill(UnitSkillEntity skill, Integer level) {
        UnitSpecializationSkillEntity uss = new UnitSpecializationSkillEntity(this, skill, level);
        this.unitSkills.add(uss);
    }

    public String getFaction() { return faction; }
    public void setFaction(String faction) { this.faction = faction; }
}

