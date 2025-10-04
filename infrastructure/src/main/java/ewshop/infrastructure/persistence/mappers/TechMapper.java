package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.Tech;
import ewshop.infrastructure.persistence.entities.TechEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class TechMapper {

    private final TechUnlockMapper techUnlockMapper;

    public TechMapper(TechUnlockMapper techUnlockMapper) {
        this.techUnlockMapper = techUnlockMapper;
    }

    public Tech toDomain(TechEntity entity) {
        if (entity == null) return null;

        return Tech.builder()
                .name(entity.getName())
                .type(entity.getType())
                .era(entity.getEra())
                .effects(entity.getEffects() != null ? entity.getEffects() : Collections.emptyList())
                .techCoords(entity.getTechCoords())
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
                .factions(entity.getFactions() != null ? entity.getFactions() : Collections.emptySet())
                .unlocks(entity.getUnlocks() != null ? entity.getUnlocks().stream()
                        .map(techUnlockMapper::toDomain)
                        .collect(Collectors.toList()) : Collections.emptyList())
                .build();
    }

    public TechEntity toEntity(Tech domain) {
        if (domain == null) return null;

        TechEntity entity = new TechEntity();
        entity.setName(domain.getName());
        entity.setType(domain.getType());
        entity.setEra(domain.getEra());
        entity.setEffects(domain.getEffects() != null ? domain.getEffects() : Collections.emptyList());
        entity.setTechCoords(domain.getTechCoords());
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
        entity.setFactions(domain.getFactions() != null ? domain.getFactions() : Collections.emptySet());
        entity.setUnlocks(domain.getUnlocks() != null ? domain.getUnlocks().stream()
                .map(techUnlockMapper::toEntity)
                .collect(Collectors.toList()) : Collections.emptyList());

        return entity;
    }
}
