package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.UnitSpecialization;
import ewshop.domain.repository.UnitSpecializationRepository;
import ewshop.infrastructure.persistence.entities.UnitSpecializationEntity;
import ewshop.infrastructure.persistence.mappers.UnitSpecializationMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataUnitSpecializationRepository;
import org.springframework.stereotype.Repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class UnitSpecializationRepositoryAdapter implements UnitSpecializationRepository {
    private static final Logger log = LoggerFactory.getLogger(UnitSpecializationRepositoryAdapter.class);
    private final SpringDataUnitSpecializationRepository springDataRepository;
    private final UnitSpecializationMapper mapper;

    public UnitSpecializationRepositoryAdapter(SpringDataUnitSpecializationRepository springDataRepository,
                                               UnitSpecializationMapper mapper) {
        this.springDataRepository = springDataRepository;
        this.mapper = mapper;
    }

    @Override
    public UnitSpecialization findByName(String name) {
        return springDataRepository.findByName(name)
                .map(mapper::toDomain)
                .orElseThrow(() -> {
                    log.warn("Unit specialization not found for name={}", name);
                    return new IllegalStateException("UnitSpecialization not found: " + name);
                });
    }


    @Override
    public List<UnitSpecialization> findAll() {
        return springDataRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public UnitSpecialization save(UnitSpecialization unitSpecialization) {
        UnitSpecializationEntity entityToSave = mapper.toEntity(unitSpecialization);
        UnitSpecializationEntity savedEntity = springDataRepository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void saveAll(List<UnitSpecialization> unitSpecializations) {
        List<UnitSpecializationEntity> entities = unitSpecializations.stream()
                .map(mapper::toEntity)
                .toList();
        springDataRepository.saveAll(entities);
    }

    @Override
    public void deleteAll() {
        springDataRepository.deleteAll();
    }
}
