package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.UnitSkill;
import ewshop.infrastructure.persistence.entities.UnitSkillEntity;
import org.springframework.stereotype.Component;

@Component
public class UnitSkillMapper {

    /** Entity -> Domain */
    public UnitSkill toDomain(UnitSkillEntity entity) {
        if (entity == null) return null;

        return UnitSkill.builder()
                .name(entity.getName())
                .amount(entity.getAmount() != null ? entity.getAmount() : 0)
                .target(entity.getTarget() != null ? entity.getTarget() : "")
                .type(entity.getType() != null ? entity.getType() : "")
                .build();
    }

    /** Domain -> Entity */
    public UnitSkillEntity toEntity(UnitSkill domain) {
        if (domain == null) return null;

        UnitSkillEntity entity = new UnitSkillEntity();
        entity.setName(domain.getName());
        entity.setAmount(domain.getAmount());
        entity.setTarget(domain.getTarget());
        entity.setType(domain.getType());
        return entity;
    }
}
