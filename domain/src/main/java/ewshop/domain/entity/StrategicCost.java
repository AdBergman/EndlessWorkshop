package ewshop.domain.entity;

import ewshop.domain.entity.enums.StrategicResourceType;

public record StrategicCost(StrategicResourceType type, int amount) {}
