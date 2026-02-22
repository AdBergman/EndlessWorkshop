package ewshop.domain.command;

import java.util.List;

public record UnitImportSnapshot(
        String unitKey,
        String displayName,

        String faction,
        boolean isMajorFaction,

        boolean isHero,
        boolean isChosen,
        String spawnType,

        String previousUnitKey,
        List<String> nextEvolutionUnitKeys,
        Integer evolutionTierIndex,

        String unitClassKey,
        String attackSkillKey,

        List<String> abilityKeys,
        List<String> descriptionLines
) {

    public UnitImportSnapshot {
        String trimmedKey = unitKey == null ? null : unitKey.trim();
        if (trimmedKey == null || trimmedKey.isEmpty()) {
            throw new IllegalArgumentException("UnitImportSnapshot.unitKey is required");
        }
        unitKey = trimmedKey;

        displayName = displayName == null ? "" : displayName.trim();

        faction = faction == null ? null : faction.trim();
        if (faction != null && faction.isEmpty()) faction = null;

        spawnType = spawnType == null ? null : spawnType.trim();
        previousUnitKey = previousUnitKey == null ? null : previousUnitKey.trim();
        unitClassKey = unitClassKey == null ? null : unitClassKey.trim();

        attackSkillKey = attackSkillKey == null ? null : attackSkillKey.trim();
        if (attackSkillKey != null && attackSkillKey.isEmpty()) attackSkillKey = null;

        nextEvolutionUnitKeys = nextEvolutionUnitKeys == null ? List.of() : List.copyOf(nextEvolutionUnitKeys);
        abilityKeys = abilityKeys == null ? List.of() : List.copyOf(abilityKeys);
        descriptionLines = descriptionLines == null ? List.of() : List.copyOf(descriptionLines);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private String unitKey = "";
        private String displayName = "";

        private String faction = null;
        private boolean isMajorFaction = true;

        private boolean isHero = false;
        private boolean isChosen = false;
        private String spawnType = null;

        private String previousUnitKey = null;
        private List<String> nextEvolutionUnitKeys = List.of();
        private Integer evolutionTierIndex = null;

        private String unitClassKey = null;
        private String attackSkillKey = null;

        private List<String> abilityKeys = List.of();
        private List<String> descriptionLines = List.of();

        public Builder unitKey(String unitKey) { this.unitKey = unitKey; return this; }
        public Builder displayName(String displayName) { this.displayName = displayName; return this; }

        public Builder faction(String faction) { this.faction = faction; return this; }
        public Builder isMajorFaction(boolean isMajorFaction) { this.isMajorFaction = isMajorFaction; return this; }

        public Builder isHero(boolean isHero) { this.isHero = isHero; return this; }
        public Builder isChosen(boolean isChosen) { this.isChosen = isChosen; return this; }
        public Builder spawnType(String spawnType) { this.spawnType = spawnType; return this; }

        public Builder previousUnitKey(String previousUnitKey) { this.previousUnitKey = previousUnitKey; return this; }
        public Builder nextEvolutionUnitKeys(List<String> nextEvolutionUnitKeys) { this.nextEvolutionUnitKeys = nextEvolutionUnitKeys; return this; }
        public Builder evolutionTierIndex(Integer evolutionTierIndex) { this.evolutionTierIndex = evolutionTierIndex; return this; }

        public Builder unitClassKey(String unitClassKey) { this.unitClassKey = unitClassKey; return this; }
        public Builder attackSkillKey(String attackSkillKey) { this.attackSkillKey = attackSkillKey; return this; }

        public Builder abilityKeys(List<String> abilityKeys) { this.abilityKeys = abilityKeys; return this; }
        public Builder descriptionLines(List<String> descriptionLines) { this.descriptionLines = descriptionLines; return this; }

        public UnitImportSnapshot build() {
            return new UnitImportSnapshot(
                    unitKey,
                    displayName,
                    faction,
                    isMajorFaction,
                    isHero,
                    isChosen,
                    spawnType,
                    previousUnitKey,
                    nextEvolutionUnitKeys,
                    evolutionTierIndex,
                    unitClassKey,
                    attackSkillKey,
                    abilityKeys,
                    descriptionLines
            );
        }
    }
}