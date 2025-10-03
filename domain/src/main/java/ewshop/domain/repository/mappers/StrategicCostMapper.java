package ewshop.domain.repository.mappers;

import ewshop.domain.entity.StrategicCost;
import ewshop.domain.repository.entities.StrategicCostEntity;

public class StrategicCostMapper {

    public static StrategicCost toDomain(StrategicCostEntity entity) {
        if (entity == null) return null;
        return new StrategicCost(entity.getType(), entity.getAmount());
    }

    public static StrategicCostEntity toEntity(StrategicCost domain) {
        if (domain == null) return null;
        return new StrategicCostEntity(domain.type(), domain.amount());
    }
}
