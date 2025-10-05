package ewshop.domain.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import ewshop.domain.entity.enums.UniqueType;

import java.util.ArrayList;
import java.util.List;

@JsonDeserialize(builder = Improvement.Builder.class)
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
        private final List<String> effects = new ArrayList<>();
        private UniqueType unique;
        private final List<StrategicCost> cost = new ArrayList<>();
        private int era;

        @JsonProperty("name")
        public Builder name(String name) {
            this.name = name;
            return this;
        }

        @JsonProperty("effects")
        public Builder effects(List<String> effects) {
            this.effects.clear();
            if (effects != null) this.effects.addAll(effects);
            return this;
        }

        public Builder addEffect(String effect) {
            this.effects.add(effect);
            return this;
        }

        @JsonProperty("unique")
        public Builder unique(UniqueType unique) {
            this.unique = unique;
            return this;
        }

        @JsonProperty("cost")
        public Builder cost(List<StrategicCost> cost) {
            this.cost.clear();
            if (cost != null) this.cost.addAll(cost);
            return this;
        }

        public Builder addCost(StrategicCost cost) {
            this.cost.add(cost);
            return this;
        }

        @JsonProperty("era")
        public Builder era(int era) {
            this.era = era;
            return this;
        }

        public Improvement build() { return new Improvement(this); }
    }
}
