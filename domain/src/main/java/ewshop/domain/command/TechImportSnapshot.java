package ewshop.domain.command;

import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.Faction;
import ewshop.domain.model.enums.TechType;

import java.util.List;
import java.util.Set;

public record TechImportSnapshot(
        String techKey,
        String displayName,
        String lore,
        boolean hidden,
        int era,
        TechType type,
        TechCoords techCoords,

        List<String> prereqTechKeys,
        List<String> exclusivePrereqTechKeys,
        List<TechTraitPrereq> traitPrereqs,

        List<String> descriptionLines,

        List<TechUnlockTuple> unlocks,

        // Derived at import-time (service postprocessor)
        Set<Faction> availableFactions
) {
    private static final TechCoords DEFAULT_COORDS = new TechCoords(0.0, 0.0);

    public TechImportSnapshot {
        String trimmedKey = techKey == null ? null : techKey.trim();
        if (trimmedKey == null || trimmedKey.isEmpty()) {
            throw new IllegalArgumentException("TechImportSnapshot.techKey is required");
        }
        techKey = trimmedKey;

        displayName = displayName == null ? "" : displayName.trim();

        if (type == null) {
            throw new IllegalArgumentException("TechImportSnapshot.type is required");
        }

        if (era < 1 || era > 6) {
            throw new IllegalArgumentException(
                    "TechImportSnapshot.era must be between 1 and 6 (got: " + era + ")"
            );
        }

        // every tech must have coords (admin UI needs renderable position)
        techCoords = techCoords == null ? DEFAULT_COORDS : techCoords;

        prereqTechKeys = prereqTechKeys == null ? List.of() : List.copyOf(prereqTechKeys);
        exclusivePrereqTechKeys = exclusivePrereqTechKeys == null ? List.of() : List.copyOf(exclusivePrereqTechKeys);
        traitPrereqs = traitPrereqs == null ? List.of() : List.copyOf(traitPrereqs);

        descriptionLines = descriptionLines == null ? List.of() : List.copyOf(descriptionLines);
        unlocks = unlocks == null ? List.of() : List.copyOf(unlocks);

        availableFactions = availableFactions == null || availableFactions.isEmpty()
                ? Set.of()
                : Set.copyOf(availableFactions);
    }

    public TechImportSnapshot withAvailableFactions(Set<Faction> next) {
        return new TechImportSnapshot(
                techKey,
                displayName,
                lore,
                hidden,
                era,
                type,
                techCoords,
                prereqTechKeys,
                exclusivePrereqTechKeys,
                traitPrereqs,
                descriptionLines,
                unlocks,
                next
        );
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String techKey = "";
        private String displayName = "";
        private String lore = null;
        private boolean hidden = false;
        private int era = 1;
        private TechType type;

        private TechCoords techCoords = DEFAULT_COORDS;

        private List<String> prereqTechKeys = List.of();
        private List<String> exclusivePrereqTechKeys = List.of();
        private List<TechTraitPrereq> traitPrereqs = List.of();

        private List<String> descriptionLines = List.of();
        private List<TechUnlockTuple> unlocks = List.of();

        private Set<Faction> availableFactions = Set.of();

        public Builder techKey(String techKey) { this.techKey = techKey; return this; }
        public Builder displayName(String displayName) { this.displayName = displayName; return this; }
        public Builder lore(String lore) { this.lore = lore; return this; }
        public Builder hidden(boolean hidden) { this.hidden = hidden; return this; }
        public Builder era(int era) { this.era = era; return this; }
        public Builder type(TechType type) { this.type = type; return this; }

        public Builder techCoords(TechCoords techCoords) { this.techCoords = techCoords; return this; }

        public Builder prereqTechKeys(List<String> prereqTechKeys) { this.prereqTechKeys = prereqTechKeys; return this; }
        public Builder exclusivePrereqTechKeys(List<String> exclusivePrereqTechKeys) { this.exclusivePrereqTechKeys = exclusivePrereqTechKeys; return this; }
        public Builder traitPrereqs(List<TechTraitPrereq> traitPrereqs) { this.traitPrereqs = traitPrereqs; return this; }

        public Builder descriptionLines(List<String> descriptionLines) { this.descriptionLines = descriptionLines; return this; }
        public Builder unlocks(List<TechUnlockTuple> unlocks) { this.unlocks = unlocks; return this; }

        public Builder availableFactions(Set<Faction> availableFactions) { this.availableFactions = availableFactions; return this; }

        public TechImportSnapshot build() {
            return new TechImportSnapshot(
                    techKey,
                    displayName,
                    lore,
                    hidden,
                    era,
                    type,
                    techCoords,
                    prereqTechKeys,
                    exclusivePrereqTechKeys,
                    traitPrereqs,
                    descriptionLines,
                    unlocks,
                    availableFactions
            );
        }
    }
}