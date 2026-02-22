package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.UnitSkill;
import ewshop.infrastructure.persistence.entities.UnitSkillEntityLegacy;
import org.springframework.stereotype.Component;

@Component
public class UnitSkillMapperLegacy {

    /** Entity -> Domain */
    public UnitSkill toDomain(UnitSkillEntityLegacy entity) {
        if (entity == null) return null;

        return UnitSkill.builder()
                .name(entity.getName())
                .amount(entity.getAmount() != null ? entity.getAmount() : 0)
                .target(entity.getTarget() != null ? entity.getTarget() : "")
                .type(entity.getType() != null ? entity.getType() : "")
                .build();
    }

    /** Domain -> Entity */
    public UnitSkillEntityLegacy toEntity(UnitSkill domain) {
        if (domain == null) return null;

        UnitSkillEntityLegacy entity = new UnitSkillEntityLegacy();
        entity.setName(domain.getName());
        entity.setAmount(domain.getAmount());
        entity.setTarget(domain.getTarget());
        entity.setType(domain.getType());
        return entity;
    }
}
