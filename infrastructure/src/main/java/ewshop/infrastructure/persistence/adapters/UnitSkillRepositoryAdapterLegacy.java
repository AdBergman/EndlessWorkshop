package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.model.UnitSkill;
import ewshop.domain.repository.UnitSkillRepository;
import ewshop.infrastructure.persistence.entities.UnitSkillEntityLegacy;
import ewshop.infrastructure.persistence.repositories.UnitSkillJpaRepositoryLegacy;
import ewshop.infrastructure.persistence.mappers.UnitSkillMapperLegacy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class UnitSkillRepositoryAdapterLegacy implements UnitSkillRepository {

    private static final Logger log = LoggerFactory.getLogger(UnitSkillRepositoryAdapterLegacy.class);

    private final UnitSkillJpaRepositoryLegacy unitSkillJpaRepositoryLegacy;
    private final UnitSkillMapperLegacy mapper;

    public UnitSkillRepositoryAdapterLegacy(UnitSkillJpaRepositoryLegacy unitSkillJpaRepositoryLegacy,
                                            UnitSkillMapperLegacy mapper) {
        this.unitSkillJpaRepositoryLegacy = unitSkillJpaRepositoryLegacy;
        this.mapper = mapper;
    }

    @Override
    public UnitSkill findByName(String name) {
        return unitSkillJpaRepositoryLegacy.findByName(name)
                .map(mapper::toDomain)
                .orElseThrow(() -> {
                    log.warn("UnitSkill not found for name={}", name);
                    return new IllegalStateException("UnitSkill not found: " + name);
                });
    }


    public Optional<UnitSkillEntityLegacy> findEntityByName(String name) {
        return unitSkillJpaRepositoryLegacy.findByName(name);
    }

    @Override
    public List<UnitSkill> findAll() {
        return unitSkillJpaRepositoryLegacy.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void saveAll(List<UnitSkill> skills) {
        List<UnitSkillEntityLegacy> entities = skills.stream()
                .map(mapper::toEntity)
                .collect(Collectors.toList());
        unitSkillJpaRepositoryLegacy.saveAll(entities);
    }

    @Override
    public UnitSkill save(UnitSkill skill) {
        UnitSkillEntityLegacy entity = mapper.toEntity(skill);
        UnitSkillEntityLegacy savedEntity = unitSkillJpaRepositoryLegacy.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void deleteAll() {
        unitSkillJpaRepositoryLegacy.deleteAll();
    }

    @Override
    public boolean existsByName(String name) {
        return unitSkillJpaRepositoryLegacy.existsByName(name);
    }


}
