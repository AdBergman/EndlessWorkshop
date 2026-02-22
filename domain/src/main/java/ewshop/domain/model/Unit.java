package ewshop.domain.model;

import java.util.ArrayList;
import java.util.List;

public class Unit {

    private final String unitKey;
    private final String displayName;

    private final boolean isHero;
    private final boolean isChosen;

    private final String spawnType;

    private final String previousUnitKey;
    private final List<String> nextEvolutionUnitKeys;
    private final Integer evolutionTierIndex;

    private final String unitClassKey;
    private final String attackSkillKey;

    private final List<String> abilityKeys;
    private final List<String> descriptionLines;

    private Unit(Builder builder) {
        this.unitKey = builder.unitKey;
        this.displayName = builder.displayName;
        this.isHero = builder.isHero;
        this.isChosen = builder.isChosen;
        this.spawnType = builder.spawnType;

        this.previousUnitKey = builder.previousUnitKey;
        this.nextEvolutionUnitKeys = List.copyOf(builder.nextEvolutionUnitKeys);
        this.evolutionTierIndex = builder.evolutionTierIndex;

        this.unitClassKey = builder.unitClassKey;
        this.attackSkillKey = builder.attackSkillKey;

        this.abilityKeys = List.copyOf(builder.abilityKeys);
        this.descriptionLines = List.copyOf(builder.descriptionLines);
    }

    public String getUnitKey() { return unitKey; }
    public String getDisplayName() { return displayName; }

    public boolean isHero() { return isHero; }
    public boolean isChosen() { return isChosen; }

    public String getSpawnType() { return spawnType; }

    public String getPreviousUnitKey() { return previousUnitKey; }
    public List<String> getNextEvolutionUnitKeys() { return nextEvolutionUnitKeys; }
    public Integer getEvolutionTierIndex() { return evolutionTierIndex; }

    public String getUnitClassKey() { return unitClassKey; }
    public String getAttackSkillKey() { return attackSkillKey; }

    public List<String> getAbilityKeys() { return abilityKeys; }
    public List<String> getDescriptionLines() { return descriptionLines; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String unitKey;
        private String displayName;

        private boolean isHero;
        private boolean isChosen;

        private String spawnType;

        private String previousUnitKey;
        private final List<String> nextEvolutionUnitKeys = new ArrayList<>();
        private Integer evolutionTierIndex;

        private String unitClassKey;
        private String attackSkillKey;

        private final List<String> abilityKeys = new ArrayList<>();
        private final List<String> descriptionLines = new ArrayList<>();

        public Builder unitKey(String unitKey) { this.unitKey = unitKey; return this; }
        public Builder displayName(String displayName) { this.displayName = displayName; return this; }

        public Builder isHero(boolean isHero) { this.isHero = isHero; return this; }
        public Builder isChosen(boolean isChosen) { this.isChosen = isChosen; return this; }

        public Builder spawnType(String spawnType) { this.spawnType = spawnType; return this; }

        public Builder previousUnitKey(String previousUnitKey) { this.previousUnitKey = previousUnitKey; return this; }

        public Builder nextEvolutionUnitKeys(List<String> keys) {
            this.nextEvolutionUnitKeys.clear();
            if (keys != null) this.nextEvolutionUnitKeys.addAll(keys);
            return this;
        }

        public Builder evolutionTierIndex(Integer evolutionTierIndex) {
            this.evolutionTierIndex = evolutionTierIndex;
            return this;
        }

        public Builder unitClassKey(String unitClassKey) {
            this.unitClassKey = unitClassKey;
            return this;
        }

        public Builder attackSkillKey(String attackSkillKey) {
            this.attackSkillKey = attackSkillKey;
            return this;
        }

        public Builder abilityKeys(List<String> abilityKeys) {
            this.abilityKeys.clear();
            if (abilityKeys != null) this.abilityKeys.addAll(abilityKeys);
            return this;
        }

        public Builder descriptionLines(List<String> lines) {
            this.descriptionLines.clear();
            if (lines != null) this.descriptionLines.addAll(lines);
            return this;
        }

        public Unit build() {
            return new Unit(this);
        }
    }
}