package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.TechPlacementUpdate;
import ewshop.domain.entity.Tech;
import ewshop.domain.entity.TechCoords;
import ewshop.domain.entity.enums.TechType;
import ewshop.domain.repository.TechRepository;
import ewshop.infrastructure.persistence.mappers.TechMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataTechRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class TechRepositoryAdapter implements TechRepository {

    private static final Logger log = LoggerFactory.getLogger(TechRepositoryAdapter.class);

    private final SpringDataTechRepository springDataTechRepository;
    private final TechMapper mapper;

    public TechRepositoryAdapter(SpringDataTechRepository springDataTechRepository, TechMapper mapper) {
        this.springDataTechRepository = springDataTechRepository;
        this.mapper = mapper;
    }

    @Override
    public List<Tech> findAll() {
        return springDataTechRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Tech save(Tech tech) {
        var entityToSave = mapper.toEntity(tech);
        var savedEntity = springDataTechRepository.save(entityToSave);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public void saveAll(List<Tech> techs) {
        var entities = techs.stream()
                .map(mapper::toEntity)
                .toList();
        springDataTechRepository.saveAll(entities);
    }

    @Override
    public void deleteAll() {
        springDataTechRepository.deleteAll();
    }

    @Override
    public void updateEraAndCoordsByNameAndType(TechPlacementUpdate update) {
        int updated = springDataTechRepository.updateEraAndCoordsByNameAndType(update.name(), update.type(), update.era(), update.coords());
        if (updated != 1) {
            log.warn("Expected to update 1 tech for name='{}' and type='{}' but updated {}", update.name(), update.type(), updated);
        }
    }
}