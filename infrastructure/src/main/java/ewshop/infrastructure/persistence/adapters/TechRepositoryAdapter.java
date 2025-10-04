package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.Tech;
import ewshop.domain.repository.TechRepository;
import ewshop.infrastructure.persistence.mappers.TechMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataTechRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class TechRepositoryAdapter implements TechRepository {

    private final SpringDataTechRepository springDataTechRepository;
    private final TechMapper mapper;

    public TechRepositoryAdapter(SpringDataTechRepository springDataTechRepository, TechMapper mapper) {
        this.springDataTechRepository = springDataTechRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Tech> findAll() {
        return springDataTechRepository.findAll().stream()
                .map(mapper::toDomain) // Use injected mapper instance
                .collect(Collectors.toList());
    }

    @Override
    public Tech save(Tech tech) {
        // 1. Map domain to entity
        var entityToSave = mapper.toEntity(tech);
        // 2. Save the entity and capture the result from the database
        var savedEntity = springDataTechRepository.save(entityToSave);
        // 3. Map the fully persisted entity back to a domain object and return it
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void deleteAll() {
        springDataTechRepository.deleteAll();
    }
}
