package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Faction;
import ewshop.infrastructure.persistence.entities.FactionEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class FactionMapper {

    public FactionEntity toEntity(Faction domain) {
        if (domain == null) return null;

        FactionEntity entity = new FactionEntity();
        entity.setFactionKey(domain.getFactionKey());
        entity.setPublicDisplayName(domain.getPublicDisplayName());
        entity.setLore(domain.getLore());
        entity.setFactionKind(domain.getFactionKind());
        entity.setAffinityKey(domain.getAffinityKey());
        entity.setAffinityType(domain.getAffinityType());
        entity.setTraitKeys(copy(domain.getTraitKeys()));
        entity.setPopulationKeys(copy(domain.getPopulationKeys()));
        entity.setUnitKeys(copy(domain.getUnitKeys()));
        entity.setBaseUnitKeys(copy(domain.getBaseUnitKeys()));
        entity.setHeroKeys(copy(domain.getHeroKeys()));
        entity.setGatedTechnologyKeys(copy(domain.getGatedTechnologyKeys()));
        entity.setStartingFactionQuestKey(domain.getStartingFactionQuestKey());
        entity.setSpecificQuestKeys(copy(domain.getSpecificQuestKeys()));
        entity.setProtectorateTraitKeys(copy(domain.getProtectorateTraitKeys()));
        return entity;
    }

    public Faction toDomain(FactionEntity entity) {
        if (entity == null) return null;

        return Faction.builder()
                .factionKey(entity.getFactionKey())
                .publicDisplayName(entity.getPublicDisplayName())
                .lore(entity.getLore())
                .factionKind(entity.getFactionKind())
                .affinityKey(entity.getAffinityKey())
                .affinityType(entity.getAffinityType())
                .traitKeys(copy(entity.getTraitKeys()))
                .populationKeys(copy(entity.getPopulationKeys()))
                .unitKeys(copy(entity.getUnitKeys()))
                .baseUnitKeys(copy(entity.getBaseUnitKeys()))
                .heroKeys(copy(entity.getHeroKeys()))
                .gatedTechnologyKeys(copy(entity.getGatedTechnologyKeys()))
                .startingFactionQuestKey(entity.getStartingFactionQuestKey())
                .specificQuestKeys(copy(entity.getSpecificQuestKeys()))
                .protectorateTraitKeys(copy(entity.getProtectorateTraitKeys()))
                .build();
    }

    private static List<String> copy(List<String> values) {
        return values == null ? new ArrayList<>() : new ArrayList<>(values);
    }
}
