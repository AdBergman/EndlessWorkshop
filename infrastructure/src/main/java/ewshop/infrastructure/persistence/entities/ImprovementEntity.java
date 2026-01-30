package ewshop.infrastructure.persistence.entities;

import ewshop.domain.model.enums.UniqueType;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

import java.util.List;

@Entity
@Table(name = "improvements")
public class ImprovementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @ElementCollection
    @CollectionTable(name = "improvement_effects", joinColumns = @JoinColumn(name = "improvement_id"))
    @Column(name = "effect")
    private List<String> effects;

    @Enumerated(EnumType.STRING)
    @Column(name = "unique_type")
    private UniqueType unique;

    @ElementCollection
    @CollectionTable(name = "improvement_costs", joinColumns = @JoinColumn(name = "improvement_id"))
    private List<StrategicCostEntity> cost;

    @Column(name = "era", nullable = false)
    private int era;

    // Constructors
    public ImprovementEntity() {}

    public ImprovementEntity(String name, List<String> effects, UniqueType unique, List<StrategicCostEntity> cost, int era) {
        this.name = name;
        this.effects = effects;
        this.unique = unique;
        this.cost = cost;
        this.era = era;
    }

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getEffects() {
        return effects;
    }

    public void setEffects(List<String> effects) {
        this.effects = effects;
    }

    public UniqueType getUnique() {
        return unique;
    }

    public void setUnique(UniqueType unique) {
        this.unique = unique;
    }

    public List<StrategicCostEntity> getCost() {
        return cost;
    }

    public void setCost(List<StrategicCostEntity> cost) {
        this.cost = cost;
    }

    public int getEra() {
        return era;
    }

    public void setEra(int era) {
        this.era = era;
    }
}
