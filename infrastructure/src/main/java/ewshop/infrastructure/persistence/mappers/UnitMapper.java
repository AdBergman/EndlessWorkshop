package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Unit;
import ewshop.infrastructure.persistence.entities.UnitEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class UnitMapper {

    public UnitEntity toEntity(Unit domain) {
        if (domain == null) return null;

        UnitEntity entity = new UnitEntity();
        entity.setUnitKey(domain.getUnitKey());
        entity.setDisplayName(domain.getDisplayName());

        entity.setHero(domain.isHero());
        entity.setChosen(domain.isChosen());

        entity.setSpawnType(domain.getSpawnType());
        entity.setPreviousUnitKey(domain.getPreviousUnitKey());
        entity.setEvolutionTierIndex(domain.getEvolutionTierIndex());

        entity.setUnitClassKey(domain.getUnitClassKey());
        entity.setAttackSkillKey(domain.getAttackSkillKey());

        entity.setNextEvolutionUnitKeys(
                domain.getNextEvolutionUnitKeys() != null
                        ? domain.getNextEvolutionUnitKeys()
                        : Collections.emptyList()
        );

        entity.setAbilityKeys(
                domain.getAbilityKeys() != null
                        ? domain.getAbilityKeys()
                        : Collections.emptyList()
        );

        entity.setDescriptionLines(
                domain.getDescriptionLines() != null
                        ? domain.getDescriptionLines()
                        : Collections.emptyList()
        );

        return entity;
    }

    public Unit toDomain(UnitEntity entity) {
        if (entity == null) return null;

        return Unit.builder()
                .unitKey(entity.getUnitKey())
                .displayName(entity.getDisplayName())
                .isHero(entity.isHero())
                .isChosen(entity.isChosen())
                .spawnType(entity.getSpawnType())
                .previousUnitKey(entity.getPreviousUnitKey())
                .nextEvolutionUnitKeys(
                        entity.getNextEvolutionUnitKeys() != null
                                ? entity.getNextEvolutionUnitKeys()
                                : Collections.emptyList()
                )
                .evolutionTierIndex(entity.getEvolutionTierIndex())
                .unitClassKey(entity.getUnitClassKey())
                .attackSkillKey(entity.getAttackSkillKey())
                .abilityKeys(
                        entity.getAbilityKeys() != null
                                ? entity.getAbilityKeys()
                                : Collections.emptyList()
                )
                .descriptionLines(
                        entity.getDescriptionLines() != null
                                ? entity.getDescriptionLines()
                                : Collections.emptyList()
                )
                .build();
    }
}