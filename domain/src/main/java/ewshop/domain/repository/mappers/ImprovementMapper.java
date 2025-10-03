package ewshop.domain.repository.mappers;

import ewshop.domain.entity.Improvement;
import ewshop.domain.repository.entities.ImprovementEntity;
import java.util.stream.Collectors;

public class ImprovementMapper {

    public static Improvement toDomain(ImprovementEntity entity) {
        if (entity == null) return null;

        return Improvement.builder()
                .name(entity.getName())
                .effects(entity.getEffects())
                .unique(entity.getUnique())
                .cost(entity.getCost().stream()
                        .map(StrategicCostMapper::toDomain)
                        .collect(Collectors.toList()))
                .era(entity.getEra())
                .build();
    }

    public static ImprovementEntity toEntity(Improvement domain) {
        if (domain == null) return null;

        ImprovementEntity entity = new ImprovementEntity();
        entity.setName(domain.getName());
        entity.setEffects(domain.getEffects());
        entity.setUnique(domain.getUnique());
        entity.setCost(domain.getCost().stream()
                .map(StrategicCostMapper::toEntity)
                .collect(Collectors.toList()));
        entity.setEra(domain.getEra());
        return entity;
    }
}
