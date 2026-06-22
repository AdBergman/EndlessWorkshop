package ewshop.infrastructure.persistence.entities;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "factions",
        uniqueConstraints = @UniqueConstraint(name = "uq_factions_faction_key", columnNames = "faction_key")
)
public class FactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "faction_key", nullable = false)
    private String factionKey;

    @Column(name = "public_display_name", nullable = false)
    private String publicDisplayName;

    @Column(name = "lore", columnDefinition = "text")
    private String lore;

    @Column(name = "faction_kind")
    private String factionKind;

    @Column(name = "affinity_key")
    private String affinityKey;

    @Column(name = "affinity_type")
    private String affinityType;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "trait_keys", columnDefinition = "text")
    private List<String> traitKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "population_keys", columnDefinition = "text")
    private List<String> populationKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "unit_keys", columnDefinition = "text")
    private List<String> unitKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "base_unit_keys", columnDefinition = "text")
    private List<String> baseUnitKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "hero_keys", columnDefinition = "text")
    private List<String> heroKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "gated_technology_keys", columnDefinition = "text")
    private List<String> gatedTechnologyKeys = new ArrayList<>();

    @Column(name = "starting_faction_quest_key")
    private String startingFactionQuestKey;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "specific_quest_keys", columnDefinition = "text")
    private List<String> specificQuestKeys = new ArrayList<>();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "protectorate_trait_keys", columnDefinition = "text")
    private List<String> protectorateTraitKeys = new ArrayList<>();

    public FactionEntity() {}

    public Long getId() { return id; }

    public String getFactionKey() { return factionKey; }
    public void setFactionKey(String factionKey) { this.factionKey = factionKey; }

    public String getPublicDisplayName() { return publicDisplayName; }
    public void setPublicDisplayName(String publicDisplayName) { this.publicDisplayName = publicDisplayName; }

    public String getLore() { return lore; }
    public void setLore(String lore) { this.lore = lore; }

    public String getFactionKind() { return factionKind; }
    public void setFactionKind(String factionKind) { this.factionKind = factionKind; }

    public String getAffinityKey() { return affinityKey; }
    public void setAffinityKey(String affinityKey) { this.affinityKey = affinityKey; }

    public String getAffinityType() { return affinityType; }
    public void setAffinityType(String affinityType) { this.affinityType = affinityType; }

    public List<String> getTraitKeys() { return traitKeys; }
    public void setTraitKeys(List<String> traitKeys) { this.traitKeys = copy(traitKeys); }

    public List<String> getPopulationKeys() { return populationKeys; }
    public void setPopulationKeys(List<String> populationKeys) { this.populationKeys = copy(populationKeys); }

    public List<String> getUnitKeys() { return unitKeys; }
    public void setUnitKeys(List<String> unitKeys) { this.unitKeys = copy(unitKeys); }

    public List<String> getBaseUnitKeys() { return baseUnitKeys; }
    public void setBaseUnitKeys(List<String> baseUnitKeys) { this.baseUnitKeys = copy(baseUnitKeys); }

    public List<String> getHeroKeys() { return heroKeys; }
    public void setHeroKeys(List<String> heroKeys) { this.heroKeys = copy(heroKeys); }

    public List<String> getGatedTechnologyKeys() { return gatedTechnologyKeys; }
    public void setGatedTechnologyKeys(List<String> gatedTechnologyKeys) { this.gatedTechnologyKeys = copy(gatedTechnologyKeys); }

    public String getStartingFactionQuestKey() { return startingFactionQuestKey; }
    public void setStartingFactionQuestKey(String startingFactionQuestKey) {
        this.startingFactionQuestKey = startingFactionQuestKey;
    }

    public List<String> getSpecificQuestKeys() { return specificQuestKeys; }
    public void setSpecificQuestKeys(List<String> specificQuestKeys) { this.specificQuestKeys = copy(specificQuestKeys); }

    public List<String> getProtectorateTraitKeys() { return protectorateTraitKeys; }
    public void setProtectorateTraitKeys(List<String> protectorateTraitKeys) {
        this.protectorateTraitKeys = copy(protectorateTraitKeys);
    }

    private static List<String> copy(List<String> values) {
        return values == null ? new ArrayList<>() : new ArrayList<>(values);
    }
}
