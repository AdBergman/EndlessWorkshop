package ewshop.facade.dto.response;

import ewshop.domain.model.enums.MajorFaction;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SavedTechBuildDto(
        UUID uuid,
        String name,
        String selectedFaction,
        List<String> techIds,
        LocalDateTime createdAt
) {

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID uuid;
        private String name = "";
        private String selectedFaction;
        private List<String> techIds = List.of();
        private LocalDateTime createdAt; // no default, use entity-provided value

        public Builder uuid(UUID uuid) { this.uuid = uuid; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder selectedFaction(MajorFaction selectedMajorFaction) { this.selectedFaction = selectedMajorFaction.getDisplayName(); return this; }
        public Builder techIds(List<String> techIds) { this.techIds = techIds; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public SavedTechBuildDto build() {
            return new SavedTechBuildDto(uuid, name, selectedFaction, techIds, createdAt);
        }
    }
}
