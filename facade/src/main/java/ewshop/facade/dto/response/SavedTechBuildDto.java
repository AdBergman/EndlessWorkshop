package ewshop.facade.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SavedTechBuildDto(
        UUID uuid,
        String name,
        List<String> techIds,
        LocalDateTime createdAt
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID uuid;
        private String name = "";
        private List<String> techIds = List.of();
        private LocalDateTime createdAt = LocalDateTime.now();

        public Builder uuid(UUID uuid) { this.uuid = uuid; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder techIds(List<String> techIds) { this.techIds = techIds; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public SavedTechBuildDto build() {
            return new SavedTechBuildDto(uuid, name, techIds, createdAt);
        }
    }
}
