package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Improvement;
import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class ImprovementMapper {

    private final StrategicCostMapper strategicCostMapper;

    public ImprovementMapper(StrategicCostMapper strategicCostMapper) {
        this.strategicCostMapper = strategicCostMapper;
    }

    public Improvement toDomain(ImprovementEntity entity) {
        if (entity == null) return null;

        return Improvement.builder()
                .name(entity.getName())
                .era(entity.getEra())
                .unique(entity.getUnique())
                .cost(entity.getCost() != null ? entity.getCost().stream()
                        .map(strategicCostMapper::toDomain)
                        .collect(Collectors.toList()) : Collections.emptyList())
                .effects(entity.getEffects() != null ? entity.getEffects() : Collections.emptyList())
                .build();
    }

    public ImprovementEntity toEntity(Improvement domain) {
        if (domain == null) return null;

        ImprovementEntity entity = new ImprovementEntity();
        entity.setName(domain.getName());
        entity.setEra(domain.getEra());
        entity.setUnique(domain.getUnique());
        entity.setCost(domain.getCost() != null ? domain.getCost().stream()
                .map(strategicCostMapper::toEntity)
                .collect(Collectors.toList()) : Collections.emptyList());
        entity.setEffects(domain.getEffects() != null ? domain.getEffects() : Collections.emptyList());
        return entity;
    }
}
