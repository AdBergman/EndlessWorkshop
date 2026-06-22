package ewshop.facade.mapper;

import ewshop.domain.model.RichHero;
import ewshop.facade.dto.response.RichHeroDto;

public final class RichHeroMapper {

    private RichHeroMapper() {}

    public static RichHeroDto toDto(RichHero hero) {
        if (hero == null) return null;

        return new RichHeroDto(
                hero.unitKey(),
                hero.displayName(),
                hero.faction(),
                hero.factionKey(),
                hero.isMajorFaction(),
                hero.heroKey(),
                hero.heroClassKey(),
                hero.originKind(),
                hero.originFactionKey(),
                hero.minorFactionKey(),
                hero.unitClassKey(),
                hero.attackSkillKey(),
                hero.ownAbilityKeys(),
                hero.abilityKeys(),
                hero.combatAbilityKeys(),
                hero.tacticalAbilityKeys(),
                hero.passiveAbilityKeys(),
                hero.mechanicalAbilityKeys(),
                hero.classRuleAbilityKeys(),
                hero.hiddenHelperAbilityKeys(),
                hero.defaultSkillKeys(),
                hero.applicableSkillTreeKeys(),
                hero.descriptionLines(),
                hero.referenceKeys()
        );
    }
}
