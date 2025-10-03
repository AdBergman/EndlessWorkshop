package ewshop.domain.repository.entities;

import ewshop.domain.entity.enums.Faction;
import ewshop.domain.entity.enums.TechType;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Embedded;
import jakarta.persistence.FetchType;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "tech")
public class TechEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TechType type;

    @Column(nullable = false)
    private int era;

    // Effects are just text for now
    @ElementCollection
    private List<String> effects;

    // Coordinates for front-end placement
    @Embedded
    private TechCoords TechCoords;

    // Only one prereq tech allowed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prereq_id")
    private TechEntity prereq;

    // Only one mutually exclusive tech allowed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "excludes_id")
    private TechEntity excludes;

    // Multiple factions can access this tech
    @ElementCollection(targetClass = Faction.class)
    @Enumerated(EnumType.STRING)
    @Column(name = "faction")
    private Set<Faction> factions;

    // Optional unlocks
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TechUnlockEntity> unlocks;

    public TechEntity() {}

    // Getters and setters for all fields
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public TechType getType() {
        return type;
    }

    public void setType(TechType type) {
        this.type = type;
    }

    public int getEra() {
        return era;
    }

    public void setEra(int era) {
        this.era = era;
    }

    public List<String> getEffects() {
        return effects;
    }

    public void setEffects(List<String> effects) {
        this.effects = effects;
    }

    public TechCoords getTechCoords() {
        return TechCoords;
    }

    public void setTechCoords(TechCoords TechCoords) {
        this.TechCoords = TechCoords;
    }

    public TechEntity getPrereq() {
        return prereq;
    }

    public void setPrereq(TechEntity prereq) {
        this.prereq = prereq;
    }

    public TechEntity getExcludes() {
        return excludes;
    }

    public void setExcludes(TechEntity excludes) {
        this.excludes = excludes;
    }

    public Set<Faction> getFactions() {
        return factions;
    }

    public void setFactions(Set<Faction> factions) {
        this.factions = factions;
    }

    public List<TechUnlockEntity> getUnlocks() {
        return unlocks;
    }

    public void setUnlocks(List<TechUnlockEntity> unlocks) {
        this.unlocks = unlocks;
    }
}
