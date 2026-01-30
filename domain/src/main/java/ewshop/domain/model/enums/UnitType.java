package ewshop.domain.model.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum UnitType {
    @JsonProperty("Infantry")
    INFANTRY,

    @JsonProperty("Ranged")
    RANGED,

    @JsonProperty("Cavalry")
    CAVALRY,

    @JsonProperty("Juggernaut")
    JUGGERNAUT,

    @JsonProperty("Flying")
    FLYING,

    @JsonProperty("Swarm")
    SWARM,

    @JsonProperty("Flying Swarm")
    FLYING_SWARM,

    @JsonProperty("Flying Ranged")
    FLYING_RANGED,

    @JsonProperty("Juggernaut Ranged")
    JUGGERNAUT_RANGED,

    @JsonProperty("Cavalry Ranged")
    CAVALRY_RANGED,
}
