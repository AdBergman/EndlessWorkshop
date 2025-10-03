package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.Treaty;
import ewshop.domain.repository.TreatyRepository;
import ewshop.infrastructure.persistence.entities.TreatyEntity;
import ewshop.infrastructure.persistence.mappers.TreatyMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataTreatyRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * The adapter that implements the domain's repository port using Spring Data JPA.
 */
@Component
public class TreatyRepositoryAdapter implements TreatyRepository {

    private final SpringDataTreatyRepository springDataTreatyRepository;

    public TreatyRepositoryAdapter(SpringDataTreatyRepository springDataTreatyRepository) {
        this.springDataTreatyRepository = springDataTreatyRepository;
    }

    @Override
    public Treaty save(Treaty treaty) {
        TreatyEntity treatyEntity = TreatyMapper.toEntity(treaty);
        TreatyEntity savedEntity = springDataTreatyRepository.save(treatyEntity);
        return TreatyMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Treaty> findByName(String name) {
        return springDataTreatyRepository.findByName(name)
                .map(TreatyMapper::toDomain);
    }
}
