package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.UnitSkill;
import ewshop.domain.repository.UnitSkillRepository;
import ewshop.infrastructure.persistence.entities.UnitSkillEntity;
import ewshop.infrastructure.persistence.mappers.UnitSkillMapper;
import ewshop.infrastructure.persistence.repositories.UnitSkillJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class UnitSkillRepositoryAdapter implements UnitSkillRepository {

    private static final Logger log = LoggerFactory.getLogger(UnitSkillRepositoryAdapter.class);

    private final UnitSkillJpaRepository unitSkillJpaRepository;
    private final UnitSkillMapper mapper;

    public UnitSkillRepositoryAdapter(UnitSkillJpaRepository unitSkillJpaRepository,
                                      UnitSkillMapper mapper) {
        this.unitSkillJpaRepository = unitSkillJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public UnitSkill findByName(String name) {
        return unitSkillJpaRepository.findByName(name)
                .map(mapper::toDomain)
                .orElseThrow(() -> {
                    log.warn("UnitSkill not found for name={}", name);
                    return new IllegalStateException("UnitSkill not found: " + name);
                });
    }


    public Optional<UnitSkillEntity> findEntityByName(String name) {
        return unitSkillJpaRepository.findByName(name);
    }

    @Override
    public List<UnitSkill> findAll() {
        return unitSkillJpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void saveAll(List<UnitSkill> skills) {
        List<UnitSkillEntity> entities = skills.stream()
                .map(mapper::toEntity)
                .collect(Collectors.toList());
        unitSkillJpaRepository.saveAll(entities);
    }

    @Override
    public UnitSkill save(UnitSkill skill) {
        UnitSkillEntity entity = mapper.toEntity(skill);
        UnitSkillEntity savedEntity = unitSkillJpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void deleteAll() {
        unitSkillJpaRepository.deleteAll();
    }

    @Override
    public boolean existsByName(String name) {
        return unitSkillJpaRepository.existsByName(name);
    }


}
