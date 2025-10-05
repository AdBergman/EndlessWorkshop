package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.Improvement;
import ewshop.domain.repository.ImprovementRepository;
import ewshop.infrastructure.persistence.mappers.ImprovementMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataImprovementRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class ImprovementRepositoryAdapter implements ImprovementRepository {

    private final SpringDataImprovementRepository springDataImprovementRepository;
    private final ImprovementMapper mapper;

    public ImprovementRepositoryAdapter(SpringDataImprovementRepository springDataImprovementRepository,
                                        ImprovementMapper mapper) {
        this.springDataImprovementRepository = springDataImprovementRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Improvement> findAll() {
        return springDataImprovementRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Improvement save(Improvement improvement) {
        var entityToSave = mapper.toEntity(improvement);
        var savedEntity = springDataImprovementRepository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void deleteAll() {
        springDataImprovementRepository.deleteAll();
    }
}
