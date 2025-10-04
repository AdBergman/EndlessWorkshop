package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.entity.Treaty;
import ewshop.domain.repository.TreatyRepository;
import ewshop.infrastructure.persistence.entities.TreatyEntity;
import ewshop.infrastructure.persistence.mappers.TreatyMapper;
import ewshop.infrastructure.persistence.repositories.SpringDataTreatyRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * The adapter that implements the domain's repository port using Spring Data JPA.
 */
@Repository
public class TreatyRepositoryAdapter implements TreatyRepository {

    private final SpringDataTreatyRepository springDataTreatyRepository;
    private final TreatyMapper treatyMapper;

    public TreatyRepositoryAdapter(SpringDataTreatyRepository springDataTreatyRepository, TreatyMapper treatyMapper) {
        this.springDataTreatyRepository = springDataTreatyRepository;
        this.treatyMapper = treatyMapper;
    }

    @Override
    public Treaty save(Treaty treaty) {
        TreatyEntity treatyEntity = treatyMapper.toEntity(treaty);
        TreatyEntity savedEntity = springDataTreatyRepository.save(treatyEntity);
        return treatyMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Treaty> findByName(String name) {
        return springDataTreatyRepository.findByName(name)
                .map(treatyMapper::toDomain);
    }
}
