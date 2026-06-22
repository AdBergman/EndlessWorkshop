package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Hero;
import ewshop.infrastructure.persistence.entities.HeroEntity;
import org.springframework.stereotype.Component;

@Component
public class HeroMapper {

    public Hero toDomain(HeroEntity entity) {
        if (entity == null) return null;
        return new Hero(
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
