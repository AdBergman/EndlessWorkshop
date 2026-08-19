package ewshop.domain.model;

import ewshop.domain.model.enums.MajorFaction;
import ewshop.domain.model.enums.TechType;

import java.util.*;

public class Tech {
    private final String name;
    private final String techKey;
    private final TechType type;
    private final int era;

    private final List<String> descriptionLines;
    private final List<TechUnlockRef> unlocks;
    private final List<String> technologyPrerequisiteTechKeys;
    private final List<String> exclusiveTechnologyPrerequisiteTechKeys;

    private final TechCoords techCoords;
    private Tech prereq;
    private Tech excludes;
    private final Set<String> majorFactions;

    private Tech(Builder builder) {
        this.name = builder.name;
        this.techKey = builder.techKey;
        this.type = builder.type;
        this.era = builder.era;

        this.descriptionLines = List.copyOf(builder.descriptionLines);
        this.unlocks = List.copyOf(builder.unlocks);
        this.technologyPrerequisiteTechKeys = List.copyOf(builder.technologyPrerequisiteTechKeys);
        this.exclusiveTechnologyPrerequisiteTechKeys = List.copyOf(builder.exclusiveTechnologyPrerequisiteTechKeys);

        this.techCoords = builder.techCoords;
        this.prereq = builder.prereq;
        this.excludes = builder.excludes;
        this.majorFactions = Set.copyOf(builder.majorFactions);
    }

    public String getName() { return name; }
    public String getTechKey() { return techKey; }
    public TechType getType() { return type; }
    public int getEra() { return era; }

    public List<String> getDescriptionLines() { return descriptionLines; }
    public List<TechUnlockRef> getUnlocks() { return unlocks; }
    public List<String> getTechnologyPrerequisiteTechKeys() { return technologyPrerequisiteTechKeys; }
    public List<String> getExclusiveTechnologyPrerequisiteTechKeys() { return exclusiveTechnologyPrerequisiteTechKeys; }

    public TechCoords getTechCoords() { return techCoords; }
    public Tech getPrereq() { return prereq; }
    public Tech getExcludes() { return excludes; }
    public Set<String> getFactions() { return majorFactions; }

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
        private final List<String> technologyPrerequisiteTechKeys = new ArrayList<>();
        private final List<String> exclusiveTechnologyPrerequisiteTechKeys = new ArrayList<>();

        private TechCoords techCoords;
        private Tech prereq;
        private Tech excludes;
        private final Set<String> majorFactions = new HashSet<>();

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
        public Builder addUnlock(String unlockType, String unlockKey, String unlockCategory) {
            this.unlocks.add(new TechUnlockRef(unlockType, unlockKey, unlockCategory));
            return this;
        }

        public Builder technologyPrerequisiteTechKeys(List<String> keys) {
            this.technologyPrerequisiteTechKeys.clear();
            addCleanKeys(this.technologyPrerequisiteTechKeys, keys);
            return this;
        }

        public Builder exclusiveTechnologyPrerequisiteTechKeys(List<String> keys) {
            this.exclusiveTechnologyPrerequisiteTechKeys.clear();
            addCleanKeys(this.exclusiveTechnologyPrerequisiteTechKeys, keys);
            return this;
        }

        public Builder techCoords(TechCoords techCoords) { this.techCoords = techCoords; return this; }
        public Builder prereq(Tech prereq) { this.prereq = prereq; return this; }
        public Builder excludes(Tech excludes) { this.excludes = excludes; return this; }

        public Builder factions(Set<String> majorFactions) {
            this.majorFactions.clear();
            if (majorFactions != null) {
                majorFactions.forEach(this::addFaction);
            }
            return this;
        }

        public Builder addFaction(String majorFaction) {
            String value = majorFaction == null ? null : majorFaction.trim();
            if (value != null && !value.isBlank()) {
                this.majorFactions.add(value);
            }
            return this;
        }

        public Builder addFaction(MajorFaction majorFaction) {
            return addFaction(majorFaction == null ? null : majorFaction.getDisplayName());
        }

        public Tech build() { return new Tech(this); }

        private static void addCleanKeys(List<String> target, List<String> keys) {
            if (keys == null || keys.isEmpty()) return;
            keys.stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(key -> !key.isBlank())
                    .distinct()
                    .forEach(target::add);
        }
    }
}
