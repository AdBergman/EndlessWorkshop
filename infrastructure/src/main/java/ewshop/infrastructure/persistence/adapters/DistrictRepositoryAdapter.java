package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.District;
import ewshop.domain.repository.DistrictRepository;
import ewshop.infrastructure.persistence.entities.DistrictEntity;
import ewshop.infrastructure.persistence.mappers.DistrictMapper;
import ewshop.infrastructure.persistence.repositories.DistrictJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class DistrictRepositoryAdapter implements DistrictRepository {

    private final DistrictJpaRepository districtJpaRepository;
    private final DistrictMapper mapper;

    public DistrictRepositoryAdapter(DistrictJpaRepository districtJpaRepository,
                                     DistrictMapper mapper) {
        this.districtJpaRepository = districtJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public District findByName(String name) {
        Optional<DistrictEntity> entityOpt =
                districtJpaRepository.findByName(name);
        return entityOpt.map(mapper::toDomain).orElse(null);
    }

    public Optional<DistrictEntity> findEntityByName(String name) {
        return districtJpaRepository.findByName(name);
    }

    @Override
    public List<District> findAll() {
        return districtJpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void saveAll(List<District> districts) {
        // Convert each domain object to entity, then save all via Spring Data JPA
        var entities = districts.stream()
                .map(mapper::toEntity)
                .toList();
        districtJpaRepository.saveAll(entities);
    }

    @Override
    public District save(District district) {
        var entityToSave = mapper.toEntity(district);
        var savedEntity = districtJpaRepository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void deleteAll() {
        districtJpaRepository.deleteAll();
    }
}
