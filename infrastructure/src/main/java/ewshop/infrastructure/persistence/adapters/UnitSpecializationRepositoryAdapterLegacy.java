package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.model.UnitSpecialization;
import ewshop.domain.repository.UnitSpecializationRepository;
import ewshop.infrastructure.persistence.entities.UnitSpecializationEntityLegacy;
import ewshop.infrastructure.persistence.repositories.UnitSpecializationJpaRepositoryLegacy;
import ewshop.infrastructure.persistence.mappers.UnitSpecializationMapperLegacy;
import org.springframework.stereotype.Repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class UnitSpecializationRepositoryAdapterLegacy implements UnitSpecializationRepository {
    private static final Logger log = LoggerFactory.getLogger(UnitSpecializationRepositoryAdapterLegacy.class);
    private final UnitSpecializationJpaRepositoryLegacy springDataRepository;
    private final UnitSpecializationMapperLegacy mapper;

    public UnitSpecializationRepositoryAdapterLegacy(UnitSpecializationJpaRepositoryLegacy springDataRepository,
                                                     UnitSpecializationMapperLegacy mapper) {
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
        UnitSpecializationEntityLegacy entityToSave = mapper.toEntity(unitSpecialization);
        UnitSpecializationEntityLegacy savedEntity = springDataRepository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void saveAll(List<UnitSpecialization> unitSpecializations) {
        List<UnitSpecializationEntityLegacy> entities = unitSpecializations.stream()
                .map(mapper::toEntity)
                .toList();
        springDataRepository.saveAll(entities);
    }

    @Override
    public void deleteAll() {
        springDataRepository.deleteAll();
    }
}
