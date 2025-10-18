package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.entity.Tech;
import ewshop.infrastructure.persistence.entities.TechEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class TechMapper {

    private final TechUnlockMapper techUnlockMapper;

    public TechMapper(TechUnlockMapper techUnlockMapper) {
        this.techUnlockMapper = techUnlockMapper;
    }

    // --- Domain -> Entity (base, without prereq/excludes) ---
    public TechEntity toEntityBase(Tech domain) {
        if (domain == null) return null;

        TechEntity entity = new TechEntity();
        entity.setName(domain.getName());
        entity.setType(domain.getType());
        entity.setEra(domain.getEra());
        entity.setEffects(domain.getEffects() != null ? domain.getEffects() : Collections.emptyList());
        entity.setTechCoords(domain.getTechCoords());
        entity.setFactions(domain.getFactions() != null ? domain.getFactions() : Collections.emptySet());
        entity.setUnlocks(domain.getUnlocks() != null
                ? domain.getUnlocks().stream()
                .map(techUnlockMapper::toEntity)
                .collect(Collectors.toList())
                : Collections.emptyList());

        // Shallow prereq/excludes for normal domain usage
        if (domain.getPrereq() != null) {
            Tech prereq = domain.getPrereq();
            TechEntity prereqEntity = new TechEntity();
            prereqEntity.setName(prereq.getName());
            prereqEntity.setType(prereq.getType());
            prereqEntity.setEra(prereq.getEra());
            entity.setPrereq(prereqEntity);
        }

        if (domain.getExcludes() != null) {
            Tech excludes = domain.getExcludes();
            TechEntity excludesEntity = new TechEntity();
            excludesEntity.setName(excludes.getName());
            excludesEntity.setType(excludes.getType());
            excludesEntity.setEra(excludes.getEra());
            entity.setExcludes(excludesEntity);
        }

        return entity;
    }

    // --- Update references (after all entities are persisted, e.g., Phase 2) ---
    public void updateReferences(TechEntity entity, Tech domain, Map<String, TechEntity> savedMap) {
        if (domain.getPrereq() != null) {
            TechEntity prereqEntity = savedMap.get(domain.getPrereq().getName());
            if (prereqEntity != null) {
                entity.setPrereq(prereqEntity);
            } else {
                System.out.println("Warning: prereq not found for " + domain.getName() + ": " + domain.getPrereq().getName());
            }
        }

        if (domain.getExcludes() != null) {
            TechEntity excludesEntity = savedMap.get(domain.getExcludes().getName());
            if (excludesEntity != null) {
                entity.setExcludes(excludesEntity);
            } else {
                System.out.println("Warning: excludes not found for " + domain.getName() + ": " + domain.getExcludes().getName());
            }
        }
    }

    // --- Domain -> Entity (full, optionally update prereq/excludes with saved map) ---
    public TechEntity toEntity(Tech domain, Map<String, TechEntity> savedMap) {
        TechEntity entity = toEntityBase(domain);
        if (savedMap != null) {
            updateReferences(entity, domain, savedMap);
        }
        return entity;
    }

    // --- Domain -> Entity (legacy simple, just shallow mapping) ---
    public TechEntity toEntity(Tech domain) {
        return toEntityBase(domain);
    }

    // --- Entity -> Domain ---
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
                .unlocks(entity.getUnlocks() != null
                        ? entity.getUnlocks().stream()
                        .map(techUnlockMapper::toDomain)
                        .collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }
}
