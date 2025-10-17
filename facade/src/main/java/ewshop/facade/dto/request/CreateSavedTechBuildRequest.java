package ewshop.facade.dto.request;

import java.util.List;

public record CreateSavedTechBuildRequest(
        String name,
        String selectedFaction,
        List<String> techIds
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name = "";
        private String selectedFaction = "";
        private List<String> techIds = List.of();

        public Builder name(String name) { this.name = name; return this; }
        public Builder selectedFaction(String selectedFaction) { this.selectedFaction = selectedFaction; return this; }
        public Builder techIds(List<String> techIds) { this.techIds = techIds; return this; }

        public CreateSavedTechBuildRequest build() {
            return new CreateSavedTechBuildRequest(name, selectedFaction, techIds);
        }
    }
}
