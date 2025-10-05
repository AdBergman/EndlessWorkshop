package ewshop.facade.dto;

import java.util.List;

public record ImprovementDto(
        String name,
        List<String> effects,
        String unique,
        List<String> cost,
        int era
) {

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private List<String> effects;
        private String unique;
        private List<String> cost;
        private int era;

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder effects(List<String> effects) {
            this.effects = effects;
            return this;
        }

        public Builder unique(String unique) {
            this.unique = unique;
            return this;
        }

        public Builder cost(List<String> cost) {
            this.cost = cost;
            return this;
        }

        public Builder era(int era) {
            this.era = era;
            return this;
        }

        public ImprovementDto build() {
            return new ImprovementDto(
                    name,
                    effects != null ? List.copyOf(effects) : List.of(),
                    unique,
                    cost != null ? List.copyOf(cost) : List.of(),
                    era
            );
        }
    }
}
