package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Unit;
import ewshop.infrastructure.persistence.entities.UnitEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class UnitMapper {

    public UnitEntity toEntity(Unit domain) {
        if (domain == null) return null;

        UnitEntity entity = new UnitEntity();
        entity.setUnitKey(domain.getUnitKey());
        entity.setDisplayName(domain.getDisplayName());
        entity.setArtId(domain.getArtId());

        entity.setFaction(domain.getFaction());
        entity.setMajorFaction(domain.isMajorFaction());

        entity.setHero(domain.isHero());
        entity.setChosen(domain.isChosen());

        entity.setSpawnType(domain.getSpawnType());
        entity.setPreviousUnitKey(domain.getPreviousUnitKey());
        entity.setEvolutionTierIndex(domain.getEvolutionTierIndex());

        entity.setUnitClassKey(domain.getUnitClassKey());
        entity.setAttackSkillKey(domain.getAttackSkillKey());

        entity.setNextEvolutionUnitKeys(copy(domain.getNextEvolutionUnitKeys()));
        entity.setAbilityKeys(copy(domain.getAbilityKeys()));
        entity.setDescriptionLines(copy(domain.getDescriptionLines()));

        return entity;
    }

    public Unit toDomain(UnitEntity entity) {
        if (entity == null) return null;

        return Unit.builder()
                .unitKey(entity.getUnitKey())
                .displayName(entity.getDisplayName())
                .artId(entity.getArtId())

                .faction(entity.getFaction())
                .isMajorFaction(entity.isMajorFaction())

                .isHero(entity.isHero())
                .isChosen(entity.isChosen())
                .spawnType(entity.getSpawnType())

                .previousUnitKey(entity.getPreviousUnitKey())
                .nextEvolutionUnitKeys(entity.getNextEvolutionUnitKeys())
                .evolutionTierIndex(entity.getEvolutionTierIndex())

                .unitClassKey(entity.getUnitClassKey())
                .attackSkillKey(entity.getAttackSkillKey())

                .abilityKeys(entity.getAbilityKeys())
                .descriptionLines(entity.getDescriptionLines())
                .build();
    }

    private static List<String> copy(List<String> in) {
        return in == null ? new ArrayList<>() : new ArrayList<>(in);
    }
}