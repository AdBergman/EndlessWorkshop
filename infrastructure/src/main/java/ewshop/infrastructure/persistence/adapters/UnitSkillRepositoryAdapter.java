package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.UnitSkill;
import ewshop.domain.repository.UnitSkillRepository;
import ewshop.infrastructure.persistence.entities.UnitSkillEntity;
import ewshop.infrastructure.persistence.mappers.UnitSkillMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataUnitSkillRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class UnitSkillRepositoryAdapter implements UnitSkillRepository {

    private static final Logger log = LoggerFactory.getLogger(UnitSkillRepositoryAdapter.class);

    private final SpringDataUnitSkillRepository springDataUnitSkillRepository;
    private final UnitSkillMapper mapper;

    public UnitSkillRepositoryAdapter(SpringDataUnitSkillRepository springDataUnitSkillRepository,
                                      UnitSkillMapper mapper) {
        this.springDataUnitSkillRepository = springDataUnitSkillRepository;
        this.mapper = mapper;
    }

    @Override
    public UnitSkill findByName(String name) {
        return springDataUnitSkillRepository.findByName(name)
                .map(mapper::toDomain)
                .orElseThrow(() -> {
                    log.warn("UnitSkill not found for name={}", name);
                    return new IllegalStateException("UnitSkill not found: " + name);
                });
    }


    public Optional<UnitSkillEntity> findEntityByName(String name) {
        return springDataUnitSkillRepository.findByName(name);
    }

    @Override
    public List<UnitSkill> findAll() {
        return springDataUnitSkillRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void saveAll(List<UnitSkill> skills) {
        List<UnitSkillEntity> entities = skills.stream()
                .map(mapper::toEntity)
                .collect(Collectors.toList());
        springDataUnitSkillRepository.saveAll(entities);
    }

    @Override
    public UnitSkill save(UnitSkill skill) {
        UnitSkillEntity entity = mapper.toEntity(skill);
        UnitSkillEntity savedEntity = springDataUnitSkillRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void deleteAll() {
        springDataUnitSkillRepository.deleteAll();
    }

    @Override
    public boolean existsByName(String name) {
        return springDataUnitSkillRepository.existsByName(name);
    }


}
