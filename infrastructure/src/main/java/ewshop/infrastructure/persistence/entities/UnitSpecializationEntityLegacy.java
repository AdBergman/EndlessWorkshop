package ewshop.infrastructure.persistence.entities;

import ewshop.domain.model.enums.UnitType;
import jakarta.persistence.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "unit_specialization")
public class UnitSpecializationEntityLegacy {

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

    @Column(nullable = false)
    private Integer tier;

    @Column(name = "art_id")
    private String artId;

    @ElementCollection
    @CollectionTable(name = "unit_specialization_costs", joinColumns = @JoinColumn(name = "unit_id"))
    @Fetch(FetchMode.SUBSELECT)
    private Set<UnitCostEmbeddableLegacy> costs = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "unit_evolutions_to", joinColumns = @JoinColumn(name = "unit_id"))
    @Column(name = "target_unit_name")
    private Set<String> upgradesTo = new HashSet<>();

    @Column
    private Integer upkeep;

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    private Set<UnitSpecializationSkillEntityLegacy> unitSkills = new HashSet<>();

    @Column
    private String faction;



    public UnitSpecializationEntityLegacy() {}

    // --- Getters & Setters ---

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UnitType getType() {
        return type;
    }

    public void setType(UnitType type) {
        this.type = type;
    }

    public int getHealth() {
        return health;
    }

    public void setHealth(int health) {
        this.health = health;
    }

    public int getDefense() {
        return defense;
    }

    public void setDefense(int defense) {
        this.defense = defense;
    }

    public int getMinDamage() {
        return minDamage;
    }

    public void setMinDamage(int minDamage) {
        this.minDamage = minDamage;
    }

    public int getMaxDamage() {
        return maxDamage;
    }

    public void setMaxDamage(int maxDamage) {
        this.maxDamage = maxDamage;
    }

    public int getMovementPoints() {
        return movementPoints;
    }

    public void setMovementPoints(int movementPoints) {
        this.movementPoints = movementPoints;
    }

    public Integer getTier() {
        return tier;
    }

    public void setTier(Integer tier) {
        this.tier = tier;
    }

    public Set<UnitCostEmbeddableLegacy> getCosts() {
        return costs;
    }

    public void setCosts(Set<UnitCostEmbeddableLegacy> costs) {
        this.costs = costs;
    }

    public Integer getUpkeep() {
        return upkeep;
    }

    public void setUpkeep(Integer upkeep) {
        this.upkeep = upkeep;
    }

    public Set<UnitSpecializationSkillEntityLegacy> getUnitSkills() {
        return unitSkills;
    }

    public void setUnitSkills(Set<UnitSpecializationSkillEntityLegacy> unitSkills) {
        this.unitSkills = unitSkills;
    }

    public Set<String> getUpgradesTo() {
        return upgradesTo;
    }

    public void setUpgradesTo(Set<String> upgradesTo) {
        this.upgradesTo = upgradesTo;
    }

    public void addSkill(UnitSkillEntityLegacy skill, Integer level) {
        UnitSpecializationSkillEntityLegacy uss = new UnitSpecializationSkillEntityLegacy(this, skill, level);
        this.unitSkills.add(uss);
    }

    public String getFaction() {
        return faction;
    }

    public void setFaction(String faction) {
        this.faction = faction;
    }

    public String getArtId() {
        return artId;
    }

    public void setArtId(String artId) {
        this.artId = artId;
    }
}