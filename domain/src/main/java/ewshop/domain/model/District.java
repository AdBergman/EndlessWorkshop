package ewshop.domain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import java.util.ArrayList;
import java.util.List;

@JsonDeserialize(builder = District.Builder.class)
public class District {
    private final String name;
    private final List<String> info;
    private final String effect;
    private final List<String> tileBonus;
    private final List<String> adjacencyBonus;
    private final String placementPrereq;

    private District(Builder builder) {
        this.name = builder.name;
        this.info = List.copyOf(builder.info);
        this.effect = builder.effect;
        this.tileBonus = List.copyOf(builder.tileBonus);
        this.adjacencyBonus = List.copyOf(builder.adjacencyBonus);
        this.placementPrereq = builder.placementPrereq;
    }

    public String getName() { return name; }
    public List<String> getInfo() { return info; }
    public String getEffect() { return effect; }
    public List<String> getTileBonus() { return tileBonus; }
    public List<String> getAdjacencyBonus() { return adjacencyBonus; }
    public String getPlacementPrereq() { return placementPrereq; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String name;
        private final List<String> info = new ArrayList<>();
        private String effect;
        private final List<String> tileBonus = new ArrayList<>();
        private final List<String> adjacencyBonus = new ArrayList<>();
        private String placementPrereq;

        @JsonProperty("name")
        public Builder name(String name) {
            this.name = name;
            return this;
        }

        @JsonProperty("info")
        public Builder info(List<String> info) {
            this.info.clear();
            if (info != null) this.info.addAll(info);
            return this;
        }

        public Builder addInfo(String info) {
            this.info.add(info);
            return this;
        }

        @JsonProperty("effect")
        public Builder effect(String effect) {
            this.effect = effect;
            return this;
        }

        @JsonProperty("tileBonus")
        public Builder tileBonus(List<String> tileBonus) {
            this.tileBonus.clear();
            if (tileBonus != null) this.tileBonus.addAll(tileBonus);
            return this;
        }

        public Builder addTileBonus(String bonus) {
            this.tileBonus.add(bonus);
            return this;
        }

        @JsonProperty("adjacencyBonus")
        public Builder adjacencyBonus(List<String> adjacencyBonus) {
            this.adjacencyBonus.clear();
            if (adjacencyBonus != null) this.adjacencyBonus.addAll(adjacencyBonus);
            return this;
        }

        public Builder addAdjacencyBonus(String bonus) {
            this.adjacencyBonus.add(bonus);
            return this;
        }

        @JsonProperty("placementPrereq")
        public Builder placementPrereq(String placementPrereq) {
            this.placementPrereq = placementPrereq;
            return this;
        }

        public District build() { return new District(this); }
    }
}
