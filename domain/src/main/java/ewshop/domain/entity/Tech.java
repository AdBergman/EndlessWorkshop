package ewshop.domain.entity;

import ewshop.domain.entity.enums.Faction;
import ewshop.domain.entity.enums.TechType;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Tech {
    private final String name;
    private final TechType type;
    private final int era;
    private final List<String> effects;
    private final TechCoords techCoords;
    private Tech prereq; // single prerequisite
    private Tech excludes; // mutually exclusive tech
    private final Set<Faction> factions;
    private final List<TechUnlock> unlocks; // keep domain object, not string

    private Tech(Builder builder) {
        this.name = builder.name;
        this.type = builder.type;
        this.era = builder.era;
        this.effects = List.copyOf(builder.effects);
        this.techCoords = builder.techCoords;
        this.prereq = builder.prereq;
        this.excludes = builder.excludes;
        this.factions = Set.copyOf(builder.factions);
        this.unlocks = List.copyOf(builder.unlocks);
    }

    // --- Getters ---
    public String getName() { return name; }
    public TechType getType() { return type; }
    public int getEra() { return era; }
    public List<String> getEffects() { return effects; }
    public TechCoords getTechCoords() { return techCoords; }
    public Tech getPrereq() { return prereq; }
    public Tech getExcludes() { return excludes; }
    public Set<Faction> getFactions() { return factions; }
    public List<TechUnlock> getUnlocks() { return unlocks; }

    // --- Builder ---
    public static Builder builder() { return new Builder(); }

    public void setPrereq(Tech prereqTech) {
        this.prereq = prereqTech;
    }

    public void setExcludes(Tech excludesTech) {
        this.excludes = excludesTech;
    }

    public static class Builder {
        private String name;
        private TechType type;
        private int era;
        private final List<String> effects = new ArrayList<>();
        private TechCoords techCoords;
        private Tech prereq;
        private Tech excludes;
        private final Set<Faction> factions = new HashSet<>();
        private final List<TechUnlock> unlocks = new ArrayList<>();

        public Builder name(String name) { this.name = name; return this; }
        public Builder type(TechType type) { this.type = type; return this; }
        public Builder era(int era) { this.era = era; return this; }
        public Builder effects(List<String> effects) { this.effects.clear(); this.effects.addAll(effects); return this; }
        public Builder addEffect(String effect) { this.effects.add(effect); return this; }
        public Builder techCoords(TechCoords techCoords) { this.techCoords = techCoords; return this; }
        public Builder prereq(Tech prereq) { this.prereq = prereq; return this; }
        public Builder excludes(Tech excludes) { this.excludes = excludes; return this; }
        public Builder factions(Set<Faction> factions) { this.factions.clear(); this.factions.addAll(factions); return this; }
        public Builder addFaction(Faction faction) { this.factions.add(faction); return this; }
        public Builder unlocks(List<TechUnlock> unlocks) { this.unlocks.clear(); this.unlocks.addAll(unlocks); return this; }
        public Builder addUnlock(TechUnlock unlock) { this.unlocks.add(unlock); return this; }

        public Tech build() { return new Tech(this); }
    }
}
