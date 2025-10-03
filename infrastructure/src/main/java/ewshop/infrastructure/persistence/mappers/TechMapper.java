package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.Tech;
import ewshop.domain.repository.entities.TechEntity;

import java.util.stream.Collectors;

public class TechMapper {

    public static Tech toDomain(TechEntity entity) {
        if (entity == null) return null;

        return Tech.builder()
                .name(entity.getName())
                .type(entity.getType())
                .era(entity.getEra())
                .effects(entity.getEffects())
                .techCoords(entity.getTechCoords())
                // Shallow mapping for prereq/excludes to avoid recursion
                .prereq(entity.getPrereq() != null
                        ? Tech.builder()
                        .name(entity.getPrereq().getName())
                        .type(entity.getPrereq().getType())
                        .era(entity.getPrereq().getEra())
                        .build()
                        : null)
                .excludes(entity.getExcludes() != null
                        ? Tech.builder()
                        .name(entity.getExcludes().getName())
                        .type(entity.getExcludes().getType())
                        .era(entity.getExcludes().getEra())
                        .build()
                        : null)
                .factions(entity.getFactions())
                .unlocks(entity.getUnlocks().stream()
                        .map(TechUnlockMapper::toDomain)
                        .collect(Collectors.toList()))
                .build();
    }

    public static TechEntity toEntity(Tech domain) {
        if (domain == null) return null;

        TechEntity entity = new TechEntity();
        entity.setName(domain.getName());
        entity.setType(domain.getType());
        entity.setEra(domain.getEra());
        entity.setEffects(domain.getEffects());
        entity.setTechCoords(domain.getTechCoords());
        // shallow mapping for prereq/excludes: only set ID if known
        if (domain.getPrereq() != null) {
            TechEntity prereqEntity = new TechEntity();
            prereqEntity.setName(domain.getPrereq().getName());
            prereqEntity.setType(domain.getPrereq().getType());
            prereqEntity.setEra(domain.getPrereq().getEra());
            entity.setPrereq(prereqEntity);
        }
        if (domain.getExcludes() != null) {
            TechEntity excludesEntity = new TechEntity();
            excludesEntity.setName(domain.getExcludes().getName());
            excludesEntity.setType(domain.getExcludes().getType());
            excludesEntity.setEra(domain.getExcludes().getEra());
            entity.setExcludes(excludesEntity);
        }
        entity.setFactions(domain.getFactions());
        entity.setUnlocks(domain.getUnlocks().stream()
                .map(TechUnlockMapper::toEntity)
                .collect(Collectors.toList()));

        return entity;
    }
}
