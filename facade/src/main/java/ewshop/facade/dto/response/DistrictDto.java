package ewshop.facade.dto.response;

import java.util.List;

public record DistrictDto(
        String name,
        List<String> info,
        String effect,
        List<String> tileBonus,
        List<String> adjacencyBonus,
        String placementPrereq
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private List<String> info = List.of();
        private String effect = "";
        private List<String> tileBonus = List.of();
        private List<String> adjacencyBonus = List.of();
        private String placementPrereq = "";

        public Builder name(String name) { this.name = name; return this; }
        public Builder info(List<String> info) { this.info = info; return this; }
        public Builder effect(String effect) { this.effect = effect; return this; }
        public Builder tileBonus(List<String> tileBonus) { this.tileBonus = tileBonus; return this; }
        public Builder adjacencyBonus(List<String> adjacencyBonus) { this.adjacencyBonus = adjacencyBonus; return this; }
        public Builder placementPrereq(String placementPrereq) { this.placementPrereq = placementPrereq; return this; }

        public DistrictDto build() {
            return new DistrictDto(name, info, effect, tileBonus, adjacencyBonus, placementPrereq);
        }
    }
}
