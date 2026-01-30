package ewshop.facade.dto.request;

import ewshop.facade.dto.response.TechCoordsDto;

public record TechAdminDto(
        String name,
        int era,
        String type,
        TechCoordsDto coords
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private int era;
        private String type;
        private TechCoordsDto coords;

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder era(int era) {
            this.era = era;
            return this;
        }

        public Builder type(String type) {
            this.type = type;
            return this;
        }

        public Builder coords(TechCoordsDto coords) {
            this.coords = coords;
            return this;
        }

        public TechAdminDto build() {
            return new TechAdminDto(name, era, type, coords);
        }
    }
}