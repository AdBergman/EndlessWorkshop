package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "units",
        uniqueConstraints = @UniqueConstraint(name = "uq_units_unit_key", columnNames = "unit_key")
)
public class UnitEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "unit_key", nullable = false, length = 255)
    private String unitKey;

    @Column(name = "display_name", nullable = false, length = 255)
    private String displayName;

    @Column(name = "art_id", length = 255)
    private String artId;

    @Column(name = "faction", length = 64)
    private String faction;

    @Column(name = "is_major_faction", nullable = false)
    private boolean isMajorFaction;

    @Column(name = "is_hero", nullable = false)
    private boolean isHero;

    @Column(name = "is_chosen", nullable = false)
    private boolean isChosen;

    @Column(name = "spawn_type", length = 64)
    private String spawnType;

    @Column(name = "previous_unit_key", length = 255)
    private String previousUnitKey;

    @Column(name = "evolution_tier_index")
    private Integer evolutionTierIndex;

    @Column(name = "unit_class_key", length = 255)
    private String unitClassKey;

    @Column(name = "attack_skill_key", length = 255)
    private String attackSkillKey;

    @ElementCollection
    @CollectionTable(
            name = "unit_next_evolutions",
            joinColumns = @JoinColumn(name = "unit_id", foreignKey = @ForeignKey(name = "fk_unit_next_evolutions_unit"))
    )
    @OrderColumn(name = "next_index")
    @Column(name = "next_unit_key", nullable = false, length = 255)
    private List<String> nextEvolutionUnitKeys = new ArrayList<>();

    @ElementCollection
    @CollectionTable(
            name = "unit_abilities",
            joinColumns = @JoinColumn(name = "unit_id", foreignKey = @ForeignKey(name = "fk_unit_abilities_unit"))
    )
    @OrderColumn(name = "ability_index")
    @Column(name = "ability_key", nullable = false, length = 255)
    private List<String> abilityKeys = new ArrayList<>();

    @ElementCollection
    @CollectionTable(
            name = "unit_description_lines",
            joinColumns = @JoinColumn(name = "unit_id", foreignKey = @ForeignKey(name = "fk_unit_description_lines_unit"))
    )
    @OrderColumn(name = "line_index")
    @Column(name = "line", nullable = false, columnDefinition = "text")
    private List<String> descriptionLines = new ArrayList<>();

    public UnitEntity() {}

    public Long getId() { return id; }

    public String getUnitKey() { return unitKey; }
    public void setUnitKey(String unitKey) { this.unitKey = unitKey; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getArtId() { return artId; }
    public void setArtId(String artId) { this.artId = artId; }

    public String getFaction() { return faction; }
    public void setFaction(String faction) { this.faction = faction; }

    public boolean isMajorFaction() { return isMajorFaction; }
    public void setMajorFaction(boolean majorFaction) { isMajorFaction = majorFaction; }

    public boolean isHero() { return isHero; }
    public void setHero(boolean hero) { isHero = hero; }

    public boolean isChosen() { return isChosen; }
    public void setChosen(boolean chosen) { isChosen = chosen; }

    public String getSpawnType() { return spawnType; }
    public void setSpawnType(String spawnType) { this.spawnType = spawnType; }

    public String getPreviousUnitKey() { return previousUnitKey; }
    public void setPreviousUnitKey(String previousUnitKey) { this.previousUnitKey = previousUnitKey; }

    public Integer getEvolutionTierIndex() { return evolutionTierIndex; }
    public void setEvolutionTierIndex(Integer evolutionTierIndex) { this.evolutionTierIndex = evolutionTierIndex; }

    public String getUnitClassKey() { return unitClassKey; }
    public void setUnitClassKey(String unitClassKey) { this.unitClassKey = unitClassKey; }

    public String getAttackSkillKey() { return attackSkillKey; }
    public void setAttackSkillKey(String attackSkillKey) { this.attackSkillKey = attackSkillKey; }

    public List<String> getNextEvolutionUnitKeys() { return nextEvolutionUnitKeys; }
    public void setNextEvolutionUnitKeys(List<String> nextEvolutionUnitKeys) { this.nextEvolutionUnitKeys = nextEvolutionUnitKeys; }

    public List<String> getAbilityKeys() { return abilityKeys; }
    public void setAbilityKeys(List<String> abilityKeys) { this.abilityKeys = abilityKeys; }

    public List<String> getDescriptionLines() { return descriptionLines; }
    public void setDescriptionLines(List<String> descriptionLines) { this.descriptionLines = descriptionLines; }
}