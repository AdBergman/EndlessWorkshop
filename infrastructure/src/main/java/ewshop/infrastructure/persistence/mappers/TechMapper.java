package ewshop.infrastructure.persistence.mappers;

import ewshop.domain.model.Tech;
import ewshop.domain.model.TechUnlockRef;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.entities.TechUnlockRefEmbeddable;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class TechMapper {

    public TechEntity toEntityBase(Tech domain) {
        if (domain == null) return null;

        TechEntity entity = new TechEntity();
        entity.setName(domain.getName());
        entity.setTechKey(domain.getTechKey());
        entity.setType(domain.getType());
        entity.setEra(domain.getEra());

        entity.setDescriptionLines(
                domain.getDescriptionLines() != null ? domain.getDescriptionLines() : Collections.emptyList()
        );

        entity.setUnlocks(
                domain.getUnlocks() != null
                        ? domain.getUnlocks().stream()
                        .map(u -> new TechUnlockRefEmbeddable(u.unlockType(), u.unlockKey()))
                        .collect(Collectors.toList())
                        : Collections.emptyList()
        );

        entity.setTechCoords(domain.getTechCoords());
        entity.setFactions(domain.getFactions() != null ? domain.getFactions() : Collections.emptySet());

        // legacy self refs stay as-is for now
        if (domain.getPrereq() != null) {
            Tech prereq = domain.getPrereq();
            TechEntity prereqEntity = new TechEntity();
            prereqEntity.setName(prereq.getName());
            prereqEntity.setTechKey(prereq.getTechKey());
            prereqEntity.setType(prereq.getType());
            prereqEntity.setEra(prereq.getEra());
            entity.setPrereq(prereqEntity);
        }

        if (domain.getExcludes() != null) {
            Tech excludes = domain.getExcludes();
            TechEntity excludesEntity = new TechEntity();
            excludesEntity.setName(excludes.getName());
            excludesEntity.setTechKey(excludes.getTechKey());
            excludesEntity.setType(excludes.getType());
            excludesEntity.setEra(excludes.getEra());
            entity.setExcludes(excludesEntity);
        }

        return entity;
    }

    public void updateReferences(TechEntity entity, Tech domain, Map<String, TechEntity> savedByTechKey) {
        // unchanged legacy logic
        if (domain.getPrereq() != null) {
            String prereqKey = domain.getPrereq().getTechKey();
            if (prereqKey != null) {
                TechEntity prereqEntity = savedByTechKey.get(prereqKey);
                if (prereqEntity != null) entity.setPrereq(prereqEntity);
                else System.out.println("Warning: prereq not found for " + domain.getTechKey() + ": " + prereqKey);
            } else {
                System.out.println("Warning: prereq techKey missing for " + domain.getTechKey());
            }
        }

        if (domain.getExcludes() != null) {
            String excludesKey = domain.getExcludes().getTechKey();
            if (excludesKey != null) {
                TechEntity excludesEntity = savedByTechKey.get(excludesKey);
                if (excludesEntity != null) entity.setExcludes(excludesEntity);
                else System.out.println("Warning: excludes not found for " + domain.getTechKey() + ": " + excludesKey);
            } else {
                System.out.println("Warning: excludes techKey missing for " + domain.getTechKey());
            }
        }
    }

    public TechEntity toEntity(Tech domain, Map<String, TechEntity> savedByTechKey) {
        TechEntity entity = toEntityBase(domain);
        if (savedByTechKey != null) updateReferences(entity, domain, savedByTechKey);
        return entity;
    }

    public TechEntity toEntity(Tech domain) {
        return toEntityBase(domain);
    }

    public Tech toDomain(TechEntity entity) {
        if (entity == null) return null;

        List<TechUnlockRef> unlocks =
                entity.getUnlocks() != null
                        ? entity.getUnlocks().stream()
                        .map(u -> new TechUnlockRef(u.getUnlockType(), u.getUnlockKey()))
                        .collect(Collectors.toList())
                        : Collections.emptyList();

        return Tech.builder()
                .name(entity.getName())
                .techKey(entity.getTechKey())
                .type(entity.getType())
                .era(entity.getEra())
                .descriptionLines(entity.getDescriptionLines() != null ? entity.getDescriptionLines() : Collections.emptyList())
                .unlocks(unlocks)
                .techCoords(entity.getTechCoords())
                .prereq(entity.getPrereq() != null
                        ? Tech.builder()
                        .name(entity.getPrereq().getName())
                        .techKey(entity.getPrereq().getTechKey())
                        .type(entity.getPrereq().getType())
                        .era(entity.getPrereq().getEra())
                        .build()
                        : null)
                .excludes(entity.getExcludes() != null
                        ? Tech.builder()
                        .name(entity.getExcludes().getName())
                        .techKey(entity.getExcludes().getTechKey())
                        .type(entity.getExcludes().getType())
                        .era(entity.getExcludes().getEra())
                        .build()
                        : null)
                .factions(entity.getFactions() != null ? entity.getFactions() : Collections.emptySet())
                .build();
    }
}