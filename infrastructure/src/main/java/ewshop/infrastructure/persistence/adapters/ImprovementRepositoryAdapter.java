package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.Improvement;
import ewshop.domain.repository.ImprovementRepository;
import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import ewshop.infrastructure.persistence.mappers.ImprovementMapper;
import ewshop.infrastructure.persistence.repositories.ImprovementJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class ImprovementRepositoryAdapter implements ImprovementRepository {

    private final ImprovementJpaRepository improvementJpaRepository;
    private final ImprovementMapper mapper;

    public ImprovementRepositoryAdapter(ImprovementJpaRepository improvementJpaRepository,
                                        ImprovementMapper mapper) {
        this.improvementJpaRepository = improvementJpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Improvement findByName(String name) {
        Optional<ImprovementEntity> entityOpt =
                improvementJpaRepository.findByName(name);
        return entityOpt.map(mapper::toDomain).orElse(null);
    }

    @Override
    public List<Improvement> findAll() {
        return improvementJpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Improvement save(Improvement improvement) {
        var entityToSave = mapper.toEntity(improvement);
        var savedEntity = improvementJpaRepository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void saveAll(List<Improvement> improvements) {
        var entities = improvements.stream()
                .map(mapper::toEntity)
                .toList();
        improvementJpaRepository.saveAll(entities);
    }

    @Override
    public void deleteAll() {
        improvementJpaRepository.deleteAll();
    }
}
