package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.RichHero;
import ewshop.infrastructure.persistence.entities.RichHeroEntity;
import org.springframework.stereotype.Component;

@Component
public class RichHeroMapper {

    public RichHero toDomain(RichHeroEntity entity) {
        if (entity == null) return null;
        return new RichHero(
                entity.getUnitKey(),
                entity.getDisplayName(),
                entity.getFaction(),
                entity.getFactionKey(),
                entity.getIsMajorFaction(),
                entity.getHeroKey(),
                entity.getHeroClassKey(),
                entity.getOriginKind(),
                entity.getOriginFactionKey(),
                entity.getMinorFactionKey(),
                entity.getUnitClassKey(),
                entity.getAttackSkillKey(),
                entity.getOwnAbilityKeys(),
                entity.getAbilityKeys(),
                entity.getCombatAbilityKeys(),
                entity.getTacticalAbilityKeys(),
                entity.getPassiveAbilityKeys(),
                entity.getMechanicalAbilityKeys(),
                entity.getClassRuleAbilityKeys(),
                entity.getHiddenHelperAbilityKeys(),
                entity.getDefaultSkillKeys(),
                entity.getApplicableSkillTreeKeys(),
                entity.getDescriptionLines(),
                entity.getReferenceKeys()
        );
    }
}
