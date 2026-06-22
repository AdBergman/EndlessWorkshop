package ewshop.domain.model;

import java.util.ArrayList;
import java.util.List;

public class Faction {

    private final String factionKey;
    private final String publicDisplayName;
    private final String lore;
    private final String factionKind;
    private final String affinityKey;
    private final String affinityType;
    private final List<String> traitKeys;
    private final List<String> populationKeys;
    private final List<String> unitKeys;
    private final List<String> baseUnitKeys;
    private final List<String> heroKeys;
    private final List<String> gatedTechnologyKeys;
    private final String startingFactionQuestKey;
    private final List<String> specificQuestKeys;
    private final List<String> protectorateTraitKeys;

    private Faction(Builder builder) {
        this.factionKey = builder.factionKey;
        this.publicDisplayName = builder.publicDisplayName;
        this.lore = builder.lore;
        this.factionKind = builder.factionKind;
        this.affinityKey = builder.affinityKey;
        this.affinityType = builder.affinityType;
        this.traitKeys = List.copyOf(builder.traitKeys);
        this.populationKeys = List.copyOf(builder.populationKeys);
        this.unitKeys = List.copyOf(builder.unitKeys);
        this.baseUnitKeys = List.copyOf(builder.baseUnitKeys);
        this.heroKeys = List.copyOf(builder.heroKeys);
        this.gatedTechnologyKeys = List.copyOf(builder.gatedTechnologyKeys);
        this.startingFactionQuestKey = builder.startingFactionQuestKey;
        this.specificQuestKeys = List.copyOf(builder.specificQuestKeys);
        this.protectorateTraitKeys = List.copyOf(builder.protectorateTraitKeys);
    }

    public String getFactionKey() { return factionKey; }
    public String getPublicDisplayName() { return publicDisplayName; }
    public String getLore() { return lore; }
    public String getFactionKind() { return factionKind; }
    public String getAffinityKey() { return affinityKey; }
    public String getAffinityType() { return affinityType; }
    public List<String> getTraitKeys() { return traitKeys; }
    public List<String> getPopulationKeys() { return populationKeys; }
    public List<String> getUnitKeys() { return unitKeys; }
    public List<String> getBaseUnitKeys() { return baseUnitKeys; }
    public List<String> getHeroKeys() { return heroKeys; }
    public List<String> getGatedTechnologyKeys() { return gatedTechnologyKeys; }
    public String getStartingFactionQuestKey() { return startingFactionQuestKey; }
    public List<String> getSpecificQuestKeys() { return specificQuestKeys; }
    public List<String> getProtectorateTraitKeys() { return protectorateTraitKeys; }

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private String factionKey;
        private String publicDisplayName;
        private String lore;
        private String factionKind;
        private String affinityKey;
        private String affinityType;
        private final List<String> traitKeys = new ArrayList<>();
        private final List<String> populationKeys = new ArrayList<>();
        private final List<String> unitKeys = new ArrayList<>();
        private final List<String> baseUnitKeys = new ArrayList<>();
        private final List<String> heroKeys = new ArrayList<>();
        private final List<String> gatedTechnologyKeys = new ArrayList<>();
        private String startingFactionQuestKey;
        private final List<String> specificQuestKeys = new ArrayList<>();
        private final List<String> protectorateTraitKeys = new ArrayList<>();

        public Builder factionKey(String factionKey) { this.factionKey = factionKey; return this; }
        public Builder publicDisplayName(String publicDisplayName) { this.publicDisplayName = publicDisplayName; return this; }
        public Builder lore(String lore) { this.lore = lore; return this; }
        public Builder factionKind(String factionKind) { this.factionKind = factionKind; return this; }
        public Builder affinityKey(String affinityKey) { this.affinityKey = affinityKey; return this; }
        public Builder affinityType(String affinityType) { this.affinityType = affinityType; return this; }

        public Builder traitKeys(List<String> traitKeys) {
            this.traitKeys.clear();
            if (traitKeys != null) this.traitKeys.addAll(traitKeys);
            return this;
        }

        public Builder populationKeys(List<String> populationKeys) {
            this.populationKeys.clear();
            if (populationKeys != null) this.populationKeys.addAll(populationKeys);
            return this;
        }

        public Builder unitKeys(List<String> unitKeys) {
            this.unitKeys.clear();
            if (unitKeys != null) this.unitKeys.addAll(unitKeys);
            return this;
        }

        public Builder baseUnitKeys(List<String> baseUnitKeys) {
            this.baseUnitKeys.clear();
            if (baseUnitKeys != null) this.baseUnitKeys.addAll(baseUnitKeys);
            return this;
        }

        public Builder heroKeys(List<String> heroKeys) {
            this.heroKeys.clear();
            if (heroKeys != null) this.heroKeys.addAll(heroKeys);
            return this;
        }

        public Builder gatedTechnologyKeys(List<String> gatedTechnologyKeys) {
            this.gatedTechnologyKeys.clear();
            if (gatedTechnologyKeys != null) this.gatedTechnologyKeys.addAll(gatedTechnologyKeys);
            return this;
        }

        public Builder startingFactionQuestKey(String startingFactionQuestKey) {
            this.startingFactionQuestKey = startingFactionQuestKey;
            return this;
        }

        public Builder specificQuestKeys(List<String> specificQuestKeys) {
            this.specificQuestKeys.clear();
            if (specificQuestKeys != null) this.specificQuestKeys.addAll(specificQuestKeys);
            return this;
        }

        public Builder protectorateTraitKeys(List<String> protectorateTraitKeys) {
            this.protectorateTraitKeys.clear();
            if (protectorateTraitKeys != null) this.protectorateTraitKeys.addAll(protectorateTraitKeys);
            return this;
        }

        public Faction build() { return new Faction(this); }
    }
}
