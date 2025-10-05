package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.District;
import ewshop.domain.repository.DistrictRepository;
import ewshop.infrastructure.persistence.entities.DistrictEntity;
import ewshop.infrastructure.persistence.mappers.DistrictMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataDistrictRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class DistrictRepositoryAdapter implements DistrictRepository {

    private final SpringDataDistrictRepository springDataDistrictRepository;
    private final DistrictMapper mapper;

    public DistrictRepositoryAdapter(SpringDataDistrictRepository springDataDistrictRepository,
                                     DistrictMapper mapper) {
        this.springDataDistrictRepository = springDataDistrictRepository;
        this.mapper = mapper;
    }

    @Override
    public District findByName(String name) {
        Optional<DistrictEntity> entityOpt =
                springDataDistrictRepository.findByName(name);
        return entityOpt.map(mapper::toDomain).orElse(null);
    }

    public Optional<DistrictEntity> findEntityByName(String name) {
        return springDataDistrictRepository.findByName(name);
    }

    @Override
    public List<District> findAll() {
        return springDataDistrictRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void saveAll(List<District> districts) {
        // Convert each domain object to entity, then save all via Spring Data JPA
        var entities = districts.stream()
                .map(mapper::toEntity)
                .toList();
        springDataDistrictRepository.saveAll(entities);
    }

    @Override
    public District save(District district) {
        var entityToSave = mapper.toEntity(district);
        var savedEntity = springDataDistrictRepository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void deleteAll() {
        springDataDistrictRepository.deleteAll();
    }
}
