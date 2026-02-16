package ewshop.domain.model;

import ewshop.domain.model.enums.Faction;
import ewshop.domain.model.enums.TechType;

import java.util.*;

public class Tech {
    private final String name;
    private final String techKey;
    private final TechType type;
    private final int era;

    private final List<String> descriptionLines;
    private final List<TechUnlockRef> unlocks;

    private final TechCoords techCoords;
    private Tech prereq;
    private Tech excludes;
    private final Set<Faction> factions;

    private Tech(Builder builder) {
        this.name = builder.name;
        this.techKey = builder.techKey;
        this.type = builder.type;
        this.era = builder.era;

        this.descriptionLines = List.copyOf(builder.descriptionLines);
        this.unlocks = List.copyOf(builder.unlocks);

        this.techCoords = builder.techCoords;
        this.prereq = builder.prereq;
        this.excludes = builder.excludes;
        this.factions = Set.copyOf(builder.factions);
    }

    public String getName() { return name; }
    public String getTechKey() { return techKey; }
    public TechType getType() { return type; }
    public int getEra() { return era; }

    public List<String> getDescriptionLines() { return descriptionLines; }
    public List<TechUnlockRef> getUnlocks() { return unlocks; }

    public TechCoords getTechCoords() { return techCoords; }
    public Tech getPrereq() { return prereq; }
    public Tech getExcludes() { return excludes; }
    public Set<Faction> getFactions() { return factions; }

    public void setPrereq(Tech prereqTech) { this.prereq = prereqTech; }
    public void setExcludes(Tech excludesTech) { this.excludes = excludesTech; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String name;
        private String techKey;
        private TechType type;
        private int era;

        private final List<String> descriptionLines = new ArrayList<>();
        private final List<TechUnlockRef> unlocks = new ArrayList<>();

        private TechCoords techCoords;
        private Tech prereq;
        private Tech excludes;
        private final Set<Faction> factions = new HashSet<>();

        public Builder name(String name) { this.name = name; return this; }
        public Builder techKey(String techKey) { this.techKey = techKey; return this; }
        public Builder type(TechType type) { this.type = type; return this; }
        public Builder era(int era) { this.era = era; return this; }

        public Builder descriptionLines(List<String> lines) {
            this.descriptionLines.clear();
            if (lines != null) this.descriptionLines.addAll(lines);
            return this;
        }
        public Builder addDescriptionLine(String line) { this.descriptionLines.add(line); return this; }

        public Builder unlocks(List<TechUnlockRef> unlocks) {
            this.unlocks.clear();
            if (unlocks != null) this.unlocks.addAll(unlocks);
            return this;
        }
        public Builder addUnlock(String unlockType, String unlockKey) {
            this.unlocks.add(new TechUnlockRef(unlockType, unlockKey));
            return this;
        }

        public Builder techCoords(TechCoords techCoords) { this.techCoords = techCoords; return this; }
        public Builder prereq(Tech prereq) { this.prereq = prereq; return this; }
        public Builder excludes(Tech excludes) { this.excludes = excludes; return this; }

        public Builder factions(Set<Faction> factions) {
            this.factions.clear();
            if (factions != null) this.factions.addAll(factions);
            return this;
        }
        public Builder addFaction(Faction faction) { this.factions.add(faction); return this; }

        public Tech build() { return new Tech(this); }
    }
}