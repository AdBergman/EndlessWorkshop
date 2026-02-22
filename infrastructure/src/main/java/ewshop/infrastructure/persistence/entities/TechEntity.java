package ewshop.infrastructure.persistence.entities;

import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.MajorFaction;
import ewshop.domain.model.enums.TechType;
import jakarta.persistence.*;

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

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "tech_description_lines", joinColumns = @JoinColumn(name = "tech_id"))
    @OrderColumn(name = "line_index")
    @Column(name = "line_text", nullable = false)
    private List<String> descriptionLines;

    @Embedded
    private TechCoords techCoords;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "tech_unlocks", joinColumns = @JoinColumn(name = "tech_id"))
    @OrderColumn(name = "order_index")
    private List<TechUnlockRefEmbeddable> unlocks;

    // Legacy – replaced by tech_prereq_key
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prereq_id")
    private TechEntity prereq;

    // Legacy – replaced by tech_exclusive_prereq_key
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "excludes_id")
    private TechEntity excludes;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "tech_faction", joinColumns = @JoinColumn(name = "tech_id"))
    @Column(name = "faction", nullable = false, length = 64)
    @Enumerated(EnumType.STRING)
    private Set<MajorFaction> majorFactions;

    @Column(name = "tech_key")
    private String techKey;

    @Column(name = "baseline_hash", length = 64)
    private String baselineHash;

    @Column(columnDefinition = "text")
    private String lore;

    @Column
    private Boolean hidden;

    public TechEntity() {
    }

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

    public List<String> getDescriptionLines() {
        return descriptionLines;
    }

    public void setDescriptionLines(List<String> lines) {
        this.descriptionLines = lines;
    }

    public List<TechUnlockRefEmbeddable> getUnlocks() {
        return unlocks;
    }

    public void setUnlocks(List<TechUnlockRefEmbeddable> unlocks) {
        this.unlocks = unlocks;
    }

    public TechCoords getTechCoords() {
        return techCoords;
    }

    public void setTechCoords(TechCoords techCoords) {
        this.techCoords = techCoords;
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

    public Set<MajorFaction> getFactions() {
        return majorFactions;
    }

    public void setFactions(Set<MajorFaction> majorFactions) {
        this.majorFactions = majorFactions;
    }

    public String getTechKey() {
        return techKey;
    }

    public void setTechKey(String techKey) {
        this.techKey = techKey;
    }

    public String getBaselineHash() {
        return baselineHash;
    }

    public void setBaselineHash(String baselineHash) {
        this.baselineHash = baselineHash;
    }

    public String getLore() {
        return lore;
    }

    public void setLore(String lore) {
        this.lore = lore;
    }

    public Boolean isHidden() {
        return hidden;
    }

    public void setHidden(Boolean hidden) {
        this.hidden = hidden;
    }

}