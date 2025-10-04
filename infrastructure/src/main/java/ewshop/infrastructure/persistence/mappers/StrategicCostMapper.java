package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.StrategicCost;
import ewshop.infrastructure.persistence.entities.StrategicCostEntity;
import org.springframework.stereotype.Component;

@Component
public class StrategicCostMapper {

    public StrategicCost toDomain(StrategicCostEntity entity) {
        if (entity == null) return null;

        // Assuming StrategicCost is a record or has a public constructor
        return new StrategicCost(entity.getType(), entity.getAmount());
    }

    public StrategicCostEntity toEntity(StrategicCost domain) {
        if (domain == null) return null;

        StrategicCostEntity entity = new StrategicCostEntity();
        entity.setType(domain.type());
        entity.setAmount(domain.amount());
        return entity;
    }
}
