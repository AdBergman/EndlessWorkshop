package ewshop.domain.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import ewshop.domain.entity.enums.Faction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@JsonDeserialize(builder = SavedTechBuild.Builder.class)
public class SavedTechBuild {

    private final UUID uuid;
    private final String name;
    private final Faction faction;
    private final List<String> techIds;
    private final LocalDateTime createdAt;

    private SavedTechBuild(Builder builder) {
        this.uuid = builder.uuid;
        this.name = builder.name;
        this.techIds = List.copyOf(builder.techIds);
        this.createdAt = builder.createdAt;
        this.faction = builder.faction;
    }

    public UUID getUuid() { return uuid; }
    public String getName() { return name; }
    public Faction getFaction() { return faction; }
    public List<String> getTechIds() { return techIds; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID uuid;
        private String name;
        private Faction faction;
        private final List<String> techIds = new ArrayList<>();
        private LocalDateTime createdAt = LocalDateTime.now();

        @JsonProperty("uuid")
        public Builder uuid(UUID uuid) {
            this.uuid = uuid;
            return this;
        }

        @JsonProperty("name")
        public Builder name(String name) {
            this.name = name;
            return this;
        }

        @JsonProperty("faction")
        public Builder faction(Faction faction) {
            this.faction = faction;
            return this;
        }


        @JsonProperty("techIds")
        public Builder techIds(List<String> techIds) {
            this.techIds.clear();
            if (techIds != null) this.techIds.addAll(techIds);
            return this;
        }

        public Builder addTechId(String techId) {
            this.techIds.add(techId);
            return this;
        }

        @JsonProperty("createdAt")
        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public SavedTechBuild build() {
            return new SavedTechBuild(this); }
    }
}
