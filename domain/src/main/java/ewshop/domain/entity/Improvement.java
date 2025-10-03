package ewshop.domain.entity;

import ewshop.domain.entity.enums.UniqueType;
import java.util.List;

public class Improvement {
    private final String name;
    private final List<String> effects;
    private final UniqueType unique;
    private final List<StrategicCost> cost;
    private final int era;

    private Improvement(Builder builder) {
        this.name = builder.name;
        this.effects = List.copyOf(builder.effects);
        this.unique = builder.unique;
        this.cost = List.copyOf(builder.cost);
        this.era = builder.era;
    }

    public String getName() { return name; }
    public List<String> getEffects() { return effects; }
    public UniqueType getUnique() { return unique; }
    public List<StrategicCost> getCost() { return cost; }
    public int getEra() { return era; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String name;
        private List<String> effects = List.of();
        private UniqueType unique;
        private List<StrategicCost> cost = List.of();
        private int era;

        public Builder name(String name) { this.name = name; return this; }
        public Builder effects(List<String> effects) { this.effects = List.copyOf(effects); return this; }
        public Builder unique(UniqueType unique) { this.unique = unique; return this; }
        public Builder cost(List<StrategicCost> cost) { this.cost = List.copyOf(cost); return this; }
        public Builder era(int era) { this.era = era; return this; }

        public Improvement build() { return new Improvement(this); }
    }
}
